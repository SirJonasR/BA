package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.Certificate;
import com.eviden.tecradar.entity.Customer;
import com.eviden.tecradar.service.CertificateService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/** Resource for performing CRUD operations on {@link Customer} entities. */
@Path("/certificate")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class CertificateResource {
  @Inject CertificateService certificateService;

  /**
   * Return all available certificates.
   *
   * @return list of all certificates
   */
  @GET
  public List<Certificate> getAll() {
    return certificateService.getAllCertificates();
  }
}
