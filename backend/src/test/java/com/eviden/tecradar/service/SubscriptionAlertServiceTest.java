package com.eviden.tecradar.service;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;

import com.eviden.tecradar.entity.Category;
import com.eviden.tecradar.entity.History;
import com.eviden.tecradar.entity.Lifecycle;
import com.eviden.tecradar.entity.Subscription;
import com.eviden.tecradar.entity.SubscriptionItem;
import com.eviden.tecradar.entity.SubscriptionItemType;
import com.eviden.tecradar.entity.Technology;
import io.quarkus.mailer.Mailer;
import io.quarkus.mailer.MockMailbox;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import org.junit.Ignore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

@QuarkusTest
public class SubscriptionAlertServiceTest {

  @InjectMock HistoryService historyService;

  @InjectMock SubscriptionItemService subscriptionItemService;

  @InjectMock TechnologyService technologyService;

  @InjectMock LifecycleService lifecycleService;

  @InjectMock CategoryService categoryService;

  @InjectMock SubscriptionService subscriptionService;

  @Inject Mailer mailer;

  @Inject SubscriptionAlertService subscriptionAlertService;

  @Inject MockMailbox mockMailbox;

  @BeforeEach
  public void setup() {
    mockMailbox.clear();
  }

  @Test
  public void testAlertSubscriptionsOnTechnologyChange() {

    Lifecycle testLifecycleOld = new Lifecycle();
    testLifecycleOld.setId(-1L);
    testLifecycleOld.setName("Old");

    Lifecycle testLifecycleNew = new Lifecycle();
    testLifecycleNew.setId(1L);
    testLifecycleNew.setName("New");

    Category testCategory = new Category();
    testCategory.setId(1L);

    Technology changedTechnology = new Technology();
    changedTechnology.setId(1L);
    changedTechnology.setLifecycle(testLifecycleNew);
    changedTechnology.setCategory(testCategory);

    History entryOld = new History();
    entryOld.setDate(LocalDateTime.now().minusDays(100));
    entryOld.setName("TestTechnology");
    entryOld.setCategory(testCategory);
    entryOld.setLifecycle(testLifecycleOld);

    History entryNew = new History();
    entryNew.setDate();
    entryNew.setName("TestTechnology");
    entryNew.setCategory(testCategory);
    entryNew.setLifecycle(testLifecycleNew);

    Subscription subscription1 = new Subscription();
    subscription1.setTimespan(0);
    subscription1.setId(1L);

    Subscription subscription2 = new Subscription();
    subscription2.setTimespan(0);
    subscription2.setId(2L);

    Subscription subscription3 = new Subscription();
    subscription3.setTimespan(0);
    subscription3.setId(3L);

    SubscriptionItem item1 = new SubscriptionItem();
    item1.setItemType(SubscriptionItemType.TECHNOLOGY.getValue());
    item1.setItemId(changedTechnology.getId());
    item1.setSubscription(subscription1);

    SubscriptionItem item2 = new SubscriptionItem();
    item2.setItemType(SubscriptionItemType.LIFECYCLE.getValue());
    item2.setItemId(changedTechnology.getLifecycleId());
    item2.setSubscription(subscription2);

    SubscriptionItem item3 = new SubscriptionItem();
    item3.setItemType(SubscriptionItemType.LIFECYCLE.getValue());
    item3.setItemId(entryOld.getLifecycle().getId());
    item3.setSubscription(subscription3);

    SubscriptionItem item4 = new SubscriptionItem();
    item4.setItemType(SubscriptionItemType.CATEGORY.getValue());
    item4.setItemId(changedTechnology.getCategoryId());
    item4.setSubscription(subscription1);

    SubscriptionItem itemNotRelevant = new SubscriptionItem();
    itemNotRelevant.setItemType(SubscriptionItemType.TECHNOLOGY.getValue());
    itemNotRelevant.setItemId(999L);
    itemNotRelevant.setSubscription(new Subscription());

    List<SubscriptionItem> subscriptionItems =
        Arrays.asList(item1, item2, item3, item4, itemNotRelevant);

    List<History> historyList = Arrays.asList(entryOld, entryNew);

    Mockito.when(subscriptionItemService.getAll()).thenReturn(subscriptionItems);
    Mockito.when(historyService.getHistoryForTechnology(changedTechnology.getId()))
        .thenReturn(historyList);
    Mockito.when(technologyService.get(anyLong()))
        .thenAnswer(
            invocation -> {
              Long technologyId = invocation.getArgument(0);
              Technology technology = new Technology();
              technology.setId(technologyId);
              technology.setName("TestTechnology");
              return technology;
            });

    subscriptionAlertService.alertSubscriptionsOnTechnologyChange(
        testLifecycleOld.getId(), testLifecycleNew.getId(), changedTechnology);

    assertEquals(3, mockMailbox.getTotalMessagesSent());
  }

