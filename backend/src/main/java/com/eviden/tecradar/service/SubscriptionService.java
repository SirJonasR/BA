package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Subscription;
import com.eviden.tecradar.entity.SubscriptionItem;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.SubscriptionRepository;
import com.eviden.tecradar.resource.SubscriptionRequestForm;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import org.jboss.logging.Logger;

/** Service for Subscription related tasks. */
@ApplicationScoped
public class SubscriptionService {

  private final SubscriptionRepository subscriptionRepository;
  private final SubscriptionItemService subscriptionItemService;
  private final UserService userService;
  private final Logger logger = Logger.getLogger(SubscriptionService.class);

  /**
   * Constructor for initializing the SubscriptionService.
   *
   * @param subscriptionRepository The repository for managing Subscription entries
   * @param subscriptionItemService The repository for managing SubscriptionItem entries
   * @param userService The service for managing user information
   */
  @Inject
  public SubscriptionService(
      SubscriptionRepository subscriptionRepository,
      SubscriptionItemService subscriptionItemService,
      UserService userService) {
    this.subscriptionRepository = subscriptionRepository;
    this.subscriptionItemService = subscriptionItemService;
    this.userService = userService;
  }

  /**
   * Fetches all subscriptions from the database.
   *
   * @return A list of all subscriptions
   */
  public List<Subscription> getAll() {
    return subscriptionRepository.listAll();
  }

  /**
   * Fetches all subscriptions of given username.
   *
   * @param username .
   * @return A list of the subscriptions
   */
  public List<Subscription> getAllByUser(String username) {
    User user = userService.get(username);
    if (user == null) {
      throw new ResourceNotFoundException("No User found for username = " + username);
    }
    return subscriptionRepository.list("user", user);
  }

  /**
   * Fetches a subscription by its id.
   *
   * @param id The id of the subscription to fetch
   * @return The subscription with the specified id
   */
  public Subscription get(Long id) {
    Subscription subscription = subscriptionRepository.findById(id);
    if (subscription == null) {
      throw new ResourceNotFoundException("No Subscription found for id = " + id);
    }
    return subscription;
  }

  /**
   * Creates a new subscription.
   *
   * @param form The form containing the values for the new subscription
   * @param username The username of the user who created the new subscription
   * @return The created subscription
   */
  @Transactional
  public Subscription create(SubscriptionRequestForm form, String username) {
    Subscription subscription = populateSubscriptionFields(new Subscription(), form);
    subscription.setUser(userService.get(username));
    logger.info("Subscription " + subscription.getName() + " created");
    subscriptionRepository.persistAndFlush(subscription);
    addItems(form, subscription);
    return subscription;
  }

  /**
   * Update a subscription of given user.
   *
   * @param id The id of the subscription to update
   * @param form The form containing the new values
   * @param username The username of the user who updated the subscription
   * @return The updated subscription
   */
  @Transactional
  public Subscription update(Long id, SubscriptionRequestForm form, String username) {
    Subscription subscription = get(id);
    subscriptionItemService.deleteBySubscriptionId(subscription.getId());
    populateSubscriptionFields(subscription, form);
    logger.info("Subscription " + subscription.getName() + " updated");
    subscriptionRepository.persistAndFlush(subscription);
    addItems(form, subscription);
    return subscription;
  }

  /**
   * Deletes a subscription and all associated entities.
   *
   * @param id The id of the subscription to delete
   */
  @Transactional
  public void delete(Long id) {
    Subscription subscription = get(id);
    subscriptionItemService.deleteBySubscriptionId(id);
    logger.info("Subscription with Id " + id + " deleted");
    subscriptionRepository.delete(subscription);
  }

  private Subscription populateSubscriptionFields(
      Subscription subscription, SubscriptionRequestForm form) {
    subscription.setName(form.getName());
    subscription.setEmail(form.getEmail());
    subscription.setTimespan(form.getTimespan());
    return subscription;
  }

  private void addItems(SubscriptionRequestForm form, Subscription subscription) {
    List<SubscriptionItem> subscriptions = subscriptionItemService.createItems(form, subscription);
    subscription.setSubscriptionItems(subscriptions);
  }
}
