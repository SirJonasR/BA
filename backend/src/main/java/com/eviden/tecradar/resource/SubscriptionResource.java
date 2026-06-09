package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.Subscription;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.service.SubscriptionService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/** Controller for the Subscription REST endpoint. */
@Path("/subscription")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class SubscriptionResource {
  @Inject SecurityIdentity securityIdentity;
  @Inject SubscriptionService subscriptionService;

  /**
   * Returns a list of all Subscriptions from given User.
   *
   * @param username The username to get the subscriptions from
   * @return A list of subscriptions
   */
  @GET
  @Path("user/{username}")
  @Consumes(MediaType.APPLICATION_JSON)
  public List<Subscription> get(@PathParam("username") String username) {
    try {
      return subscriptionService.getAllByUser(username);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("Subscriptions of the user " + username + " not found.");
    }
  }

  /**
   * Returns Subscription with given id.
   *
   * @param id The id of the subscription
   * @return The subscription
   */
  @GET
  @Path("id/{id}")
  @Consumes(MediaType.APPLICATION_JSON)
  public Subscription get(@PathParam("id") Long id) {
    try {
      return subscriptionService.get(id);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("Subscription with Id " + id + " not found.");
    }
  }

  /**
   * Create a new Subscription Database entry.
   *
   * @param subscriptionRequestForm The form containing the values
   * @return The created subscription
   */
  @POST
  @Transactional
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public Subscription create(SubscriptionRequestForm subscriptionRequestForm) {
    String userName = securityIdentity.getPrincipal().getName();
    try {
      return subscriptionService.create(subscriptionRequestForm, userName);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("Subscription with user " + userName + " not created.");
    }
  }

  /**
   * Update an existing Subscription Database entry.
   *
   * @param id The id of the subscription
   * @param subscriptionRequestForm The form containing the new values
   * @return The updated subscription
   */
  @PUT
  @Path("{id}")
  @Transactional
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public Subscription update(
      @PathParam("id") Long id, SubscriptionRequestForm subscriptionRequestForm) {
    String userName = securityIdentity.getPrincipal().getName();
    try {
      return subscriptionService.update(id, subscriptionRequestForm, userName);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("Subscription with user " + userName + " not found.");
    }
  }

  /**
   * Delete a Subscription entry with given id.
   *
   * @param id The id of the subscription to delete
   */
  @DELETE
  @Path("{id}")
  @Transactional
  @Consumes(MediaType.APPLICATION_JSON)
  public void delete(@PathParam("id") Long id) {
    try {
      subscriptionService.delete(id);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("Subscription with Id " + id + " not found.");
    }
  }
}
