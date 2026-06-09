package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Counter;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.repository.CounterRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.util.List;
import org.jboss.logging.Logger;

/** Service class for counter related tasks. */
@Singleton
public class CounterService {
  @Inject CounterRepository counterRepository;
  @Inject Logger logger;

  /**
   * Increments the view count if user already viewed the technology, otherwise new counter gets
   * created with view count 1.
   *
   * @param user the user who is viewing the technology.
   * @param technology the technology which got viewed
   */
  @Transactional
  public void incrementCounter(User user, Technology technology) {
    Counter counter = counterRepository.findByTechnologyAndUser(technology, user);
    if (counter == null) {
      Counter newCounter = new Counter();
      newCounter.setUser(user);
      newCounter.setTechnology(technology);
      newCounter.setViewCount(1L);
      logger.debug("Counter increased");
      counterRepository.persistAndFlush(newCounter);
    } else {
      counter.setViewCount(counter.getViewCount() + 1);
      logger.info("Counter increased");
      counterRepository.persistAndFlush(counter);
    }
  }

  /**
   * Deletes counters which contains given technology.
   *
   * @param technology the technology
   */
  @Transactional
  public void deleteByTechnology(Technology technology) {
    List<Counter> counterList = counterRepository.findByTechnology(technology);
    for (Counter counter : counterList) {
      logger.info("Counter for technology " + technology.getId() + " deleted");
      counterRepository.delete(counter);
    }
  }

  public List<Counter> getAll() {
    return counterRepository.listAll();
  }

  public List<Counter> getAllByTechnology(Technology technology) {
    return counterRepository.findByTechnology(technology);
  }

  public Long getCount(Technology technology) {
    return (long) getAllByTechnology(technology).size();
  }
}
