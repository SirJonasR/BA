import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadarLegendComponent } from './radar-legend.component';
import { TechnologyService } from 'src/app/services/technology.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('RadarLegendComponent', () => {
  let component: RadarLegendComponent;
  let fixture: ComponentFixture<RadarLegendComponent>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;

  beforeEach(() => {
    // Create mock TechnologyService
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'getLifecycles',
    ]);
    mockTechnologyService.getLifecycles.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [RadarLegendComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: TechnologyService, useValue: mockTechnologyService },
      ],
    });
    fixture = TestBed.createComponent(RadarLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
