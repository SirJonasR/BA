package com.eviden.tecradar.model;

import java.time.LocalDateTime;
import java.util.Map;

/** DTO for comments. This class is used to transfer comments to the frontend */
public class CommentDto {
  private String text;
  private String authorUsername;
  private LocalDateTime date;

  /**
   * Map of changes associated with the comment. For example: - "Priorität": false -> true,
   * "Lifecycle": "Deprecated" -> "Adopt"
   */
  private Map<String, String> changes;

  public Map<String, String> getChanges() {
    return changes;
  }

  public void setChanges(Map<String, String> changes) {
    this.changes = changes;
  }

  // Constructors
  public CommentDto() {}

  /** Constructor for CommentDto. */
  public CommentDto(String text, String authorUsername, LocalDateTime date) {
    this.text = text;
    this.authorUsername = authorUsername;
    this.date = date;
  }

  // Getters and setters
  public String getText() {
    return text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public String getAuthorUsername() {
    return authorUsername;
  }

  public void setAuthorUsername(String authorUsername) {
    this.authorUsername = authorUsername;
  }

  public LocalDateTime getDate() {
    return date;
  }

  public void setDate(LocalDateTime date) {
    this.date = date;
  }
}
