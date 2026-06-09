package com.eviden.tecradar.service;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.entity.Category;
import com.eviden.tecradar.entity.Lifecycle;
import com.eviden.tecradar.entity.TecSwapElement;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.model.TecSwapDto;
import com.eviden.tecradar.repository.TecSwapRepository;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class TecSwapServiceTest {
  @Inject TecSwapService tecSwapService;
  @InjectMock private TecSwapRepository tecSwapRepository;

  private static Technology getTechnology(Long id, String name) {
    Category category = new Category();
    category.setId(1L);
    category.setName("category");
    category.setDescription("");
    Lifecycle lifecycle = new Lifecycle();
    lifecycle.setId(1L);
    lifecycle.setName("lifecycle");
    lifecycle.setDescription("");
    lifecycle.setSort(1);

    Technology technology1 = new Technology();
    technology1.setId(id);
    technology1.setName(name);
    technology1.setPriority(false);
    technology1.setCategory(category);
    technology1.setLifecycle(lifecycle);
    return technology1;
  }

  @Test
  void testGetAll() {
    Technology technology1 = getTechnology(1L, "tec1");
    Technology technology2 = getTechnology(2L, "tec2");

    TecSwapElement tecSwapElement1 = new TecSwapElement();
    tecSwapElement1.setId(1L);
    tecSwapElement1.setTechnology(technology1);
    tecSwapElement1.setTecSwap("TecSwap1");
    tecSwapElement1.setEditDate(null);
    tecSwapElement1.setIsCompleted(false);

    TecSwapElement tecSwapElement2 = new TecSwapElement();
    tecSwapElement2.setId(2L);
    tecSwapElement2.setTechnology(technology2);
    tecSwapElement2.setTecSwap("TecSwap2");
    tecSwapElement2.setEditDate(null);
    tecSwapElement2.setIsCompleted(false);

    List<TecSwapElement> tecSwapElements = new ArrayList<>();
    tecSwapElements.add(tecSwapElement1);
    tecSwapElements.add(tecSwapElement2);

    when(tecSwapRepository.listAll()).thenReturn(tecSwapElements);

    List<TecSwapElement> result = tecSwapService.getAll();

    Assertions.assertEquals(2, result.size());
    Assertions.assertEquals("TecSwap1", result.get(0).getTecSwap());
    Assertions.assertEquals("TecSwap2", result.get(1).getTecSwap());
  }

  @Test
  void testGetByTechnology() {
    Technology technology1 = getTechnology(1L, "tec1");

    TecSwapElement tecSwapElement1 = new TecSwapElement();
    tecSwapElement1.setId(1L);
    tecSwapElement1.setTechnology(technology1);
    tecSwapElement1.setTecSwap("TecSwap1");
    tecSwapElement1.setEditDate(null);
    tecSwapElement1.setIsCompleted(false);

    when(tecSwapRepository.findByTechnology(technology1)).thenReturn(tecSwapElement1);

    TecSwapElement result = tecSwapService.getByTechnology(technology1);
    Assertions.assertEquals("TecSwap1", result.getTecSwap());
  }

  @Test
  void testCreate() {
    Technology technology1 = getTechnology(1L, "tec1");

    TecSwapElement tecSwapElement = tecSwapService.create(technology1);
    verify(tecSwapRepository).persistAndFlush(tecSwapElement);
    Assertions.assertEquals("Noch nicht zugeordnet", tecSwapElement.getTecSwap());
    Assertions.assertEquals(1, tecSwapElement.getTechnologyCategoryId());
    Assertions.assertEquals("tec1", tecSwapElement.getTechnologyName());
    Assertions.assertNull(tecSwapElement.getEditDate());
  }

  @Test
  void testUpdate() {
    Technology technology1 = getTechnology(1L, "tec1");
    TecSwapElement tecSwapElement1 = new TecSwapElement();
    tecSwapElement1.setId(1L);
    tecSwapElement1.setTechnology(technology1);
    tecSwapElement1.setTecSwap("TecSwap1");
    tecSwapElement1.setEditDate(null);
    tecSwapElement1.setIsCompleted(false);
    when(tecSwapRepository.findById(1L)).thenReturn(tecSwapElement1);
    TecSwapDto tecSwapDto = new TecSwapDto();
    tecSwapDto.isCompleted = true;
    tecSwapDto.tecSwap = "NewTecSwap";
    tecSwapDto.technologyId = 1L;
    tecSwapDto.editDate = "";
    TecSwapElement updatedTecSwapElement = tecSwapService.update(1L, tecSwapDto);
    verify(tecSwapRepository).persistAndFlush(updatedTecSwapElement);
    Assertions.assertEquals("NewTecSwap", updatedTecSwapElement.getTecSwap());
    Assertions.assertNull(updatedTecSwapElement.getEditDate());
    Assertions.assertTrue(updatedTecSwapElement.isIsCompleted());
    tecSwapDto.editDate = null;
    updatedTecSwapElement = tecSwapService.update(1L, tecSwapDto);
    Assertions.assertNull(updatedTecSwapElement.getEditDate());
    tecSwapDto.editDate = "2025-01-01";
    updatedTecSwapElement = tecSwapService.update(1L, tecSwapDto);
    Assertions.assertEquals(LocalDate.of(2025, 1, 1), updatedTecSwapElement.getEditDate());
  }

  @Test
  void testDeleteByTechnology() {
    Technology technology = getTechnology(1L, "tec1");
    tecSwapService.deleteByTechnology(technology);
    verify(tecSwapRepository).deleteByTechnology(technology);
  }
}
