package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.AuthenticationHelper;
import com.eviden.tecradar.entity.DeepExpertListEntry;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.UpdateDeepExpertListEntryDto;
import com.eviden.tecradar.service.DeepExpertService;
import com.eviden.tecradar.service.UserService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class DeepExpertListResourceTest {
  @InjectMock DeepExpertService expertService;
  @InjectMock UserService userService;

  private User adminUser;
  private User nonAdminUser;
  private List<DeepExpertListEntry> mockExperts;
  private List<UpdateDeepExpertListEntryDto> mockExpertDtos;

  private static String adminUserName = "luke";
  private static String nonAdminUserName = "leia";
  private static String password = "test";

  @BeforeEach
  void setUp() {
    adminUser = new User();
    adminUser.setId(1L);
    adminUser.setUserName(adminUserName);
    adminUser.addRole(RoleName.ADMIN);

    nonAdminUser = new User();
    nonAdminUser.setId(1L);
    nonAdminUser.setUserName(nonAdminUserName);
    nonAdminUser.addRole(RoleName.USER);

    // Create mock expert list entries
    DeepExpertListEntry entry1 = new DeepExpertListEntry();
    entry1.setScope("");
    entry1.setExpertInformation("Max Mustermann");
    entry1.setTechnologyName("Java");
    entry1.setDescription("Java Expertise in Backend Development");
    entry1.setListIndex(0);

    DeepExpertListEntry entry2 = new DeepExpertListEntry();
    entry2.setScope("");
    entry2.setExpertInformation("Erika Mustermann");
    entry2.setTechnologyName("JavaScript");
    entry2.setDescription("JavaScript Expertise in Frontend Development");
    entry2.setListIndex(1);
    mockExperts = Arrays.asList(entry1, entry2);

    UpdateDeepExpertListEntryDto updateEntry1 = new UpdateDeepExpertListEntryDto();
    updateEntry1.expertInformation = "Max Mustermann";
    updateEntry1.technologyName = "Java";
    updateEntry1.description = "Java Expertise in Backend Development";
    updateEntry1.tableRow = 0;
    updateEntry1.scope = "";

    UpdateDeepExpertListEntryDto updateEntry2 = new UpdateDeepExpertListEntryDto();
    updateEntry2.expertInformation = "Erika Mustermann";
    updateEntry2.technologyName = "JavaScript";
    updateEntry2.description = "JavaScript Expertise in Frontend Development";
    updateEntry2.tableRow = 1;
    updateEntry2.scope = "";

    mockExpertDtos = Arrays.asList(updateEntry1, updateEntry2);

    // Mock UserService to return test user
    when(userService.findOrCreate(adminUserName)).thenReturn(adminUser);
    when(userService.findOrCreate(nonAdminUserName)).thenReturn(nonAdminUser);
  }

  @Test
  @Order(1)
  void testGetDeepExpertsWithEmptyList() {
    List<DeepExpertListEntry> emptyList = new ArrayList<>();
    String token = AuthenticationHelper.getToken(nonAdminUserName, password);
    when(expertService.getDeepExpertForTechnology(eq(999L))).thenReturn(emptyList);

    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/deep-experts/999")
        .then()
        .statusCode(HttpStatus.SC_OK)
        .body("$", empty());

    verify(expertService).getDeepExpertForTechnology(eq(999L));
  }

  @Test
  @Order(2)
  void testGetDeepExpertsWithMockExperts() {
    List<DeepExpertListEntry> responseList = new ArrayList<>();

    String token = AuthenticationHelper.getToken(nonAdminUserName, password);
    when(expertService.getDeepExpertForTechnology(eq(999L))).thenReturn(mockExperts);

    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/deep-experts/999")
        .then()
        .statusCode(HttpStatus.SC_OK)
        .body("$", hasSize(2))
        .body("[0].technologyName", equalTo("Java"))
        .body("[0].expertInformation", equalTo("Max Mustermann"))
        .body("[0].description", equalTo("Java Expertise in Backend Development"))
        .body("[1].technologyName", equalTo("JavaScript"))
        .body("[1].expertInformation", equalTo("Erika Mustermann"))
        .body("[1].description", equalTo("JavaScript Expertise in Frontend Development"));

    verify(expertService).getDeepExpertForTechnology(eq(999L));
  }

  @Test
  @Order(3)
  void testGetDeepExpertsForNonExistentElement() {
    String token = AuthenticationHelper.getToken(nonAdminUserName, password);
    when(expertService.getDeepExpertForTechnology(eq(999L)))
        .thenThrow(new ResourceNotFoundException("TecSwapElement not found"));

    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/deep-experts/999")
        .then()
        .statusCode(HttpStatus.SC_NOT_FOUND);

    verify(expertService).getDeepExpertForTechnology(eq(999L));
  }

  @Test
  @Order(4)
  void testGetDeepExpertsWithoutAuth() {
    given().when().get("/deep-experts/1").then().statusCode(HttpStatus.SC_UNAUTHORIZED);
    verify(expertService, never()).getDeepExpertForTechnology(anyLong());
  }

  @Test
  @Order(5)
  void testPutDeepExpertsWithoutAuth() {
    given().when().put("/deep-experts").then().statusCode(HttpStatus.SC_UNAUTHORIZED);
    verify(expertService, never()).updateDeepExpertList(any());
  }

  @Test
  @Order(6)
  void testPutDeepExpertsWithAdminRole() {
    String token = AuthenticationHelper.getToken(adminUserName, password);

    given()
        .when()
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .body(mockExpertDtos)
        .put("/deep-experts")
        .then()
        .statusCode(HttpStatus.SC_NO_CONTENT);

    verify(expertService).updateDeepExpertList(any());
  }

  @Test
  @Order(7)
  void testPutDeepExpertsWithoutBody() {
    String token = AuthenticationHelper.getToken(adminUserName, password);

    given()
        .when()
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .put("/deep-experts")
        .then()
        .statusCode(HttpStatus.SC_BAD_REQUEST);
    verify(expertService, never()).updateDeepExpertList(any());
  }

  @Test
  @Order(8)
  void testPutDeepExpertsWithAdminRoleAndEmptyList() {
    String token = AuthenticationHelper.getToken(adminUserName, password);

    given()
        .when()
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .body(new ArrayList<>())
        .put("/deep-experts")
        .then()
        .statusCode(HttpStatus.SC_NO_CONTENT);

    verify(expertService).updateDeepExpertList(any());
  }

  @Test
  @Order(9)
  void testPutDeepExpertsWithInvalidBody() {
    String token = AuthenticationHelper.getToken(adminUserName, password);
    UpdateDeepExpertListEntryDto invalidEntry = new UpdateDeepExpertListEntryDto();
    invalidEntry.technologyName = null; // Invalid state
    invalidEntry.expertInformation = "Some Expert";
    invalidEntry.description = "Some Description";
    invalidEntry.tableRow = 0;
    invalidEntry.scope = "";

    List<UpdateDeepExpertListEntryDto> invalidList = List.of(invalidEntry);

    given()
        .when()
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .body(invalidList)
        .put("/deep-experts")
        .then()
        .statusCode(HttpStatus.SC_BAD_REQUEST);

    verify(expertService, never()).updateDeepExpertList(any());
  }

  @Test
  @Order(10)
  void testPutDeepExpertsWithoutAdminRole() {
    String token = AuthenticationHelper.getToken("leia", password);

    given()
        .when()
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .body(mockExpertDtos)
        .put("/deep-experts")
        .then()
        .statusCode(HttpStatus.SC_FORBIDDEN);
    verify(expertService, never()).updateDeepExpertList(any());
  }

  @Test
  @Order(11)
  void testGetDeepExpertsWithNonNumericTechnologyId() {
    String token = AuthenticationHelper.getToken(nonAdminUserName, password);

    given()
        .when()
        .header("Authorization", "Bearer " + token)
        .get("/deep-experts/a")
        .then()
        .statusCode(HttpStatus.SC_NOT_FOUND);
    verify(expertService, never()).getDeepExpertForTechnology(anyLong());
  }

  @Test
  @Order(12)
  void testGetDeepExperts() {
    String token = AuthenticationHelper.getToken(nonAdminUserName, password);

    when(expertService.getDeepExpertList()).thenReturn(mockExperts);
    given()
        .when()
        .header("Authorization", "Bearer " + token)
        .get("/deep-experts")
        .then()
        .statusCode(HttpStatus.SC_OK)
        .body("$", hasSize(2))
        .body("[0].technologyName", equalTo("Java"))
        .body("[0].expertInformation", equalTo("Max Mustermann"))
        .body("[0].description", equalTo("Java Expertise in Backend Development"))
        .body("[1].technologyName", equalTo("JavaScript"))
        .body("[1].expertInformation", equalTo("Erika Mustermann"))
        .body("[1].description", equalTo("JavaScript Expertise in Frontend Development"));
    verify(expertService, never()).getDeepExpertForTechnology(anyLong());
    verify(expertService).getDeepExpertList();
  }
}
