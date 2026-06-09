package com.eviden.tecradar.service;

import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.exception.TooManyTechnologiesSelectedException;
// import com.eviden.tecradar.model.CustomerStats;
import com.eviden.tecradar.model.GantSeries;
import com.eviden.tecradar.model.TechnologyDetailReportInput;
import com.eviden.tecradar.repository.CustomerRepository;
import com.eviden.tecradar.repository.TechnologyRepository;
import com.eviden.tecradar.resource.ReportResource;
import com.eviden.tecradar.resource.TechDetailReportRequest;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import net.sf.jasperreports.engine.JRException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

/** This class contains unit tests for the ReportService class. */
@QuarkusTest
class ReportServiceTest {
  @Inject CustomerService customerService;
  @Inject LifecycleService lifecycleService;
  @Inject TechnologyService technologyService;
  @Inject ReportResource reportResource;

  @Mock TechnologyRepository technologyRepository;

  @Mock TechnologyDetailReportInput technologyDetailReportInput;

  @Mock CustomerRepository customerRepository;

  @InjectMocks ReportService reportService;

  /** Setup method to initialize mocks before each test. */
  @BeforeEach
  void setUp() {
    MockitoAnnotations.initMocks(this);
  }

  private TechnologyDetailReportInput getTechnologyDetailReportInput(int pageCountStart) {
    TechnologyDetailReportInput reportInput = new TechnologyDetailReportInput();
    reportInput.setClicks(1);
    reportInput.setDescription("TestDescription");
    reportInput.setId(-1L);
    reportInput.setLifecycleName("Lifecycle", 10);
    reportInput.setLastChange("12.12.1200");
    reportInput.setCategoryName("Category");
    reportInput.setPagecountStart(pageCountStart);

    // Creating and adding 15 GantSeries objects to the reportInput
    List<GantSeries> gantSeriesList1 = new ArrayList<>();
    for (int i = 0; i < 15; i++) {
      GantSeries gantSeries = new GantSeries("TEchName", "L", new Date(), new Date());
      gantSeriesList1.add(gantSeries);
    }
    reportInput.setGanttSeriesList(gantSeriesList1);
    return reportInput;
  }

  /**
   * Test case for generating a PDF report for a single technology.
   *
   * @throws IOException If an I/O error occurs
   * @throws JRException If an error occurs during JasperReports processing
   */
  @Test
  void generateTechDetailPdfReport_singleTechnology_Success() throws IOException, JRException {
    // Mocking
    TechDetailReportRequest request = new TechDetailReportRequest();
    Long[] ids = new Long[] {-1L};
    request.setTechnologyIds(ids);
    request.setStartDate(new Date());
    request.setEndDate(new Date());

    Technology technology = new Technology();

    // Mocking the findById method of technologyRepository to return the technology
    when(technologyRepository.findById(-1L)).thenReturn(technology);

    TechnologyDetailReportInput reportInput = getTechnologyDetailReportInput(1);

    // Mocking the convertTechnologyToTechDetailReportInput method of technologyDetailReportInput
    when(technologyDetailReportInput.convertTechnologyToTechDetailReportInput(any(), any(), any()))
        .thenReturn(reportInput);

    // Execution
    byte[] result = reportService.generateTechDetailPdfReport(request);

    // Assertion
    assertNotNull(result);
    assertTrue(result.length > 0);
  }

  /**
   * Test case for generating a PDF report for multiple technologies.
   *
   * @throws IOException If an I/O error occurs
   * @throws JRException If an error occurs during JasperReports processing
   */
  @Test
  void generateTechDetailPdfReport_multipleTechnologies_Success() throws IOException, JRException {
    // Mocking
    TechDetailReportRequest request = new TechDetailReportRequest();
    Long[] ids = new Long[] {(long) -1, (long) -2};
    request.setTechnologyIds(ids);
    request.setStartDate(new Date());
    request.setEndDate(new Date());

    // Mocking the Technology entities
    Technology technology1 = new Technology();
    Technology technology2 = new Technology();

    // Mocking the findById method of technologyRepository to return the corresponding Technology
    // objects
    when(technologyRepository.findById(eq((long) -1))).thenReturn(technology1);
    when(technologyRepository.findById(eq((long) -2))).thenReturn(technology2);

    // Mocking the TechnologyDetailReportInput objects
    TechnologyDetailReportInput reportInput1 = getTechnologyDetailReportInput(1);
    TechnologyDetailReportInput reportInput2 = getTechnologyDetailReportInput(2);

    // Mocking the convertTechnologyToTechDetailReportInput method of technologyDetailReportInput
    when(technologyDetailReportInput.convertTechnologyToTechDetailReportInput(
            eq(technology1), any(), any()))
        .thenReturn(reportInput1);
    when(technologyDetailReportInput.convertTechnologyToTechDetailReportInput(
            eq(technology2), any(), any()))
        .thenReturn(reportInput2);

    // Execution
    byte[] result = reportService.generateTechDetailPdfReport(request);

    // Assertion
    assertNotNull(result);
    assertTrue(result.length > 0);
  }

