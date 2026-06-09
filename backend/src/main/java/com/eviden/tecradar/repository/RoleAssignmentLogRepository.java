package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.RoleAssignmentLog;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

/** Repository for RoleAssignmentLog Entity. */
@ApplicationScoped
public class RoleAssignmentLogRepository implements PanacheRepository<RoleAssignmentLog> {
  /**
   * Returns all role assginment log entries that contain changes to the roles of the given user.
   *
   * @return list of role assignment log entries ordered by datetime of the change (most recent
   *     change first)
   */
  public List<RoleAssignmentLog> findByUserName(String username) {
    return find("user.userName = ?1 order by changedAt desc", username).list();
  }
}
