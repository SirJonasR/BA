package com.eviden.tecradar.resource;

/**
 * DTO for posting comments. This class is used to transfer comment data from the frontend to the
 * backend
 */
public class CommentPostRequest {
  private String content;
  boolean didTechnologyChange;
  boolean didTecSwapElementChange;

  public boolean getDidTechnologyChange() {
    return didTechnologyChange;
  }

  public void setDidTechnologyChange(boolean didTechnologyChange) {
    this.didTechnologyChange = didTechnologyChange;
  }

  public boolean getDidTecSwapElementChange() {
    return didTecSwapElementChange;
  }

  public void setDidTecSwapElementChange(boolean didTecSwapElementChange) {
    this.didTecSwapElementChange = didTecSwapElementChange;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }
}
