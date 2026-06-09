package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Picture;
import com.eviden.tecradar.exception.InvalidValueException;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.PictureRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import org.jboss.logging.Logger;

/** Service for picture related tasks. */
@ApplicationScoped
public class PictureService {
  @Inject PictureRepository pictureRepository;
  @Inject Logger logger;

  /**
   * Provide a list with all pictures.
   *
   * @return list of pictures
   */
  public List<Picture> getAll() {
    return pictureRepository.listAll();
  }

  /**
   * Provide picture for given id.
   *
   * @param id picture identifier
   * @return picture
   * @throws ResourceNotFoundException if picture technology does not exist
   */
  public Picture get(Long id) throws ResourceNotFoundException {
    Picture picture = pictureRepository.findById(id);
    if (picture == null) {
      throw new ResourceNotFoundException("No picture found for id " + id);
    }

    return picture;
  }

  /**
   * Creates a new picture entry in the database.
   *
   * @return the newly created picture
   */
  @Transactional
  public Picture create(byte[] pictureData) throws InvalidValueException {
    if (pictureData.length > 4000000) {
      logger.error("Invalid picture size");
      throw new InvalidValueException("Invalid picture size");
    } else {
      Picture picture = new Picture();
      picture.setData(pictureData);
      logger.info("Picture created");
      pictureRepository.persistAndFlush(picture);
      return picture;
    }
  }

  /**
   * Delete a picture for a given technology.
   *
   * @param id technology identifier
   * @throws ResourceNotFoundException if picture does not exist
   */
  @Transactional
  public void delete(Long id) throws ResourceNotFoundException {
    Picture picture = get(id);
    logger.info("Picture with Id " + id + " deleted");
    pictureRepository.delete(picture);
  }
}
