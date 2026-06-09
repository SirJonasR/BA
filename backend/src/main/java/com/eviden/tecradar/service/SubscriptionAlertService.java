package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.History;
import com.eviden.tecradar.entity.Subscription;
import com.eviden.tecradar.entity.SubscriptionItem;
import com.eviden.tecradar.entity.SubscriptionItemType;
import com.eviden.tecradar.entity.Technology;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.eclipse.microprofile.config.ConfigProvider;

/** Service for Alerting Subscriptions on Changes. */
@ApplicationScoped
public class SubscriptionAlertService {
  private final String technologyRoutingLink =
      ConfigProvider.getConfig().getValue("frontend.technology-routing-link", String.class);
  @Inject HistoryService historyService;
  @Inject SubscriptionItemService subscriptionItemService;
  @Inject TechnologyService technologyService;
  @Inject LifecycleService lifecycleService;
  @Inject CategoryService categoryService;
  @Inject SubscriptionService subscriptionService;
  @Inject Mailer mailer;

  /**
   * Alerts every Subscription that is subscribed to an element of the changed Technology with a
   * timespan 0. Gets Called by a recent Technology Change.
   *
   * @param lifecycleIdOld id of old lifecycle
   * @param lifecycleIdNew id of new lifecycle
   * @param technology The changed Technology
   */
  public void alertSubscriptionsOnTechnologyChange(
      Long lifecycleIdOld, Long lifecycleIdNew, Technology technology) {
    List<SubscriptionItem> allSubscriptionItems = subscriptionItemService.getAll();
    // Get every Subscription of technology
    List<SubscriptionItem> filteredItems =
        allSubscriptionItems.stream()
            .filter(
                item ->
                    item.getItemType().equals(SubscriptionItemType.TECHNOLOGY.getValue())
                            && item.getItemId().equals(technology.getId())
                        || item.getItemType().equals(SubscriptionItemType.LIFECYCLE.getValue())
                            && item.getItemId().equals(lifecycleIdOld)
                        || item.getItemType().equals(SubscriptionItemType.LIFECYCLE.getValue())
                            && item.getItemId().equals(lifecycleIdNew)
                        || item.getItemType().equals(SubscriptionItemType.CATEGORY.getValue())
                            && item.getItemId().equals(technology.getCategoryId()))
            .toList();

    // Get the Subscription of the filtered Subscribed Elements. With a Set it is made sure that no
    // Subscription is double.
    Set<Subscription> filteredSubscription = new HashSet<>();

    filteredItems.forEach(
        item -> {
          if (item.getSubscription().getTimespan() == 0) {
            filteredSubscription.add(item.getSubscription());
          }
        });

    // Create Msg for E-Mail Text
    String alertMsg = getTechnologyLifecycleChangeAsString(technology.getId(), LocalDateTime.now());

    // Send E-Mail to every filtered Subscription
    filteredSubscription.forEach(subscription -> sendEmail(subscription, alertMsg));
  }

  /**
   * Alerts all subscribed Users with timespan 0 about the added Technology.
   *
   * @param technology The newly added Technology
   */
  public void alertSubscriptionsOnAddedTechnology(Technology technology) {
    // Get Every Subscribed Element and filter for the Category and Lifecycle of the added
    // Technology.
    List<SubscriptionItem> allSubscriptionItems = subscriptionItemService.getAll();

    List<SubscriptionItem> filteredSubscriptionItems =
        allSubscriptionItems.stream()
            .filter(
                item ->
                    item.getItemType().equals(SubscriptionItemType.CATEGORY.getValue())
                            && item.getItemId().equals(technology.getCategoryId())
                        || item.getItemType().equals(SubscriptionItemType.LIFECYCLE.getValue())
                            && item.getItemId().equals(technology.getLifecycleId()))
            .toList();

    // Get the Subscription of the filtered Subscribed Elements. With a Set it is made sure that no
    // Subscription is double.
    Set<Subscription> filteredSubscription = new HashSet<>();

    filteredSubscriptionItems.forEach(
        item -> {
          if (item.getSubscription().getTimespan() == 0) {
            filteredSubscription.add(item.getSubscription());
          }
        });

    // Create Msg for E-Mail Text
    String newTechnologyMsg =
        "Die neue Technologie '<a href='"
            + technologyRoutingLink
            + technology.getId()
            + "'>"
            + technology.getName()
            + "</a>' in der Kategorie '"
            + technology.getCategory().getName()
            + "' mit dem Lebenszyklus '"
            + technology.getLifecycle().getName()
            + "' wurde hinzugefügt.";

    // Send E-Mail for every filtered Subscription
    filteredSubscription.forEach(subscription -> sendEmail(subscription, newTechnologyMsg));
  }

