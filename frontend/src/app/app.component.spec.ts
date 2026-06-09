import { AppComponent } from './app.component';
import { TechnologyService } from 'src/app/services/technology.service';
import { KeycloakService } from 'keycloak-angular';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { FeatureFlagService } from 'src/app/services/feature-flag.service';
import { ThemeService } from './theming';

describe('AppComponent', () => {
  let component: AppComponent;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockKeycloakService: jasmine.SpyObj<KeycloakService>;
  let mockUserHandlingService: jasmine.SpyObj<UserHandlingService>;
  let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;

  beforeEach(() => {
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'initialize',
    ]);
    mockKeycloakService = jasmine.createSpyObj('KeycloakService', [
      'isLoggedIn',
    ]);
    mockUserHandlingService = jasmine.createSpyObj('UserHandlingService', [
      'init',
    ]);
    mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', [
      'init',
      'isEnabled',
    ]);
    mockThemeService = jasmine.createSpyObj('ThemeService', [
      'initThemeFromBackend',
      'forceLightTheme',
    ]);

    component = new AppComponent(
      mockTechnologyService,
      mockKeycloakService,
      mockFeatureFlagService,
      mockUserHandlingService,
      mockThemeService,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize services if user is logged in', async () => {
    mockKeycloakService.isLoggedIn.and.returnValue(Promise.resolve(true));
    mockTechnologyService.initialize.and.returnValue(Promise.resolve());
    mockUserHandlingService.init.and.returnValue(Promise.resolve());
    mockFeatureFlagService.isEnabled.and.returnValue(true);
    mockThemeService.initThemeFromBackend.and.returnValue(Promise.resolve());

    await component.ngOnInit();

    expect(mockTechnologyService.initialize).toHaveBeenCalled();
    expect(mockUserHandlingService.init).toHaveBeenCalled();
    expect(mockFeatureFlagService.init).toHaveBeenCalled();
    expect(mockThemeService.initThemeFromBackend).toHaveBeenCalled();
    expect(component.isInitialized).toBeTrue();
  });

  it('should not initialize services if user is not logged in', async () => {
    mockKeycloakService.isLoggedIn.and.returnValue(Promise.resolve(false));

    await component.ngOnInit();

    expect(mockTechnologyService.initialize).not.toHaveBeenCalled();
    expect(mockUserHandlingService.init).not.toHaveBeenCalled();
    expect(mockFeatureFlagService.init).not.toHaveBeenCalled();
    expect(component.isInitialized).toBeFalse();
  });
});
