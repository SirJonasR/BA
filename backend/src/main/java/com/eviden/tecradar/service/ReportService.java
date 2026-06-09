package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.exception.TooManyTechnologiesSelectedException;
import com.eviden.tecradar.model.TechnologyDetailReportInput;
import com.eviden.tecradar.repository.TechnologyRepository;
import com.eviden.tecradar.resource.TechDetailReportRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.jboss.logging.Logger;

/** Service class responsible for generating reports. */
@ApplicationScoped
public class ReportService {

  // Constants for technology max cap
  public static final int MAX_COUNT_TECH = 30;
  private static final Logger logger = Logger.getLogger(ReportService.class);
  // Constants for file paths
  private static final String TECH_DETAIL_PAGE_PATH = "reports/technologyDetailPage.jrxml";
  private static final String backgroundPicBlue =
      "/reports/images/SC-DEEP_BLUE_CLOSE_UP_1-low-res.png";
  private static final String backgroundPicOrange =
      "/reports/images/SC-ORANGE_CLOSE_UP_2-low-res.png";
  @Inject TechnologyRepository technologyRepository;
  @Inject TechnologyDetailReportInput technologyDetailReportInput;

  /**
   * Generates a PDF report for technology details based on the provided input data.
   *
   * @param request The request containing technology IDs and date range.
   * @return A byte array containing the generated PDF report.
   * @throws JRException If an error occurs during JasperReports processing.
   * @throws IOException If an error occurs during input/output operations.
   */
  public byte[] generateTechDetailPdfReport(TechDetailReportRequest request)
      throws JRException, IOException {
    ArrayList<TechnologyDetailReportInput> technologyReports = new ArrayList<>();

    Long[] requestIdList = request.getTechnologyIds();

    // check for duplicates and remove those
    Long[] uniqueRequestIds = Arrays.stream(requestIdList).distinct().toArray(Long[]::new);

    // check for max count of technologies in input
    int idCount = uniqueRequestIds.length;
    if (idCount > MAX_COUNT_TECH) {
      throw new TooManyTechnologiesSelectedException(
          "Es wurden zu viele Technologien ausgewählt. Gleichzeitig können maximal "
              + MAX_COUNT_TECH
              + " Technologien ausgewählt werden.");
    }

    // Loop through the provided technology IDs and generate Data for each technology
    for (Long technologyId : uniqueRequestIds) {
      Technology technology = technologyRepository.findById(technologyId);

      // check for inavlid ID and skip
      if (technology == null) {
        continue;
      }
      TechnologyDetailReportInput technologyReport =
          technologyDetailReportInput.convertTechnologyToTechDetailReportInput(
              technology, request.getStartDate(), request.getEndDate());
      technologyReports.add(technologyReport);
    }

    try (InputStream jrxmlInputStreamTechDetailPage =
        getClass().getClassLoader().getResourceAsStream(TECH_DETAIL_PAGE_PATH)) {

      Map<String, Object> parameters = new HashMap<>();
      parameters.put("backgroundPicBlue", this.getClass().getResourceAsStream(backgroundPicBlue));
      parameters.put(
          "backgroundPicOrange", this.getClass().getResourceAsStream(backgroundPicOrange));
      JasperReport techDetailReport;
      try {
        logger.info("Report compiled successfully from " + TECH_DETAIL_PAGE_PATH);
        techDetailReport = JasperCompileManager.compileReport(jrxmlInputStreamTechDetailPage);
      } catch (JRException e) {
        logger.warn("Failed to compiled report from " + TECH_DETAIL_PAGE_PATH, e);
        throw new RuntimeException(e);
      }
      ArrayList<TechnologyDetailReportInput> technologies = new ArrayList<>(technologyReports);

      JasperPrint finalReport =
          fillReportWithTechnology(techDetailReport, parameters, technologies.get(0));

      // Loop through the remaining technologies and add their details to the report
      for (int y = 1; y < technologies.size(); y++) {
        TechnologyDetailReportInput technology = technologies.get(y);
        technology.setPagecountStart(finalReport.getPages().size());
        Map<String, Object> parametersTmp = new HashMap<>();
        JasperPrint jasperPrint =
            fillReportWithTechnology(techDetailReport, parametersTmp, technology);
        jasperPrint.getPages().forEach(finalReport::addPage);
      }

      // If there are multiple technologies, add a summary report for technology lifecycle
      // comparison
      //      if (technologyReports.size() > 1) {
      //        try (InputStream jrxmlInputStreamTechLifecycleComparison =
      //            getClass().getClassLoader().getResourceAsStream(LIFECYCLE_COMPARISON_PATH)) {
      //          JasperReport techLifecycleDevComparisonReport =
      //              JasperCompileManager.compileReport(jrxmlInputStreamTechLifecycleComparison);
      //
      //          // Set the starting page count for the summary report
      //          technologies
      //              .get(technologies.size() - 1)
      //              .setPagecountStart(finalReport.getPages().size());
      //
      //          // Fill the summary report with data
      //          JRBeanCollectionDataSource dataSource = new
      // JRBeanCollectionDataSource(technologies);
      //          JasperPrint summary =
      //              JasperFillManager.fillReport(
      //                  techLifecycleDevComparisonReport, parameters, dataSource);
      //
      //          // Add the summary report pages to the final report
      //          summary.getPages().forEach(finalReport::addPage);
      //        }
      //      }

      // Export the final report to a byte array as a PDF
      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      JasperExportManager.exportReportToPdfStream(finalReport, outputStream);

      // Return the generated PDF report as a byte array
      return outputStream.toByteArray();
    }
  }

