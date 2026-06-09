import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadarSettingsComponent } from './radar-settings.component';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { ThemeService } from 'src/app/theming/services/theme.service';
import { ThemeId } from 'src/app/theming/models/theme-config.model';
import { of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

describe('RadarSettingsComponent', () => {
  let component: RadarSettingsComponent;
  let fixture: ComponentFixture<RadarSettingsComponent>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;

  const mockUserHandlingService = jasmine.createSpyObj('UserHandlingService', [
    'updateUserDisplay',
  ]);

  beforeEach(async () => {
    themeServiceSpy = jasmine.createSpyObj(
      'ThemeService',
      ['getAvailableThemes', 'getCurrentTheme', 'setTheme'],
      {
        theme$: of(ThemeId.Light),
      },
    );

    themeServiceSpy.getAvailableThemes.and.returnValue([]);
    themeServiceSpy.getCurrentTheme.and.returnValue(ThemeId.Light);

    mockUserHandlingService.user = {
      showIcons: false,
      showIconsInColor: false,
    };

    await TestBed.configureTestingModule({
      declarations: [RadarSettingsComponent],
      imports: [
        MatIconModule,
        MatSlideToggleModule,
        MatRadioModule,
        FormsModule,
      ],
      providers: [
        { provide: UserHandlingService, useValue: mockUserHandlingService },
        { provide: ThemeService, useValue: themeServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RadarSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle isThemeExpanded when toggleThemeExpanded is called', () => {
    expect(component.isThemeExpanded).toBeFalse();
    component.toggleThemeExpanded();
    expect(component.isThemeExpanded).toBeTrue();
    component.toggleThemeExpanded();
    expect(component.isThemeExpanded).toBeFalse();
  });

  it('should call themeService.setTheme when onThemeChange is called', () => {
    component.availableThemes = [
      {},
      {},
    ] as unknown as typeof component.availableThemes;
    const newTheme = ThemeId.Dark;
    component.onThemeChange(newTheme);

    expect(themeServiceSpy.setTheme).toHaveBeenCalledWith(newTheme);
  });

  it('should initialize with current theme from service', () => {
    expect(component.currentThemeId).toBe(ThemeId.Light);
    expect(themeServiceSpy.getCurrentTheme).toHaveBeenCalled();
  });
});
