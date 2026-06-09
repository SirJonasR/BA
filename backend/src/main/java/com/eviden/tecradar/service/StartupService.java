package com.eviden.tecradar.service;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/** Service that handles application startup logic. */
@ApplicationScoped
public class StartupService {

  @Inject Logger log;

  @Inject EnvironmentService environmentService;

  void onStart(@Observes StartupEvent ev) {
    log.infof(
        "The DEPLOYMENT_ENVIRONMENT variable is set to '%s'",
        environmentService.getDeploymentEnvironment());
  }
}
