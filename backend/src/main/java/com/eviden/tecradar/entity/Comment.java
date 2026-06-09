package com.eviden.tecradar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Entity representing a comment. Every comment is associated with a TecSwapElement and/or a
 * Technology.
 */
@Entity
public class Comment {
  /**
   * The maximum length of a comment. Changes to this value should be reflected in the database
   * schema as well.
   */
  public static final int MAX_COMMENT_LENGTH = 1000;

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  /**
   * The corresponding history entry for this comment. This is used to link the comment to a
   * specific history entry of a technology change.
   */
  @ManyToOne
  @JoinColumn(name = "corresponding_history_id")
  private History correspondingHistory;

  /**
   * The previous history entry for this comment. This is used to link the comment to the previous
   * state of the TecSwapElement before the current change.
   */
  @ManyToOne
  @JoinColumn(name = "previous_history_id")
  private History previousHistory;

  /**
   * The revision ID of the TecSwapElement that this comment is associated with. This is used to
   * track changes in the TecSwapElement.
   */
  @Column(name = "tecswap_revision_id")
  private int tecswapRevisionId;

  /**
   * The base revision ID of the TecSwapElement. This is used to track the original state of the
   * TecSwapElement before any changes were made.
   */
  @Column(name = "base_tecswap_revision_id")
  private int baseTecswapRevisionId;

  @CreationTimestamp
  @Column(name = "creation_date")
  private LocalDateTime creationDate;

  @JsonIgnore
  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  @JsonIgnore
  @ManyToOne
  @JoinColumn(name = "tecswap_element_id")
  private TecSwapElement tecSwapElement;

  /** The content of the comment. This is the text that the user has written as a comment. */
  @Column(length = MAX_COMMENT_LENGTH)
  private String content;

  // Getters and setters below
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public History getCorrespondingHistory() {
    return correspondingHistory;
  }

  public void setCorrespondingHistory(History correspondingHistory) {
    this.correspondingHistory = correspondingHistory;
  }

  public int getTecswapRevisionId() {
    return tecswapRevisionId;
  }

  public void setTecswapRevisionId(int tecswapRevisionId) {
    this.tecswapRevisionId = tecswapRevisionId;
  }

  public int getBaseTecswapRevisionId() {
    return baseTecswapRevisionId;
  }

  public void setBaseTecswapRevisionId(int baseTecswapRevisionId) {
    this.baseTecswapRevisionId = baseTecswapRevisionId;
  }

  public History getPreviousHistory() {
    return previousHistory;
  }

  public void setPreviousHistory(History previousHistory) {
    this.previousHistory = previousHistory;
  }

  public LocalDateTime getCreationDate() {
    return creationDate;
  }

  public void setCreationDate(LocalDateTime creationDate) {
    this.creationDate = creationDate;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public TecSwapElement getTecSwapElement() {
    return tecSwapElement;
  }

  public void setTecSwapElement(TecSwapElement tecSwapElement) {
    this.tecSwapElement = tecSwapElement;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }
}
