import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndustrySearchfieldComponent } from './industry-searchfield.component';
import { ProjectService } from 'src/app/services/project.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

describe('IndustrySearchfieldComponent', () => {
  let component: IndustrySearchfieldComponent;
  let fixture: ComponentFixture<IndustrySearchfieldComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;

  beforeEach(() => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getIndustries',
    ]);
    TestBed.configureTestingModule({
      declarations: [IndustrySearchfieldComponent],
      imports: [HttpClientTestingModule, MatAutocompleteModule],
      providers: [{ provide: ProjectService, useValue: mockProjectService }],
    });
    fixture = TestBed.createComponent(IndustrySearchfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
