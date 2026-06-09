package com.eviden.tecradar.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.eviden.tecradar.entity.*;
import io.quarkus.test.junit.QuarkusTest;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class GantSeriesTest {

  @Test
  void testConvertHistoryListToGantSeriesList() {

    Technology technology = new Technology();
    technology.setName("Mock Technology");

    Lifecycle mockLifecycle11 = new Lifecycle();
    mockLifecycle11.setName("Lifecycle1");

    Lifecycle mockLifecycle12 = new Lifecycle();
    mockLifecycle12.setName("Lifecycle1");

    Lifecycle mockLifecycle21 = new Lifecycle();
    mockLifecycle21.setName("Lifecycle2");

    Lifecycle mockLifecycle22 = new Lifecycle();
    mockLifecycle22.setName("Lifecycle2");

    Lifecycle mockLifecycle31 = new Lifecycle();
    mockLifecycle31.setName("Lifecycle3");

    Lifecycle mockLifecycle32 = new Lifecycle();
    mockLifecycle32.setName("Lifecycle3");

    Lifecycle mockLifecycle33 = new Lifecycle();
    mockLifecycle33.setName("Lifecycle3");

    // Create history entries
    List<History> historyList = new ArrayList<>();

    historyList.add(createMockHistoryList(technology, mockLifecycle11));
    historyList.add(createMockHistoryList(technology, mockLifecycle12));
    historyList.add(createMockHistoryList(technology, mockLifecycle21));
    historyList.add(createMockHistoryList(technology, mockLifecycle22));
    historyList.add(createMockHistoryList(technology, mockLifecycle31));
    historyList.add(createMockHistoryList(technology, mockLifecycle32));
    historyList.add(createMockHistoryList(technology, mockLifecycle33));

    // Convert history list to GantSeries list
    List<GantSeries> gantSeriesList =
        GantSeries.convertHistoryListToGantSeriesList(historyList, "TechnologyName");

    // Assert the size and properties of the resulting GantSeries list
    assertEquals(3, gantSeriesList.size());

    GantSeries gantSeries1 = gantSeriesList.get(0);
    assertEquals("TechnologyName", gantSeries1.getSeries());
    assertEquals("Lifecycle1", gantSeries1.getTask());

    GantSeries gantSeries2 = gantSeriesList.get(1);
    assertEquals("TechnologyName", gantSeries2.getSeries());
    assertEquals("Lifecycle2", gantSeries2.getTask());

    GantSeries gantSeries3 = gantSeriesList.get(2);
    assertEquals("TechnologyName", gantSeries3.getSeries());
    assertEquals("Lifecycle3", gantSeries3.getTask());
  }

  @Test
  void testConvertHistoryListToGantSeriesList_SizeGreaterThan15() {
    // Create history entries with more than 15 elements
    List<History> historyList = new ArrayList<>();
    Technology technology = new Technology();
    technology.setName("Mock Technology");

    // Add 20 history entries
    for (int i = 0; i < 20; i++) {
      Lifecycle lifecycle = new Lifecycle();
      lifecycle.setName("Lifecycle" + i);
      historyList.add(createMockHistoryList(technology, lifecycle));
    }

    // Convert history list to GantSeries list
    List<GantSeries> gantSeriesList =
        GantSeries.convertHistoryListToGantSeriesList(historyList, "TechnologyName");

    // Assert that the resulting GantSeries list has a size of 15 (as specified in the method)
    assertEquals(15, gantSeriesList.size());
  }

  private History createMockHistoryList(Technology technology, Lifecycle l) {

    History history1 = new History();
    history1.setTechnology(technology);
    history1.setLifecycle(l);
    history1.setDate();
    history1.setName("Mock History 1");

    return history1;
  }
}
