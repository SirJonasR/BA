package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** Tests for Customer Entitiy */
@QuarkusTest
public class CustomerTest {

  @Test
  void testSetId() {
    Customer customer = new Customer();
    customer.setId(1L);
    Assertions.assertEquals(1L, customer.getId());
  }

  @Test
  void testSetName() {
    Customer customer = new Customer();
    customer.setName("TestCustomer");
    Assertions.assertEquals("TestCustomer", customer.getName());
  }

  //  @Test
  //  void testSetCustomerProjects() {
  //    Customer customer = new Customer();
  //    CustomerProject project1 = new CustomerProject();
  //    project1.setName("Project1");
  //
  //    CustomerProject project2 = new CustomerProject();
  //    project2.setName("Project2");
  //
  //    List<CustomerProject> projects = new ArrayList<>();
  //    projects.add(project1);
  //    projects.add(project2);
  //
  //    customer.setCustomerProjects(projects);
  //
  //    Assertions.assertEquals(2, customer.getCustomerProjects().size());
  //    Assertions.assertEquals("Project1", customer.getCustomerProjects().get(0).getName());
  //    Assertions.assertEquals("Project2", customer.getCustomerProjects().get(1).getName());
  //  }
}
