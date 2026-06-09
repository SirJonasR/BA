package com.eviden.tecradar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import java.util.List;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * Tag entity represents a tag that can be associated with multiple technologies.
 *
 * @author Markus Scherz
 */
@Entity
public class Tag {

  /** The unique identifier for each tag. This is also the name of the tag. */
  @Id
  @Column(length = 25)
  private String name;

  /**
   * List of technologies associated with this tag. Managed via lazy fetch strategy and cascade
   * deletion if the Tag entity is removed.
   */
  @JsonIgnore
  @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<Technology> technologies;

  /**
   * Returns the name of the tag. The name is trimmed and null values are converted to empty
   * strings.
   *
   * @return the name of the tag
   */
  public String getName() {
    if (name == null) {
      return "";
    }
    return name.strip();
  }

  /**
   * Sets the name of the tag.
   *
   * @param name the name of the tag
   */
  public void setName(String name) {
    if (name.isBlank()) {
      throw new IllegalArgumentException("Tag name cannot be empty");
    }
    this.name = name.strip();
  }

  public List<Technology> getTechnologies() {
    return technologies;
  }

  public void setTechnologies(List<Technology> technologies) {
    this.technologies = technologies;
  }
}
