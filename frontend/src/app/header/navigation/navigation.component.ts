import { Component, OnInit, ViewChild } from '@angular/core';
import { Category, Lifecycle } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { PopupInfoComponent } from 'src/app/utils/popup-info/popup-info.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
/**
 * Navigation component
 *
 * Component that displays navigation menu
 */
export class NavigationComponent implements OnInit {
  getCategories: Category[] | undefined;
  getLifecycles: Lifecycle[] | undefined;
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;

  constructor(
    private technologyService: TechnologyService,
    private userHandlingService: UserHandlingService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.getCategories = this.technologyService.categories;
    this.getLifecycles = this.technologyService.lifecycles;
  }

  openInfoWindow(): void {
    this.dialog.open(PopupInfoComponent);
  }

  isTecSwap(): boolean {
    return this.userHandlingService.hasRole(UserRole.TECSWAP);
  }

  isAdmin(): boolean {
    return this.userHandlingService.hasRole(UserRole.ADMIN);
  }
}
