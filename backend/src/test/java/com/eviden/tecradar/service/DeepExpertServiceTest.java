package com.eviden.tecradar.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

import com.eviden.tecradar.entity.DeepExpertListEntry;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.repository.DeepExpertListRepository;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class DeepExpertServiceTest {

  @Inject DeepExpertService deepExpertService;

  @InjectMock DeepExpertListRepository deepExpertListRepository;

  @InjectMock TechnologyService technologyService;

  private Technology javaTechnology;
  private DeepExpertListEntry javaExpert;
  private DeepExpertListEntry pythonExpert;

  @BeforeEach
  void setUp() {
    javaTechnology = new Technology();
    javaTechnology.setId(1L);
    javaTechnology.setName("Java");

    javaExpert = new DeepExpertListEntry();
    javaExpert.setTechnologyName("Java");
    javaExpert.setExpertInformation("Expert One");

    pythonExpert = new DeepExpertListEntry();
    pythonExpert.setTechnologyName("Python");
    pythonExpert.setExpertInformation("Expert Two");
  }

  @Test
  void testUpdateDeepExpertListWithNewEntries() {
    List<DeepExpertListEntry> newEntries = Arrays.asList(javaExpert, pythonExpert);

    deepExpertService.updateDeepExpertList(newEntries);

    verify(deepExpertListRepository, times(1)).deleteAll();
    verify(deepExpertListRepository, times(1)).persist(javaExpert);
    verify(deepExpertListRepository, times(1)).persist(pythonExpert);
    verify(deepExpertListRepository, times(1)).flush();
  }

  @Test
  void testUpdateDeepExpertListWithEmptyList() {
    List<DeepExpertListEntry> emptyList = new ArrayList<>();

    deepExpertService.updateDeepExpertList(emptyList);

    verify(deepExpertListRepository, times(1)).deleteAll();
    verify(deepExpertListRepository, never()).persist(any(DeepExpertListEntry.class));
    verify(deepExpertListRepository, never()).flush();
  }

  @Test
  void testUpdateDeepExpertListWithNull() {
    deepExpertService.updateDeepExpertList(null);

    verify(deepExpertListRepository, times(1)).deleteAll();
    verify(deepExpertListRepository, never()).persist(any(DeepExpertListEntry.class));
    verify(deepExpertListRepository, never()).flush();
  }

  @Test
  void testGetDeepExpertForTechnologyExactMatch() {
    when(technologyService.get(1L)).thenReturn(javaTechnology);
    when(deepExpertListRepository.listAll()).thenReturn(Arrays.asList(javaExpert, pythonExpert));

    List<DeepExpertListEntry> result = deepExpertService.getDeepExpertForTechnology(1L);

    assertEquals(1, result.size());
    assertEquals("Java", result.get(0).getTechnologyName());
  }

  @Test
  void testGetDeepExpertForTechnologyCaseInsensitiveMatch() {
    javaTechnology.setName("java");
    when(technologyService.get(1L)).thenReturn(javaTechnology);
    when(deepExpertListRepository.listAll()).thenReturn(Collections.singletonList(javaExpert));

    List<DeepExpertListEntry> result = deepExpertService.getDeepExpertForTechnology(1L);

    assertEquals(1, result.size());
    assertEquals("Java", result.get(0).getTechnologyName());
  }

  @Test
  void testGetDeepExpertForTechnologySubstringMatch() {
    Technology springBootTechnology = new Technology();
    springBootTechnology.setId(2L);
    springBootTechnology.setName("Spring Boot");

    DeepExpertListEntry springExpert = new DeepExpertListEntry();
    springExpert.setTechnologyName("Spring");

    when(technologyService.get(2L)).thenReturn(springBootTechnology);
    when(deepExpertListRepository.listAll()).thenReturn(Collections.singletonList(springExpert));

    List<DeepExpertListEntry> result = deepExpertService.getDeepExpertForTechnology(2L);

    assertEquals(1, result.size());
    assertEquals("Spring", result.get(0).getTechnologyName());
  }

  @Test
  void testGetDeepExpertForTechnologyNoMatch() {
    when(technologyService.get(1L)).thenReturn(javaTechnology);
    when(deepExpertListRepository.listAll()).thenReturn(Collections.singletonList(pythonExpert));

    List<DeepExpertListEntry> result = deepExpertService.getDeepExpertForTechnology(1L);

    assertTrue(result.isEmpty());
  }

  @Test
  void testGetDeepExpertForTechnologyWithEmptyRepository() {
    when(technologyService.get(1L)).thenReturn(javaTechnology);
    when(deepExpertListRepository.listAll()).thenReturn(Collections.emptyList());

    List<DeepExpertListEntry> result = deepExpertService.getDeepExpertForTechnology(1L);

    assertTrue(result.isEmpty());
  }

  @Test
  void testGetDeepExpertList() {
    List<DeepExpertListEntry> experts = Arrays.asList(javaExpert, pythonExpert);
    when(deepExpertListRepository.listAll()).thenReturn(experts);

    List<DeepExpertListEntry> result = deepExpertService.getDeepExpertList();

    assertEquals(2, result.size());
    assertEquals(javaExpert.getTechnologyName(), result.get(0).getTechnologyName());
    assertEquals(javaExpert.getExpertInformation(), result.get(0).getExpertInformation());
    assertEquals(pythonExpert.getTechnologyName(), result.get(1).getTechnologyName());
    assertEquals(pythonExpert.getExpertInformation(), result.get(1).getExpertInformation());
  }
}
