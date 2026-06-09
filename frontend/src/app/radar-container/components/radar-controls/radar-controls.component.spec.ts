import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadarControlsComponent } from './radar-controls.component';
import SpyObj = jasmine.SpyObj;
import { FeatureFlagService } from 'src/app/services/feature-flag.service';

describe('RadarControlsComponent', () => {
  let component: RadarControlsComponent;
  let fixture: ComponentFixture<RadarControlsComponent>;
  let mockFeatureFlagService: SpyObj<FeatureFlagService>;

  beforeEach(() => {
    mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', [
      'isEnabled',
    ]);
    TestBed.configureTestingModule({
      declarations: [RadarControlsComponent],
      providers: [
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
      ],
    });

    mockFeatureFlagService.isEnabled.and.returnValue(true);
    fixture = TestBed.createComponent(RadarControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
