package com.eviden.tecradar.exception;

/** Exception for resource not found. */
public class ResourceNotFoundException extends RuntimeException {
  public ResourceNotFoundException(String msg) {
    super(msg);
  }
}
