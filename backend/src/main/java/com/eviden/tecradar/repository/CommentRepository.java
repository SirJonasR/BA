package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Comment;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

/** Repository for comment entity. */
@ApplicationScoped
public class CommentRepository implements PanacheRepository<Comment> {
  /**
   * Finds comments associated with a specific TecSwapElement, ordered by creation date.
   *
   * @param tecSwapElementId the ID of the TecSwapElement
   * @return a list of comments associated with the specified TecSwapElement, ordered by newest
   *     first
   */
  public List<Comment> findByTecSwapElementOrdered(Long tecSwapElementId) {
    return find("tecSwapElement.id = ?1 ORDER BY creationDate DESC", tecSwapElementId).list();
  }
}
