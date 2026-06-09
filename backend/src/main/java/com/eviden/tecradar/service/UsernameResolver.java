package com.eviden.tecradar.service;

import io.quarkiverse.bucket4j.runtime.resolver.IdentityResolver;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * A custom implementation of {@link IdentityResolver} that resolves the identity key based on the
 * username of the currently authenticated user.
 *
 * <p>This class uses {@link SecurityIdentity} to retrieve the principal's name, which is used as
 * the identity key for rate limiting or other identity-based features.
 */
@ApplicationScoped
public class UsernameResolver implements IdentityResolver {

  @Inject SecurityIdentity securityIdentity;

  public String resolve() {
    return securityIdentity.getPrincipal().getName();
  }

  @Override
  public String getIdentityKey() {
    return "username";
  }
}
