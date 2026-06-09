package com.eviden.tecradar.resource;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

public class SubscriptionRequestFormTest {

  @Test
  public void testSubscriptionRequestFormSettersAndGetters() {
    SubscriptionRequestForm form = new SubscriptionRequestForm();
    form.setName("TestName");
    form.setTimespan(12);
    form.setEmail("test@example.com");

    List<String> subscribedItemTypes = Arrays.asList("Type1", "Type2");
    form.setSubscribedItemType(subscribedItemTypes);

    List<Long> subscribedItemIds = Arrays.asList(1L, 2L);
    form.setSubscribedItemId(subscribedItemIds);

    assertEquals("TestName", form.getName());
    assertEquals(12, form.getTimespan());
    assertEquals("test@example.com", form.getEmail());
    assertEquals(subscribedItemTypes, form.getSubscribedItemType());
    assertEquals(subscribedItemIds, form.getSubscribedItemId());
  }
}
