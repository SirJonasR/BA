package com.eviden.tecradar.resource;

import com.eviden.tecradar.exception.TooManyTechnologiesSelectedException;
import com.eviden.tecradar.service.ReportService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.InternalServerErrorException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import net.sf.jasperreports.engine.JRException;

/** JAX-RS resource class responsible for handling technology detail report-related requests. */
@Path("/report")
public class ReportResource {
  @Inject ReportService reportService;

  /**
   * Endpoint for exporting a technology detail report in PDF format.
   *
   * @param request An array of technology IDs with Startdate and enddate.
   * @return Response containing the generated PDF report as a downloadable attachment.
   * @throws JRException If an error occurs during JasperReports processing.
   * @throws IOException If an error occurs during input/output operations.
   */
  @POST
  @Path("/technologyDetailReport")
  @Produces("application/pdf")
  @Transactional
  @Consumes(MediaType.APPLICATION_JSON)
  @RateLimited(bucket = "reportGenerationLimit", identityResolver = UsernameResolver.class)
  public Response exportTechnologyDetailReport(TechDetailReportRequest request)
      throws JRException, IOException {

    try {
      // Generate a PDF report based on the technologyIds
      byte[] pdfBytes = reportService.generateTechDetailPdfReport(request);

      // Build and return a Response containing the generated PDF as a downloadable attachment
      return Response.ok(pdfBytes)
          .header("Content-Disposition", "attachment; filename=technologyDetailReport.pdf")
          .build();

    } catch (TooManyTechnologiesSelectedException e) {
      throw new BadRequestException(e.getMessage());
    } catch (JRException | IOException e) {
      throw new InternalServerErrorException();
    }
  }

  // /**
  //  * Endpoint for exporting a customer stats report in PDF format.
  //  *
  //  * @param request An array of customers
  //  * @return Response containing the generated PDF report as downloadable attachment.
  //  * @throws JRException If an error occurs during JasperReports processing.
  //  * @throws IOException If an error occurs during input/output operations.
  //  */
  // @POST
  // @Path("/customerStatsReport")
  // @Produces("application/pdf")
  // @Transactional
  // @Consumes(MediaType.APPLICATION_JSON)
  // public Response exportCustomerReport(CustomerStatReportRequest request)
  //     throws JRException, IOException {
  //   byte[] pdfBytes = reportService.generateCustomerStat(request);
  //   return Response.ok(pdfBytes)
  //       .header("Content-Disposition", "attachment; filename=customerReport.pdf")
  //       .build();
  // }
}
