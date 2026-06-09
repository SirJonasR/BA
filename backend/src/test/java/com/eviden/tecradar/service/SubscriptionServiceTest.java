package com.eviden.tecradar.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.eviden.tecradar.entity.Subscription;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.SubscriptionRepository;
import com.eviden.tecradar.resource.SubscriptionRequestForm;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

@QuarkusTest
public class SubscriptionServiceTest {

  @InjectMock SubscriptionRepository subscriptionRepository;

  @InjectMock SubscriptionItemService subscriptionItemService;

  @InjectMock UserService userService;

  SubscriptionService subscriptionService;

  @BeforeEach
  public void setup() {
    subscriptionService =
        new SubscriptionService(subscriptionRepository, subscriptionItemService, userService);
  }

  @Test
  public void testGetAllSubscriptions() {
    List<Subscription> mockSubscriptions = Arrays.asList(new Subscription(), new Subscription());
    Mockito.when(subscriptionRepository.listAll()).thenReturn(mockSubscriptions);

    List<Subscription> subscriptions = subscriptionService.getAll();

    assertEquals(2, subscriptions.size());
  }

  @Test
  public void testGetSubscriptionById() {
    Long subscriptionId = 1L;
    Subscription mockSubscription = new Subscription();
    mockSubscription.setId(subscriptionId);

    Mockito.when(subscriptionRepository.findById(subscriptionId)).thenReturn(mockSubscription);

    Subscription subscription = subscriptionService.get(subscriptionId);

    assertEquals(subscriptionId, subscription.getId());
  }

  @Test
  public void testGetSubscriptionByInvalidId() {
    Long invalidId = 999L;

    Mockito.when(subscriptionRepository.findById(invalidId)).thenReturn(null);

    assertThrows(
        ResourceNotFoundException.class,
        () -> {
          subscriptionService.get(invalidId);
        });
  }

  @Test
  public void testGetAllSubscriptionsByUser() {
    User mockUser = new User();
    mockUser.setUserName("testUser");
    List<Subscription> mockSubscriptions = Arrays.asList(new Subscription(), new Subscription());

    Mockito.when(userService.get("testUser")).thenReturn(mockUser);
    Mockito.when(subscriptionRepository.list("user", mockUser)).thenReturn(mockSubscriptions);

    List<Subscription> subscriptions = subscriptionService.getAllByUser("testUser");

    assertEquals(2, subscriptions.size());
  }

  @Test
  public void testCreateSubscription() {
    SubscriptionRequestForm form = new SubscriptionRequestForm();
    form.setName("TestSubscription");
    form.setTimespan(7);
    form.setEmail("test@example.com");

    User mockUser = new User();
    mockUser.setUserName("testUser");

    Mockito.when(userService.get("testUser")).thenReturn(mockUser);
    Mockito.doNothing()
        .when(subscriptionRepository)
        .persistAndFlush(Mockito.any(Subscription.class));
    Mockito.when(
            subscriptionItemService.createItems(
                Mockito.any(SubscriptionRequestForm.class), Mockito.any(Subscription.class)))
        .thenReturn(new ArrayList<>());

    Subscription createdSubscription = subscriptionService.create(form, "testUser");

    assertEquals(mockUser.getUserName(), createdSubscription.getUser().getUserName());
    assertEquals("test@example.com", createdSubscription.getEmail());
    assertEquals(7, createdSubscription.getTimespan());
  }

  @Test
  public void testUpdateSubscription() {
    Long subscriptionId = 1L;
    Subscription mockSubscription = new Subscription();
    mockSubscription.setId(subscriptionId);
    SubscriptionRequestForm form = new SubscriptionRequestForm();
    form.setName("TestSubscription");
    form.setTimespan(7);
    form.setEmail("test@example.com");

    String username = "testUser";

    Mockito.when(subscriptionRepository.findById(subscriptionId)).thenReturn(mockSubscription);
    Mockito.when(userService.get(username)).thenReturn(new User());
    Mockito.doNothing().when(subscriptionItemService).deleteBySubscriptionId(subscriptionId);
    Mockito.doNothing().when(subscriptionRepository).persistAndFlush(mockSubscription);

    Subscription updatedSubscription = subscriptionService.update(subscriptionId, form, username);

    assertEquals("TestSubscription", updatedSubscription.getName());
    assertEquals(7, updatedSubscription.getTimespan());
    assertEquals("test@example.com", updatedSubscription.getEmail());
  }

  @Test
  public void testDeleteSubscription() {
    Long subscriptionId = 1L;
    Subscription mockSubscription = new Subscription();
    mockSubscription.setId(subscriptionId);

    Mockito.when(subscriptionRepository.findById(subscriptionId)).thenReturn(mockSubscription);
    Mockito.doNothing().when(subscriptionItemService).deleteBySubscriptionId(subscriptionId);
    Mockito.doNothing().when(subscriptionRepository).delete(mockSubscription);

    subscriptionService.delete(subscriptionId);

    Mockito.verify(subscriptionItemService, Mockito.times(1))
        .deleteBySubscriptionId(subscriptionId);
    Mockito.verify(subscriptionRepository, Mockito.times(1)).delete(mockSubscription);
  }
}
