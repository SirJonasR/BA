// package com.eviden.tecradar.model;

// import static org.junit.jupiter.api.Assertions.assertEquals;

// import com.eviden.tecradar.entity.Customer;
// import com.eviden.tecradar.entity.Lifecycle;
// import com.eviden.tecradar.entity.Technology;
// import com.eviden.tecradar.service.CustomerService;
// import com.eviden.tecradar.service.LifecycleService;
// import com.eviden.tecradar.service.TechnologyCustomerService;
// import com.eviden.tecradar.service.TechnologyService;
// import io.quarkus.test.junit.QuarkusTest;
// import jakarta.inject.Inject;
// import org.junit.jupiter.api.Test;

// @QuarkusTest
// public class CustomerStatsTest {
//   @Inject CustomerService customerService;
//   @Inject TechnologyCustomerService technologyCustomerService;
//   @Inject LifecycleService lifecycleService;
//   @Inject TechnologyService technologyService;

//   @Test
//   void testConvertToCustomerStats() {

//     Technology technology1 = technologyService.get(-1L);
//     Customer customer1 = customerService.getOrCreate("Customer1");
//     Lifecycle lifecycle1 = lifecycleService.get(-1L);
//     technologyCustomerService.getOrCreate(customer1, technology1, lifecycle1);
//     CustomerStats result = new CustomerStats();
//     result.technologyCustomerService = technologyCustomerService;
//     result.lifecycleService = lifecycleService;
//     result = result.convertCustomerToCustomerStats(customer1);
//     assertEquals("Customer1", result.getName());
//     assertEquals(1, result.getTotalNumber());
//     assertEquals(0, result.getId());
//     assertEquals(0, result.getMaintainNumber());
//     assertEquals(0, result.getAdoptNumber());
//     assertEquals(0, result.getAssesNumber());
//     assertEquals(1, result.getMonitorNumber());
//     assertEquals(0, result.getPageCountStart());
//     assertEquals("Quarkus | Monitor\r\n", result.getListOfTechnologies());
//   }
// }
