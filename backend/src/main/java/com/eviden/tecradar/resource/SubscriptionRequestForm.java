package com.eviden.tecradar.resource;

import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import org.jboss.resteasy.reactive.PartType;

/** Data container for transferring subscription related data from client to backend. */
public class SubscriptionRequestForm {
  @FormParam("name")
  @PartType(MediaType.TEXT_PLAIN)
  private String name;

  @FormParam("timespan")
  @PartType(MediaType.TEXT_PLAIN)
  private int timespan;

  @FormParam("email")
  @PartType(MediaType.TEXT_PLAIN)
  private String email;

  @FormParam("subscribedItemType")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> subscribedItemType;

  @FormParam("subscribedItemId")
  @PartType(MediaType.TEXT_PLAIN)
  private List<Long> subscribedItemId;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public int getTimespan() {
    return timespan;
  }

  public void setTimespan(int timespan) {
    this.timespan = timespan;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public List<String> getSubscribedItemType() {
    return subscribedItemType;
  }

  public void setSubscribedItemType(List<String> subscribedItemType) {
    this.subscribedItemType = subscribedItemType;
  }

  public List<Long> getSubscribedItemId() {
    return subscribedItemId;
  }

  public void setSubscribedItemId(List<Long> subscribedItemId) {
    this.subscribedItemId = subscribedItemId;
  }

  @Override
  public String toString() {
    return "SubscriptionRequestForm{"
        + "name='"
        + name
        + '\''
        + ", timespan='"
        + timespan
        + '\''
        + ", email='"
        + email
        + '\''
        + ", subscribedItemTypes="
        + subscribedItemType
        + '\''
        + ", subscribedItemIds="
        + subscribedItemId
        + "}";
  }
}
