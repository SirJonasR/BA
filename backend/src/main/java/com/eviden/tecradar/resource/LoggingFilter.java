package com.eviden.tecradar.resource;

import io.smallrye.jwt.auth.principal.DefaultJWTCallerPrincipal;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import org.jboss.logging.Logger;

/** Class for logging. */
@Provider
public class LoggingFilter implements ContainerRequestFilter {
  @Inject Logger logger;

  @Override
  public void filter(ContainerRequestContext requestContext) throws IOException {
    logger.debug(
        "Incoming request: "
            + requestContext.getMethod()
            + " "
            + requestContext.getUriInfo().getRequestUri());
    logger.debug("Headers: " + requestContext.getHeaders());
    logger.debug("Cookies: " + requestContext.getCookies());
    String authHeader = requestContext.getHeaderString("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      logger.warn("Missing or invalid Authorization header");
      return;
    }
    String token = authHeader.substring("Bearer".length()).trim();
    logger.debug(
        "Token received (truncated): "
            + token.substring(0, 5)
            + "..."
            + token.substring(token.length() - 5));

    try {
      DefaultJWTCallerPrincipal principal =
          (DefaultJWTCallerPrincipal) requestContext.getSecurityContext().getUserPrincipal();
      logger.debug("Authenticated user: " + principal.getName());
      logger.debug("Token expiration: " + principal.getExpirationTime());
      logger.debug("Claim: " + principal.getClaimNames());
    } catch (Exception e) {
      logger.warn("Token verification failed: " + e.getMessage());
    }
  }
}
