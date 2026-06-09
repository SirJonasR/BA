package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.Customer;
import com.eviden.tecradar.service.CustomerService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/** Resource for performing CRUD operations on {@link Customer} entities. */
@Path("/customer")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class CustomerResource {
  @Inject CustomerService customerService;

  /**
   * Return all available customers.
   *
   * @return list of all customers
   */
  @GET
  public List<Customer> getAll() {
    return customerService.getAllCustomers();
  }
}