  /**
   * Fills a JasperReport with technology details and returns the resulting JasperPrint.
   *
   * @param report The JasperReport to fill.
   * @param parameters Additional parameters for the report.
   * @param technology The TechnologyDetailReportInput instance representing the technology details.
   * @return The filled JasperPrint.
   * @throws JRException If an error occurs during JasperReports processing.
   */
  private JasperPrint fillReportWithTechnology(
      JasperReport report, Map<String, Object> parameters, TechnologyDetailReportInput technology)
      throws JRException {
    ArrayList<TechnologyDetailReportInput> technologyInputList = new ArrayList<>();
    technologyInputList.add(technology);
    JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(technologyInputList);
    parameters.put("backgroundPicBlue", this.getClass().getResourceAsStream(backgroundPicBlue));
    parameters.put("backgroundPicOrange", this.getClass().getResourceAsStream(backgroundPicOrange));
    try {
      logger.info("Report " + report.getName() + "filled successfully.");
      return JasperFillManager.fillReport(report, parameters, dataSource);
    } catch (JRException e) {
      logger.warn("Failed to fill the report " + report.getName(), e);
      throw new JRException(e);
    }
  }

  // private JasperPrint fillReportWithCustomer(
  //     JasperReport report, Map<String, Object> parameters, CustomerStats customerStats)
  //     throws JRException {
  //   ArrayList<CustomerStats> customerInputList = new ArrayList<>();
  //   customerInputList.add(customerStats);
  //   JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(customerInputList);
  //   parameters.put("backgroundPicBlue", this.getClass().getResourceAsStream(backgroundPicBlue));
  //   parameters.put("backgroundPicOrange",
  // this.getClass().getResourceAsStream(backgroundPicOrange));
  //   return JasperFillManager.fillReport(report, parameters, dataSource);
  // }

  // /**
  //  * Generates a PDF report for customer stats based on the provided input data.
  //  *
  //  * @param request The request containing customer names
  //  * @return A byte array containing the generated PDF report.
  //  * @throws JRException If an error occurs during JasperReports processing.
  //  * @throws IOException If an error occurs during input/output operations.
  //  */
  // public byte[] generateCustomerStat(CustomerStatReportRequest request)
  //     throws JRException, IOException {
  //   ArrayList<CustomerStats> customerStatsReports = new ArrayList<>();
  //   for (String customerName : request.getCustomerNames()) {
  //     Customer customer = customerRepository.findByName(customerName);
  //     CustomerStats converted = customerStats.convertCustomerToCustomerStats(customer);
  //     customerStatsReports.add(converted);
  //   }

  //   try (InputStream jrxmlInputStreamCustomerStatsPage =
  //       getClass().getClassLoader().getResourceAsStream(CUSTOMER_STATS_PAGE_PATH)) {
  //     ArrayList<CustomerStats> stats = new ArrayList<>(customerStatsReports);
  //     Map<String, Object> parameters = new HashMap<>();
  //     parameters.put("backgroundPicBlue",
  // this.getClass().getResourceAsStream(backgroundPicBlue));
  //     parameters.put(
  //         "backgroundPicOrange", this.getClass().getResourceAsStream(backgroundPicOrange));

  //     JasperReport customerReport =
  //         JasperCompileManager.compileReport(jrxmlInputStreamCustomerStatsPage);
  //     JasperPrint finalReport = fillReportWithCustomer(customerReport, parameters, stats.get(0));

  //     for (int i = 1; i < stats.size(); i++) {
  //       CustomerStats cs = stats.get(i);
  //       cs.setPageCountStart(finalReport.getPages().size());
  //       Map<String, Object> parametersTmp = new HashMap<>();
  //       JasperPrint jasperPrint = fillReportWithCustomer(customerReport, parametersTmp, cs);
  //       jasperPrint.getPages().forEach(finalReport::addPage);
  //     }
  //     // Export the final report to a byte array as a PDF
  //     ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
  //     JasperExportManager.exportReportToPdfStream(finalReport, outputStream);

  //     // Return the generated PDF report as a byte array
  //     return outputStream.toByteArray();
  //   }
  // }
}
