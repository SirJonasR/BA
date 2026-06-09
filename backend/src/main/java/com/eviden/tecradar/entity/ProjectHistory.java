package com.eviden.tecradar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.hibernate.annotations.CreationTimestamp;

/** Entity for ProjectHistory. */
@Entity
@Table(name = "project_history")
public class ProjectHistory {
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  @Column(name = "change_date")
  @CreationTimestamp
  private LocalDateTime changeDate;

  @JsonIgnore @ManyToOne private User user;
  @JsonIgnore @ManyToOne private Project project;

  @JoinTable(
      name = "project_history_technology",
      joinColumns = @JoinColumn(name = "project_history_id"),
      inverseJoinColumns = @JoinColumn(name = "technology_id"))
  @JsonIgnore
  @ManyToMany
  private List<Technology> technologies;

  @JoinTable(
      name = "project_history_customer",
      joinColumns = @JoinColumn(name = "project_history_id"),
      inverseJoinColumns = @JoinColumn(name = "customer_id"))
  @JsonIgnore
  @ManyToMany
  private List<Customer> customers;

  private String name;

  @Column(length = 1800)
  private String description;

  @OneToMany(
      mappedBy = "projectHistory",
      cascade = CascadeType.ALL,
      fetch = FetchType.EAGER,
      orphanRemoval = true)
  private List<ContactHistory> contact;

  @Column(name = "sales_service_Link")
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

  public LocalDateTime getChangeDate() {
    return changeDate;
  }

  public void setChangeDate(LocalDateTime changeDate) {
    this.changeDate = changeDate;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  /**
   * Gets the name of the user, who updated or created the project (history).
   *
   * @return the name of the user otherwise empty.
   */
  public String getUsername() {
    if (user == null) {
      return "";
    }
    return this.user.getUserName();
  }

  public Project getProject() {
    return project;
  }

  public void setProject(Project project) {
    this.project = project;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public List<ContactHistory> getContact() {
    return contact;
  }

  public void setContact(List<ContactHistory> contact) {
    this.contact = contact;
  }

  public String getSalesServiceLink() {
    return salesServiceLink;
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

  public List<Technology> getTechnologies() {
    return technologies;
  }

  public void setTechnologies(List<Technology> technologies) {
    this.technologies = technologies;
  }

  public List<Long> getTechnologyIds() {
    return technologies.stream().map(Technology::getId).collect(Collectors.toList());
  }

  public List<String> getTechnologyNames() {
    return technologies.stream().map(Technology::getName).collect(Collectors.toList());
  }

  public List<Customer> getCustomers() {
    return customers;
  }

  public void setCustomers(List<Customer> customers) {
    this.customers = customers;
  }

  public List<String> getCustomerNames() {
    return customers.stream().map(Customer::getName).collect(Collectors.toList());
  }

  public LocalDate getEndDate() {
    return endDate;
  }

  public void setEndDate(LocalDate endDate) {
    this.endDate = endDate;
  }
}
