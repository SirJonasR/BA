package com.eviden.tecradar.exception;

/**
 * Exception thrown when too many technologies are selected.
 *
 * <p>This exception is typically thrown when a user attempts to select more technologies than
 * allowed. Although this is usually prevented by frontend validation, it serves as a safeguard for
 * direct backend calls that violate the selection limit.
 */
public class TooManyTechnologiesSelectedException extends RuntimeException {
  public TooManyTechnologiesSelectedException(String message) {
    super(message);
  }
}
