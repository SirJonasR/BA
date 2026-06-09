package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Contact;
import com.eviden.tecradar.entity.ContactHistory;
import com.eviden.tecradar.entity.Project;
import com.eviden.tecradar.entity.ProjectHistory;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.ProjectHistoryRepository;
import com.eviden.tecradar.repository.ProjectRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.jboss.logging.Logger;

/** Service for projectHistory related tasks. */
@ApplicationScoped
public class ProjectHistoryService {
  @Inject ProjectHistoryRepository projectHistoryRepository;
  @Inject ProjectRepository projectRepository;
  @Inject UserService userService;
  @Inject Logger logger;

  /**
   * Create and persist a project-history entry for a given and project.
   *
   * @param user the user
   * @param project the project
   * @return project-history entry
   */
  @Transactional
  public ProjectHistory create(User user, Project project) {
    ProjectHistory projectHistory = new ProjectHistory();
    projectHistory.setProject(project);
    projectHistory.setUser(user);
    projectHistory.setChangeDate(LocalDateTime.now());
    projectHistory.setDescription(project.getDescription());
    projectHistory.setContact(buildContactHistory(projectHistory, project.getContact()));
    projectHistory.setSalesServiceLink(project.getSalesServiceLink());
    projectHistory.setName(project.getName());
    projectHistory.setStartDate(project.getStartDate());
    projectHistory.setInfo(project.getInfo());
    projectHistory.setIndustrySpecificInformation(project.getIndustrySpecificInformation());
    projectHistory.setTechnologies(new ArrayList<>(project.getTechnologies()));
    projectHistory.setCustomers(new ArrayList<>(project.getCustomers()));
    logger.info(
        "Project History with User "
            + (user != null ? user.getUserName() : "null")
            + " and Project "
            + project.getName()
            + " created");
    projectHistoryRepository.persistAndFlush(projectHistory);
    return projectHistory;
  }

  private List<ContactHistory> buildContactHistory(
      ProjectHistory projectHistory, List<Contact> contacts) {
    List<ContactHistory> historyContacts = new ArrayList<>();
    if (contacts == null) {
      return historyContacts;
    }
    for (Contact contact : contacts) {
      ContactHistory history = new ContactHistory();
      history.setEmail(contact.getEmail());
      history.setRole(contact.getRole());
      history.setProjectHistory(projectHistory);
      historyContacts.add(history);
    }
    return historyContacts;
  }

  /**
   * Provide all project-history entries for a given project.
   *
   * @param projectId project identifier
   * @return List of project-history
   * @throws ResourceNotFoundException if project does not exist.
   */
  public List<ProjectHistory> getHistoryForProject(Long projectId, String username)
      throws ResourceNotFoundException {
    Project project = projectRepository.findById(projectId);
    if (project == null) {
      throw new ResourceNotFoundException("No project found for id = " + projectId);
    }
    List<ProjectHistory> histories = projectHistoryRepository.list("project", project);
    histories.sort(Comparator.comparing(ProjectHistory::getChangeDate));
    User user = userService.get(username);
    if (!user.hasRole(RoleName.ADMIN)) {
      histories.forEach(projectHistory -> projectHistory.setUser(null));
    }
    return histories;
  }

  /**
   * Removes the technology for the given project.
   *
   * @param project which should be updated.
   * @param technology which should be deleted.
   */
  public void removeTechnology(Project project, Technology technology) {
    List<ProjectHistory> projectHistoryList = projectHistoryRepository.list("project", project);

    if (projectHistoryList == null || projectHistoryList.isEmpty()) {
      logger.warn("No project history found for project: " + project.getName());
      return;
    }
    ProjectHistory projectHistory = projectHistoryList.get(0);
    logger.info(
        "Technology " + technology.getName() + " from Project " + project.getName() + " removed");
    projectHistory.getTechnologies().remove(technology);
    projectHistoryRepository.persistAndFlush(projectHistory);
  }

  public void deleteProjectHistoryForProject(Project project) {
    projectHistoryRepository.delete("project", project);
    logger.info("Project history for project with id " + project.getId() + " deleted");
  }
}
