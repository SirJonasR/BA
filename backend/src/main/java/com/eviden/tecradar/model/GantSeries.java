package com.eviden.tecradar.model;

import com.eviden.tecradar.entity.History;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

/**
 * Represents a Gantt series, capturing information about a specific task or lifecycle change over
 * time for a technology. This model is utilized for JasperReports PDF generation.
 */
public class GantSeries {
  String series; // Name of the technology associated with the Gantt series
  String task; // Task or lifecycle name associated with the Gantt series
  String subtask; // Subtask associated with the Gantt series
  Date startDate; // Start date of the Gantt series
  Date endDate; // End date of the Gantt series

  public String getSeries() {
    return series;
  }

  public void setSeries(String series) {
    this.series = series;
  }

  public String getTask() {
    return task;
  }

  public void setTask(String task) {
    this.task = task;
  }

  public String getSubtask() {
    return subtask;
  }

  public void setSubtask(String subtask) {
    this.subtask = subtask;
  }

  public Date getStartDate() {
    return startDate;
  }

  public void setStartDate(Date startDate) {
    this.startDate = startDate;
  }

  public Date getEndDate() {
    return endDate;
  }

  public void setEndDate(Date endDate) {
    this.endDate = endDate;
  }

  /**
   * Constructs a Gantt series object.
   *
   * @param technologyName The name of the technology associated with the Gantt series.
   * @param lifecycle The lifecycle or task name.
   * @param startDate The start date of the Gantt series.
   * @param endDate The end date of the Gantt series.
   */
  public GantSeries(String technologyName, String lifecycle, Date startDate, Date endDate) {
    this.setSeries(technologyName);
    this.setSubtask("SubTask");
    this.setTask(lifecycle);
    this.setStartDate(startDate);
    this.setEndDate(endDate);
  }

  /**
   * Converts a list of history entries into a list of GantSeries representing the technology's
   * lifecycle changes over time.
   *
   * @param historyList The list of History entries to be converted.
   * @param technologyName The name of the technology for which GantSeries is generated.
   * @return A list of GantSeries instances representing lifecycle changes.
   */
  public static List<GantSeries> convertHistoryListToGantSeriesList(
      List<History> historyList, String technologyName) {

    Collections.sort(historyList, Comparator.comparing(History::getDate));
    List<GantSeries> gantSeriesList = new ArrayList<>();

    // Initialize start date and current lifecycle based on the first history entry
    Date startDate =
        Date.from(historyList.get(0).getDate().atZone(ZoneId.systemDefault()).toInstant());
    String currentLifecycle = historyList.get(0).getLifecycleName();

    // Iterate through history entries to create GantSeries instances
    for (History history : historyList) {
      String newLifecycle = history.getLifecycleName();
      if (!newLifecycle.equals(currentLifecycle)) {

        // If the lifecycle changes, set the end date for the current GantSeries
        Date endDate = Date.from(history.getDate().atZone(ZoneId.systemDefault()).toInstant());

        // Create a new GantSeries for the period between startDate and endDate
        GantSeries gantSeries =
            new GantSeries(technologyName, currentLifecycle, startDate, endDate);
        gantSeriesList.add(gantSeries);

        // Set startDate for the next GantSeries to the lifecycle change date
        startDate = endDate;
        currentLifecycle = newLifecycle;
      }
    }

    // Set the end date for the last GantSeries to the current date
    Date endDate = new Date();
    // Reset time components to zero
    Calendar calendar = Calendar.getInstance();
    calendar.setTime(endDate);
    calendar.set(Calendar.HOUR_OF_DAY, 0); // Hour
    calendar.set(Calendar.MINUTE, 0); // Minute
    calendar.set(Calendar.SECOND, 0); // Second
    calendar.set(Calendar.MILLISECOND, 0); // Millisecond

    // Update the end date with zero time
    endDate = calendar.getTime();

    GantSeries lastGantSeries =
        new GantSeries(technologyName, currentLifecycle, startDate, endDate);
    gantSeriesList.add(lastGantSeries);

    if (gantSeriesList.size() > 15) {
      return gantSeriesList.subList(gantSeriesList.size() - 15, gantSeriesList.size());
    }

    Collections.sort(gantSeriesList, Comparator.comparing(GantSeries::getStartDate));

    return gantSeriesList;
  }
}
