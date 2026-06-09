package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.History;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;

/** Repository for history entity. */
@ApplicationScoped
public class HistoryRepository implements PanacheRepository<History> {

  /**
   * Finds the most recent change entry that a given user performed on a given technology.
   *
   * @param user the user who performed the change
   * @param technology the technology that was changed
   * @return an optional containing the most recent history entry, or empty if none found
   */
  public Optional<History> findMostRecentByUserAndTechnology(User user, Technology technology) {
    return find("user = ?1 and technology = ?2 order by changeDate desc", user, technology)
        .firstResultOptional();
  }

  /**
   * Finds the most recent change entry for a given technology that was made earlier than the
   * specified currentHistory.
   *
   * @param technology the technology to search for
   * @param currentHistory the current history entry to find the previous entry before
   * @return an optional containing the previous history entry, or empty if none found
   */
  public Optional<History> findPreviousEntryBefore(Technology technology, History currentHistory) {
    return find(
            "technology = ?1 and changeDate < ?2 order by changeDate desc",
            technology,
            currentHistory.getDate())
        .firstResultOptional();
  }
}
