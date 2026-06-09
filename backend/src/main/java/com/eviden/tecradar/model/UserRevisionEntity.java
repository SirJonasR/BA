package com.eviden.tecradar.model;

import com.eviden.tecradar.service.UserRevisionListener;
import jakarta.persistence.Entity;
import org.hibernate.envers.DefaultRevisionEntity;
import org.hibernate.envers.RevisionEntity;

/**
 * Everytime a change is made to an audited entity, a new revision is created. This revision entity
 * is used to save the user_id (who changed an audited entity) and timestamp of the change. See
 * also: {@link com.eviden.tecradar.service.UserRevisionListener}
 */
@Entity
@RevisionEntity(UserRevisionListener.class)
public class UserRevisionEntity extends DefaultRevisionEntity {

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
  }

  private Long userId;
}
