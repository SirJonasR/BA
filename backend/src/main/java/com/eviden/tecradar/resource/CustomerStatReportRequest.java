package com.eviden.tecradar.resource;

/** Data container for transferring customer request details from client to backend. */
public class CustomerStatReportRequest {

  private String[] customerNames;

  public String[] getCustomerNames() {
    return customerNames;
  }

  public void setCustomerNames(String[] customerNames) {
    this.customerNames = customerNames;
  }
}
