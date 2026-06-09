package com.eviden.tecradar.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.eviden.tecradar.entity.*;
import com.eviden.tecradar.repository.PictureRepository;
import com.eviden.tecradar.service.HistoryService;
import io.quarkus.test.junit.QuarkusTest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

@QuarkusTest
class TechnologyDetailReportInputTest {

  @Test
  void testConvertTechnologyToTechDetailReportInput() {
    // Mock dependencies
    PictureRepository pictureRepository = mock(PictureRepository.class);
    HistoryService historyService = mock(HistoryService.class);

    // Create a mock Technology instance
    Technology technology = new Technology();
    technology.setId(1L);
    technology.setName("Mock Technology");
    technology.setShortDescription("Mock Description\n");
    technology.setPictureId(1L);

    Category mockCategory = new Category();
    mockCategory.setId(1L);
    mockCategory.setDescription("Desc...");
    mockCategory.setName("TestNameCategory");

    technology.setCategory(mockCategory);
    // technology.setScore(10);

    Lifecycle mockLifecycle = new Lifecycle();
    mockLifecycle.setId(1L);
    mockLifecycle.setDescription("Desc...");
    mockLifecycle.setName("TestNameLife");
    technology.setLifecycle(mockLifecycle);
    technology.setViewCount(100L);
    List<History> historyList = createMockHistoryList(mockLifecycle, mockCategory);

    when(historyService.getHistoryForTechnology(any())).thenReturn(historyList);

    List<GantSeries> gantSeriesList = createMockGantSeriesList(technology);

    MockedStatic<GantSeries> gantSeriesMock = mockStatic(GantSeries.class);

    gantSeriesMock
        .when(
            () -> GantSeries.convertHistoryListToGantSeriesList(historyList, technology.getName()))
        .thenReturn(gantSeriesList);

    Picture p1 = new Picture();
    p1.setData("Picture".getBytes());
    p1.setId(1L);
    // Create a mock Picture
    when(pictureRepository.findById(technology.getPictureId())).thenReturn(p1);

    // Call the method under test
    TechnologyDetailReportInput reportInput = new TechnologyDetailReportInput();
    reportInput.historyService = historyService;
    reportInput.pictureRepository = pictureRepository;
    Calendar calendar = Calendar.getInstance();

    // Einen Tag von heute abziehen, um das Datum von gestern zu erhalten
    calendar.add(Calendar.DAY_OF_YEAR, -1);
    Date yesterdayDate = calendar.getTime();

    TechnologyDetailReportInput result =
        reportInput.convertTechnologyToTechDetailReportInput(technology, yesterdayDate, new Date());

    LocalDateTime lastChangeDate = LocalDateTime.now();
    String formattedDate = lastChangeDate.format(DateTimeFormatter.ofPattern("dd.MM.yyyy"));

    long differenceMillis =
        gantSeriesList.get(gantSeriesList.size() - 1).endDate.getTime()
            - gantSeriesList.get(gantSeriesList.size() - 1).startDate.getTime();

    String daysInLifecycle =
        "Seit "
            + TimeUnit.DAYS.convert(differenceMillis, TimeUnit.MILLISECONDS)
            + " Tagen in "
            + gantSeriesList.get(gantSeriesList.size() - 1).task;

    // Perform assertions
    assertEquals(1L, result.getId());
    assertEquals("Mock Technology", result.getName());
    assertEquals("Mock Description\n", result.getDescription());
    assertEquals("TestNameCategory", result.getCategoryName());
    assertEquals(daysInLifecycle, result.getLifecycleName());
    assertEquals("100 Aufrufe", result.getClicks());
    assertEquals("Letzte Änderung " + formattedDate, result.getLastChange());
    assertEquals(0, result.getPagecountStart());
    assertEquals(
        Base64.getEncoder().encodeToString(p1.getData()).length(), result.getPicture().length());
  }

  public List<CustomerProjectTechnology> createMockCustomerProjectTechnology() {
    List<CustomerProjectTechnology> customers = new ArrayList<>();

    String[] customerNames = {"Test Customer 1", "Test Customer 2", "Test Customer 3"};

    for (String name : customerNames) {
      Customer customer = new Customer();
      customer.setName(name);
      CustomerProject project = new CustomerProject();
      project.setCustomer(customer);
      project.setName("proj1");
      CustomerProjectTechnology customerProjectTechnology = new CustomerProjectTechnology();
      customerProjectTechnology.setCustomerProject(project);
      customers.add(customerProjectTechnology);
    }

    return customers;
  }

  private List<History> createMockHistoryList(Lifecycle l, Category c) {
    List<History> historyList = new ArrayList<>();

    History history1 = new History();
    history1.setId(1L);
    history1.setLifecycle(l);
    history1.setCategory(c);
    history1.setDate();
    history1.setUser(new User());
    history1.setTechnology(new Technology());
    history1.setName("Mock History 1");
    historyList.add(history1);

    return historyList;
  }

  private List<GantSeries> createMockGantSeriesList(Technology technology) {
    List<GantSeries> gantSeriesList = new ArrayList<>();
    Calendar calendar1 = Calendar.getInstance();

    calendar1.add(Calendar.DAY_OF_YEAR, -5);
    Date datebeforeStartDate = calendar1.getTime();

    Calendar calendar2 = Calendar.getInstance();

    calendar2.add(Calendar.DAY_OF_YEAR, +5);
    Date dateafterFilter = calendar2.getTime();

    GantSeries g1 = new GantSeries(technology.getName(), "Task1", datebeforeStartDate, new Date());
    gantSeriesList.add(g1);

    GantSeries g2 =
        new GantSeries(technology.getName(), "Task2", datebeforeStartDate, dateafterFilter);
    gantSeriesList.add(g2);

    GantSeries g3 = new GantSeries(technology.getName(), "Task3", new Date(), new Date());
    gantSeriesList.add(g3);

    GantSeries g4 =
        new GantSeries(technology.getName(), "TestNameLife", new Date(), dateafterFilter);
    gantSeriesList.add(g4);

    return gantSeriesList;
  }
}
