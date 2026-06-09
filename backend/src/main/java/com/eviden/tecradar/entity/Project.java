package com.eviden.tecradar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/** Entity for Project. */
@Entity
public class Project {
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  @Column(unique = true)
  private String name;

  @ManyToOne
  @JoinColumn(name = "industry_id")
  private Industry industry;

  @ManyToMany
  @JoinTable(
      name = "project_customer",
      joinColumns = @JoinColumn(name = "project_id"),
      inverseJoinColumns = @JoinColumn(name = "customer_id"))
  private List<Customer> customers;

  @ManyToMany
  @JsonIgnore
  @JoinTable(
      name = "project_technology",
      joinColumns = @JoinColumn(name = "project_id"),
      inverseJoinColumns = @JoinColumn(name = "technology_id"))
  private List<Technology> technologies;

  @Column(length = 1800)
  private String description;

  @OneToMany(
      mappedBy = "project",
      cascade = CascadeType.ALL,
      fetch = FetchType.EAGER,
      orphanRemoval = true)
  private List<Contact> contact = new ArrayList<>();

  @Column(name = "sales_service_link")
  private String salesServiceLink;

  @Column(length = 1800)
  private String info;

  @Column(name = "industry_specific_information", length = 1800)
  private String industrySpecificInformation;

  @Column(name = "start_date")
  private LocalDate startDate;

  @Column(name = "end_date")
  private LocalDate endDate;

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

  @JsonIgnore
  public Industry getIndustry() {
    return this.industry;
  }

  public void setIndustry(Industry industry) {
    this.industry = industry;
  }

  @JsonProperty("industry")
  public String getIndustryName() {
    return industry != null ? industry.getName() : null;
  }

  public List<Technology> getTechnologies() {
    return technologies;
  }

  public void setTechnologies(List<Technology> technologies) {
    this.technologies = technologies;
  }

  /**
   * Retrieves a list of IDs for the associated technologies.
   *
   * @return a list of technology IDs, or empty list if no technologies are associated.
   */
  @JsonProperty("technologyIds")
  public List<Long> getTechnologyIds() {
    if (technologies == null || technologies.isEmpty()) {
      return new ArrayList<>();
    }
    return technologies.stream()
        .sorted(Comparator.comparing(Technology::getName))
        .map(Technology::getId)
        .collect(Collectors.toList());
  }

  /**
   * Retrieves a list of names for the associated technologies.
   *
   * @return a list of technology names.
   */
  @JsonProperty("technologyNames")
  public List<String> getTechnologyNames() {
    if (technologies == null || technologies.isEmpty()) {
      return new ArrayList<>();
    }
    return technologies.stream()
        .sorted(Comparator.comparing(Technology::getName))
        .map(Technology::getName)
        .collect(Collectors.toList());
  }

  /**
   * Retrieves the list of customers for the project.
   *
   * @return list of customers.
   */
  public List<Customer> getCustomers() {
    if ((customers != null)) {
      customers.sort(Comparator.comparing(Customer::getName));
    }
    return customers;
  }

  public void setCustomers(List<Customer> customers) {
    this.customers = customers;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Project project = (Project) o;
    return Objects.equals(name, (project).name);
  }

  @Override
  public int hashCode() {
    return name.hashCode();
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public List<Contact> getContact() {
    return contact;
  }

  public void setContact(List<Contact> contact) {
    this.contact = contact;
  }

  public String getSalesServiceLink() {
    return this.salesServiceLink;
  }

  public void setSalesServiceLink(String salesServiceLink) {
    this.salesServiceLink = salesServiceLink;
  }

  public String getInfo() {
    return info;
  }

  public void setInfo(String info) {
    this.info = info;
  }

  public String getIndustrySpecificInformation() {
    return industrySpecificInformation;
  }

  public void setIndustrySpecificInformation(String industrySpecificInformation) {
    this.industrySpecificInformation = industrySpecificInformation;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public LocalDate getEndDate() {
    return endDate;
  }

  public void setEndDate(LocalDate endDate) {
    this.endDate = endDate;
  }
}
