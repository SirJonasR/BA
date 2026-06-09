package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Subscription;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/** Repository for Subscription. */
@ApplicationScoped
public class SubscriptionRepository implements PanacheRepository<Subscription> {}
