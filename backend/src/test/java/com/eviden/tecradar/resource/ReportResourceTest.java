package com.eviden.tecradar.resource;

import static org.junit.Assert.fail;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;

import com.eviden.tecradar.exception.TooManyTechnologiesSelectedException;
import com.eviden.tecradar.service.ReportService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import java.util.Date;
import net.sf.jasperreports.engine.JRException;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.Mockito;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ReportResourceTest {

  @Inject ReportResource reportResource;

  @Test
  @Order(1)
  public void testExportTechnologyDetailReport_Success() throws JRException, IOException {
    // Mocking
    ReportService reportService = Mockito.mock(ReportService.class);
    byte[] fakePdfBytes = "Fake PDF content".getBytes();
    Mockito.when(reportService.generateTechDetailPdfReport(any())).thenReturn(fakePdfBytes);

    reportResource.reportService = reportService;

    TechDetailReportRequest request = new TechDetailReportRequest();
    Long[] ids = new Long[] {-1L};
    request.setTechnologyIds(ids);
    request.setStartDate(new Date());
    request.setEndDate(new Date());

    // Test
    Response response = reportResource.exportTechnologyDetailReport(request);

    byte[] responseBytes = response.readEntity(byte[].class);

    // Assertions
    assertEquals(200, response.getStatus());
    assertEquals(
        "attachment; filename=technologyDetailReport.pdf",
        response.getHeaderString("Content-Disposition"));
    assertEquals(fakePdfBytes.length, responseBytes.length);
    // You may add more assertions based on your specific requirements
  }

  /**
   * Test case for REST endpoint handling TooManyTechnologiesSelectedException. Verifies that when
   * the service throws this exception, the endpoint responds with HTTP 400 Bad Request.
   *
   * @throws IOException If an I/O error occurs
   * @throws JRException If an error occurs during JasperReports processing
   */
  @Test
  @Order(2)
  public void testExportTechnologyDetailReport_tooManyTechnologiesSelectedException()
      throws JRException, IOException {
    ReportService mockReportService = Mockito.mock(ReportService.class);
    reportResource.reportService = mockReportService;

    TechDetailReportRequest request = new TechDetailReportRequest();
    Long[] ids = new Long[ReportService.MAX_COUNT_TECH + 1];
    for (int i = 0; i < ids.length; i++) {
      ids[i] = (long) i;
    }
    request.setTechnologyIds(ids);
    request.setStartDate(new Date());
    request.setEndDate(new Date());

    Mockito.when(mockReportService.generateTechDetailPdfReport(any()))
        .thenThrow(new TooManyTechnologiesSelectedException("Zu viele Technologien."));

    // call the endpoint und check for BadRequestException
    try {
      reportResource.exportTechnologyDetailReport(request);
      fail("Excepted BadRequestException not thrown.");
    } catch (BadRequestException e) {
      assertEquals("Zu viele Technologien.", e.getMessage());
    }
  }

  /**
   * Test case for verifying that the rate limit is enforced on the technology detail report
   * endpoint. Sends multiple allowed requests which should succeed with HTTP 200, then sends one
   * additional request that exceeds the limit and expects an HTTP 429 Too Many Requests response
   * with a Retry-After header.
   */
  // @Test
  // @Order(3)
  // public void testRateLimitExceeded_returns429() {
  //   String token = AuthenticationHelper.getToken("luke", "test");
  //   int allowedRequests = 10;

  //   // example request body with valid tech id
  //   String requestBody =
  //       """
  //       {
  //         "technologyIds": [1],
  //         "startDate": 1672531200000,
  //         "endDate": 1703987199999
  //       }
  //       """;

  //   // send allowed count of request, this should give a success status 200
  //   for (int i = 0; i < allowedRequests; i++) {
  //     RestAssured.given()
  //         .header("Authorization", "Bearer " + token)
  //         .contentType(ContentType.JSON)
  //         .body(requestBody)
  //         .when()
  //         .post("report/technologyDetailReport")
  //         .then()
  //         .statusCode(HttpStatus.SC_OK);
  //   }

  //   // send one more request to exceed the limit - this should return a status code 429
  //   RestAssured.given()
  //       .contentType("application/json")
  //       .body(requestBody)
  //       .when()
  //       .post("/report/technologyDetailReport")
  //       .then()
  //       .statusCode(429)
  //       .header("Retry-After", notNullValue());
  // }

  // @Test
  // public void testExportCustomerReportEndpoint() throws JRException, IOException {
  //   CustomerStatReportRequest customerStatReportRequest = new CustomerStatReportRequest();
  //   String[] customerList = {"Customer1"};
  //   customerStatReportRequest.setCustomerNames(customerList);
  //   ReportService reportService = Mockito.mock(ReportService.class);
  //   byte[] fakePdfBytes = "Fake PDF content".getBytes();
  //   Mockito.when(reportService.generateCustomerStat(any())).thenReturn(fakePdfBytes);
  //   reportResource.reportService = reportService;
  //   // Test
  //   Response response = reportResource.exportCustomerReport(customerStatReportRequest);

  //   byte[] responseBytes = response.readEntity(byte[].class);

  //   // AssertionsS
  //   assertEquals(200, response.getStatus());
  //   assertEquals(
  //       "attachment; filename=customerReport.pdf",
  // response.getHeaderString("Content-Disposition"));
  //   assertEquals(fakePdfBytes.length, responseBytes.length);
  //   assertEquals("Customer1", customerStatReportRequest.getCustomerNames()[0]);
  // }
}
