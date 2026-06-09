package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.TecSwapElement;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.model.TecSwapDto;
import com.eviden.tecradar.repository.TecSwapRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/** Service for TecSwap related tasks. */
@ApplicationScoped
public class TecSwapService {

  @Inject TecSwapRepository tecSwapRepository;

  /**
   * Retrieves a TecSwapElement by its ID.
   *
   * @param id the ID of the TecSwapElement to retrieve
   * @return the TecSwapElement with the specified ID
   * @throws NotFoundException if no TecSwapElement is found with the given ID
   */
  public TecSwapElement get(Long id) {
    TecSwapElement tecSwapElement = tecSwapRepository.findById(id);
    if (tecSwapElement == null) {
      throw new NotFoundException("Kein TecSwapElement gefunden mit der id " + id);
    }
    return tecSwapElement;
  }

  /**
   * Fetches all tec_swap_elements from the database.
   *
   * @return a list of all tec_swap_elements alphabetically sorted.
   */
  public List<TecSwapElement> getAll() {
    return tecSwapRepository.listAll().stream()
        .sorted(
            Comparator.comparing(
                tecSwapElement -> tecSwapElement.getTechnologyName().toLowerCase()))
        .collect(Collectors.toList());
  }

  public TecSwapElement getByTechnology(Technology technology) {
    return tecSwapRepository.findByTechnology(technology);
  }

  /**
   * Creates a new tec_swap_element.
   *
   * @param technology containing the values.
   * @return The created tec_swap_element.
   */
  @Transactional
  public TecSwapElement create(Technology technology) {
    TecSwapElement tecSwapElement = new TecSwapElement();
    tecSwapElement.setIsCompleted(false);
    tecSwapElement.setEditDate(null);
    tecSwapElement.setTecSwap("Noch nicht zugeordnet");
    tecSwapElement.setTechnology(technology);
    tecSwapRepository.persistAndFlush(tecSwapElement);
    return tecSwapElement;
  }

  /**
   * Updates a tec_swap_element.
   *
   * @param id the id of the tec_swap_element to update
   * @param tecSwapDto the model containing the new values.
   * @return The updated tec_swap_element
   */
  @Transactional
  public TecSwapElement update(Long id, TecSwapDto tecSwapDto) {
    TecSwapElement tecSwapElement = get(id);
    tecSwapElement.setTecSwap(tecSwapDto.tecSwap);
    tecSwapElement.setIsCompleted(tecSwapDto.isCompleted);
    if (!(tecSwapDto.editDate == null
        || tecSwapDto.editDate.isEmpty()
        || tecSwapDto.editDate.isBlank())) {
      tecSwapElement.setEditDate(LocalDate.parse(tecSwapDto.editDate));
    } else {
      tecSwapElement.setEditDate(null);
    }
    tecSwapElement.setTechnology(tecSwapElement.getTechnology());
    tecSwapRepository.persistAndFlush(tecSwapElement);
    return tecSwapElement;
  }

  @Transactional
  public void deleteByTechnology(Technology technology) {
    tecSwapRepository.deleteByTechnology(technology);
  }
}
