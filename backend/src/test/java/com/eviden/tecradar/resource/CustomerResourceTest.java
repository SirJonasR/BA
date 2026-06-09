package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.entity.Customer;
import com.eviden.tecradar.service.CustomerService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class CustomerResourceTest {

  @InjectMock CustomerService customerService;

  @Test
  public void testGetAllCustomers() {
    Customer customer1 = new Customer();
    customer1.setName("Customer1");

    Customer customer2 = new Customer();
    customer2.setName("Customer2");

    List<Customer> customers = new ArrayList<>();
    customers.add(customer1);
    customers.add(customer2);

    when(customerService.getAllCustomers()).thenReturn(customers);

    given()
        .when()
        .get("/customer")
        .then()
        .statusCode(200)
        .body(
            "$.size()", is(2),
            "[0].name", is("Customer1"),
            "[1].name", is("Customer2"));
  }
}
