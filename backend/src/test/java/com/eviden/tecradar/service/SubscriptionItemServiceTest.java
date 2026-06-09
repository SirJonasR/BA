package com.eviden.tecradar.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.eviden.tecradar.entity.Subscription;
import com.eviden.tecradar.entity.SubscriptionItem;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.SubscriptionItemRepository;
import com.eviden.tecradar.repository.SubscriptionRepository;
import com.eviden.tecradar.resource.SubscriptionRequestForm;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

@QuarkusTest
public class SubscriptionItemServiceTest {

  @InjectMock SubscriptionItemRepository subscriptionItemRepository;

  @InjectMock SubscriptionRepository subscriptionRepository;

  @Inject SubscriptionItemService subscriptionItemService;

  @Test
  public void testGetSubscriptionItemsBySubscription() {
    Long subscriptionId = 1L;
    Subscription mockSubscription = new Subscription();
    mockSubscription.setId(subscriptionId);
    List<SubscriptionItem> mockSubscriptionItems =
        Arrays.asList(new SubscriptionItem(), new SubscriptionItem());

    Mockito.when(subscriptionRepository.findById(subscriptionId)).thenReturn(mockSubscription);
    Mockito.when(subscriptionItemRepository.list("subscription", mockSubscription))
        .thenReturn(mockSubscriptionItems);

    List<SubscriptionItem> subscriptionItems =
        subscriptionItemService.getSubscriptionItemsBySubscription(subscriptionId);

    assertEquals(2, subscriptionItems.size());
  }

  @Test
  public void testGetSubscriptionItemsByInvalidSubscription() {
    Long invalidSubscriptionId = 999L;

    Mockito.when(subscriptionRepository.findById(invalidSubscriptionId)).thenReturn(null);

    assertThrows(
        ResourceNotFoundException.class,
        () -> {
          subscriptionItemService.getSubscriptionItemsBySubscription(invalidSubscriptionId);
        });
  }

  @Test
  public void testCreateItems() {
    SubscriptionRequestForm form = new SubscriptionRequestForm();
    form.setSubscribedItemType(Arrays.asList("Type1", "Type2"));
    form.setSubscribedItemId(Arrays.asList(1L, 2L));
    Subscription mockSubscription = new Subscription();

    Mockito.doNothing()
        .when(subscriptionItemRepository)
        .persistAndFlush(Mockito.any(SubscriptionItem.class));

    List<SubscriptionItem> subscriptionItems =
        subscriptionItemService.createItems(form, mockSubscription);

    assertEquals(2, subscriptionItems.size());
    Mockito.verify(subscriptionItemRepository, Mockito.times(2))
        .persistAndFlush(Mockito.any(SubscriptionItem.class));
  }
}