  /**
   * Scheduled Task for weekly subscriptions (Timespan 7) Function will run once every Monday Alerts
   * every User with a weekly subscription about recent Changes.
   */
  @Scheduled(cron = "0 0 3 * * ?")
  void weeklyChanges() {
    // Get All Subscriptions with a weekly timespan
    List<Subscription> weeklySubscriptionList =
        subscriptionService.getAll().stream()
            .filter(subscription -> subscription.getTimespan() == 1)
            .toList();
    // Send Email for every Subscription that has actual changes. Otherwise no email sent.
    weeklySubscriptionList.forEach(
        subscription -> {
          String changes =
              getAllChangesForSubscription(subscription, LocalDateTime.now().minusDays(1));
          if (!changes.isBlank()) {
            sendEmail(subscription, changes);
          }
        });
  }

  /**
   * Scheduled Task for weekly subscriptions (Timespan 30) Function will run once every Monday
   * Alerts every User with a weekly subscription about recent Changes.
   */
  @Scheduled(cron = "0 0 0 1 * ?")
  void monthlyChanges() {
    // Get All Subscriptions with a monthly timespan
    List<Subscription> monthlySubscriptionList =
        subscriptionService.getAll().stream()
            .filter(subscription -> subscription.getTimespan() == 30)
            .toList();
    // Send Email for every Subscription that has actual changes. Otherwise no email sent.
    monthlySubscriptionList.forEach(
        subscription -> {
          String changes =
              getAllChangesForSubscription(subscription, LocalDateTime.now().minusDays(30));
          if (!changes.isBlank()) {
            sendEmail(subscription, changes);
          }
        });
  }

  /**
   * Gets all Changes for the given Subscription and given Timespan. Returns blank String if there
   * are no changes.
   *
   * @param subscription .
   * @param timespan The timespan of the given subscription
   * @return Changes as String Message
   */
  private String getAllChangesForSubscription(Subscription subscription, LocalDateTime timespan) {
    List<SubscriptionItem> subscribedItems =
        subscriptionItemService.getSubscriptionItemsBySubscription(subscription.getId());

    StringBuilder categoryChanges = new StringBuilder();
    StringBuilder lifecycleChanges = new StringBuilder();
    StringBuilder technologyChanges = new StringBuilder();

    for (SubscriptionItem element : subscribedItems) {
      if (element.getItemType().equals(SubscriptionItemType.CATEGORY.getValue())) {
        categoryChanges.append(getChangesOfCategoryAsString(element.getItemId(), timespan));
      } else if (element.getItemType().equals(SubscriptionItemType.LIFECYCLE.getValue())) {
        lifecycleChanges.append(getChangesOfLifecycleAsString(element.getItemId(), timespan));
      } else if (element.getItemType().equals(SubscriptionItemType.TECHNOLOGY.getValue())) {
        technologyChanges.append(
            getTechnologyLifecycleChangeAsString(element.getItemId(), timespan));
      }
    }

    return categoryChanges + "\n" + lifecycleChanges + "\n" + technologyChanges + "\n";
  }

  /**
   * Lists all Changes of given Lifecycle since the given Date as String.
   *
   * @param lifecycleId Id of lifecycle to list changes from
   * @param fromDate The date from which the changes should be tracked down to
   * @return The Changes are returned as a String Message
   */
  private String getChangesOfLifecycleAsString(long lifecycleId, LocalDateTime fromDate) {
    List<Technology> technologiesOfLifecycle =
        technologyService.getAll().stream()
            .filter(technology -> technology.getLifecycleId().equals(lifecycleId))
            .collect(Collectors.toList());

    String changes = getChangesOfTechnologiesAsString(technologiesOfLifecycle, fromDate);

    String lifecycleChangesAsString = "";
    // Only create Message if there are actually Changes. Otherwise return "".
    if (!changes.isBlank()) {
      lifecycleChangesAsString =
          "Lifecycle " + lifecycleService.get(lifecycleId).getName() + ":\n" + changes + "\n";
    }
    return lifecycleChangesAsString;
  }

  /**
   * Lists all Changes of given Category since the given Date as String.
   *
   * @param categoryId Id of category to list changes from
   * @param fromDate The date from which the changes should be tracked down to
   * @return The Changes are returned as a String Message
   */
  private String getChangesOfCategoryAsString(long categoryId, LocalDateTime fromDate) {
    List<Technology> technologiesOfCategory =
        technologyService.getAll().stream()
            .filter(technology -> technology.getCategoryId().equals(categoryId))
            .collect(Collectors.toList());

    String changes = getChangesOfTechnologiesAsString(technologiesOfCategory, fromDate);

    String categoryChangesAsString = "";
    // Only create Message if there are actually Changes. Otherwise return "".
    if (!changes.isBlank()) {
      categoryChangesAsString =
          "Kategorie '" + categoryService.get(categoryId).getName() + ":\n" + changes + "\n";
    }
    return categoryChangesAsString;
  }

