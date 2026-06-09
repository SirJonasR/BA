package com.eviden.tecradar.exception;

/** Exception for invalid values. */
public class InvalidValueException extends RuntimeException {
  public InvalidValueException(String msg) {
    super(msg);
  }
}
