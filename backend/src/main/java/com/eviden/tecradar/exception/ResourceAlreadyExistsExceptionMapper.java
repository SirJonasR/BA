package com.eviden.tecradar.exception;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/** mapper for @link{@link ResourceAlreadyExistsException}. */
@Provider
public class ResourceAlreadyExistsExceptionMapper
    implements ExceptionMapper<ResourceAlreadyExistsException> {

  @Override
  public Response toResponse(ResourceAlreadyExistsException exception) {
    return Response.status(Response.Status.CONFLICT).entity(exception.getMessage()).build();
  }
}
