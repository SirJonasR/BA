package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.SubscriptionItem;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/** Repository for SubscriptionItem. */
@ApplicationScoped
public class SubscriptionItemRepository implements PanacheRepository<SubscriptionItem> {}
