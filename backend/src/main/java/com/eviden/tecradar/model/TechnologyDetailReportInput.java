package com.eviden.tecradar.model;

import com.eviden.tecradar.entity.History;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.repository.PictureRepository;
import com.eviden.tecradar.service.HistoryService;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.options.MutableDataSet;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * DTO class representing input data for generating a detailed report on a technology. This DTO is
 * used as the data model for the PDF template 'TechnologyDetailPage'.
 */
@Singleton
public class TechnologyDetailReportInput {

  @Inject PictureRepository pictureRepository;
  @Inject HistoryService historyService;

  private Long id;
  private String name;
  private String picture;
  private Long pictureId;
  private String description;
  private String categoryName;
  private String lifecycleName;
  private String clicks;
  private String lastChange;
  private int pagecountStart = 0;
  private String customers;
  private List<GantSeries> ganttSeriesList;

  /**
   * Converts Markdown text to HTML format using a configurable parser and renderer.
   *
   * @param markdownText The Markdown text to convert.
   * @return The converted HTML text.
   */
  public static String convertToHtml(String markdownText) {
    MutableDataSet options = new MutableDataSet();
    Parser parser = Parser.builder(options).build();
    HtmlRenderer renderer = HtmlRenderer.builder(options).build();
    return renderer.render(parser.parse(markdownText));
  }

  /**
   * Removes HTML tags from a given string, leaving plain text.
   *
   * @param htmlText The string containing HTML tags to be removed.
   * @return The cleaned string without HTML tags.
   */
  public static String removeHtmlTags(String htmlText) {
    // Regex pattern for HTML tags
    String regex = "<[^>]+>";
    Pattern pattern = Pattern.compile(regex);
    Matcher matcher = pattern.matcher(htmlText);

    // Remove HTML tags by replacing them with an empty string
    return matcher.replaceAll("");
  }

  // Utility method for calculating days between two dates
  public static long getDaysBetweenDates(Date startDate, Date endDate) {
    long differenceMillis = endDate.getTime() - startDate.getTime();
    return TimeUnit.DAYS.convert(differenceMillis, TimeUnit.MILLISECONDS);
  }

  public int getPagecountStart() {
    return pagecountStart;
  }

  public void setPagecountStart(int pagecountStart) {
    this.pagecountStart = pagecountStart;
  }

  //  /**
  //   * Sets the customer list, concatenating customer names with commas and an "&" before the last
  //   * name.
  //   *
  //   * @param customers List of TechnologyCustomer objects.
  //   */
  //  public void setCustomers(List<CustomerProjectTechnology> customers) {
  //    StringBuilder customersStringBuilder = new StringBuilder();
  //    List<String> customerNames = new ArrayList<>();
  //    for (int i = 0; i < customers.size(); i++) {
  //      String customerName = customers.get(i).getCustomerProject().getCustomer().getName();
  //      if (!customerNames.contains(customerName)) {
  //        customerNames.add(customerName);
  //        if (i > 0) {
  //          customersStringBuilder.append(", ");
  //        }
  //        customersStringBuilder.append(customerName);
  //      }
  //    }
  //    this.customers = customersStringBuilder.toString();
  //  }

  public List<GantSeries> getGanttSeriesList() {
    return ganttSeriesList;
  }

  public void setGanttSeriesList(List<GantSeries> ganttSeriesList) {
    this.ganttSeriesList = ganttSeriesList;
  }

  public String getCustomers() {
    return customers;
  }

