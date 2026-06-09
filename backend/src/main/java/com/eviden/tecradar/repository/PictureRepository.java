package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Picture;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/** Repository for picture entity. */
@ApplicationScoped
public class PictureRepository implements PanacheRepository<Picture> {}
