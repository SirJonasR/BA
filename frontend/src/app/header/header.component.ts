import { Component } from '@angular/core';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
/**
 * The header component
 */
export class HeaderComponent {
  constructor(
    private userHandlingService: UserHandlingService,
    private router: Router,
  ) {}

  getIsAdmin(): boolean {
    return this.userHandlingService.hasRole(UserRole.ADMIN);
  }

  logout(): void {
    this.userHandlingService.logout();
  }

  navigateToSubscriptions(): void {
    this.router.navigate([`/subscription/overview`]);
  }

  get userName(): string {
    return this.userHandlingService.user.userName;
  }

  onSelect = async (id: number): Promise<void> => {
    await this.router.navigate([`/detail/${id}`]);
  };

  get isProd(): boolean {
    return window.location.href.includes('tecradar.ips.my-it-infra.net');
  }
}
