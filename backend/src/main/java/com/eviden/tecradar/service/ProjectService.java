package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Contact;
import com.eviden.tecradar.entity.Customer;
import com.eviden.tecradar.entity.Industry;
import com.eviden.tecradar.entity.Project;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.exception.InvalidValueException;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.ContactDto;
import com.eviden.tecradar.model.ProjectDto;
import com.eviden.tecradar.repository.IndustryRepository;
import com.eviden.tecradar.repository.ProjectRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

/** Service for {@link Project} related tasks. */
@ApplicationScoped
public class ProjectService {
  @Inject ProjectRepository projectRepository;
  @Inject IndustryRepository industryRepository;
  @Inject CustomerService customerService;
  @Inject TechnologyService technologyService;
  @Inject ProjectHistoryService projectHistoryService;
  @Inject UserService userService;
  @Inject Logger logger;

  /**
   * Get a list of all Projects from the database.
   *
   * @return a list of all projects alphabetically sorted.
   */
  public List<Project> getAll() {
    return projectRepository.listAll().stream()
        .sorted(Comparator.comparing(project -> project.getName().toLowerCase()))
        .collect(Collectors.toList());
  }

  /**
   * Retrieves a project by its ID.
   *
   * @param id the identifier of the project.
   * @return the project with the specified ID. or null if not found.
   */
  public Project get(long id) {
    Project project = projectRepository.findById(id);
    if (project == null) {
      throw new ResourceNotFoundException("No project found for id = " + id);
    }
    return project;
  }

  /**
   * Retrieves a list of technologies associated with a project.
   *
   * @param projectId the ID of the project.
   * @return a list of technologies associated with the project.
   */
  public List<Technology> getTechnologiesByProjectId(long projectId) {
    Project project = this.get(projectId);
    if (project == null) {
      throw new ResourceNotFoundException("No project found for id = " + projectId);
    }
    return project.getTechnologies();
  }

  @Transactional
  public void persistNewProject(Project newProject) {
    logger.info("New Project " + newProject.getName() + " saved");
    projectRepository.persistAndFlush(newProject);
  }

  /**
   * Finds a project by name, or creates a new one if it does not exist.
   *
   * @param name the name of the project.
   * @return the existing or newly created project.
   */
  public Project findOrCreateProject(String name) {
    if (projectRepository.findByNameIgnoreCase(name) != null) {
      return projectRepository.findByNameIgnoreCase(name);
    } else {
      Project project = new Project();
      project.setName(name);
      return project;
    }
  }

  /**
   * Creates projects and associates them with a technology and customers.
   *
   * @param technology the technology to associate with the projects.
   * @param projectIds the list of project ids to create or update.
   * @param username the name of the user.
   */
  public List<Project> createByForm(Technology technology, List<Long> projectIds, String username) {
    List<Project> projects = new ArrayList<>();
    for (Long id : projectIds) {
      Project project = get(id);
      List<Technology> technologies;
      if (project.getTechnologies() == null) {
        technologies = new ArrayList<>();
      } else {
        technologies = project.getTechnologies();
      }
      technologies.add(technology);
      project.setTechnologies(new ArrayList<>(new HashSet<>(technologies)));
      project.setCustomers(project.getCustomers());
      logger.info("Project " + project.getName() + " created");
      projectRepository.persistAndFlush(project);
      projectHistoryService.create(userService.get(username), project);
      projects.add(project);
    }
    return projects;
  }

  /**
   * Converts a list of customer objects into a list of unique customer entities, creating new
   * customers if needed.
   *
   * @param newCustomers the list of customer objects.
   * @return a list of unique customers.
   */
  private List<Customer> getCustomerListWithCustomers(List<Customer> newCustomers) {
    List<Customer> customers = new ArrayList<>();
    for (Customer customer : newCustomers) {
      Customer retrievedCustomer = customerService.get(customer.getName());
      if (retrievedCustomer == null) {
        retrievedCustomer = new Customer();
        retrievedCustomer.setName(customer.getName());
        customerService.create(retrievedCustomer);
      }
      customers.add(retrievedCustomer);
    }
    Set<Customer> uniqueSet = new HashSet<>(customers);
    return new ArrayList<>(uniqueSet);
  }

  public Project create(ProjectDto projectDto, String username) {
    Project project = findOrCreateProject(projectDto.name);
    return setProject(projectDto, username, project);
  }