  /**
   * Sets the lifecycle name with a prefix indicating the number of days the Technology spent in
   * this lifecycle.
   *
   * @param lifecycleName The name of the lifecycle.
   * @param daysInLifecycle The number of days the Technology spent in the lifecycle.
   */
  public void setLifecycleName(String lifecycleName, long daysInLifecycle) {
    if (daysInLifecycle == 1) {
      this.lifecycleName = "Seit 1 Tag in " + lifecycleName;
    } else {
      this.lifecycleName = "Seit " + daysInLifecycle + " Tagen in " + lifecycleName;
    }
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getCategoryName() {
    return categoryName;
  }

  public void setCategoryName(String categoryName) {
    this.categoryName = categoryName;
  }

  public String getLifecycleName() {
    return lifecycleName;
  }

  public String getClicks() {
    return clicks;
  }

  /**
   * Sets the click count String.
   *
   * @param clicks The number of clicks.
   */
  public void setClicks(long clicks) {
    if (clicks == 1) {
      this.clicks = clicks + " Aufruf";
    } else {
      this.clicks = clicks + " Aufrufe";
    }
  }

  public String getLastChange() {
    return lastChange;
  }

  public void setLastChange(String lastChange) {

    this.lastChange = "Letzte Änderung " + lastChange;
  }

  public Long getPictureId() {
    return pictureId;
  }

  public void setPictureId(Long id) {
    this.pictureId = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getPicture() {
    return picture;
  }

  public void setPicture(String picture) {
    this.picture = picture;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    String cleanText = removeHtmlTags(convertToHtml(description));
    this.description = cleanText.length() > 300 ? cleanText.substring(0, 300) + "..." : cleanText;
  }

  /**
   * Converts a Technology entity to a TechnologyDetailReportInput DTO for reporting purposes.
   *
   * @param technology The Technology entity to convert.
   * @return The corresponding TechnologyDetailReportInput DTO.
   */
  public TechnologyDetailReportInput convertTechnologyToTechDetailReportInput(
      Technology technology, Date startDate, Date endDate) {

    TechnologyDetailReportInput technologyDetailReportInput = new TechnologyDetailReportInput();

    // Set basic properties from the input Technology entity
    technologyDetailReportInput.setId(technology.getId());
    technologyDetailReportInput.setName(technology.getName());
    if (technology.getShortDescription() == null) {
      technology.setShortDescription("");
    }
    if (technology.getShortDescription().trim().isEmpty()) {
      technologyDetailReportInput.setDescription(technology.getDescription());
    } else {
      technologyDetailReportInput.setDescription(technology.getShortDescription());
    }
    technologyDetailReportInput.setPictureId(technology.getPictureId());
    technologyDetailReportInput.setCategoryName(technology.getCategory().getName());

    // Retrieve and sort the history list for the given technology
    List<History> historyList = historyService.getHistoryForTechnology(technology.getId());
    historyList.sort(Comparator.comparing(History::getDate).reversed());

    // Convert the relevant history data to GantSeries list for display
    List<GantSeries> gantSeriesList =
        GantSeries.convertHistoryListToGantSeriesList(historyList, technology.getName());

    long daysInLifecycle =
        getDaysBetweenDates(
            gantSeriesList.get(gantSeriesList.size() - 1).getStartDate(),
            gantSeriesList.get(gantSeriesList.size() - 1).getEndDate());

    List<GantSeries> gantSeriesListFiltered = new ArrayList<>();
    ;

    if (startDate != null && endDate != null) {
      for (GantSeries gantSeries : gantSeriesList) {
        if ((gantSeries.getStartDate().after(startDate)
                || gantSeries.getStartDate().equals(startDate))
            && (gantSeries.getEndDate().before(endDate)
                || gantSeries.getEndDate().equals(endDate))) {
          gantSeriesListFiltered.add(gantSeries);
        } else if (gantSeries.getEndDate().before(endDate)
                && (startDate.before(gantSeries.getEndDate())
                    || startDate.equals(gantSeries.getEndDate()))
            || gantSeries.getEndDate().equals(endDate)
                && (startDate.before(gantSeries.getEndDate())
                    || startDate.equals(gantSeries.getEndDate()))) {
          gantSeries.setStartDate(startDate);
          gantSeriesListFiltered.add(gantSeries);
        } else if (gantSeries.getEndDate().after(endDate)
            && gantSeries.getStartDate().before(startDate)) {
          gantSeries.setStartDate(startDate);
          gantSeries.setEndDate(endDate);
          gantSeriesListFiltered.add(gantSeries);
        }
      }
      // Ensure there are at least 15 GantSeries, filling with dummy series if necessary
      while (gantSeriesListFiltered.size() < 15) {
        GantSeries dummySeries =
            new GantSeries(
                technology.getName(),
                gantSeriesListFiltered.get(0).getTask(),
                gantSeriesListFiltered.get(0).getStartDate(),
                gantSeriesListFiltered.get(0).getEndDate());
        gantSeriesListFiltered.add(dummySeries);
      }
      technologyDetailReportInput.setGanttSeriesList(gantSeriesListFiltered);
    } else {
      // Ensure there are at least 15 GantSeries, filling with dummy series if necessary
      while (gantSeriesList.size() < 15) {
        GantSeries dummySeries =
            new GantSeries(
                technology.getName(),
                gantSeriesList.get(0).getTask(),
                gantSeriesList.get(0).getStartDate(),
                gantSeriesList.get(0).getEndDate());
        gantSeriesList.add(dummySeries);
      }
      technologyDetailReportInput.setGanttSeriesList(gantSeriesList);
    }

    // Set the formatted date of the last change in the technology
    LocalDateTime lastChangeDate = historyList.get(historyList.size() - 1).getDate();
    String formattedDate = lastChangeDate.format(DateTimeFormatter.ofPattern("dd.MM.yyyy"));
    technologyDetailReportInput.setLifecycleName(
        technology.getLifecycle().getName(), daysInLifecycle);
    technologyDetailReportInput.setLastChange(formattedDate);

    // Set the Base64-encoded picture data if available, otherwise set it to null
    if (technology.getPictureId() != null) {
      byte[] pictureData = pictureRepository.findById(technology.getPictureId()).getData();
      String pictureBase64 = Base64.getEncoder().encodeToString(pictureData);
      technologyDetailReportInput.setPicture(pictureBase64);
    } else {
      technologyDetailReportInput.setPicture(null);
    }

    technologyDetailReportInput.setClicks(technology.getViewCount());

    // technologyDetailReportInput.setCustomers(technology.getCustomerProjectTechnologies());

    return technologyDetailReportInput;
  }
}
