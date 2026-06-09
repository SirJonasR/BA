package com.eviden.tecradar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import java.time.LocalDateTime;

/** Entity for logging changes in User role assignment. Every change will be logged. */
@Entity(name = "role_assignment_log")
public class RoleAssignmentLog {
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  @JsonIgnore
  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "role_name")
  private RoleName roleName;

  @Enumerated(EnumType.STRING)
  @Column(name = "role_action")
  private RoleAction action;

  @ManyToOne
  @JoinColumn(name = "changed_by_id")
  private User changedBy;

  @Column(name = "changed_at")
  private LocalDateTime changedAt;

  public Long getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public RoleName getRoleName() {
    return roleName;
  }

  public void setRoleName(RoleName roleName) {
    this.roleName = roleName;
  }

  public RoleAction getRoleAction() {
    return action;
  }

  public void setRoleAction(RoleAction action) {
    this.action = action;
  }

  public User getChangedByUser() {
    return changedBy;
  }

  public void setChangedByUser(User changedBy) {
    this.changedBy = changedBy;
  }

  public LocalDateTime getChangedAt() {
    return changedAt;
  }

  public void setChangedAt(LocalDateTime changedAt) {
    this.changedAt = changedAt;
  }
}
