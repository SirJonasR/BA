package com.eviden.tecradar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import java.util.Objects;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/** Entity for CustomerProjectTechnology. */
@Entity
public class CustomerProjectTechnology {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  @ManyToOne(fetch = FetchType.EAGER)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private CustomerProject customerProject;

  @ManyToOne
  @JsonIgnore
  @OnDelete(action = OnDeleteAction.CASCADE)
  private Technology technology;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CustomerProjectTechnology that = (CustomerProjectTechnology) o;
    return Objects.equals(customerProject, that.customerProject)
        && Objects.equals(technology, that.technology);
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public CustomerProject getCustomerProject() {
    return customerProject;
  }

  public void setCustomerProject(CustomerProject customerProject) {
    this.customerProject = customerProject;
  }

  public Technology getTechnology() {
    return technology;
  }

  public void setTechnology(Technology technology) {
    this.technology = technology;
  }
}