  @Test
  public void testAlertSubscriptionsOnAddedTechnology() {

    Lifecycle testLifecycle = new Lifecycle();
    testLifecycle.setId(1L);

    Category testCategory = new Category();
    testCategory.setId(1L);

    Technology newTechnology = new Technology();
    newTechnology.setId(1L);
    newTechnology.setCategory(testCategory);
    newTechnology.setLifecycle(testLifecycle);

    Subscription subscription1 = new Subscription();
    subscription1.setId(1L);
    subscription1.setTimespan(0);

    Subscription subscription2 = new Subscription();
    subscription1.setId(2L);
    subscription1.setTimespan(0);

    SubscriptionItem categoryItem = new SubscriptionItem();
    categoryItem.setItemType(SubscriptionItemType.CATEGORY.getValue());
    categoryItem.setItemId(newTechnology.getCategoryId());
    categoryItem.setSubscription(subscription1);

    SubscriptionItem lifecycleItem = new SubscriptionItem();
    lifecycleItem.setItemType(SubscriptionItemType.LIFECYCLE.getValue());
    lifecycleItem.setItemId(newTechnology.getLifecycleId());
    lifecycleItem.setSubscription(subscription2);

    List<SubscriptionItem> subscriptionItems = Arrays.asList(categoryItem, lifecycleItem);

    Mockito.when(subscriptionItemService.getAll()).thenReturn(subscriptionItems);

    subscriptionAlertService.alertSubscriptionsOnAddedTechnology(newTechnology);

    assertEquals(2, mockMailbox.getTotalMessagesSent());
  }

