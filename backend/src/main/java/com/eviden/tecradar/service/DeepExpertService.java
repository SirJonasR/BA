package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.DeepExpertListEntry;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.repository.DeepExpertListRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class DeepExpertService {
  @Inject DeepExpertListRepository deepExpertListRepository;
  @Inject TechnologyService technologyService;

  @Transactional
  public void updateDeepExpertList(List<DeepExpertListEntry> newEntries) {
    deepExpertListRepository.deleteAll();
    if (newEntries != null && !newEntries.isEmpty()) {
      for (DeepExpertListEntry entry : newEntries) {
        deepExpertListRepository.persist(entry);
      }
      deepExpertListRepository.flush();
    }
  }

  public List<DeepExpertListEntry> getDeepExpertForTechnology(Long technologyId) {
    Technology t = technologyService.get(technologyId);
    String targetTechnologyName = t.getName().toLowerCase();
    List<DeepExpertListEntry> allEntries = deepExpertListRepository.listAll();
    return allEntries.stream()
        .filter(
            entry -> {
              String entryTechnologyName = entry.getTechnologyName().toLowerCase();
              return entryTechnologyName.contains(targetTechnologyName)
                  || targetTechnologyName.contains(entryTechnologyName);
            })
        .collect(Collectors.toList());
  }

  public List<DeepExpertListEntry> getDeepExpertList() {
    return deepExpertListRepository.listAll();
  }
}
