package com.eviden.tecradar.exception;

/** Exception for Resource already exists in the database. */
public class ResourceAlreadyExistsException extends RuntimeException {
  public ResourceAlreadyExistsException(String message) {
    super(message);
  }
}
