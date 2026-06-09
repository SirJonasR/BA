import { Component, OnInit } from '@angular/core';
import { TechnologyService } from 'src/app/services/technology.service';
import { KeycloakService } from 'keycloak-angular';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { FeatureFlagService } from 'src/app/services/feature-flag.service';
import { ThemeService } from './theming';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isInitialized = false;

  constructor(
    private readonly technologyService: TechnologyService,
    private readonly keycloak: KeycloakService,
    private featureFlagService: FeatureFlagService,
    private userHandling: UserHandlingService,
    private themeService: ThemeService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!(await this.keycloak.isLoggedIn())) {
      return;
    }
    try {
      await Promise.all([
        await this.technologyService.initialize(),
        await this.userHandling.init(),
        await this.featureFlagService.init(),
      ]);

      // Handle theme initialization based on feature flag
      if (this.featureFlagService.isEnabled('ENABLE_THEME_SWITCHING')) {
        // Theme switching enabled: Load user's persisted theme from backend
        await this.themeService.initThemeFromBackend();
      } else {
        // Theme switching disabled: Force light theme
        this.themeService.forceLightTheme();
      }
    } finally {
      this.isInitialized = true;
    }
    this.startTokenRefresh();
  }

  startTokenRefresh(): void {
    setInterval(() => {
      this.keycloak
        .updateToken(180)
        .then((refreshed) => {
          if (refreshed) {
            console.log('Token got refreshed ' + new Date());
          } else {
            console.log('Token didnt refresh, still valid ' + new Date());
          }
        })
        .catch(() => {
          console.error('Something went wrong ' + new Date());
        });
    }, 60000);
  }
}
