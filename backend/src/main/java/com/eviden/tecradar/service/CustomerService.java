package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Customer;
import com.eviden.tecradar.repository.CustomerProjectRepository;
import com.eviden.tecradar.repository.CustomerProjectTechnologyRepository;
import com.eviden.tecradar.repository.CustomerRepository;
import com.eviden.tecradar.repository.TechnologyRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

/** Service for customer related tasks. */
@ApplicationScoped
public class CustomerService {
  @Inject CustomerRepository customerRepository;
  @Inject CustomerProjectRepository customerProjectRepository;
  @Inject CustomerProjectTechnologyRepository customerProjectTechnologyRepository;
  @Inject TechnologyRepository technologyRepository;
  @Inject Logger logger;

  /**
   * Get a list of all customers from the database.
   *
   * @return a list of all customers alphabetically sorted.
   */
  public List<Customer> getAllCustomers() {
    return customerRepository.listAll().stream()
        .sorted(Comparator.comparing(customer -> customer.getName().toLowerCase()))
        .collect(Collectors.toList());
  }

  //  public List<CustomerProject> getAllCustomerProjects() {
  //    return customerProjectRepository.listAll();
  //  }

  /**
   * Gets a customer with given name if it exists.
   *
   * @param name of the customer
   * @return the customer
   */
  public Customer get(String name) {
    return customerRepository.findByName(name);
  }

  //  /**
  //   * Gets a list of CustomerProjectTechnology for given technologyName.
  //   *
  //   * @param technologyName name of the given technology
  //   * @return list of CustomerProjectTechnology
  //   */
  //  public List<CustomerProjectTechnology> getCustomerProjectsOfTechnology(String technologyName)
  // {
  //    Technology technology = technologyRepository.findByNameIgnoreCase(technologyName);
  //    if (technology == null) {
  //      throw new ResourceNotFoundException("No Technology found for Name: " + technologyName);
  //    }
  //    return customerProjectTechnologyRepository.list("technology", technology);
  //  }
  //
  //  /**
  //   * Gets a list of technologies associated with a specific project and customer.
  //   *
  //   * @param projectName the name of the project
  //   * @param customerName the name of the customer
  //   * @return list of technologies used in the specified project of the specified customer
  //   */
  //  public List<Technology> getTechnologiesOfProject(String projectName, String customerName) {
  //    Customer customer = customerRepository.findByName(customerName);
  //    if (customer == null) {
  //      throw new ResourceNotFoundException("No Customer found for Name: " + customerName);
  //    }
  //
  //    CustomerProject customerProject =
  //        customerProjectRepository
  //            .find("customer.id = ?1 and name = ?2", customer.getId(), projectName)
  //            .firstResult();
  //    if (customerProject == null) {
  //      throw new ResourceNotFoundException(
  //          "No Project found for Name: " + projectName + " for Customer: " + customerName);
  //    }
  //
  //    return customerProject.getCustomerProjectTechnologies().stream()
  //        .map(CustomerProjectTechnology::getTechnology)
  //        .collect(Collectors.toList());
  //  }

  /**
   * Deletes a customer.
   *
   * @param customer of the customer
   */
  @Transactional
  public void delete(Customer customer) {
    logger.info("Customer with name " + customer.getName() + " deleted");
    customerRepository.delete(customer);
  }

  //  /**
  //   * Deletes CustomerProjectTechnology for given id.
  //   *
  //   * @param technology technology
  //   */
  //  @Transactional
  //  public void deleteCustomerProjectTechnologyByTechnology(Technology technology) {
  //    customerProjectTechnologyRepository.delete("technology", technology);
  //  }

  @Transactional
  public void create(Customer customer) {
    logger.info("Customer " + customer.getName() + " created");
    customerRepository.persistAndFlush(customer);
  }
}
