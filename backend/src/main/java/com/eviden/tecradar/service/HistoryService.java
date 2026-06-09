package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Certificate;
import com.eviden.tecradar.entity.Customer;
import com.eviden.tecradar.entity.History;
import com.eviden.tecradar.entity.Project;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.EmbeddedCertificate;
import com.eviden.tecradar.model.EmbeddedProject;
import com.eviden.tecradar.repository.HistoryRepository;
import com.eviden.tecradar.repository.TechnologyRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

/** Service for history related tasks. */
@ApplicationScoped
public class HistoryService {
  @Inject HistoryRepository historyRepository;
  @Inject TechnologyRepository technologyRepository;
  @Inject Logger logger;

  /**
   * Create and persist a history entry for a given user and technology.
   *
   * @param user the user
   * @param technology the technology
   * @return history entry
   */
  public History create(User user, Technology technology) {
    History history = new History();
    history.setTechnology(technology);
    history.setUser(user);
    history.setDate();
    history.setName(technology.getName());
    history.setDescription(technology.getDescription());
    history.setShortDescription(
        technology.getShortDescription() == null ? "" : technology.getShortDescription());
    history.setLifecycle(technology.getLifecycle());
    history.setCategory(technology.getCategory());
    history.setPictureId(technology.getPictureId());
    history.setPriority(technology.isPriority());
    history.setTags(
        technology.getTags().stream().filter(tag -> !tag.isEmpty()).collect(Collectors.toList()));
    history.setProjects(
        technology.getProjects().stream()
            .map(this::convertsProjectToProjectTh)
            .collect(Collectors.toList()));
    history.setCertificates(
        technology.getCertificates().stream()
            .map(this::convertsCertificateToCertificateTh)
            .collect(Collectors.toList()));
    history.setConnectedTechnologyNames(
        getConnectedTechnologyNames(technology.getConnectedTechnologyIds()));

    logger.info(
        "History with user "
            + user.getUserName()
            + " and technology "
            + technology.getName()
            + " created");
    historyRepository.persistAndFlush(history);
    return history;
  }

  /**
   * Converts a project to an embeddedProject.
   *
   * @param project which should be converted
   * @return Converted embedded_Project.
   */
  public EmbeddedProject convertsProjectToProjectTh(Project project) {
    EmbeddedProject embeddedProject = new EmbeddedProject();
    embeddedProject.name = project.getName();
    embeddedProject.description = project.getDescription();
    embeddedProject.info = project.getInfo();
    embeddedProject.customers =
        project.getCustomers().stream().map(Customer::getName).toList().toString();
    if (!(project.getStartDate() == null)) {
      embeddedProject.startDate = project.getStartDate();
    } else {
      embeddedProject.startDate = null;
    }
    return embeddedProject;
  }

  /**
   * Converts a certificate to an embeddedCertificate for history.
   *
   * @param certificate Which should be converted.
   * @return The converted embeddedCertificate.
   */
  public EmbeddedCertificate convertsCertificateToCertificateTh(Certificate certificate) {
    EmbeddedCertificate embeddedCertificate = new EmbeddedCertificate();
    embeddedCertificate.name = certificate.getName();
    embeddedCertificate.description = certificate.getDescription();
    embeddedCertificate.followUps =
        certificate.getFollowUps().stream().map(Certificate::getName).toList().toString();
    embeddedCertificate.pres =
        certificate.getPrerequisites().stream().map(Certificate::getName).toList().toString();
    return embeddedCertificate;
  }

  /**
   * Get a list of all technology names from the given technology ids.
   *
   * @param ids identifiers of the technologies.
   * @return A list of Technology names.
   */
  public List<String> getConnectedTechnologyNames(List<Long> ids) {
    List<String> technologyNames = new ArrayList<>();
    for (Long id : ids) {
      Technology technology = technologyRepository.findById(id);
      technologyNames.add(technology.getName());
    }
    return technologyNames;
  }

  /**
   * Provide all history entries for a given technology.
   *
   * @param technologyId technology identifier
   * @return list of history entries
   * @throws ResourceNotFoundException if technology does not exist
   */
  public List<History> getHistoryForTechnology(Long technologyId) throws ResourceNotFoundException {
    Technology technology = technologyRepository.findById(technologyId);
    if (technology == null) {
      throw new ResourceNotFoundException("No technology found for id = " + technologyId);
    }
    List<History> histories = historyRepository.list("technology", technology);
    histories.sort(Comparator.comparing(History::getDate));
    return histories;
  }

  /**
   * Delete all history entries for a given technology.
   *
   * @param technology the technology
   */
  public void deleteHistoryForTechnology(Technology technology) {
    logger.info("History with technology " + technology.getName() + " deleted");
    historyRepository.delete("technology", technology);
  }
}
