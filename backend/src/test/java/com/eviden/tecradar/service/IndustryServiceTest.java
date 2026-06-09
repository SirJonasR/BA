package com.eviden.tecradar.service;

import static org.mockito.Mockito.when;

import com.eviden.tecradar.entity.Industry;
import com.eviden.tecradar.repository.IndustryRepository;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** test for industry service */
@QuarkusTest
public class IndustryServiceTest {

  @InjectMock IndustryRepository industryRepository;

  @Inject IndustryService industryService;

  @Test
  void testGetAll() {
    Industry industry = new Industry();
    industry.setId(1L);
    industry.setName("Technology");
    Industry industry2 = new Industry();
    industry2.setId(2L);
    industry2.setName("Healthcare");

    List<Industry> mockIndustries = Arrays.asList(industry, industry2);

    // Mock the repository behavior
    when(industryRepository.listAll()).thenReturn(mockIndustries);

    // Call the service
    List<Industry> result = industryService.getAll();

    Assertions.assertEquals(mockIndustries.size(), result.size());
    Assertions.assertEquals("Healthcare", result.get(0).getName());
    Assertions.assertEquals("Technology", result.get(1).getName());
  }
}
