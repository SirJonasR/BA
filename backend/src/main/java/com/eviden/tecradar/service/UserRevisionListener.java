package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.model.UserRevisionEntity;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.inject.spi.CDI;
import org.hibernate.envers.RevisionListener;

/**
 * This listener is invoked whenever a new revision is created in the Envers auditing system (for
 * example a change of an entity that is annotated with @Audited). This listener sets the user ID of
 * the user who made the change, allowing tracking of changes by user.
 */
public class UserRevisionListener implements RevisionListener {

  @Override
  public void newRevision(Object revisionEntity) {
    UserRevisionEntity rev = (UserRevisionEntity) revisionEntity;
    SecurityIdentity identity = CDI.current().select(SecurityIdentity.class).get();

    if (identity != null && !identity.isAnonymous()) {
      String username = identity.getPrincipal().getName();
      UserService userService = CDI.current().select(UserService.class).get();
      User user = userService.get(username);
      rev.setUserId(user.getId());
    } else {
      // Quarkus system changes (e.g. setup of local db) use an anonymous identity
      rev.setUserId(null);
    }
  }
}
