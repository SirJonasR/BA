package com.eviden.tecradar.service;

import com.eviden.tecradar.model.UserRevisionEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;

/**
 * AuditHistoryService provides a generic, reusable way to retrieve audit history for any entity
 * audited by Hibernate Envers.
 *
 * <p>Usage:
 *
 * <ul>
 *   <li>Ensure your entity is audited with Hibernate Envers annotations (e.g. using,
 *       {@code @Audited}).
 *   <li>Inject AuditHistoryService into your repository or service.
 *   <li>Call {@code getHistory(Class<T> entityClass, long id)} with the audited entity class and
 *       its ID.
 *   <li>The method returns a list of {@link AuditHistoryRecord}, each containing the entity
 *       snapshot, user revision entity, and revision type.
 * </ul>
 *
 * <p>Example:
 *
 * <pre>{@code
 * @Inject
 * AuditHistoryService auditHistoryService;
 * List<AuditHistoryService.AuditHistoryRecord<MyEntity>> history =
 *     auditHistoryService.getHistory(MyEntity.class, entityId);
 * }</pre>
 *
 * <p>This approach is independent of any specific entity or DTO, making it easy to retrieve audit
 * history for any audited class in your application.
 */
@ApplicationScoped
public class AuditHistoryService {
  private final EntityManager entityManager;

  public AuditHistoryService(EntityManager entityManager) {
    this.entityManager = entityManager;
  }

  /**
   * Retrieves the audit history for a given entity.
   *
   * @param entityClass the class of the entity to retrieve history for
   * @param id of the entity to retrieve history for
   * @param <T> the type of the audited entity
   * @return a list of AuditHistoryRecords
   */
  public <T> List<AuditHistoryRecord<T>> getHistory(Class<T> entityClass, long id) {
    AuditReader reader = AuditReaderFactory.get(entityManager);
    List<?> rawResults =
        reader
            .createQuery()
            .forRevisionsOfEntity(entityClass, false, true)
            .add(AuditEntity.id().eq(id))
            .addOrder(AuditEntity.revisionNumber().desc())
            .getResultList();
    List<AuditHistoryRecord<T>> history = new ArrayList<>();
    for (Object obj : rawResults) {
      if (obj instanceof Object[] row
          && row.length == 3
          && entityClass.isInstance(row[0])
          && row[1] instanceof UserRevisionEntity
          && row[2] instanceof RevisionType) {
        history.add(
            new AuditHistoryRecord<>(
                entityClass.cast(row[0]), (UserRevisionEntity) row[1], (RevisionType) row[2]));
      }
    }
    return history;
  }

  /**
   * Represents a record in the audit history, containing the entity snapshot, user revision entity,
   * and revision type.
   *
   * @param snapshot the snapshot of the audited entity at the time of the revision
   * @param userRev the user revision entity containing user ID and timestamp of the change
   * @param revisionType the type of revision (ADD, MOD, DEL)
   * @param <T> snapshot
   */
  public record AuditHistoryRecord<T>(
      T snapshot, UserRevisionEntity userRev, RevisionType revisionType) {}
}
