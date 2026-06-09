package com.eviden.tecradar.exception;

import io.quarkiverse.bucket4j.runtime.RateLimitException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

/**
 * ExceptionMapper implementation for handling {@link RateLimitException}.
 *
 * <p>Converts {@code RateLimitException} instances into HTTP 429 (Too Many Requests) responses,
 * including a human-readable message and a {@code Retry-After} header indicating the wait time in
 * seconds.
 *
 * <p>The response message is localized in German and adapts its format depending on the wait time.
 */
@Provider
public class RateLimitExceptionMapper implements ExceptionMapper<RateLimitException> {

  private static final Logger LOG = Logger.getLogger(RateLimitExceptionMapper.class.getName());

  @Override
  public Response toResponse(RateLimitException e) {
    // Log zur Kontrolle
    LOG.info(
        "RateLimitExceptionMapper triggered. Wartezeit: " + e.getWaitTimeInMilliSeconds() + "ms");

    // Wartezeit in Sekunden umrechnen
    long waitForSec = TimeUnit.MILLISECONDS.toSeconds(e.getWaitTimeInMilliSeconds());
    // long waitForMin = TimeUnit.SECONDS.toMinutes(waitForSec);

    String message;

    // Only show seconds when below one minute, show minutes and seconds in every other case
    if (waitForSec < 60) {
      message =
          "Zu viele Anfragen! Bitte warte "
              + waitForSec
              + " Sekunden, bevor du es erneut versuchst.";
    } else {
      long minutes = waitForSec / 60;
      long seconds = waitForSec % 60;

      message =
          "Zu viele Anfragen! Bitte warte "
              + minutes
              + " Minuten und "
              + seconds
              + " Sekunden, bevor du es erneut versucht.";
    }

    return Response.status(Response.Status.TOO_MANY_REQUESTS)
        .header("Retry-After", waitForSec)
        .entity(message)
        .build();
  }
}
