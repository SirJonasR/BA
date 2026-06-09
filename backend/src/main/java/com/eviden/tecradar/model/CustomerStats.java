// package com.eviden.tecradar.model;

// import com.eviden.tecradar.entity.Customer;
// import com.eviden.tecradar.entity.TechnologyCustomer;
// import com.eviden.tecradar.service.LifecycleService;
// import com.eviden.tecradar.service.TechnologyCustomerService;
// import jakarta.inject.Inject;
// import jakarta.inject.Singleton;
// import java.util.ArrayList;
// import java.util.List;

// /**
//  * DTO class representing input data for generating a detailed report on a customer. This DTO is
//  * used as the data model for the PDF template 'CustomerStatsPage'.
//  */
// @Singleton
// public class CustomerStats {

//   @Inject LifecycleService lifecycleService;
//   @Inject TechnologyCustomerService technologyCustomerService;

//   private long id;
//   private String name;
//   private int totalNumber;
//   private int maintainNumber;
//   private int adoptNumber;
//   private int assesNumber;
//   private int monitorNumber;
//   private String listOfTechnologies;
//   private int pageCountStart = 0;

//   public long getId() {
//     return id;
//   }

//   public String getName() {
//     return name;
//   }

//   public int getTotalNumber() {
//     return totalNumber;
//   }

//   public int getMaintainNumber() {
//     return maintainNumber;
//   }

//   public int getAdoptNumber() {
//     return adoptNumber;
//   }

//   public int getAssesNumber() {
//     return assesNumber;
//   }

//   public int getMonitorNumber() {
//     return monitorNumber;
//   }

//   public String getListOfTechnologies() {
//     return listOfTechnologies;
//   }

//   public int getPageCountStart() {
//     return pageCountStart;
//   }

//   public void setPageCountStart(int pageCountStart) {
//     this.pageCountStart = pageCountStart;
//   }

//   public void setId(long id) {
//     this.id = id;
//   }

//   public void setName(String name) {
//     this.name = name;
//   }

//   public void setTotalNumber(int totalNumber) {
//     this.totalNumber = (totalNumber);
//   }

//   public void setMaintainNumber(int maintainNumber) {
//     this.maintainNumber = maintainNumber;
//   }

//   public void setAdoptNumber(int adoptNumber) {
//     this.adoptNumber = adoptNumber;
//   }

//   public void setAssesNumber(int assesNumber) {
//     this.assesNumber = assesNumber;
//   }

//   public void setMonitorNumber(int monitorNumber) {
//     this.monitorNumber = monitorNumber;
//   }

//   public void setListOfTechnologies(String listOfTechnologies) {
//     this.listOfTechnologies = listOfTechnologies;
//   }

//   /**
//    * Converts a Customer entity to a CustomerStats DTO for reporting purposes.
//    *
//    * @param customer The customer entity to convert.
//    * @return The corresponding CustomerStats DTO
//    */
//   public CustomerStats convertCustomerToCustomerStats(Customer customer) {
//     CustomerStats customerStats = new CustomerStats();
//     customerStats.setName(customer.getName());
//     List<TechnologyCustomer> allTechnologyCustomers = technologyCustomerService.getAll();
//     List<TechnologyCustomer> allTechnologyCustomersFromCustomer = new ArrayList<>();
//     int maintainNumber = 0;
//     int adoptNumber = 0;
//     int assesNumber = 0;
//     int monitorNumber = 0;

//     for (TechnologyCustomer technologyCustomer : allTechnologyCustomers) {
//       if (technologyCustomer.getCustomer().getName().equals(customer.getName())) {
//         allTechnologyCustomersFromCustomer.add(technologyCustomer);
//         if (technologyCustomer.getLifecycleId() == -1L) {
//           monitorNumber++;
//         } else if (technologyCustomer.getLifecycleId() == -2L) {
//           assesNumber++;
//         } else if (technologyCustomer.getLifecycleId() == -3L) {
//           adoptNumber++;
//         } else if (technologyCustomer.getLifecycleId() == -4L) {
//           maintainNumber++;
//         }
//       }
//     }
//     StringBuilder sb = new StringBuilder();
//     for (TechnologyCustomer technologyCustomer : allTechnologyCustomersFromCustomer) {
//       sb.append(technologyCustomer.getTechnologyName())
//           .append(" | ")
//           .append(lifecycleService.get(technologyCustomer.getLifecycleId()).getName())
//           .append("\r\n");
//     }

//     customerStats.setTotalNumber(allTechnologyCustomersFromCustomer.size());
//     customerStats.setMaintainNumber(maintainNumber);
//     customerStats.setAdoptNumber(adoptNumber);
//     customerStats.setAssesNumber(assesNumber);
//     customerStats.setMonitorNumber(monitorNumber);
//     customerStats.setListOfTechnologies(sb.toString());
//     return customerStats;
//   }
// }
