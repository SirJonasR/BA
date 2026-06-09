package com.eviden.tecradar.entity;

import static org.hibernate.envers.RelationTargetAuditMode.NOT_AUDITED;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDate;
import org.hibernate.envers.Audited;

/** entity for tec_swap_element. */
@Entity
@Audited // Creates a history of changes for this entity
@Table(name = "tec_swap_element")
public class TecSwapElement {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  // Audit includes the technology id, but not the full technology object
  @Audited(targetAuditMode = NOT_AUDITED)
  @OneToOne
  @JsonIgnore
  private Technology technology;

  @Column(name = "tec_swap")
  private String tecSwap;

  @Column(name = "is_completed")
  private boolean isCompleted;

  @Column(name = "edit_date")
  private LocalDate editDate;

  public Long getId() {
    return this.id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Technology getTechnology() {
    return this.technology;
  }

  public void setTechnology(Technology technology) {
    this.technology = technology;
  }

  public String getTechnologyName() {
    return this.technology.getName();
  }

  public Long getTechnologyId() {
    return this.technology.getId();
  }

  public Long getTechnologyCategoryId() {
    return this.technology.getCategoryId();
  }

  public Long getTechnologyLifecycleId() {
    return this.technology.getLifecycleId();
  }

  public boolean isTechnologyIsPriority() {
    return this.technology.isPriority();
  }

  public String getTecSwap() {
    return this.tecSwap;
  }

  public void setTecSwap(String tecSwap) {
    this.tecSwap = tecSwap;
  }

  public boolean isIsCompleted() {
    return this.isCompleted;
  }

  public void setIsCompleted(boolean completed) {
    this.isCompleted = completed;
  }

  public LocalDate getEditDate() {
    return this.editDate;
  }

  public void setEditDate(LocalDate editDate) {
    this.editDate = editDate;
  }
}
