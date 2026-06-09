package com.eviden.tecradar.exception;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

/** ExceptionMapper for resource not found. */
@Provider
public class ResourceNotFoundExceptionMapper implements ExceptionMapper<ResourceNotFoundException> {

  private static final Logger logger = Logger.getLogger(ResourceNotFoundExceptionMapper.class);

  @Override
  public Response toResponse(ResourceNotFoundException exception) {
    String message = "Resource not found: " + exception.getMessage();
    logger.warn(message, exception);
    return Response.status(Response.Status.NOT_FOUND).entity(message).build();
  }
}
