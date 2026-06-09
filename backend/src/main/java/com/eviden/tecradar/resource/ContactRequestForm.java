package com.eviden.tecradar.resource;

import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.core.MediaType;
import java.io.InputStream;
import java.util.List;
import org.jboss.resteasy.reactive.PartType;

/** Data container for transferring ContactForm related data from client to backend. */
public class ContactRequestForm {
  @FormParam("description")
  @PartType(MediaType.TEXT_PLAIN)
  private String description;

  @FormParam("mailAddress")
  @PartType(MediaType.TEXT_PLAIN)
  private String mailAddress;

  @FormParam("attachmentData")
  @PartType(MediaType.APPLICATION_OCTET_STREAM)
  private List<InputStream> attachmentData;

  @FormParam("attachmentFileName")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> attachmentFileName;

  @FormParam("attachmentContentType")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> attachmentContentType;

  @FormParam("mailType")
  @PartType(MediaType.TEXT_PLAIN)
  private String mailType;

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getMailAddress() {
    return mailAddress;
  }

  public void setMailAddress(String mailAddress) {
    this.mailAddress = mailAddress;
  }

  public List<InputStream> getAttachmentData() {
    return attachmentData;
  }

  public void setAttachmentData(List<InputStream> attachmentData) {
    this.attachmentData = attachmentData;
  }

  public List<String> getAttachmentFileName() {
    return attachmentFileName;
  }

  public void setAttachmentFileName(List<String> attachmentFileName) {
    this.attachmentFileName = attachmentFileName;
  }

  public void setAttachmentContentType(List<String> attachmentContentType) {
    this.attachmentContentType = attachmentContentType;
  }

  public List<String> getAttachmentContentType() {
    return attachmentContentType;
  }

  public String getMailType() {
    return mailType;
  }

  public void setMailType(String mailType) {
    this.mailType = mailType;
  }

  @Override
  public String toString() {
    return "Beschreibung= " + this.description + '\n' + "E-Mail-Adresse= " + this.mailAddress;
  }
}
