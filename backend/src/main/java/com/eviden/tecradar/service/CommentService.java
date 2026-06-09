package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Comment;
import com.eviden.tecradar.entity.History;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.TecSwapElement;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.model.CommentDto;
import com.eviden.tecradar.repository.CommentRepository;
import com.eviden.tecradar.repository.HistoryRepository;
import com.eviden.tecradar.repository.TecSwapRepository;
import com.eviden.tecradar.resource.CommentPostRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * * Service for managing comments on TecSwapElements, including posting comments and retrieving
 * comment history with changes.
 */
@ApplicationScoped
public class CommentService {
  private static final Logger log = LoggerFactory.getLogger(CommentService.class);
  private final TecSwapService tecSwapService;
  private final CommentRepository commentRepository;
  private final HistoryRepository historyRepository;
  private final TecSwapRepository tecSwapRepository;

  /** Constructor for commentService. */
  @jakarta.inject.Inject
  public CommentService(
      TecSwapService tecSwapService,
      CommentRepository commentRepository,
      HistoryRepository historyRepository,
      TecSwapRepository tecSwapRepository) {
    this.tecSwapService = tecSwapService;
    this.commentRepository = commentRepository;
    this.historyRepository = historyRepository;
    this.tecSwapRepository = tecSwapRepository;
  }

  /**
   * Posts a comment to a TecSwapElement.
   *
   * @param tecSwapId : id of the TecSwapElement to which the comment should be posted
   * @param body : the request body, containing the comment content and flags for changes
   * @param user : the user posting the comment, must have TECSWAP role
   */
  @Transactional
  public void postComment(Long tecSwapId, CommentPostRequest body, User user) {
    TecSwapElement t = tecSwapService.get(tecSwapId);
    if (t == null) {
      throw new NotFoundException("No TecSwapElement found for id = " + tecSwapId);
    }
    if (body.getContent() == null) {
      throw new BadRequestException("Comment text must not be null");
    }
    if (body.getContent().length() > Comment.MAX_COMMENT_LENGTH) {
      throw new BadRequestException("Comment text must not exceed 1000 characters");
    }

    Comment comment = new Comment();
    if (body.getDidTechnologyChange()) {
      handleTechnologyChange(comment, user, t);
    }

    if (body.getDidTecSwapElementChange()) {
      handleTecSwapElementChange(comment, user, t);
    }
    comment.setContent(body.getContent());
    comment.setTecSwapElement(t);
    comment.setUser(user);
    commentRepository.persistAndFlush(comment);
  }

  /**
   * Handles logic for when a technology change is indicated in the comment request. Looks up the
   * most recent history entry for the user and technology, checks if the change is recent, and sets
   * corresponding history references on the comment. Throws BadRequestException if no history entry
   * is found.
   */
  private void handleTechnologyChange(Comment comment, User user, TecSwapElement t) {
    Optional<History> historyEntry =
        historyRepository.findMostRecentByUserAndTechnology(user, t.getTechnology());
    if (historyEntry.isEmpty()) {
      throw new BadRequestException(
          "No history entry found for user "
              + user.getUserName()
              + " and technology "
              + t.getTechnology().getName());
    }
    History history = historyEntry.get();
    comment.setCorrespondingHistory(history);
    Optional<History> previousHistory =
        historyRepository.findPreviousEntryBefore(t.getTechnology(), history);
    previousHistory.ifPresent(comment::setPreviousHistory);
  }

  /**
   * Handles logic for when a TecSwapElement change is indicated in the comment request. Finds the
   * most recent TecSwapElement change made by the user and the state before that change, then sets
   * revision IDs on the comment for later comparison. Throws BadRequestException if no change by
   * the user is found.
   */
  private void handleTecSwapElementChange(Comment comment, User user, TecSwapElement t) {
    List<AuditHistoryService.AuditHistoryRecord<TecSwapElement>> tecSwapHistory =
        tecSwapRepository.getHistory(t.getId());

    AuditHistoryService.AuditHistoryRecord<TecSwapElement> mostRecentChangeByUser = null;
    AuditHistoryService.AuditHistoryRecord<TecSwapElement> stateBeforeUserChange = null;

    for (AuditHistoryService.AuditHistoryRecord<TecSwapElement> historyDto : tecSwapHistory) {
      if (mostRecentChangeByUser != null) {
        stateBeforeUserChange = historyDto;
        break;
      }
      if (historyDto.userRev().getUserId().equals(user.getId())) {
        mostRecentChangeByUser = historyDto;
      }
    }
    if (mostRecentChangeByUser == null) {
      throw new BadRequestException(
          "No TecSwapElement change found for user " + user.getUserName());
    }
    comment.setTecswapRevisionId(mostRecentChangeByUser.userRev().getId());
    if (stateBeforeUserChange != null) {
      comment.setBaseTecswapRevisionId(stateBeforeUserChange.userRev().getId());
    }
  }