  /**
   * Sets the value for the project from the projectDTO, and also creates project history.
   *
   * @param projectDto the projectDTO for the project.
   * @param username name of the user.
   * @param project to set the values.
   * @return the persisted project.
   */
  @Transactional
  public Project setProject(ProjectDto projectDto, String username, Project project) {
    List<Technology> technologies = new ArrayList<>();
    for (long technologyId : projectDto.technologyIds) {
      technologies.add(technologyService.get(technologyId));
    }
    Industry industry = industryRepository.findByNameIgnoreCase(projectDto.industry);
    if (industry == null) {
      throw new ResourceNotFoundException("Industry not found: " + projectDto.industry);
    }
    logger.debug("set Industry: " + industry.getName() + " to Project");
    project.setIndustry(industry);
    project.setTechnologies(technologies);
    project.setCustomers(getCustomerListWithCustomers(projectDto.customers));
    project.setDescription(projectDto.description);
    updateContactList(projectDto, project);
    project.setSalesServiceLink(projectDto.salesServiceLink);
    project.setInfo(projectDto.info);
    project.setIndustrySpecificInformation(projectDto.industrySpecificInformation);
    if (!(projectDto.startDate.isEmpty() || projectDto.startDate.isBlank())) {
      project.setStartDate(LocalDate.parse(projectDto.startDate));
    } else {
      project.setStartDate(null);
    }
    if (!(projectDto.endDate.isEmpty() || projectDto.endDate.isBlank())) {
      LocalDate endDate = LocalDate.parse(projectDto.endDate);
      if (project.getStartDate() != null && project.getStartDate().isAfter(endDate)) {
        logger.warn("Start date is after end date");
        throw new IllegalArgumentException("Start date is after end date");
      }
      project.setEndDate(endDate);
    } else {
      project.setEndDate(null);
    }
    logger.info("The value of project " + project.getName() + " updated");
    projectRepository.persistAndFlush(project);
    projectHistoryService.create(userService.get(username), project);
    return project;
  }

  private void updateContactList(ProjectDto projectDto, Project project) {
    List<Contact> currentContacts = project.getContact();
    Set<String> normalizedContactEmails = new HashSet<>();
    if (currentContacts == null) {
      currentContacts = new ArrayList<>();
      project.setContact(currentContacts);
    }

    // Clear existing contacts
    currentContacts.clear();

    // Add new contacts
    if (projectDto.contact != null) {
      for (ContactDto contactDto : projectDto.contact) {
        if (contactDto == null) {
          continue;
        }
        if (contactDto.email == null || contactDto.email.isBlank()) {
          logger.warn("Contact email is missing for project " + project.getName());
          continue;
        }

        String normalizedEmail = contactDto.email.trim().toLowerCase(Locale.ROOT);
        if (!normalizedContactEmails.add(normalizedEmail)) {
          logger.warn(
              "Duplicate contact email found for project "
                  + project.getName()
                  + ": "
                  + contactDto.email);
          throw new InvalidValueException(
              "Duplicate contact email found. Contacts must not contain the same email.");
        }

        Contact contact = new Contact();
        contact.setEmail(contactDto.email.trim());
        contact.setRole(contactDto.role);
        contact.setProject(project);
        currentContacts.add(contact);
      }
    }
  }

  /**
   * Updates an existing project with new data.
   *
   * @param id the ID of the project to update.
   * @param newProject the new data for the project.
   * @return the updated project.
   */
  @Transactional
  public Project update(long id, ProjectDto newProject, String username) {
    Project project = projectRepository.findById(id);
    project.setName(newProject.name);
    logger.info("Project " + project.getName() + " updated");
    return setProject(newProject, username, project);
  }

  /**
   * Removes a technology from a project.
   *
   * @param id the ID of the project.
   * @param technology the technology to remove.
   */
  public void removeTechnologyFromProject(long id, Technology technology) {
    Project project = projectRepository.findById(id);
    project.getTechnologies().remove(technology);
    projectHistoryService.removeTechnology(project, technology);
    logger.info("Technology " + technology.getName() + " removed from project with Id " + id);
    projectRepository.persistAndFlush(project);
  }

  /**
   * Deletes the project and the project history entry for the given id.
   *
   * @param id project identifier.
   */
  @Transactional
  public void delete(long id) {
    Project project = get(id);
    projectHistoryService.deleteProjectHistoryForProject(project);
    logger.info("Project with Id " + id + " deleted");
    projectRepository.delete(project);
  }
}
