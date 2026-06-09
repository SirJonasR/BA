package com.eviden.tecradar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.SequenceGenerator;
import java.util.List;
import java.util.Objects;

/** Entity for customer. */
@Entity
public class Customer {

  //  @OneToMany(mappedBy = "customer")
  //  @JsonIgnore
  //  List<CustomerProject> customerProjects;

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  @Column(unique = true)
  private String name;

  @JsonIgnore
  @ManyToMany(mappedBy = "customers")
  private List<Project> projects;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  //  public List<CustomerProject> getCustomerProjects() {
  //    return customerProjects;
  //  }
  //
  //  public void setCustomerProjects(List<CustomerProject> customerProjects) {
  //    this.customerProjects = customerProjects;
  //  }

  public List<Project> getProjects() {
    return projects;
  }

  public void setProjects(List<Project> projects) {
    this.projects = projects;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Customer customer = (Customer) o;
    return Objects.equals(name, customer.getName());
  }

  @Override
  public int hashCode() {
    return name.hashCode();
  }
}
