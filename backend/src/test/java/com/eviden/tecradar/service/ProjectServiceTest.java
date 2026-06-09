package com.eviden.tecradar.service;

import static org.junit.Assert.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.entity.Contact;
import com.eviden.tecradar.entity.Customer;
import com.eviden.tecradar.entity.Industry;
import com.eviden.tecradar.entity.Project;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.InvalidValueException;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.ContactDto;
import com.eviden.tecradar.model.ProjectDto;
import com.eviden.tecradar.repository.IndustryRepository;
import com.eviden.tecradar.repository.ProjectRepository;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;

@QuarkusTest
public class ProjectServiceTest {

  @Inject ProjectService projectService;
  @InjectMock private ProjectRepository projectRepository;
  @InjectMock private TechnologyService technologyService;
  @InjectMock private ProjectHistoryService projectHistoryService;
  @InjectMock private UserService userService;
  @InjectMock private IndustryRepository industryRepository;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    Industry testIndustry = new Industry();
    testIndustry.setId(1L);
    testIndustry.setName("PSD - Public Sector & Defense");
    when(industryRepository.findByNameIgnoreCase(anyString())).thenReturn(testIndustry);
  }

  @Test
  void testGetAll() {
    Project project1 = new Project();
    project1.setName("Project1");

    Project project2 = new Project();
    project2.setName("Project2");

    when(projectRepository.listAll()).thenReturn(Arrays.asList(project1, project2));

    List<Project> result = projectService.getAll();

    Assertions.assertEquals(2, result.size());
    Assertions.assertEquals("Project1", result.get(0).getName());
    Assertions.assertEquals("Project2", result.get(1).getName());
  }

  @Test
  void testGet() {
    Project project = new Project();
    project.setName("Project");
    projectService.persistNewProject(project);
    when(projectRepository.findById(-1L)).thenReturn(project);
    Project result = projectService.get(-1L);

    Assertions.assertNotNull(result);
    Assertions.assertEquals("Project", result.getName());
    when(projectRepository.findById(-1L)).thenReturn(null);
    Exception exception =
        assertThrows(ResourceNotFoundException.class, () -> projectService.get(-1L));
    Assertions.assertEquals(exception.getMessage(), "No project found for id = -1");
  }

  @Test
  void testFindOrCreateProject() {
    Project project = new Project();
    project.setName("project1");
    when(projectRepository.findByNameIgnoreCase("project1")).thenReturn(project);
    Project p = projectService.findOrCreateProject("project1");
    Assertions.assertNotNull(p);
  }

  @Test
  void testCreateProject() {
    when(projectRepository.findByNameIgnoreCase("project")).thenReturn(null);
    Project project = projectService.findOrCreateProject("project");
    Assertions.assertNotNull(project);
    Assertions.assertEquals("project", project.getName());
  }

  @Test
  void testCreateByForm() {
    Project project = new Project();
    project.setId(1L);
    Technology technologyP = new Technology();
    technologyP.setId(-1L);
    User user = new User();
    when(projectRepository.findById(1L)).thenReturn(project);
    when(projectHistoryService.create(user, project)).thenReturn(null);
    Technology technology = new Technology();
    technology.setId(1L);
    projectService.createByForm(technology, List.of(1L), "user");
    verify(projectRepository).persistAndFlush(project);
    List<Technology> technologies = List.of(technologyP);
    project.setTechnologies(new ArrayList<>(technologies));
    when(projectRepository.findById(1L)).thenReturn(project);
    Assertions.assertEquals(
        2,
        projectService
            .createByForm(technology, List.of(1L), "user")
            .get(0)
            .getTechnologies()
            .size());
  }

  @Test
  void testUpdate() {
    Project odlProject = new Project();
    odlProject.setName("oldProject");
    ProjectDto projectDto = new ProjectDto();
    projectDto.id = 1L;
    projectDto.name = "newProjectName";
    projectDto.technologyIds = new ArrayList<>();
    projectDto.technologyIds.add(1L);
    projectDto.description = "desc";
    projectDto.info = "";
    ContactDto contactDto = new ContactDto();
    contactDto.email = "contactPerson@example.com";
    contactDto.role = "owner";
    projectDto.contact = new ArrayList<>();
    projectDto.contact.add(contactDto);
    projectDto.industrySpecificInformation = "industrySpecificInfo";
    projectDto.salesServiceLink = "";
    projectDto.startDate = " ";
    projectDto.endDate = " ";
    Customer customer = new Customer();
    customer.setName("customer");
    projectDto.customers = new ArrayList<>();
    projectDto.customers.add(customer);
    Technology technology = new Technology();
    technology.setName("technology");
    when(projectRepository.findById(1L)).thenReturn(odlProject);
    when(technologyService.get(1L)).thenReturn(technology);
    projectDto.industry = "PSD - Public Sector & Defense";
    Project updatedProject = projectService.update(1L, projectDto, "luke");
    Assertions.assertEquals(projectDto.name, updatedProject.getName());
    Assertions.assertEquals(
        projectDto.technologyIds.size(), updatedProject.getTechnologies().size());
    Assertions.assertEquals(projectDto.customers, updatedProject.getCustomers());
    Assertions.assertEquals(1, updatedProject.getContact().size());
    Assertions.assertEquals(
        "contactPerson@example.com", updatedProject.getContact().get(0).getEmail());
    Assertions.assertEquals("owner", updatedProject.getContact().get(0).getRole());
    Assertions.assertEquals(
        projectDto.industrySpecificInformation, updatedProject.getIndustrySpecificInformation());
    projectDto.startDate = "2025-01-01";
    projectDto.endDate = "2024-01-01";
    Exception exception =
        assertThrows(
            IllegalArgumentException.class, () -> projectService.update(1L, projectDto, "luke"));
    Assertions.assertEquals(exception.getMessage(), "Start date is after end date");
  }

  @Test
  void testDelete() {
    Project project = new Project();
    when(projectRepository.findById(1L)).thenReturn(project);
    doNothing().when(projectHistoryService).deleteProjectHistoryForProject(project);
    projectService.delete(1L);
    verify(projectRepository).delete(project);
  }

  @Test
  void testRemoveTechnologyFromProject() {
    Project project = new Project();
    Technology technology = new Technology();
    technology.setName("technology");
    project.setTechnologies(new ArrayList<>(List.of(technology)));
    Assertions.assertEquals(1, project.getTechnologies().size());
    when(projectRepository.findById(1L)).thenReturn(project);
    doNothing().when(projectHistoryService).removeTechnology(project, technology);
    projectService.removeTechnologyFromProject(1L, technology);
    Assertions.assertEquals(0, project.getTechnologies().size());
    verify(projectRepository).persistAndFlush(project);
  }

  @Test
  void testCreate() {
    Project project = new Project();
    ProjectDto projectDto = new ProjectDto();
    projectDto.id = 1L;
    projectDto.name = "newProjectName";
    projectDto.technologyIds = new ArrayList<>();
    projectDto.technologyIds.add(1L);
    projectDto.description = "desc";
    projectDto.info = "";
    ContactDto contactDto = new ContactDto();
    contactDto.email = "contactPerson@example.com";
    contactDto.role = "owner";
    projectDto.contact = new ArrayList<>();
    projectDto.contact.add(contactDto);
    projectDto.industrySpecificInformation = "industrySpecificInfo";
    projectDto.salesServiceLink = "";
    projectDto.startDate = "2025-01-01";
    projectDto.endDate = "2025-10-10";
    projectDto.industry = "PSD - Public Sector & Defense";
    projectDto.customers = new ArrayList<>();
    when(userService.get("username")).thenReturn(null);
    when(projectHistoryService.create(null, project)).thenReturn(null);
    Project createdProject = projectService.create(projectDto, "username");
    Assertions.assertEquals(1, createdProject.getContact().size());
    Assertions.assertEquals(
        "contactPerson@example.com", createdProject.getContact().get(0).getEmail());
    Assertions.assertEquals("owner", createdProject.getContact().get(0).getRole());
  }

  @Test
  void testUpdateContactListClearsAndAdds() throws Exception {
    Project project = new Project();
    Contact existing = new Contact();
    existing.setEmail("old@example.com");
    existing.setRole("old-role");
    existing.setProject(project);
    project.setContact(new ArrayList<>(List.of(existing)));

    ContactDto contactDto = new ContactDto();
    contactDto.email = "new@example.com";
    contactDto.role = "owner";
    ProjectDto projectDto = new ProjectDto();
    projectDto.contact = new ArrayList<>(List.of(contactDto));

    var method =
        ProjectService.class.getDeclaredMethod(
            "updateContactList", ProjectDto.class, Project.class);
    method.setAccessible(true);
    method.invoke(projectService, projectDto, project);

    Assertions.assertEquals(1, project.getContact().size());
    Assertions.assertEquals("new@example.com", project.getContact().get(0).getEmail());
    Assertions.assertEquals("owner", project.getContact().get(0).getRole());
    Assertions.assertEquals(project, project.getContact().get(0).getProject());
  }

  @Test
  void testSetProjectRejectsDuplicateContactEmails() {
    Project project = new Project();
    project.setName("duplicate-email-project");

    ContactDto firstContact = new ContactDto();
    firstContact.email = "duplicate@example.com";
    firstContact.role = "owner";

    ContactDto secondContact = new ContactDto();
    secondContact.email = " Duplicate@Example.com ";
    secondContact.role = "architect";

    ProjectDto projectDto = new ProjectDto();
    projectDto.name = "duplicate-email-project";
    projectDto.technologyIds = new ArrayList<>();
    projectDto.customers = new ArrayList<>();
    projectDto.contact = new ArrayList<>(List.of(firstContact, secondContact));
    projectDto.industry = "PSD - Public Sector & Defense";
    projectDto.description = "desc";
    projectDto.info = "";
    projectDto.salesServiceLink = "";
    projectDto.industrySpecificInformation = "";
    projectDto.startDate = " ";
    projectDto.endDate = " ";

    InvalidValueException exception =
        assertThrows(
            InvalidValueException.class,
            () -> projectService.setProject(projectDto, "luke", project));

    Assertions.assertEquals(
        "Duplicate contact email found. Contacts must not contain the same email.",
        exception.getMessage());
  }
}
