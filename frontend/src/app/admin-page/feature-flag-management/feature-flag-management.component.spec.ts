import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FeatureFlagManagementComponent } from './feature-flag-management.component';
import { FeatureFlagService } from 'src/app/services/feature-flag.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeatureFlag } from 'src/app/models/feature-flag';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

describe('FeatureFlagManagementComponent', () => {
  let component: FeatureFlagManagementComponent;
  let fixture: ComponentFixture<FeatureFlagManagementComponent>;
  let featureFlagServiceMock: jasmine.SpyObj<FeatureFlagService>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;

  const mockFeatureFlags: FeatureFlag[] = [
    { name: 'featureA', enabled: true },
    { name: 'featureB', enabled: false },
  ];

  beforeEach(async () => {
    featureFlagServiceMock = jasmine.createSpyObj('FeatureFlagService', [
      'getFeatureFlags',
      'updateFeatureFlag',
    ]);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [FeatureFlagManagementComponent],
      imports: [
        NoopAnimationsModule,
        MatTableModule,
        MatSlideToggleModule,
        FormsModule,
      ],
      providers: [
        { provide: FeatureFlagService, useValue: featureFlagServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureFlagManagementComponent);
    component = fixture.componentInstance;
    featureFlagServiceMock.getFeatureFlags.and.returnValue(
      of(mockFeatureFlags),
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load feature flags on init', () => {
    expect(featureFlagServiceMock.getFeatureFlags).toHaveBeenCalled();
    expect(component.featureFlags.length).toBe(2);
    expect(component.featureFlags).toEqual(mockFeatureFlags);
  });

  it('should call updateFeatureFlag and show snackbar on toggle change', () => {
    const flagToUpdate: FeatureFlag = { name: 'featureA', enabled: false };
    featureFlagServiceMock.updateFeatureFlag.and.returnValue(of(flagToUpdate));

    component.onToggleChange(flagToUpdate);

    expect(featureFlagServiceMock.updateFeatureFlag).toHaveBeenCalledWith(
      flagToUpdate.name,
      flagToUpdate.enabled,
    );
    expect(snackBarMock.open).toHaveBeenCalledWith(
      `Feature flag '${flagToUpdate.name}' was updated.`,
      'Close',
      { duration: 3000 },
    );
  });
});
