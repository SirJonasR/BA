package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.entity.Certificate;
import com.eviden.tecradar.service.CertificateService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class CertificateResourceTest {

  @InjectMock CertificateService certificateService;

  @Test
  public void testGetAllCertificates() {
    Certificate certificate1 = new Certificate();
    certificate1.setName("Certificate1");

    Certificate certificate2 = new Certificate();
    certificate2.setName("Certificate2");

    List<Certificate> certificates = new ArrayList<>();
    certificates.add(certificate1);
    certificates.add(certificate2);

    when(certificateService.getAllCertificates()).thenReturn(certificates);

    given()
        .when()
        .get("/certificate")
        .then()
        .statusCode(200)
        .body(
            "$.size()", is(2),
            "[0].name", is("Certificate1"),
            "[1].name", is("Certificate2"));
  }
}
