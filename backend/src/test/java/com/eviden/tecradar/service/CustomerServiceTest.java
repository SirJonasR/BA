package com.eviden.tecradar.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.eviden.tecradar.entity.Customer;
import com.eviden.tecradar.repository.CustomerProjectRepository;
import com.eviden.tecradar.repository.CustomerProjectTechnologyRepository;
import com.eviden.tecradar.repository.CustomerRepository;
import com.eviden.tecradar.repository.TechnologyRepository;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class CustomerServiceTest {

  @Inject CustomerService customerService;

  @InjectMock CustomerRepository customerRepository;

  @InjectMock CustomerProjectRepository customerProjectRepository;

  @InjectMock CustomerProjectTechnologyRepository customerProjectTechnologyRepository;

  @InjectMock TechnologyRepository technologyRepository;

  @Test
  public void testGetAllCustomers() {
    Customer customer1 = new Customer();
    customer1.setName("Customer1");

    Customer customer2 = new Customer();
    customer2.setName("Customer2");

    List<Customer> customers = new ArrayList<>();
    customers.add(customer1);
    customers.add(customer2);

    when(customerRepository.listAll()).thenReturn(customers);

    List<Customer> result = customerService.getAllCustomers();
    assertEquals(2, result.size());
    assertEquals("Customer1", result.get(0).getName());
    assertEquals("Customer2", result.get(1).getName());
  }

  @Test
  public void testGetCustomer() {
    Customer customer = new Customer();
    customer.setName("Customer1");

    when(customerRepository.findByName("Customer1")).thenReturn(customer);

    Customer result = customerService.get("Customer1");
    assertEquals("Customer1", result.getName());
  }

  //  @Test
  //  public void testGetCustomerProjectsOfTechnologyByName() {
  //    Technology technology = new Technology();
  //    technology.setName("TestTechnology");
  //
  //    when(technologyRepository.findByNameIgnoreCase("TestTechnology")).thenReturn(technology);
  //    when(customerProjectTechnologyRepository.list("technology", technology))
  //        .thenReturn(new ArrayList<>());
  //
  //    List<CustomerProjectTechnology> result =
  //        customerService.getCustomerProjectsOfTechnology("TestTechnology");
  //    assertNotNull(result);
  //  }

  //  @Test
  //  public void testGetCustomerProjectsOfTechnologyByNameNotFound() {
  //    when(technologyRepository.findByNameIgnoreCase("UnknownTechnology")).thenReturn(null);
  //
  //    assertThrows(
  //        ResourceNotFoundException.class,
  //        () -> {
  //          customerService.getCustomerProjectsOfTechnology("UnknownTechnology");
  //        });
  //  }
}
