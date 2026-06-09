package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Category;
import com.eviden.tecradar.entity.Certificate;
import com.eviden.tecradar.entity.Lifecycle;
import com.eviden.tecradar.entity.Picture;
import com.eviden.tecradar.entity.Project;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.Tag;
import com.eviden.tecradar.entity.TecSwapElement;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.InvalidValueException;
import com.eviden.tecradar.exception.ResourceAlreadyExistsException;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.TechnologyRepository;
import com.eviden.tecradar.resource.TechnologyRequestForm;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

/** Service for technology related tasks. */
@ApplicationScoped
public class TechnologyService {
  private final TechnologyRepository technologyRepository;
  private final CategoryService categoryService;
  private final LifecycleService lifecycleService;
  private final UserService userService;
  private final HistoryService historyService;
  private final TagService tagService;
  private final PictureService pictureService;
  private final SubscriptionAlertService subscriptionAlertService;
  private final CounterService counterService;
  private final CertificateService certificateService;
  private final ProjectService projectService;
  private final TecSwapService tecSwapService;
  @Inject Logger logger;
  @Inject CommentService commentService;

  /**
   * Constructor for initializing the TechnologyService.
   *
   * @param technologyRepository The repository for managing technology entities.
   * @param categoryService The service for managing categories.
   * @param lifecycleService The service for managing lifecycle information.
   * @param userService The service for managing user information.
   * @param historyService The service for managing history information.
   * @param tagService The service for managing tags.
   * @param pictureService The service for managing pictures.
   * @param subscriptionAlertService The service for notifying Subscriptions about changes
   */
  @Inject
  public TechnologyService(
      TechnologyRepository technologyRepository,
      CategoryService categoryService,
      LifecycleService lifecycleService,
      UserService userService,
      HistoryService historyService,
      TagService tagService,
      PictureService pictureService,
      SubscriptionAlertService subscriptionAlertService,
      CounterService counterService,
      CertificateService certificateService,
      ProjectService projectService,
      TecSwapService tecSwapService) {
    this.technologyRepository = technologyRepository;
    this.categoryService = categoryService;
    this.lifecycleService = lifecycleService;
    this.userService = userService;
    this.historyService = historyService;
    this.tagService = tagService;
    this.pictureService = pictureService;
    this.subscriptionAlertService = subscriptionAlertService;
    this.counterService = counterService;
    this.certificateService = certificateService;
    this.projectService = projectService;
    this.tecSwapService = tecSwapService;
  }

  /**
   * Creates for existing technologies a tec_swap_element when the backend restarts. (Discard after
   * release!)
   *
   * @param event startup event
   */
  public void createForExistingTechnologyTecSwap(@Observes StartupEvent event) {
    List<Technology> technologies = getAll();
    for (Technology technology : technologies) {
      TecSwapElement tecSwapElement = tecSwapService.getByTechnology(technology);
      if (tecSwapElement == null) {
        tecSwapService.create(technology);
      }
    }
  }

  /**
   * Fetches all technologies from the database.
   *
   * @return A list of all technologies alphabetically sorted.
   */
  public List<Technology> getAll() {
    return technologyRepository.listAll().stream()
        .sorted(Comparator.comparing(technology -> technology.getName().toLowerCase()))
        .collect(Collectors.toList());
  }

  /**
   * Fetches a technology by its id.
   *
   * @param id The id of the technology to fetch
   * @return The technology with the specified id
   * @throws ResourceNotFoundException if the technology does not exist.
   */
  public Technology get(Long id) {
    Technology technology = technologyRepository.findById(id);
    if (technology == null) {
      throw new ResourceNotFoundException("No technology found for id = " + id);
    }
    technology.setConnectedTechnologyNames(getConnectedTechnologyNames(technology));
    return technology;
  }

  /**
   * Gets the connected technology names.
   *
   * @param technology The technology whose connected technology names are to be retrieved.
   * @return A list of technology names.
   */
  public List<String> getConnectedTechnologyNames(Technology technology) {
    List<String> connectedTechnologyNames = new ArrayList<>();
    for (Long connectedTechnologyId : technology.getConnectedTechnologyIds()) {
      connectedTechnologyNames.add(technologyRepository.findById(connectedTechnologyId).getName());
    }
    return connectedTechnologyNames;
  }

