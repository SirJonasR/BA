package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Subscription;
import com.eviden.tecradar.entity.SubscriptionItem;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.SubscriptionItemRepository;
import com.eviden.tecradar.repository.SubscriptionRepository;
import com.eviden.tecradar.resource.SubscriptionRequestForm;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import org.jboss.logging.Logger;

/** Service for SubscriptionItem. */
@ApplicationScoped
public class SubscriptionItemService {

  @Inject SubscriptionItemRepository subscriptionItemRepository;
  @Inject SubscriptionRepository subscriptionRepository;
  @Inject Logger logger;

  public List<SubscriptionItem> getAll() {
    return subscriptionItemRepository.listAll();
  }

  /**
   * Get all SubscriptionItems of given Subscription.
   *
   * @param subscriptionId Id of subscription
   * @return List of SubscriptionItem
   * @throws ResourceNotFoundException if subscription not found
   */
  @Transactional
  public List<SubscriptionItem> getSubscriptionItemsBySubscription(Long subscriptionId)
      throws ResourceNotFoundException {
    Subscription subscription = subscriptionRepository.findById(subscriptionId);
    if (subscription == null) {
      throw new ResourceNotFoundException(
          "No Subscription-Items found for subscriptionId: "
              + subscriptionId
              + " because there is no Subscription!");
    }
    return subscriptionItemRepository.list("subscription", subscription);
  }

  /**
   * Creates all SubscriptionItem entries for given Subscription.
   *
   * @param form The form containing the values for the SubscriptionItems
   * @param subscription The Subscription that has the SubscriptionItems
   * @return The list of created SubscriptionItems
   */
  @Transactional
  public List<SubscriptionItem> createItems(
      SubscriptionRequestForm form, Subscription subscription) {
    List<String> itemTypes = form.getSubscribedItemType();
    List<Long> itemIds = form.getSubscribedItemId();
    List<SubscriptionItem> subscribedItems = new ArrayList<>();
    for (int i = 0; i < itemTypes.size(); i++) {
      SubscriptionItem item = new SubscriptionItem();
      item.setItemType(itemTypes.get(i));
      item.setItemId(itemIds.get(i));
      item.setSubscription(subscription);
      subscribedItems.add(item);
      logger.info("Item " + item.getItemId() + " created");
      subscriptionItemRepository.persistAndFlush(item);
    }
    return subscribedItems;
  }

  /**
   * Deletes all SubscriptionItems of given Subscription.
   *
   * @param subscriptionId Id of Subscription to delete SubscriptionItems from
   */
  @Transactional
  public void deleteBySubscriptionId(Long subscriptionId) {
    List<SubscriptionItem> subscriptionItems = getSubscriptionItemsBySubscription(subscriptionId);
    for (SubscriptionItem subscriptionItem : subscriptionItems) {
      logger.info("Item with Id " + subscriptionId + " deleted");
      subscriptionItemRepository.delete(subscriptionItem);
    }
  }
}
