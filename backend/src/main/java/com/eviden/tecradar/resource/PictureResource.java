package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.Picture;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.service.PictureService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/** Controller for the picture REST endpoint. */
@Path("/picture")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class PictureResource {

  @Inject PictureService pictureService;

  /**
   * Get a list with all pictures.
   *
   * @return list of pictures
   */
  @GET
  public List<Picture> getAllPictures() {
    return pictureService.getAll();
  }

  /**
   * Get picture for a given id. Return HTTP status 404, if picture does not exist
   *
   * @param id picture identifier
   * @return picture
   * @throws NotFoundException if picture does not exist
   */
  @Path("{id}")
  @GET
  public Picture get(@PathParam("id") Long id) {
    try {
      return pictureService.get(id);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("No picture found with Id = " + id);
    }
  }
}