  /**
   * Creates a new technology and creates a history entry.
   *
   * @param form The form containing the values for the new technology
   * @param username The username of the user who created the technology
   * @return The created technology
   */
  @Transactional
  public Technology create(TechnologyRequestForm form, String username) {
    if (checkDuplicateTechnologyName(form.getName(), "")) {
      logger.warn("Technology already exists");
      throw new ResourceAlreadyExistsException("Technology already exists");
    }
    Technology technology = populateTechnologyFields(new Technology(), form, false, username);
    addStatusAndJumpDate(1, form.getLifecycleId(), technology);
    technologyRepository.persistAndFlush(technology);
    logger.info(
        "New technology with name "
            + technology.getName()
            + " and id "
            + technology.getId()
            + " created");
    tecSwapService.create(technology);
    updateConnectedTechnologies(
        new ArrayList<>(), form.getConnectedTechnologyIds(), technology.getId());
    technology.setCertificates(addCertificates(form, technology));
    technology.setProjects(projectService.createByForm(technology, form.getProjectIds(), username));
    historyService.create(userService.get(username), technology);
    subscriptionAlertService.alertSubscriptionsOnAddedTechnology(technology);
    return technology;
  }

  /**
   * Updates a technology and creates a history entry if necessary.
   *
   * @param id The id of the technology to update
   * @param form The form containing the new values
   * @param username The username of the user who updated the technology
   * @return The updated technology
   * @throws ResourceAlreadyExistsException if the technology already exists.
   */
  @Transactional
  public Technology update(Long id, TechnologyRequestForm form, String username) {

    Technology technology = get(id);
    if (checkDuplicateTechnologyName(form.getName(), technology.getName())) {
      logger.warn("Technology already exists");
      throw new ResourceAlreadyExistsException("Technology already exists");
    }
    Long technologyLifecycleId = technology.getLifecycleId();
    addStatusAndJumpDate(technologyLifecycleId, form.getLifecycleId(), technology);
    final List<Tag> oldTags = new ArrayList<>(technology.getTagObjects());
    final List<Certificate> oldCertificates = technology.getCertificates();
    final List<Long> oldConnectedTechnologyIds = technology.getConnectedTechnologyIds();
    //    customerService.deleteCustomerProjectTechnologyByTechnology(technology);
    populateTechnologyFields(technology, form, true, username);
    removeOrphanedProjectRelations(technology);
    logger.info("Technology with Id " + id + " updated");
    technologyRepository.persistAndFlush(technology);
    updateConnectedTechnologies(
        oldConnectedTechnologyIds, technology.getConnectedTechnologyIds(), technology.getId());
    removeOrphanedTags(oldTags, technology.getTagObjects(), technology);
    removeOrphanedCertificateRelations(oldCertificates, technology.getCertificates());
    technology.setCertificates(addCertificates(form, technology));
    technology.setProjects(projectService.createByForm(technology, form.getProjectIds(), username));
    historyService.create(userService.get(username), technology);
    if (!technologyLifecycleId.equals(form.getLifecycleId())) {
      subscriptionAlertService.alertSubscriptionsOnTechnologyChange(
          form.getLifecycleId(), technologyLifecycleId, technology);
    }
    return technology;
  }

  /**
   * Deletes a technology and all associated entities.
   *
   * @param id The id of the technology to delete
   */
  @Transactional
  public void delete(Long id) {
    Technology technology = get(id);
    commentService.deleteCommentsByTechnologyId(id);
    deleteAssociatedEntities(technology);
    removeOrphanedConnectedTechnologies(technology);
    removeOrphanedProjectRelations(technology);
    certificateService.deleteCertificateByTechnology(technology);
    tecSwapService.deleteByTechnology(technology);
    List<Tag> oldTags = new ArrayList<>(technology.getTagObjects());
    logger.info("Technology " + technology.getName() + " with id " + id + " deleted");
    technologyRepository.delete(technology);
    removeOrphanedTags(oldTags, null, technology);
  }

  /**
   * Removes orphaned connected technology.
   *
   * @param technology orphaned technology.
   */
  public void removeOrphanedConnectedTechnologies(Technology technology) {
    List<Long> connectedTechnologyIds = technology.getConnectedTechnologyIds();
    for (Long id : connectedTechnologyIds) {
      Technology connectedTechnology = get(id);
      logger.info("Connected technology with Id " + id + " deleted");
      connectedTechnology.getConnectedTechnologyIds().remove(technology.getId());
    }
    technology.getConnectedTechnologyIds().clear();
  }

  /**
   * Removes orphaned project relationships.
   *
   * @param technology orphaned technology.
   */
  public void removeOrphanedProjectRelations(Technology technology) {
    for (Project project : technology.getProjects()) {
      projectService.removeTechnologyFromProject(project.getId(), technology);
    }
    technology.getProjects().clear();
  }

