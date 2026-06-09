package com.eviden.tecradar.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.entity.FeatureFlag;
import com.eviden.tecradar.repository.FeatureFlagRepository;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class FeatureFlagServiceTest {

  @Inject FeatureFlagService featureFlagService;

  @InjectMock FeatureFlagRepository featureFlagRepository;

  private FeatureFlag testFlag;

  @BeforeEach
  void setUp() {
    testFlag = new FeatureFlag();
    testFlag.setName("test-flag");
    testFlag.setEnabled(true);
  }

  @Test
  void testGetAllFeatureFlags() {
    List<FeatureFlag> flags = Collections.singletonList(testFlag);
    when(featureFlagRepository.listAll()).thenReturn(flags);

    List<FeatureFlag> result = featureFlagService.getAllFeatureFlags();

    assertEquals(1, result.size());
    assertEquals("test-flag", result.get(0).getName());
    verify(featureFlagRepository, times(1)).listAll();
  }

  @Test
  void testGetFeatureFlag_whenFlagExists() {
    when(featureFlagRepository.findByName("test-flag")).thenReturn(Optional.of(testFlag));

    Optional<FeatureFlag> result = featureFlagService.getFeatureFlag("test-flag");

    assertTrue(result.isPresent());
    assertEquals("test-flag", result.get().getName());
    verify(featureFlagRepository, times(1)).findByName("test-flag");
  }

  @Test
  void testGetFeatureFlag_whenFlagDoesNotExist() {
    when(featureFlagRepository.findByName("non-existing-flag")).thenReturn(Optional.empty());

    Optional<FeatureFlag> result = featureFlagService.getFeatureFlag("non-existing-flag");

    assertFalse(result.isPresent());
    verify(featureFlagRepository, times(1)).findByName("non-existing-flag");
  }

  @Test
  void testIsFeatureEnabled_whenFlagExistsAndIsEnabled() {
    when(featureFlagRepository.findByName("test-flag")).thenReturn(Optional.of(testFlag));

    boolean result = featureFlagService.isFeatureEnabled("test-flag");

    assertTrue(result);
  }

  @Test
  void testIsFeatureEnabled_whenFlagExistsAndIsDisabled() {
    testFlag.setEnabled(false);
    when(featureFlagRepository.findByName("test-flag")).thenReturn(Optional.of(testFlag));

    boolean result = featureFlagService.isFeatureEnabled("test-flag");

    assertFalse(result);
  }

  @Test
  void testIsFeatureEnabled_whenFlagDoesNotExist() {
    when(featureFlagRepository.findByName("non-existing-flag")).thenReturn(Optional.empty());

    boolean result = featureFlagService.isFeatureEnabled("non-existing-flag");

    assertFalse(result);
  }

  @Test
  void testUpdateFeatureFlag_whenFlagExists() {
    when(featureFlagRepository.findByName("test-flag")).thenReturn(Optional.of(testFlag));

    FeatureFlag result = featureFlagService.updateFeatureFlag("test-flag", false);

    assertFalse(result.isEnabled());
    verify(featureFlagRepository, times(1)).persist(testFlag);
  }

  @Test
  void testUpdateFeatureFlag_whenFlagDoesNotExist() {
    when(featureFlagRepository.findByName("non-existing-flag")).thenReturn(Optional.empty());

    assertThrows(
        NotFoundException.class,
        () -> {
          featureFlagService.updateFeatureFlag("non-existing-flag", true);
        });

    verify(featureFlagRepository, never()).persist(any(FeatureFlag.class));
  }
}
