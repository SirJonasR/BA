package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.TecSwapElement;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.service.AuditHistoryService;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

/** Repository for tec_swap_element entity. */
@ApplicationScoped
public class TecSwapRepository implements PanacheRepository<TecSwapElement> {

  @Inject AuditHistoryService auditHistoryService;

  public TecSwapElement findByTechnology(Technology tech) {
    return find("technology", tech).firstResult();
  }

  public void deleteByTechnology(Technology tech) {
    delete("technology", tech);
  }

  /**
   * Retrieves the history of changes for a TecSwapElement identified by its ID.
   *
   * @param id the ID of the TecSwapElement for which to retrieve the history
   * @return a list of AuditHistoryService.AuditHistoryRecord containing the history records
   */
  public List<AuditHistoryService.AuditHistoryRecord<TecSwapElement>> getHistory(long id) {
    return auditHistoryService.getHistory(TecSwapElement.class, id);
  }
}
