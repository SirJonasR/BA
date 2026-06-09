package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.AuthenticationHelper;
import com.eviden.tecradar.entity.Category;
import com.eviden.tecradar.entity.Lifecycle;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.TecSwapElement;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.model.TecSwapDto;
import com.eviden.tecradar.service.TecSwapService;
import com.eviden.tecradar.service.UserService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class TecSwapResourceTest {
  @InjectMock private TecSwapService tecSwapService;
  @InjectMock private UserService userService;

  private static Technology getTechnology() {
    Category category = new Category();
    category.setId(1L);
    category.setName("category");
    category.setDescription("");
    Lifecycle lifecycle = new Lifecycle();
    lifecycle.setId(1L);
    lifecycle.setName("lifecycle");
    lifecycle.setDescription("");
    lifecycle.setSort(1);

    Technology technology1 = new Technology();
    technology1.setId(1L);
    technology1.setName("tec1");
    technology1.setPriority(false);
    technology1.setCategory(category);
    technology1.setLifecycle(lifecycle);
    return technology1;
  }

  @Test
  void testGetAllTecSwapElementsEndpoint() {
    Category category = new Category();
    category.setId(1L);
    category.setName("category");
    category.setDescription("");
    Lifecycle lifecycle = new Lifecycle();
    lifecycle.setId(1L);
    lifecycle.setName("lifecycle");
    lifecycle.setDescription("");
    lifecycle.setSort(1);

    Technology technology1 = new Technology();
    technology1.setId(1L);
    technology1.setName("tec1");
    technology1.setPriority(false);
    technology1.setCategory(category);
    technology1.setLifecycle(lifecycle);

    Technology technology2 = new Technology();
    technology2.setId(2L);
    technology2.setName("tec2");
    technology2.setPriority(false);
    technology2.setCategory(category);
    technology2.setLifecycle(lifecycle);

    TecSwapElement tecSwapElement1 = new TecSwapElement();
    tecSwapElement1.setId(1L);
    tecSwapElement1.setTechnology(technology1);
    tecSwapElement1.setTecSwap("TecSwap1");
    tecSwapElement1.setEditDate(null);
    tecSwapElement1.setIsCompleted(false);

    TecSwapElement tecSwapElement2 = new TecSwapElement();
    tecSwapElement2.setId(2L);
    tecSwapElement2.setTechnology(technology2);
    tecSwapElement2.setTecSwap("TecSwap2");
    tecSwapElement2.setEditDate(null);
    tecSwapElement2.setIsCompleted(false);

    List<TecSwapElement> tecSwapElements = new ArrayList<>();
    tecSwapElements.add(tecSwapElement1);
    tecSwapElements.add(tecSwapElement2);

    User user = new User();
    user.addRole(RoleName.TECSWAP);

    when(userService.findOrCreate("yoda")).thenReturn(user);
    when(tecSwapService.getAll()).thenReturn(tecSwapElements);

    String token2 = AuthenticationHelper.getToken("yoda", "test");
    given()
        .header("Authorization", "Bearer " + token2)
        .when()
        .get("/tec_swap")
        .then()
        .statusCode(200)
        .body("$.size()", is(2), "[0].tecSwap", is("TecSwap1"), "[1].tecSwap", is("TecSwap2"));
  }

  @Test
  void testGetAllTecSwapElementsNotAuthorized() {
    User user = new User();
    user.addRole(RoleName.USER);
    when(userService.findOrCreate("leia")).thenReturn(user);
    String token = AuthenticationHelper.getToken("leia", "test");
    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/tec_swap")
        .then()
        .statusCode(403);
  }

  @Test
  void testUpdateTecSwapElement() {
    Technology technology1 = getTechnology();

    TecSwapDto tecSwapDto = new TecSwapDto();
    tecSwapDto.tecSwap = "newTecSwap";
    tecSwapDto.editDate = "";
    tecSwapDto.technologyId = 1L;
    tecSwapDto.isCompleted = true;

    TecSwapElement tecSwapElement = new TecSwapElement();
    tecSwapElement.setId(1L);
    tecSwapElement.setTecSwap("newTecSwap");
    tecSwapElement.setIsCompleted(true);
    tecSwapElement.setTechnology(technology1);
    tecSwapElement.setEditDate(null);

    when(tecSwapService.update(1L, tecSwapDto)).thenReturn(tecSwapElement);
    User user = new User();
    user.addRole(RoleName.TECSWAP);
    when(userService.findOrCreate("luke")).thenReturn(user);
    String token = AuthenticationHelper.getToken("luke", "test");
    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .body(tecSwapDto)
        .when()
        .put("/tec_swap/1")
        .then()
        .statusCode(204);
  }

  @Test
  void testUpdateTecSwapElementUnauthorized() {
    User user = new User();
    user.addRole(RoleName.USER);
    when(userService.findOrCreate("leia")).thenReturn(user);
    String token = AuthenticationHelper.getToken("leia", "test");
    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .when()
        .put("/tec_swap/1")
        .then()
        .statusCode(403);
  }
}