  /**
   * Gets all Changes of the given Technologies as a String. Checks if the Technology changed a
   * Lifecycle or if it was newly added.
   *
   * @param filteredTechnologies The Technologies to get the Changes from
   * @param fromDate The date from which the changes should be tracked down to
   * @return The Changes are returned as a String Message
   */
  private String getChangesOfTechnologiesAsString(
      List<Technology> filteredTechnologies, LocalDateTime fromDate) {
    List<Technology> technologiesRecentlyJumpedList =
        filteredTechnologies.stream()
            .filter(
                technology ->
                    technology.getJumpDate().isAfter(fromDate)
                        && !technology.getJumpDate().isEqual(LocalDateTime.now()))
            .toList();

    List<Technology> newTechnologiesList =
        filteredTechnologies.stream()
            .filter(technology -> isNewTechnology(technology.getId(), fromDate))
            .toList();

    StringBuilder lifeycleChanges = new StringBuilder();
    technologiesRecentlyJumpedList.forEach(
        technology ->
            lifeycleChanges
                .append(getTechnologyLifecycleChangeAsString(technology.getId(), fromDate))
                .append("\n"));

    StringBuilder newTechnologies = new StringBuilder();
    newTechnologiesList.forEach(
        technology ->
            newTechnologies
                .append("Die neue Technologie '")
                .append(technology.getName())
                .append("' wurde hinzugefügt.")
                .append("\n"));

    return lifeycleChanges + newTechnologies.toString();
  }

  /**
   * Check if the Technology was created after the given Date.
   *
   * @param technologyId Id of the technology to check
   * @param fromDate The Date to check
   * @return true if new. False if not.
   */
  private boolean isNewTechnology(long technologyId, LocalDateTime fromDate) {
    List<History> historyList = historyService.getHistoryForTechnology(technologyId);
    List<History> filteredHistory =
        historyList.stream().filter(history -> history.getDate().isAfter(fromDate)).toList();
    return filteredHistory.size() == historyList.size();
  }

  /**
   * Creates Mailtext and sends E-Mail to User of given Subscription. Mailer configurations are in
   * application.properties.
   *
   * @param subscription The subscription to get E-Mail-Address and Name
   * @param changesAsText The Changes to include in the E-Mail
   */
  private void sendEmail(Subscription subscription, String changesAsText) {
    String subject = "Tecradar | Abo '" + subscription.getName() + "'";
    String mailText =
        "<p>Hallo,</p>"
            + "<p>Für Ihr TecRadar-Abonnement '<strong>"
            + subscription.getName()
            + "</strong>' gibt es eine neue Meldung:</p>"
            + "<p>"
            + changesAsText
            + "</p>";
    mailer.send(Mail.withHtml(subscription.getEmail(), subject, mailText));
  }

  /**
   * Gets the Lifecycle Change of given Technology since given Date.
   *
   * @param technologyId Id of technology to get Changes from
   * @param fromDate The date from which the changes should be tracked down to
   * @return The Changes are returned as a String Message
   */
  private String getTechnologyLifecycleChangeAsString(long technologyId, LocalDateTime fromDate) {
    Technology technology = technologyService.get(technologyId);
    List<History> historyEntriesToCompare = getHistoryEntriesToCompare(technologyId, fromDate);
    History firstEntry = historyEntriesToCompare.get(0);
    History secondEntry = historyEntriesToCompare.get(1);

    // Only Create Text if Lifecycle actually Changes. Otherwise return "".
    String lifecycleChange = "";
    if (!firstEntry.getLifecycle().equals(secondEntry.getLifecycle())) {
      lifecycleChange =
          "Die Technologie "
              + "<a href='"
              + technologyRoutingLink
              + technology.getId()
              + "'>"
              + technology.getName()
              + "</a>"
              + " ("
              + secondEntry.getCategoryName()
              + ")"
              + " wechselte von "
              + firstEntry.getLifecycleName()
              + " zu "
              + secondEntry.getLifecycleName()
              + "."
              + "\n";
    }

    return lifecycleChange;
  }

  /**
   * Returns the first and last History Entry for the given Timespan.
   *
   * @param technologyId Id of technology
   * @param fromDate The earliest Date from which on the History entries should be listed
   * @return list of history
   */
  private List<History> getHistoryEntriesToCompare(long technologyId, LocalDateTime fromDate) {
    List<History> historyList = historyService.getHistoryForTechnology(technologyId);
    List<History> filteredHistory =
        historyList.stream().filter(history -> history.getDate().isAfter(fromDate)).toList();
    List<History> historyEntriesBeforeAndAfter = new ArrayList<>();
    // If Technology Changed just now
    if (filteredHistory.isEmpty()) {
      historyEntriesBeforeAndAfter.add(historyList.get(historyList.size() - 2));
    } else if (historyList.size() > filteredHistory.size()) {
      historyEntriesBeforeAndAfter.add(
          historyList.get(historyList.indexOf(filteredHistory.get(0)) - 1));
    } else {
      historyEntriesBeforeAndAfter.add(filteredHistory.get(0));
    }
    historyEntriesBeforeAndAfter.add(historyList.get(historyList.size() - 1));
    return historyEntriesBeforeAndAfter;
  }
}