  /**
   * Test case for handling duplicate technology IDs in the request. Ensures duplicates are removed
   * and each technology is processed only once.
   *
   * @throws IOException If an I/O error occurs
   * @throws JRException If an error occurs during JasperReports processing
   */
  @Test
  void generateTechDetailPdfReport_duplicateIds_removedAndProcessedOnce()
      throws JRException, IOException {
    TechDetailReportRequest request = new TechDetailReportRequest();
    Long[] ids = new Long[] {1L, 1L, 2L, 3L};
    request.setTechnologyIds(ids);
    request.setStartDate(new Date());
    request.setEndDate(new Date());

    Technology tech1 = new Technology();
    Technology tech2 = new Technology();
    Technology tech3 = new Technology();

    when(technologyRepository.findById(1L)).thenReturn(tech1);
    when(technologyRepository.findById(2L)).thenReturn(tech2);
    when(technologyRepository.findById(3L)).thenReturn(tech3);

    TechnologyDetailReportInput reportInput = getTechnologyDetailReportInput(1);

    when(technologyDetailReportInput.convertTechnologyToTechDetailReportInput(any(), any(), any()))
        .thenReturn(reportInput);
    byte[] result = reportService.generateTechDetailPdfReport(request);

    assertNotNull(result);
    assertTrue(result.length > 0);

    // check that findById() will only be called once per id
    verify(technologyRepository, times(1)).findById(1L);
    verify(technologyRepository, times(1)).findById(2L);
    verify(technologyRepository, times(1)).findById(3L);
  }

  /**
   * Test case for handling invalid technology IDs in the request. Ensures that invalid IDs (not
   * found in repository) are skipped without errors.
   *
   * @throws IOException If an I/O error occurs
   * @throws JRException If an error occurs during JasperReports processing
   */
  @Test
  void generateTechDetailPdfReport_invalidIds_skipped() throws JRException, IOException {
    TechDetailReportRequest request = new TechDetailReportRequest();
    Long[] ids = new Long[] {1L, 999L}; // 999 for invalid
    request.setTechnologyIds(ids);
    request.setStartDate(new Date());
    request.setEndDate(new Date());

    Technology tech1 = new Technology();

    when(technologyRepository.findById(1L)).thenReturn(tech1);
    when(technologyRepository.findById(999L)).thenReturn(null);

    TechnologyDetailReportInput reportInput = getTechnologyDetailReportInput(1);

    when(technologyDetailReportInput.convertTechnologyToTechDetailReportInput(any(), any(), any()))
        .thenReturn(reportInput);
    byte[] result = reportService.generateTechDetailPdfReport(request);

    assertNotNull(result);
    assertTrue(result.length > 0);

    // check, that convertTechnologyToTechDetail will only be called for valid IDs
    verify(technologyDetailReportInput, times(1))
        .convertTechnologyToTechDetailReportInput(eq(tech1), any(), any());
  }

  /**
   * Test case for exceeding the maximum allowed number of technology IDs. Expects a
   * TooManyTechnologiesSelectedException to be thrown when limit is exceeded.
   */
  @Test
  void generateTechDetailPdfReport_tooManyIds_throwsException()
      throws TooManyTechnologiesSelectedException {
    TechDetailReportRequest request = new TechDetailReportRequest();

    // generate array with more then MAX_COUNT_TECH + 1 IDs
    int tooMany = ReportService.MAX_COUNT_TECH + 1;
    Long[] ids = new Long[tooMany];
    for (int i = 0; i < tooMany; i++) {
      ids[i] = (long) i;
    }
    request.setTechnologyIds(ids);
    request.setStartDate(new Date());
    request.setEndDate(new Date());

    assertThrows(
        TooManyTechnologiesSelectedException.class,
        () -> {
          reportService.generateTechDetailPdfReport(request);
        });
  }

  // /**
  //  * Tests if generateCustomerStats works.
  //  *
  //  * @throws IOException If an I/O error occurs
  //  * @throws JRException If an error occurs during JasperReports processing
  //  */
  // @Test
  // void testGenerateCustomerStat() throws JRException, IOException {
  //   Technology technology1 = technologyService.get(-1L);
  //   Customer customer1 = customerService.getOrCreate("Customer1");
  //   Lifecycle lifecycle1 = lifecycleService.get(-1L);
  //   technologyCustomerService.getOrCreate(customer1, technology1, lifecycle1);
  //   CustomerStatReportRequest request = new CustomerStatReportRequest();
  //   String[] customerNames = {"Customer1"};
  //   request.setCustomerNames(customerNames);
  //   when(customerRepository.findByName("Customer1")).thenReturn(customer1);
  //   CustomerStats customerStats1 = new CustomerStats();
  //   customerStats1.setTotalNumber(1);
  //   customerStats1.setName("Customer1");
  //   customerStats1.setMaintainNumber(0);
  //   customerStats1.setAdoptNumber(0);
  //   customerStats1.setAssesNumber(0);
  //   customerStats1.setMonitorNumber(1);
  //   customerStats1.setListOfTechnologies("Test");
  //   customerStats1.setPageCountStart(1);

  //   when(customerStats.convertCustomerToCustomerStats(customer1)).thenReturn(customerStats1);
  //   byte[] result = reportService.generateCustomerStat(request);
  //   assertNotNull(result);
  //   assertTrue(result.length > 0);
  // }
}
