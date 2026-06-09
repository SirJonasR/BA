package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.DeepExpertListEntry;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DeepExpertListRepository implements PanacheRepository<DeepExpertListEntry> {}