  /**
   * Populates the fields of a technology with the values from the form.
   *
   * @param technology The technology to populate
   * @param form The form containing the values
   * @return The populated technology
   * @throws ResourceNotFoundException if given category or lifecycle does not exist.
   * @throws InvalidValueException if given (short)-description is too long.
   */
  private Technology populateTechnologyFields(
      Technology technology, TechnologyRequestForm form, boolean isEdit, String username) {
    Category category = categoryService.get(form.getCategoryId());
    Lifecycle lifecycle = lifecycleService.get(form.getLifecycleId());
    if (!isEdit) {
      technology.setLifecycle(lifecycle);
    } else if (this.userService.get(username).hasRole(RoleName.TECSWAP)) {
      technology.setLifecycle(lifecycle);
    }
    technology.setCategory(category);
    technology.setPriority(form.isPriority());
    if (form.getName().length() > 255) {
      logger.warn("Name must have a value and be under 255 characters");
      throw new InvalidValueException("Name must have a value and be under 255 characters");
    } else {
      technology.setName(form.getName());
    }
    if (form.getDescription() == null
        || form.getDescription().length() > 1800
        || form.getDescription().trim().isEmpty()) {
      logger.warn("Description must have a value and be under 1800 characters");
      throw new InvalidValueException("Description must have a value and be under 1800 characters");
    } else {
      technology.setDescription(form.getDescription());
    }
    if (form.getShortDescription() != null && form.getShortDescription().length() > 300) {
      logger.warn("Short Description must be under 300 characters");
      throw new InvalidValueException("Short Description must be under 300 characters");
    } else {
      technology.setShortDescription(form.getShortDescription());
    }
    if (form.isNewPic()) {
      if (technology.getPictureId() != null) {
        pictureService.delete(technology.getPictureId());
      }
      Picture picture = pictureService.create(form.getPictureData());
      technology.setPictureId(picture.getId());
    } else if (form.getPictureData().length == 0 && technology.getPictureId() != null) {
      pictureService.delete(technology.getPictureId());
      technology.setPictureId(null);
    }

    List<Tag> tags = tagService.getTags(form);
    technology.setTags(tags);

    if (form.getConnectedTechnologyIds() != null) {
      technology.setConnectedTechnologyIds(form.getConnectedTechnologyIds());
    }

    return technology;
  }

  /**
   * Creates a list of technology-certificate and adds it to the given technology.
   *
   * @param form the form containing the values
   * @param technology the technology
   */
  private List<Certificate> addCertificates(TechnologyRequestForm form, Technology technology) {
    certificateService.deleteUnusedCertificates(technology, form.getCertificationNames());
    boolean shouldAddNewCertificate =
        form.getCertificationNames().stream().anyMatch(name -> !name.trim().isEmpty());
    if (shouldAddNewCertificate) {
      List<Certificate> certificates =
          certificateService.createOrUpdateCertificates(
              technology.getName(),
              form.getCertificationNames(),
              form.getCertificationDescription(),
              form.getCertificatePrerequisites(),
              form.getCertificateFollowUps());
      technology.setCertificates(certificates);
    } else {
      technology.setCertificates(new ArrayList<>());
    }
    return technology.getCertificates();
  }

  private void addStatusAndJumpDate(
      long pastLifeCycleId, long currentLifecycleId, Technology technology) {
    LocalDateTime today = LocalDateTime.now();
    technology.setJumpDate(today);
    if (pastLifeCycleId == 1L) {
      technology.setStatus(1);
    } else if (currentLifecycleId > pastLifeCycleId) {
      technology.setStatus(2);
    } else if (currentLifecycleId < pastLifeCycleId) {
      technology.setStatus(3);
    }
  }

  /**
   * Checks if a technology with the given name already exists.
   *
   * @param name The name of the technology
   * @param oldName the name of the old technology
   * @return true if the technology does already exist, false otherwise, also false if the old and
   *     new name are equal.
   * @throws IllegalArgumentException if the name is null or empty.
   */
  private boolean checkDuplicateTechnologyName(String name, String oldName) {
    if (name == null || name.isBlank()) {
      logger.warn("Technology name must not be empty");
      throw new IllegalArgumentException("Technology name must not be empty");
    }

    if (name.equalsIgnoreCase(oldName)) {
      return false;
    }

    Technology technology = technologyRepository.findByNameIgnoreCase(name.strip());
    return technology != null;
  }

