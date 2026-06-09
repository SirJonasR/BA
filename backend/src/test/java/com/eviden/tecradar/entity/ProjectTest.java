package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.Test;
import org.junit.jupiter.api.Assertions;

@QuarkusTest
public class ProjectTest {

  @Test
  public void testAllSettersAndGetters() {
    Project project = new Project();
    project.setId(1L);
    project.setName("Test Project");
    project.setDescription("desc");
    Contact contact = new Contact();
    contact.setEmail("testcontact@example.com");
    contact.setRole("owner");
    contact.setProject(project);
    List<Contact> contacts = new ArrayList<>();
    contacts.add(contact);
    project.setContact(contacts);
    project.setSalesServiceLink("testlink");
    project.setInfo("testinfo");
    project.setIndustrySpecificInformation("testindustryinfo");
    project.setStartDate(LocalDate.of(2025, 1, 1));
    project.setEndDate(LocalDate.of(2025, 12, 31));
    Industry industry = new Industry();
    industry.setId(23L);
    industry.setName("Test Industry");
    project.setIndustry(industry);

    Assertions.assertEquals(Long.valueOf(1), project.getId());
    Assertions.assertEquals("Test Project", project.getName());
    Assertions.assertEquals("desc", project.getDescription());
    Assertions.assertEquals(1, project.getContact().size());
    Assertions.assertEquals("testcontact@example.com", project.getContact().get(0).getEmail());
    Assertions.assertEquals("owner", project.getContact().get(0).getRole());
    Assertions.assertEquals("testlink", project.getSalesServiceLink());
    Assertions.assertEquals("testinfo", project.getInfo());
    Assertions.assertEquals("testindustryinfo", project.getIndustrySpecificInformation());
    Assertions.assertEquals(LocalDate.of(2025, 1, 1), project.getStartDate());
    Assertions.assertEquals(LocalDate.of(2025, 12, 31), project.getEndDate());
    Assertions.assertEquals(industry, project.getIndustry());
    Assertions.assertEquals(project.getIndustryName(), project.getIndustry().getName());
  }
}
