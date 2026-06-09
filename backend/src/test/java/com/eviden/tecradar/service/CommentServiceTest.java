package com.eviden.tecradar.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.eviden.tecradar.entity.Comment;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.TecSwapElement;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.repository.CommentRepository;
import com.eviden.tecradar.repository.HistoryRepository;
import com.eviden.tecradar.repository.TecSwapRepository;
import com.eviden.tecradar.resource.CommentPostRequest;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class CommentServiceTest {

  @Mock private TecSwapService tecSwapService;

  @Mock private CommentRepository commentRepository;

  @Mock private HistoryRepository historyRepository;

  @Mock private TecSwapRepository tecSwapRepository;

  @InjectMocks private CommentService commentService;

  private User user;
  private TecSwapElement tecSwapElement;
  private CommentPostRequest commentPostRequest;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    user = new User();
    user.setId(1L);
    user.setUserName("testuser");

    tecSwapElement = new TecSwapElement();
    tecSwapElement.setId(1L);

    commentPostRequest = new CommentPostRequest();
    commentPostRequest.setContent("Test comment");
  }

  @Test
  void postComment_shouldThrowNotFoundException_whenTecSwapElementNotFound() {
    user.addRole(RoleName.TECSWAP);
    when(tecSwapService.get(1L)).thenReturn(null);
    assertThrows(
        NotFoundException.class, () -> commentService.postComment(1L, commentPostRequest, user));
  }

  @Test
  void postComment_shouldThrowBadRequestException_whenCommentContentExceedsMaxLength() {
    user.addRole(RoleName.TECSWAP);
    when(tecSwapService.get(1L)).thenReturn(tecSwapElement);
    commentPostRequest.setContent(new String(new char[Comment.MAX_COMMENT_LENGTH + 1]));
    assertThrows(
        BadRequestException.class, () -> commentService.postComment(1L, commentPostRequest, user));
  }

  @Test
  void postComment_shouldSaveComment_whenRequestIsValid() {
    user.addRole(RoleName.TECSWAP);
    when(tecSwapService.get(1L)).thenReturn(tecSwapElement);
    commentService.postComment(1L, commentPostRequest, user);
    verify(commentRepository, times(1)).persistAndFlush(any(Comment.class));
  }

  @Test
  void getComments_shouldThrowForbiddenException_whenUserDoesNotHaveTecSwapRole() {
    user.setAllRoles(Collections.emptyList());
    assertThrows(ForbiddenException.class, () -> commentService.getComments(1L, user));
  }

  @Test
  void getComments_shouldThrowIllegalArgumentException_whenTecSwapElementNotFound() {
    user.addRole(RoleName.TECSWAP);
    when(tecSwapService.get(1L)).thenReturn(null);
    assertThrows(IllegalArgumentException.class, () -> commentService.getComments(1L, user));
  }

  @Test
  void getComments_shouldReturnCommentDtos_whenRequestIsValid() {
    user.addRole(RoleName.TECSWAP);
    when(tecSwapService.get(1L)).thenReturn(tecSwapElement);
    when(commentRepository.findByTecSwapElementOrdered(1L)).thenReturn(Collections.emptyList());
    when(tecSwapRepository.getHistory(1L)).thenReturn(Collections.emptyList());
    commentService.getComments(1L, user);
    verify(commentRepository, times(1)).findByTecSwapElementOrdered(1L);
  }
}
