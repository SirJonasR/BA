package com.eviden.tecradar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import java.util.List;

/** entity for Subscription. */
@Entity
public class Subscription {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  @JsonIgnore @ManyToOne private User user;

  private String name;

  private int timespan;

  private String email;

  @OneToMany(mappedBy = "subscription")
  List<SubscriptionItem> subscriptionItems;

  public List<SubscriptionItem> getSubscriptionItems() {
    return subscriptionItems;
  }

  public void setSubscriptionItems(List<SubscriptionItem> subscriptionItems) {
    this.subscriptionItems = subscriptionItems;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public int getTimespan() {
    return timespan;
  }

  public void setTimespan(int timespan) {
    this.timespan = timespan;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }
}
