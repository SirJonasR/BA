import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService,
    protected readonly userHandlingService: UserHandlingService,
  ) {
    super(router, keycloak);
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
  ): Promise<boolean> {
    const roles = route.data['roles'] as string[];
    // Force the user to log in if currently unauthenticated.
    if (!this.authenticated) {
      await this.keycloak.login({});
    }
    // Clear Keycloak '#iss' Params in URL
    const currentUrl = window.location.href;
    if (currentUrl.includes('iss=')) {
      const cleanUrl = currentUrl.split('#')[0];
      window.history.replaceState(null, '', cleanUrl);
      this.router.navigate([window.location.pathname], { replaceUrl: true });
    }

    if (roles) {
      this.userHandlingService.getUser().subscribe((user) => {
        if (roles.some((role) => user.roles.includes(<UserRole>role))) {
          return true;
        }
        this.router.navigate(['']);
        return false;
      });
    }

    return true;
  }
}
