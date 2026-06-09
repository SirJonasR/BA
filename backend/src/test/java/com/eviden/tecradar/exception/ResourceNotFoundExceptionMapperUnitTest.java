package com.eviden.tecradar.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

public class ResourceNotFoundExceptionMapperUnitTest {
  @Test
  public void testToResponse() {
    ResourceNotFoundException ex = new ResourceNotFoundException("Not found" + 123L);
    ResourceNotFoundExceptionMapper mapper = new ResourceNotFoundExceptionMapper();

    Response response = mapper.toResponse(ex);

    assertEquals(404, response.getStatus());
    assertTrue(response.getEntity().toString().contains("123"));
  }
}
