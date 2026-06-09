package com.eviden.tecradar.exception;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/** ExceptionMapper for invalid values. */
@Provider
public class InvalidValueExceptionMapper implements ExceptionMapper<InvalidValueException> {

  @Override
  public Response toResponse(InvalidValueException exception) {
    return Response.status(Response.Status.BAD_REQUEST).entity(exception.getMessage()).build();
  }
}