  /**
   * Checks if any of the fields that are stored in the history table have changed.
   *
   * @param oldTech The technology that was updated
   * @param form The form containing the new values
   * @return true if any of the fields have changed, false otherwise
   */
  private boolean checkHistoryChanges(Technology oldTech, TechnologyRequestForm form) {
    if (oldTech.getShortDescription() == null) {
      oldTech.setShortDescription("");
    }
    return !oldTech.getName().equals(form.getName())
        || !oldTech.getDescription().equals(form.getDescription())
        || !oldTech.getShortDescription().equals(form.getShortDescription())
        || !Objects.equals(oldTech.getCategoryId(), form.getCategoryId())
        || !Objects.equals(oldTech.getLifecycleId(), form.getLifecycleId())
        || !oldTech.isPriority() == form.isPriority()
        || form.isNewPic()
        || (form.getPictureData().length == 0 && oldTech.getPictureId() != null)
        || !oldTech.getConnectedTechnologyIds().equals(form.getConnectedTechnologyIds())
        || !oldTech.getCertificates().stream()
            .allMatch(certificate -> form.getCertificationNames().contains(certificate.getName()))
        || !oldTech.getProjects().stream()
            .allMatch(project -> form.getProjectIds().contains(project.getId()))
        || !new HashSet<>(form.getTags()).containsAll(oldTech.getTags());
  }

  /**
   * Deletes all entities that are associated with a technology.
   *
   * @param technology The technology that was deleted
   */
  private void deleteAssociatedEntities(Technology technology) {
    historyService.deleteHistoryForTechnology(technology);
    if (technology.getPictureId() != null) {
      pictureService.delete(technology.getPictureId());
    }
    //    customerService.deleteCustomerProjectTechnologyByTechnology(technology);
    counterService.deleteByTechnology(technology);
  }

  /**
   * Removes tags that are not used by any technology anymore.
   *
   * @param oldTags List of tags that were used by the technology before the update
   * @param newTags List of tags that are used by the technology after the update
   * @param tech The technology that was updated/deleted
   */
  private void removeOrphanedTags(List<Tag> oldTags, List<Tag> newTags, Technology tech) {
    for (Tag oldTag : oldTags) {
      if (newTags == null || !newTags.contains(oldTag)) {
        List<Technology> technologiesUsingTag = oldTag.getTechnologies();
        if (technologiesUsingTag == null
            || technologiesUsingTag.isEmpty()
            || (oldTag.getTechnologies().size() == 1
                && oldTag.getTechnologies().get(0).equals(tech))) {
          tagService.delete(oldTag.getName());
        }
      }
    }
  }

  /**
   * Increments the view count in counter and in technology.
   *
   * @param technologyId the id of the technology
   * @param userName the name of the user
   */
  public void incrementVisitCounter(Long technologyId, String userName) {
    User user = userService.get(userName);
    Technology technology = get(technologyId);
    counterService.incrementCounter(user, technology);
    technology.setViewCount(counterService.getCount(technology));
    logger.debug("View counter for technology with Id " + technologyId + " increased");
    technologyRepository.persistAndFlush(technology);
  }

  /**
   * Removes certificates that are not by any technology anymore.
   *
   * @param oldCertificates list of old customerProjectTechnologies
   * @param newCertificates list of new customerProjectTechnologies
   */
  public void removeOrphanedCertificateRelations(
      List<Certificate> oldCertificates, List<Certificate> newCertificates) {
    for (Certificate oldCertificate : oldCertificates) {
      if (newCertificates == null || !newCertificates.contains(oldCertificate)) {
        certificateService.delete(oldCertificate);
      }
    }
  }

  /**
   * Updates connected Technologies so it becomes bidirectional.
   *
   * @param oldConnectedTechnologyIds technologyIds of old connected technologies
   * @param newConnectedTechnologyIds technologyIds of new connected technologies
   * @param technologyId technology id
   */
  public void updateConnectedTechnologies(
      List<Long> oldConnectedTechnologyIds,
      List<Long> newConnectedTechnologyIds,
      Long technologyId) {
    List<Long> newConnections = new ArrayList<>();
    List<Long> removedConnections = new ArrayList<>();
    for (Long newId : newConnectedTechnologyIds) {
      if (!oldConnectedTechnologyIds.contains(newId)) {
        newConnections.add(newId);
      }
    }
    for (Long oldId : oldConnectedTechnologyIds) {
      if (!newConnectedTechnologyIds.contains(oldId)) {
        removedConnections.add(oldId);
      }
    }

    for (Long newTechnologyId : newConnections) {
      Technology newTechnology = this.get(newTechnologyId);
      if (!newTechnology.getConnectedTechnologyIds().contains(technologyId)) {
        newTechnology.getConnectedTechnologyIds().add(technologyId);
        logger.info(
            "Connected technologies of the technology with Id " + technologyId + " updated");
        technologyRepository.persistAndFlush(newTechnology);
      }
    }

    for (Long removedTechnologyId : removedConnections) {
      Technology removedTechnology = this.get(removedTechnologyId);
      if (removedTechnology.getConnectedTechnologyIds().contains(technologyId)) {
        removedTechnology.getConnectedTechnologyIds().remove(technologyId);
        logger.info(
            "Connected technologies of the technology with Id " + technologyId + " removed");
        technologyRepository.persistAndFlush(removedTechnology);
      }
    }
  }
}
