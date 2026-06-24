package com.eviden.tecradar.resource;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

@Path("/api/vulnerable")
public class VulnerableResource {

    @Inject
    EntityManager em;

    // GROUND TRUTH: Classic SQL Injection
    @GET
    @Path("/search")
    public Object searchUser(@QueryParam("name") String name) {
        String query = "SELECT * FROM users WHERE username = '" + name + "'";
        return em.createNativeQuery(query).getResultList();
    }
}