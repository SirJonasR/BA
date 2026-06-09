package com.eviden.tecradar.service;

import static org.junit.Assert.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;

@QuarkusTest
public class ProjectHistoryServiceTest {
  @Inject ProjectHistoryService projectHistoryService;
  @InjectMock private ProjectHistoryRepository projectHistoryRepository;
  @InjectMock private ProjectRepository projectRepository;
  @InjectMock private UserService userService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void testCreate() {
    Project project = new Project();
    project.setName("testProject");
    project.setDescription("testProjectDescription");
    project.setStartDate(null);
    Contact contact = new Contact();
    contact.setEmail("testContactPerson@example.com");
    contact.setRole("owner");
    contact.setProject(project);
    project.setContact(new ArrayList<>(List.of(contact)));
    project.setCustomers(new ArrayList<>());
    project.setTechnologies(new ArrayList<>());
    ProjectHistory projectHistory = projectHistoryService.create(null, project);
    Assertions.assertNotNull(projectHistory);
    Assertions.assertEquals(1, projectHistory.getContact().size());
    Assertions.assertEquals(
        "testContactPerson@example.com", projectHistory.getContact().get(0).getEmail());
    Assertions.assertEquals("owner", projectHistory.getContact().get(0).getRole());
    verify(projectHistoryRepository, times(1)).persistAndFlush(any(ProjectHistory.class));
  }

  @Test
  void testGetHistoryForProject() {
    when(projectRepository.findById(1L)).thenReturn(null);
    Exception exception =
        assertThrows(
            ResourceNotFoundException.class,
            () -> projectHistoryService.getHistoryForProject(1L, ""));
    Assertions.assertEquals(exception.getMessage(), "No project found for id = 1");
    List<ProjectHistory> projectHistories = new ArrayList<>();
    Project project = new Project();
    project.setId(1L);
    ProjectHistory projectHistory1 = new ProjectHistory();
    projectHistory1.setProject(project);
    projectHistory1.setChangeDate(LocalDateTime.now());
    ProjectHistory projectHistory2 = new ProjectHistory();
    projectHistory2.setProject(project);
    projectHistory2.setChangeDate(LocalDateTime.now());
    projectHistories.add(projectHistory1);
    projectHistories.add(projectHistory2);
    when(projectRepository.findById(1L)).thenReturn(project);
    when(projectHistoryRepository.list("project", project)).thenReturn(projectHistories);
    User user = new User();
    user.setUserName("user");
    user.addRole(RoleName.ADMIN);
    when(userService.get("user")).thenReturn(user);
    Assertions.assertEquals(2, projectHistoryService.getHistoryForProject(1L, "user").size());
    user.addRole(RoleName.USER);
    when(userService.get("user")).thenReturn(user);
    Assertions.assertNull(projectHistoryService.getHistoryForProject(1L, "user").get(0).getUser());
  }

  @Test
  void testDeleteProjectHistoryForProject() {
    Project project = new Project();
    project.setId(1L);
    projectHistoryService.deleteProjectHistoryForProject(project);
    verify(projectHistoryRepository, times(1)).delete("project", project);
  }

  @Test
  void testRemoveTechnology() {
    Project project = new Project();
    project.setId(1L);
    ProjectHistory projectHistory = new ProjectHistory();
    Technology technology = new Technology();
    technology.setId(1L);
    technology.setName("testTechnology");
    Technology technology1 = new Technology();
    technology1.setId(1L);
    technology1.setName("testTechnolgoy1");
    projectHistory.setProject(project);
    List<Technology> technologies = new ArrayList<>();
    projectHistory.setTechnologies(technologies);
    when(projectHistoryRepository.list("project", project)).thenReturn(List.of(projectHistory));
    projectHistoryService.removeTechnology(project, technology);
    Assertions.assertEquals(0, projectHistory.getTechnologies().size());
    verify(projectHistoryRepository, times(1)).persistAndFlush(projectHistory);
  }

  @Test
  void testBuildContactHistoryCopiesFields() throws Exception {
    ProjectHistory projectHistory = new ProjectHistory();
    Contact contact = new Contact();
    contact.setEmail("contact@example.com");
    contact.setRole("owner");
    List<Contact> contacts = new ArrayList<>(List.of(contact));

    var method =
        ProjectHistoryService.class.getDeclaredMethod(
            "buildContactHistory", ProjectHistory.class, List.class);
    method.setAccessible(true);

    @SuppressWarnings("unchecked")
    List<ContactHistory> result =
        (List<ContactHistory>) method.invoke(projectHistoryService, projectHistory, contacts);

    Assertions.assertEquals(1, result.size());
    Assertions.assertEquals("contact@example.com", result.get(0).getEmail());
    Assertions.assertEquals("owner", result.get(0).getRole());
    Assertions.assertEquals(projectHistory, result.get(0).getProjectHistory());
  }
}
