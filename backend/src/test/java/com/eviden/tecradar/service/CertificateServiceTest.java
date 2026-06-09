package com.eviden.tecradar.service;

import static org.junit.Assert.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.entity.Certificate;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.repository.CertificateRepository;
import com.eviden.tecradar.repository.TechnologyRepository;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.ArgumentCaptor;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CertificateServiceTest {

  @Inject CertificateService certificateService;

  @InjectMock CertificateRepository certificateRepository;

  @InjectMock TechnologyRepository technologyRepository;

  @Test
  public void testGetAllCertificates() {
    Certificate certificate1 = new Certificate();
    certificate1.setName("Certificate1");

    Certificate certificate2 = new Certificate();
    certificate2.setName("Certificate2");

    List<Certificate> certificates = new ArrayList<>();
    certificates.add(certificate1);
    certificates.add(certificate2);

    when(certificateRepository.listAll()).thenReturn(certificates);

    List<Certificate> result = certificateService.getAllCertificates();
    assertEquals(2, result.size());
    assertEquals("Certificate1", result.get(0).getName());
    assertEquals("Certificate2", result.get(1).getName());
  }

  @Test
  public void testGetCertificate() {
    Certificate certificate = new Certificate();
    certificate.setName("Certificate1");

    when(certificateRepository.findByName("Certificate1")).thenReturn(certificate);
    when(certificateRepository.findById(1L)).thenReturn(certificate);

    Certificate result = certificateService.get("Certificate1");
    Certificate result2 = certificateService.get(1L);
    assertEquals("Certificate1", result.getName());
    assertEquals("Certificate1", result2.getName());
  }

  @Test
  public void testCreateOrUpdateCertificate() {
    Technology technology = new Technology();
    technology.setName("TestTechnology");

    when(technologyRepository.findByNameIgnoreCase("TestTechnology")).thenReturn(technology);
    when(certificateRepository.findByName(anyString())).thenReturn(null);

    List<String> certificateNames = List.of("Certificate1", "Certificate2");
    List<String> certificateDescription = List.of("Description1", "Description2");

    certificateService.createOrUpdateCertificates(
        "TestTechnology",
        certificateNames,
        certificateDescription,
        new ArrayList<>(),
        new ArrayList<>());
    verify(certificateRepository, times(2)).persistAndFlush(any(Certificate.class));
    IllegalArgumentException expectedException =
        assertThrows(
            IllegalArgumentException.class,
            () -> {
              Certificate cert = certificateService.findOrCreateCertificate("");
              if (cert.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Certificate name must not be empty");
              }
            });

    Assertions.assertTrue(
        expectedException.getMessage().contains("Certificate name must not be empty"));
    certificateService.createOrUpdateCertificates(
        "t1", new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
  }

  @Test
  public void testDelete() {
    Certificate certificate = new Certificate();
    List<Certificate> certificates = new ArrayList<>();
    certificates.add(new Certificate());
    when(certificateService.getAllCertificates()).thenReturn(certificates);
    certificateService.delete(certificate);
    verify(certificateRepository).delete(certificate);
  }

  @Test
  public void testDeleteFollowUpTextForAll() {
    Certificate followUp = new Certificate();
    followUp.setName("Z2");
    Certificate referencingCert = new Certificate();
    referencingCert.setDescription("Intro\n**Empfohlene Folgezertifikat:** Z2");
    when(certificateRepository.findByFollowUp(followUp)).thenReturn(List.of(referencingCert));
    certificateService.deleteFollowUpTextForAll(followUp);
    ArgumentCaptor<Certificate> captor = ArgumentCaptor.forClass(Certificate.class);
    verify(certificateRepository).persistAndFlush(captor.capture());
    String updated = captor.getValue().getDescription();
    Assertions.assertEquals("Intro", updated);
  }

  @Test
  public void testDeletePrerequisitesTextForAll() {
    Certificate prereq = new Certificate();
    prereq.setName("Z2");
    Certificate referencingCert = new Certificate();
    referencingCert.setDescription("Intro\n**Empfohlene Vorgängerzertifikat:** Z2\nDetails");
    when(certificateRepository.findByPrerequisites(prereq)).thenReturn(List.of(referencingCert));
    certificateService.deletePrerequisitesTextForAll(prereq);
    ArgumentCaptor<Certificate> captor = ArgumentCaptor.forClass(Certificate.class);
    verify(certificateRepository).persistAndFlush(captor.capture());
    String updated = captor.getValue().getDescription();
    Assertions.assertEquals("Intro\nDetails", updated);
  }
}