  /**
   * Retrieves comments for a TecSwapElement, including changes made to the technology and the
   * TecSwapElement itself.
   *
   * @param tecSwapId : id of the TecSwapElement for which to retrieve comments
   * @param user : the user requesting the comments, must have TECSWAP role
   * @return List of CommentDto containing comment details and changes
   */
  public List<CommentDto> getComments(Long tecSwapId, User user) {
    if (!user.hasRole(RoleName.TECSWAP)) {
      throw new ForbiddenException();
    }
    TecSwapElement t = tecSwapService.get(tecSwapId);
    if (t == null) {
      throw new IllegalArgumentException("No TecSwapElement found for id = " + tecSwapId);
    }

    List<Comment> comments = commentRepository.findByTecSwapElementOrdered(t.getId());
    List<AuditHistoryService.AuditHistoryRecord<TecSwapElement>> history =
        tecSwapRepository.getHistory(t.getId());
    List<CommentDto> commentDtos = new ArrayList<>();
    for (Comment c : comments) {

      CommentDto commentDto = new CommentDto();
      commentDto.setDate(c.getCreationDate());
      commentDto.setAuthorUsername(c.getUser().getUserName());
      commentDto.setText(c.getContent());
      commentDto.setChanges(new LinkedHashMap<>());

      Map<String, String> changeSet = new LinkedHashMap<>();
      // If comment has technology history entry, add changes to changeSet
      if (c.getCorrespondingHistory() != null) {
        Map<String, String> changeMap =
            compareHistories(c.getPreviousHistory(), c.getCorrespondingHistory());
        changeSet.putAll(changeMap);
      }

      // If comment has TecSwapElement history entry, add changes to changeSet
      if (c.getTecswapRevisionId() != 0) {
        TecSwapElement base = null;
        TecSwapElement prev = null;
        for (AuditHistoryService.AuditHistoryRecord<TecSwapElement> historyDto : history) {
          if (historyDto.userRev().getId() == c.getBaseTecswapRevisionId()) {
            base = historyDto.snapshot();
          } else if (historyDto.userRev().getId() == c.getTecswapRevisionId()) {
            prev = historyDto.snapshot();
          }
        }
        Map<String, String> changeMap = compareTecSwapElements(base, prev);
        changeSet.putAll(changeMap);
      }
      commentDto.setChanges(changeSet);
      commentDtos.add(commentDto);
    }
    return commentDtos;
  }

  private Map<String, String> compareTecSwapElements(
      TecSwapElement oldElement, TecSwapElement newElement) {
    Map<String, String> changeSet = new LinkedHashMap<>();

    if (newElement == null) {
      return changeSet;
    }

    // Compare tecSwap
    String oldTecSwap = oldElement != null ? oldElement.getTecSwap() : null;
    String newTecSwap = newElement.getTecSwap();
    if ((oldTecSwap != null && !oldTecSwap.equals(newTecSwap))
        || (oldTecSwap == null && newTecSwap != null)) {
      changeSet.put(
          "Zugeordneter TecSwap", (oldTecSwap != null ? oldTecSwap : "") + " -> " + newTecSwap);
    }

    // Compare isCompleted
    boolean oldCompleted = oldElement != null && oldElement.isIsCompleted();
    boolean newCompleted = newElement.isIsCompleted();
    if (oldCompleted != newCompleted) {
      changeSet.put("Erledigt", oldCompleted + " -> " + newCompleted);
    }

    return changeSet;
  }

  private Map<String, String> compareHistories(History oldHistory, History newHistory) {
    Map<String, String> changeSet = new LinkedHashMap<>();

    // New values
    String newCategory =
        newHistory.getCategory() != null ? newHistory.getCategory().getName() : null;
    String newLifecycle =
        newHistory.getLifecycle() != null ? newHistory.getLifecycle().getName() : null;
    boolean newIsPriority = newHistory.isPriority();

    // If oldHistory is null, just show what's been set
    if (oldHistory == null) {
      if (newCategory != null) {
        changeSet.put("Kategorie", " -> " + newCategory);
      }
      if (newLifecycle != null) {
        changeSet.put("Lifecycle", " -> " + newLifecycle);
      }
      changeSet.put("Priorität", " -> " + newIsPriority);
      return changeSet;
    }

    // Old values
    String oldCategory =
        oldHistory.getCategory() != null ? oldHistory.getCategory().getName() : null;
    String oldLifecycle =
        oldHistory.getLifecycle() != null ? oldHistory.getLifecycle().getName() : null;
    boolean oldIsPriority = oldHistory.isPriority();

    // Compare category
    if ((oldCategory != null && !oldCategory.equals(newCategory))
        || (oldCategory == null && newCategory != null)) {
      changeSet.put("Kategorie", (oldCategory != null ? oldCategory : "") + " -> " + newCategory);
    }

    // Compare lifecycle
    if ((oldLifecycle != null && !oldLifecycle.equals(newLifecycle))
        || (oldLifecycle == null && newLifecycle != null)) {
      changeSet.put(
          "Lifecycle", (oldLifecycle != null ? oldLifecycle : "") + " -> " + newLifecycle);
    }

    // Compare priority
    if (oldIsPriority != newIsPriority) {
      changeSet.put("Priorität", oldIsPriority + " -> " + newIsPriority);
    }

    return changeSet;
  }

  /**
   * Delets every comment that is related to a tecSwapElement that is related to the technology with
   * the given id
   */
  public void deleteCommentsByTechnologyId(Long technologyId) {
    long deletedComments = commentRepository.delete("tecSwapElement.technology.id", technologyId);
    log.info(
        "Comments associated with technology "
            + technologyId
            + " deleted (total of "
            + deletedComments
            + ")");
  }
}
