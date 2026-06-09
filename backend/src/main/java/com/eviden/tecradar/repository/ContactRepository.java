package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Contact;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/** Repository for Contact entity. */
@ApplicationScoped
public class ContactRepository implements PanacheRepository<Contact> {}