  @Ignore
  public void testWeeklyChanges() {
    Lifecycle testLifecycleOld = new Lifecycle();
    testLifecycleOld.setId(-1L);
    testLifecycleOld.setName("Old");

    Lifecycle testLifecycleNew = new Lifecycle();
    testLifecycleNew.setId(1L);
    testLifecycleNew.setName("New");

    Category testCategory = new Category();
    testCategory.setId(1L);

    Technology changedTechnology1 = new Technology();
    changedTechnology1.setId(1L);
    changedTechnology1.setLifecycle(testLifecycleNew);
    changedTechnology1.setCategory(testCategory);
    changedTechnology1.setJumpDate(LocalDateTime.now());

    History entryOld1 = new History();
    entryOld1.setDate(LocalDateTime.now().minusDays(4));
    entryOld1.setName("TestTechnology");
    entryOld1.setCategory(testCategory);
    entryOld1.setLifecycle(testLifecycleOld);

    History entryNew1 = new History();
    entryNew1.setDate();
    entryNew1.setName("TestTechnology");
    entryNew1.setCategory(testCategory);
    entryNew1.setLifecycle(testLifecycleNew);

    Technology changedTechnology2 = new Technology();
    changedTechnology2.setId(2L);
    changedTechnology2.setLifecycle(testLifecycleOld);
    changedTechnology2.setCategory(testCategory);
    changedTechnology2.setJumpDate(LocalDateTime.now());

    History entryOld2 = new History();
    entryOld2.setDate(LocalDateTime.now().minusDays(6));
    entryOld2.setName("TestTechnology");
    entryOld2.setDescription("test");
    entryOld2.setCategory(testCategory);
    entryOld2.setLifecycle(testLifecycleNew);

    History entryNew2 = new History();
    entryNew2.setDate();
    entryNew2.setName("TestTechnology");
    entryNew2.setCategory(testCategory);
    entryNew2.setLifecycle(testLifecycleOld);

    Technology newTechnology = new Technology();
    newTechnology.setName("newTechnology");
    newTechnology.setCategory(testCategory);
    newTechnology.setLifecycle(testLifecycleOld);

    History entryNewTechnology = new History();
    entryNewTechnology.setDate();
    entryNewTechnology.setCategory(testCategory);
    entryNewTechnology.setLifecycle(testLifecycleOld);

    Technology changedTechnologyIrrelevant = new Technology();
    changedTechnologyIrrelevant.setId(3L);
    changedTechnologyIrrelevant.setLifecycle(testLifecycleOld);
    changedTechnologyIrrelevant.setCategory(testCategory);
    changedTechnologyIrrelevant.setJumpDate(LocalDateTime.now().minusDays(25));

    History entryOld3 = new History();
    entryOld3.setDate(LocalDateTime.now().minusDays(30));
    entryOld3.setName("TestTechnology");
    entryOld3.setCategory(testCategory);
    entryOld3.setLifecycle(testLifecycleOld);

    History entryNew3 = new History();
    entryNew3.setDate(LocalDateTime.now().minusDays(25));
    entryNew3.setName("TestTechnology");
    entryNew3.setCategory(testCategory);
    entryNew3.setLifecycle(testLifecycleNew);

    Subscription subscription1 = new Subscription();
    subscription1.setTimespan(7);
    subscription1.setId(1L);

    Subscription subscription2 = new Subscription();
    subscription2.setTimespan(7);
    subscription2.setId(2L);

    Subscription subscription3 = new Subscription();
    subscription3.setTimespan(7);
    subscription3.setId(3L);

    Subscription subscriptionIrrelevant = new Subscription();
    subscriptionIrrelevant.setTimespan(30);
    subscriptionIrrelevant.setId(4L);

    SubscriptionItem item1 = new SubscriptionItem();
    item1.setItemType(SubscriptionItemType.TECHNOLOGY.getValue());
    item1.setItemId(changedTechnology1.getId());
    item1.setSubscription(subscription1);

    SubscriptionItem item2 = new SubscriptionItem();
    item2.setItemType(SubscriptionItemType.LIFECYCLE.getValue());
    item2.setItemId(changedTechnology2.getLifecycleId());
    item2.setSubscription(subscription2);

    SubscriptionItem item3 = new SubscriptionItem();
    item3.setItemType(SubscriptionItemType.CATEGORY.getValue());
    item3.setItemId(newTechnology.getCategoryId());
    item3.setSubscription(subscription3);

    SubscriptionItem itemIrrelevant = new SubscriptionItem();
    itemIrrelevant.setItemType(SubscriptionItemType.CATEGORY.getValue());
    itemIrrelevant.setItemId(newTechnology.getCategoryId());
    itemIrrelevant.setSubscription(subscriptionIrrelevant);

    Mockito.when(subscriptionService.getAll())
        .thenReturn(
            Arrays.asList(subscription1, subscription2, subscription3, subscriptionIrrelevant));

    Mockito.when(subscriptionItemService.getSubscriptionItemsBySubscription(subscription1.getId()))
        .thenReturn(List.of(item1));
    Mockito.when(subscriptionItemService.getSubscriptionItemsBySubscription(subscription2.getId()))
        .thenReturn(List.of(item2));
    Mockito.when(subscriptionItemService.getSubscriptionItemsBySubscription(subscription3.getId()))
        .thenReturn(List.of(item3));

    Mockito.when(lifecycleService.get(anyLong())).thenReturn(testLifecycleOld);
    Mockito.when(categoryService.get(testCategory.getId())).thenReturn(testCategory);

    List<Technology> technologies =
        Arrays.asList(changedTechnology1, changedTechnology2, changedTechnologyIrrelevant);
    Mockito.when(technologyService.getAll()).thenReturn(technologies);
    Mockito.when(historyService.getHistoryForTechnology(changedTechnology1.getId()))
        .thenReturn(Arrays.asList(entryOld1, entryNew1));
    Mockito.when(historyService.getHistoryForTechnology(changedTechnology2.getId()))
        .thenReturn(Arrays.asList(entryOld2, entryNew2));
    Mockito.when(historyService.getHistoryForTechnology(newTechnology.getId()))
        .thenReturn(List.of(entryNewTechnology));
    Mockito.when(historyService.getHistoryForTechnology(changedTechnologyIrrelevant.getId()))
        .thenReturn(Arrays.asList(entryOld3, entryNew3));
    Mockito.when(technologyService.get(anyLong()))
        .thenAnswer(
            invocation -> {
              Long technologyId = invocation.getArgument(0);
              Technology technology = new Technology();
              technology.setId(technologyId);
              technology.setName("TestTechnology");
              return technology;
            });

    subscriptionAlertService.weeklyChanges();

    assertEquals(3, mockMailbox.getTotalMessagesSent());
  }

