package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.AuthenticationHelper;
import com.eviden.tecradar.entity.Contact;
import com.eviden.tecradar.entity.ContactHistory;
import com.eviden.tecradar.entity.Project;
import com.eviden.tecradar.entity.ProjectHistory;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.ContactDto;
import com.eviden.tecradar.model.ProjectDto;
import com.eviden.tecradar.service.ProjectHistoryService;
import com.eviden.tecradar.service.ProjectService;
import com.eviden.tecradar.service.TechnologyService;
import com.eviden.tecradar.service.UserService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/** tests for project endpoint. */
@QuarkusTest
public class ProjectResourceTest {
  @InjectMock private ProjectService projectService;
  @InjectMock private ProjectHistoryService projectHistoryService;
  @InjectMock private UserService userService;
  @InjectMock private TechnologyService technologyService;

  @Test
  void testGetAllProjects() {
    Project project1 = new Project();
    project1.setName("project1");
    Project project2 = new Project();
    project2.setName("project2");

    List<Project> projects = new ArrayList<>();
    projects.add(project1);
    projects.add(project2);

    when(projectService.getAll()).thenReturn(projects);

    String token = AuthenticationHelper.getToken("leia", "test");
    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/project")
        .then()
        .statusCode(200)
        .body("$.size()", is(2), "[0].name", is("project1"), "[1].name", is("project2"));
  }

  @Test
  void testGet() {
    Project project1 = new Project();
    project1.setName("project1");
    project1.setId(0L);
    when(projectService.get(0)).thenReturn(project1);
    String token = AuthenticationHelper.getToken("leia", "test");

    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/project/0")
        .then()
        .statusCode(200)
        .body("name", is("project1"));
    doThrow(new ResourceNotFoundException("")).when(projectService).get(-1L);
    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/project/-1")
        .then()
        .statusCode(404);
  }

  @Test
  void testUpdate() {
    Project oldProject = new Project();
    oldProject.setId(0L);
    oldProject.setName("oldProject");

    ProjectDto updatedProject = new ProjectDto();
    updatedProject.id = 0L;
    updatedProject.name = "updatedProject";

    Project up = new Project();
    up.setName("updatedProject");
    up.setId(0L);

    when(projectService.update(updatedProject.id, updatedProject, "leia")).thenReturn(up);
    String token = AuthenticationHelper.getToken("leia", "test");
    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .body(oldProject)
        .when()
        .put("/project/0")
        .then()
        .statusCode(204)
        .extract()
        .response();
  }

  @Test
  void testDelete() {
    String token = AuthenticationHelper.getToken("luke", "test");
    User user = new User();
    user.addRole(RoleName.ADMIN);
    when(userService.findOrCreate("luke")).thenReturn(user);
    doNothing().when(projectService).delete(0L);

    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .when()
        .delete("/project/0")
        .then()
        .statusCode(204)
        .extract()
        .response();

    doThrow(new ResourceNotFoundException("")).when(projectService).delete(-1L);

    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .when()
        .delete("/project/-1")
        .then()
        .statusCode(404)
        .extract()
        .response();
    user.setAllRoles(new ArrayList<>());
    user.addRole(RoleName.USER);
    when(userService.findOrCreate("leia")).thenReturn(user);
    String token2 = AuthenticationHelper.getToken("leia", "test");
    given()
        .header("Authorization", "Bearer " + token2)
        .contentType(ContentType.JSON)
        .when()
        .delete("/project/0")
        .then()
        .statusCode(403)
        .extract()
        .response();
  }

  @Test
  void testPost() {
    ProjectDto projectDto = new ProjectDto();
    projectDto.id = -1L;
    projectDto.name = "newProjectName";
    projectDto.technologyIds = new ArrayList<>();
    projectDto.technologyIds.add(1L);
    projectDto.description = "desc";
    projectDto.info = "";
    projectDto.salesServiceLink = "";
    ContactDto contactDto = new ContactDto();
    contactDto.email = "contactPerson@example.com";
    contactDto.role = "owner";
    projectDto.contact = new ArrayList<>();
    projectDto.contact.add(contactDto);
    projectDto.startDate = "2025-01-01";
    projectDto.customers = new ArrayList<>();
    Project project = new Project();
    project.setName(projectDto.name);
    project.setId(1L);
    Contact contact = new Contact();
    contact.setEmail("contactPerson@example.com");
    contact.setRole("owner");
    contact.setProject(project);
    project.setContact(new ArrayList<>(List.of(contact)));
    project.setCustomers(new ArrayList<>());
    project.setDescription("desc");
    project.setSalesServiceLink("");
    project.setInfo("");
    project.setTechnologies(new ArrayList<>());
    project.setStartDate(LocalDate.of(2025, 1, 1));

    when(projectService.create(any(), eq("luke"))).thenReturn(project);
    String token = AuthenticationHelper.getToken("luke", "test");

    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .body(projectDto)
        .when()
        .post("/project")
        .then()
        .statusCode(200)
        .body("name", is(project.getName()));
  }

  @Test
  void testGetHistory() {
    ProjectHistory projectHistory = new ProjectHistory();
    projectHistory.setProject(new Project());
    projectHistory.setTechnologies(new ArrayList<>());
    projectHistory.setUser(new User());
    projectHistory.setChangeDate(LocalDateTime.now());
    projectHistory.setCustomers(new ArrayList<>());
    projectHistory.setName("h1");
    projectHistory.setDescription("desc");
    ContactHistory contactHistory = new ContactHistory();
    contactHistory.setEmail("contact@example.com");
    contactHistory.setRole("owner");
    contactHistory.setProjectHistory(projectHistory);
    projectHistory.setContact(new ArrayList<>(List.of(contactHistory)));
    projectHistory.setId(1L);
    List<ProjectHistory> projectHistories = new ArrayList<>();
    projectHistories.add(projectHistory);

    when(projectHistoryService.getHistoryForProject(1L, "luke")).thenReturn(projectHistories);

    String token = AuthenticationHelper.getToken("luke", "test");
    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/project/history/1")
        .then()
        .statusCode(200)
        .body("$.size()", is(1));
  }
}
