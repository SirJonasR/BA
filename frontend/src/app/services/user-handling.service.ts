import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { HttpClient, HttpParams } from '@angular/common/http';
import { KeycloakProfile } from 'keycloak-js';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  TECSWAP = 'TECSWAP',
}

export type User = {
  userName: string;
  roles: UserRole[];
  showIconsInColor: boolean;
  showIcons: boolean;
};

/**
 * @description
 * Injectable service for handling user-related functionalities such as authentication, role identification, and user information retrieval.
 * Utilizes Keycloak for authentication.
 */
@Injectable({
  providedIn: 'root',
})
export class UserHandlingService {
  userProfile: KeycloakProfile | null = null;
  user: User = {
    userName: '',
    roles: [],
    showIconsInColor: false,
    showIcons: true,
  };
  isInitialized = false;

  /**
   * @description
   * Constructor for the UserHandlingService class.
   *
   * @param keycloak KeycloakService for user authentication and role management.
   * @param http
   */
  constructor(
    protected readonly keycloak: KeycloakService,
    private http: HttpClient,
  ) {}

  /**
   * @description
   * Initialization method for the UserHandlingService class.
   * Determines if the user is an admin and retrieves the username.
   */
  async init(): Promise<void> {
    try {
      this.user = await firstValueFrom(this.getUser());
      this.isInitialized = true;
      this.userProfile = await this.keycloak.loadUserProfile();
      if (this.user.showIcons == null) this.user.showIcons = true;
      if (this.user.showIconsInColor == null)
        this.user.showIconsInColor = false;
    } catch (error) {
      console.error('User initialization failed', error);
    }
  }

  hasRole(role: UserRole): boolean {
    return this.user.roles.includes(role);
  }

  getUser(): Observable<User> {
    return this.http.get<User>(environment.apiUrl + '/user/me');
  }

  getUserName(): string {
    return this.keycloak.getUsername();
  }

  async updateUserDisplay(
    showIconsInColor: boolean,
    showIcons: boolean,
  ): Promise<void> {
    this.user.showIconsInColor = showIconsInColor;
    this.user.showIcons = showIcons;
    await this.pushSettingsToBackend(showIconsInColor, showIcons);
  }

  /**
   * Pushes display settings to the backend
   */
  private async pushSettingsToBackend(
    showIconsInColor: boolean,
    showIcons: boolean,
  ): Promise<void> {
    const settingsPayload = {
      showIconsInColor: showIconsInColor,
      showIcons: showIcons,
    };

    await firstValueFrom(
      this.http.put(environment.apiUrl + '/user/settings', settingsPayload),
    );
  }

  async getShowIconsInColor(): Promise<boolean> {
    while (!this.isInitialized) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return this.user.showIconsInColor;
  }

  async getShowIcons(): Promise<boolean> {
    while (!this.isInitialized) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return this.user.showIcons;
  }

  updateUser(updatedUser: User): Observable<User> {
    return this.http.put<User>(environment.apiUrl + '/user', updatedUser);
  }

  getUserEmail(): string {
    return this.userProfile?.email ?? '';
  }

  logout(): void {
    this.keycloak.logout();
  }

  revokeConsent(emailAddress: string): Observable<unknown> {
    const params = new HttpParams().set('email', emailAddress);
    return this.http.delete(environment.apiUrl + '/contact/revoke-consent', {
      params,
    });
  }

  doesAgreementExist(): Observable<boolean> {
    return this.http.get<boolean>(environment.apiUrl + '/contact/agreement');
  }

  getAllUser(): Observable<User[]> {
    return this.http.get<User[]>(environment.apiUrl + '/user');
  }
}