  @Test
  public void testMonthlyChanges() {
    Lifecycle testLifecycleOld = new Lifecycle();
    testLifecycleOld.setId(-1L);
    testLifecycleOld.setName("Old");

    Lifecycle testLifecycleNew = new Lifecycle();
    testLifecycleNew.setId(1L);
    testLifecycleNew.setName("New");

    Category testCategory = new Category();
    testCategory.setId(1L);

    Technology changedTechnology1 = new Technology();
    changedTechnology1.setId(1L);
    changedTechnology1.setLifecycle(testLifecycleNew);
    changedTechnology1.setCategory(testCategory);
    changedTechnology1.setJumpDate(LocalDateTime.now());

    History entryOld1 = new History();
    entryOld1.setDate(LocalDateTime.now().minusDays(20));
    entryOld1.setName("TestTechnology");
    entryOld1.setCategory(testCategory);
    entryOld1.setLifecycle(testLifecycleOld);

    History entryNew1 = new History();
    entryNew1.setDate();
    entryNew1.setName("TestTechnology");
    entryNew1.setCategory(testCategory);
    entryNew1.setLifecycle(testLifecycleNew);

    Technology changedTechnology2 = new Technology();
    changedTechnology2.setId(2L);
    changedTechnology2.setLifecycle(testLifecycleOld);
    changedTechnology2.setCategory(testCategory);
    changedTechnology2.setJumpDate(LocalDateTime.now());

    History entryOld2 = new History();
    entryOld2.setDate(LocalDateTime.now().minusDays(20));
    entryOld2.setName("TestTechnology");
    entryOld2.setDescription("test");
    entryOld2.setCategory(testCategory);
    entryOld2.setLifecycle(testLifecycleNew);

    History entryNew2 = new History();
    entryNew2.setDate();
    entryNew2.setName("TestTechnology");
    entryNew2.setCategory(testCategory);
    entryNew2.setLifecycle(testLifecycleOld);

    Technology newTechnology = new Technology();
    newTechnology.setName("newTechnology");
    newTechnology.setCategory(testCategory);
    newTechnology.setLifecycle(testLifecycleOld);

    History entryNewTechnology = new History();
    entryNewTechnology.setDate();
    entryNewTechnology.setCategory(testCategory);
    entryNewTechnology.setLifecycle(testLifecycleOld);

    Technology changedTechnologyIrrelevant = new Technology();
    changedTechnologyIrrelevant.setId(3L);
    changedTechnologyIrrelevant.setLifecycle(testLifecycleOld);
    changedTechnologyIrrelevant.setCategory(testCategory);
    changedTechnologyIrrelevant.setJumpDate(LocalDateTime.now().minusDays(50));

    History entryOld3 = new History();
    entryOld3.setDate(LocalDateTime.now().minusDays(50));
    entryOld3.setName("TestTechnology");
    entryOld3.setCategory(testCategory);
    entryOld3.setLifecycle(testLifecycleOld);

    History entryNew3 = new History();
    entryNew3.setDate(LocalDateTime.now().minusDays(40));
    entryNew3.setName("TestTechnology");
    entryNew3.setCategory(testCategory);
    entryNew3.setLifecycle(testLifecycleNew);

    Subscription subscription1 = new Subscription();
    subscription1.setTimespan(30);
    subscription1.setId(1L);

    Subscription subscription2 = new Subscription();
    subscription2.setTimespan(30);
    subscription2.setId(2L);

    Subscription subscription3 = new Subscription();
    subscription3.setTimespan(30);
    subscription3.setId(3L);

    Subscription subscriptionIrrelevant = new Subscription();
    subscriptionIrrelevant.setTimespan(7);
    subscriptionIrrelevant.setId(4L);

    SubscriptionItem item1 = new SubscriptionItem();
    item1.setItemType(SubscriptionItemType.TECHNOLOGY.getValue());
    item1.setItemId(changedTechnology1.getId());
    item1.setSubscription(subscription1);

    SubscriptionItem item2 = new SubscriptionItem();
    item2.setItemType(SubscriptionItemType.LIFECYCLE.getValue());
    item2.setItemId(changedTechnology2.getLifecycleId());
    item2.setSubscription(subscription2);

    SubscriptionItem item3 = new SubscriptionItem();
    item3.setItemType(SubscriptionItemType.CATEGORY.getValue());
    item3.setItemId(newTechnology.getCategoryId());
    item3.setSubscription(subscription3);

    SubscriptionItem itemIrrelevant = new SubscriptionItem();
    itemIrrelevant.setItemType(SubscriptionItemType.CATEGORY.getValue());
    itemIrrelevant.setItemId(newTechnology.getCategoryId());
    itemIrrelevant.setSubscription(subscriptionIrrelevant);

    Mockito.when(subscriptionService.getAll())
        .thenReturn(
            Arrays.asList(subscription1, subscription2, subscription3, subscriptionIrrelevant));

    Mockito.when(subscriptionItemService.getSubscriptionItemsBySubscription(subscription1.getId()))
        .thenReturn(List.of(item1));
    Mockito.when(subscriptionItemService.getSubscriptionItemsBySubscription(subscription2.getId()))
        .thenReturn(List.of(item2));
    Mockito.when(subscriptionItemService.getSubscriptionItemsBySubscription(subscription3.getId()))
        .thenReturn(List.of(item3));

    Mockito.when(lifecycleService.get(anyLong())).thenReturn(testLifecycleOld);
    Mockito.when(categoryService.get(testCategory.getId())).thenReturn(testCategory);

    List<Technology> technologies =
        Arrays.asList(changedTechnology1, changedTechnology2, changedTechnologyIrrelevant);
    Mockito.when(technologyService.getAll()).thenReturn(technologies);
    Mockito.when(historyService.getHistoryForTechnology(changedTechnology1.getId()))
        .thenReturn(Arrays.asList(entryOld1, entryNew1));
    Mockito.when(historyService.getHistoryForTechnology(changedTechnology2.getId()))
        .thenReturn(Arrays.asList(entryOld2, entryNew2));
    Mockito.when(historyService.getHistoryForTechnology(newTechnology.getId()))
        .thenReturn(List.of(entryNewTechnology));
    Mockito.when(historyService.getHistoryForTechnology(changedTechnologyIrrelevant.getId()))
        .thenReturn(Arrays.asList(entryOld3, entryNew3));
    Mockito.when(technologyService.get(anyLong()))
        .thenAnswer(
            invocation -> {
              Long technologyId = invocation.getArgument(0);
              Technology technology = new Technology();
              technology.setId(technologyId);
              technology.setName("TestTechnology");
              return technology;
            });

    subscriptionAlertService.monthlyChanges();

    assertEquals(3, mockMailbox.getTotalMessagesSent());
  }
}
