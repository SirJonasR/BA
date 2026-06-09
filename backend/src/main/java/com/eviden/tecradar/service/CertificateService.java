package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Certificate;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.repository.CertificateRepository;
import com.eviden.tecradar.repository.TechnologyRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

/** Service for customer related tasks. */
@ApplicationScoped
public class CertificateService {
  @Inject CertificateRepository certificateRepository;
  @Inject TechnologyRepository technologyRepository;
  @Inject Logger logger;

  private static List<Certificate> getCertificateList(
      List<String> certificateNames, List<String> certificateDescription) {
    List<Certificate> certificateList = new ArrayList<>();

    int index = 0;
    for (String certificateName : certificateNames) {
      Certificate certificate = new Certificate();
      certificate.setName(certificateName);
      if (!certificateDescription.isEmpty()) {
        certificate.setDescription(certificateDescription.get(index));
      }
      index++;
      certificateList.add(certificate);
    }
    return certificateList;
  }

  /**
   * Get a list of all certificate from the database.
   *
   * @return a list of all certificates alphabetically sorted.
   */
  public List<Certificate> getAllCertificates() {
    return certificateRepository.listAll().stream()
        .sorted(Comparator.comparing(certificate -> certificate.getName().toLowerCase()))
        .collect(Collectors.toList());
  }

  /**
   * Creates or updates a customer.
   *
   * @param technologyName technology name
   * @param certificateNames customer name
   * @param certificateDescription project name
   */
  @Transactional
  public List<Certificate> createOrUpdateCertificates(
      String technologyName,
      List<String> certificateNames,
      List<String> certificateDescription,
      List<String> certificatePrerequisites,
      List<String> certificateFollowUps) {
    List<Certificate> certificateList = new ArrayList<>();
    Technology technology = technologyRepository.findByNameIgnoreCase(technologyName);
    int indexP = 0;
    int indexF = 0;

    for (int i = 0; i < certificateNames.size(); i++) {
      Certificate certificate = findOrCreateCertificate(certificateNames.get(i));
      if (certificate.getName().trim().isEmpty()) {
        logger.warn("Certificate name is empty");
        throw new IllegalArgumentException("Certificate name must not be empty");
      }
      certificate.setDescription(certificateDescription.get(i));
      certificate.setTechnology(technology);
      List<Certificate> pre = new ArrayList<>();
      List<Certificate> followUps = new ArrayList<>();
      if (!certificatePrerequisites.isEmpty() && !certificateFollowUps.isEmpty()) {
        while (true) {
          if (certificatePrerequisites.get(indexP).isEmpty()) {
            indexP++;
            break;
          }
          Long idP = Long.valueOf(certificatePrerequisites.get(indexP));
          pre.add(get(idP));
          indexP++;
        }
        while (true) {
          if (certificateFollowUps.get(indexF).isEmpty()) {
            indexF++;
            break;
          }
          Long idF = Long.valueOf(certificateFollowUps.get(indexF));
          followUps.add(get(idF));
          indexF++;
        }
        if (!pre.isEmpty()) {
          certificate.setPrerequisites(pre);
        } else {
          certificate.setPrerequisites(new ArrayList<>());
        }
        if (!followUps.isEmpty()) {
          certificate.setFollowUps(followUps);
        } else {
          certificate.setFollowUps(new ArrayList<>());
        }
      }
      certificateList.add(certificate);
      certificateRepository.persistAndFlush(certificate);
    }

    return certificateList;
  }

  /**
   * Finds an existing certificate or creates a new one for the given name.
   *
   * @param name of the certificate
   * @return new or existing certificate.
   */
  public Certificate findOrCreateCertificate(String name) {
    if (certificateRepository.findByName(name) != null) {
      return certificateRepository.findByName(name);
    } else {
      Certificate certificate = new Certificate();
      certificate.setName(name);
      return certificate;
    }
  }

  /**
   * Gets a certificate with given name if it exists.
   *
   * @param name of the certificate
   * @return the certificate
   */
  public Certificate get(String name) {
    return certificateRepository.findByName(name);
  }

  public Certificate get(Long id) {
    return certificateRepository.findById(id);
  }

  /**
   * Deletes a certificate.
   *
   * @param certificate of the certificate
   */
  @Transactional
  public void delete(Certificate certificate) {
    logger.info("Certificate " + certificate.getName() + " deleted");
    List<Certificate> all = getAllCertificates();
    for (Certificate c : all) {
      c.getPrerequisites().remove(certificate);
      c.getFollowUps().remove(certificate);
    }
    certificate.getFollowUps().clear();
    certificate.getPrerequisites().clear();
    certificateRepository.delete(certificate);
  }

  /**
   * Deletes CustomerProjectTechnology for given id.
   *
   * @param technology technology
   */
  @Transactional
  public void deleteCertificateByTechnology(Technology technology) {
    logger.info("Certificates with technology " + technology.getName() + " deleted");
    certificateRepository.delete("technology", technology);
  }

  /**
   * Deletes all certificates that are not used in a technology.
   *
   * @param technology given technology
   * @param certificateNames given certificate names.
   */
  public void deleteUnusedCertificates(Technology technology, List<String> certificateNames) {
    if (technology.getCertificates().isEmpty()) {
      return;
    }
    for (Certificate certificate : technology.getCertificates()) {
      if (certificateNames.isEmpty() || !certificateNames.contains(certificate.getName())) {
        deleteFollowUpTextForAll(certificate);
        deletePrerequisitesTextForAll(certificate);
        delete(certificate);
      }
    }
  }

  /**
   * Deletes the follow-up text in all certificates, which had the given certificate as follow-up.
   *
   * @param certificate given certificate.
   */
  public void deleteFollowUpTextForAll(Certificate certificate) {
    List<Certificate> certificatesReferencingFollowUps =
        certificateRepository.findByFollowUp(certificate);
    for (Certificate certificate1 : certificatesReferencingFollowUps) {
      String description = certificate1.getDescription();
      String updatedDescription =
          description.replace("\n**Empfohlene Folgezertifikat:** " + certificate.getName(), "");
      certificate1.setDescription(updatedDescription);
      certificateRepository.persistAndFlush(certificate1);
    }
  }

  /**
   * Deletes the prerequisite text in all certificates, which had the given certificate as
   * prerequisites.
   *
   * @param certificate given certificate.
   */
  public void deletePrerequisitesTextForAll(Certificate certificate) {
    List<Certificate> certificatesReferencingPrerequisites =
        certificateRepository.findByPrerequisites(certificate);
    for (Certificate certificate1 : certificatesReferencingPrerequisites) {
      String description = certificate1.getDescription();
      String updatedDescription =
          description.replace("\n**Empfohlene Vorgängerzertifikat:** " + certificate.getName(), "");
      certificate1.setDescription(updatedDescription);
      certificateRepository.persistAndFlush(certificate1);
    }
  }
}
