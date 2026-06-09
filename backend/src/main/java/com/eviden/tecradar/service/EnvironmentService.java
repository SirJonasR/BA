package com.eviden.tecradar.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/** Service class for determining the current deployment environment of the application. */
@ApplicationScoped
public class EnvironmentService {

  @ConfigProperty(name = "DEPLOYMENT_ENVIRONMENT", defaultValue = "local")
  String deploymentEnvironment;

  public boolean isDev() {
    return "dev".equalsIgnoreCase(deploymentEnvironment);
  }

  public boolean isProd() {
    return "prod".equalsIgnoreCase(deploymentEnvironment);
  }

  public boolean isLocal() {
    return "local".equalsIgnoreCase(deploymentEnvironment);
  }

  public String getDeploymentEnvironment() {
    return deploymentEnvironment;
  }
}
