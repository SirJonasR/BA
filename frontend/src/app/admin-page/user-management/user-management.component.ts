import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  User,
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  dataSource: MatTableDataSource<User> = new MatTableDataSource();
  displayedColumns: string[] = ['userName', 'roles', 'confirm'];
  possibleRoles: UserRole[] = [UserRole.USER, UserRole.ADMIN, UserRole.TECSWAP];
  users: User[] = [];
  changeMap = new Map<string, { rolesChange: boolean }>();
  selectedUserRoles: UserRole[] = [];
  expandedCards: { roles: boolean } = { roles: false };
  isSearchVisible = false;
  searchText = '';
  constructor(
    private userHandlingService: UserHandlingService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.userHandlingService.getAllUser().subscribe((users) => {
      this.users = users;
      this.dataSource.data = this.mapValues(users);
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.paginator._intl.itemsPerPageLabel = 'User pro Seite';
    this.paginator._intl.nextPageLabel = 'Nächste Seite';
    this.paginator._intl.lastPageLabel = 'Letzte Seite';
    this.paginator._intl.firstPageLabel = 'Erste Seite';
    this.paginator._intl.previousPageLabel = 'Vorherige Seite';
  }

  ngOnChanges(): void {
    this.dataSource.data = this.mapValues(this.users);
  }

  mapValues(users: User[]): {
    userName: string;
    roles: UserRole[];
    showIcons: boolean;
    showIconsInColor: boolean;
  }[] {
    return users.map((user) => ({
      ...user,
      userName: user.userName,
      roles: user.roles,
      showIcons: user.showIcons,
      showIconsInColor: user.showIconsInColor,
    }));
  }

  onRolesChange(user: User): void {
    const current = this.changeMap.get(user.userName) || { rolesChange: false };
    this.changeMap.set(user.userName, { ...current, rolesChange: true });
  }

  updateUser(user: User): void {
    this.userHandlingService.updateUser(user).subscribe((user) => {
      this.snackBar.open('Der User ' + user.userName + ' wurde aktualisiert');
    });
  }

  confirmChanges(user: User): void {
    const current = this.changeMap.get(user.userName);
    if (current) {
      this.changeMap.set(user.userName, {
        ...current,
        rolesChange: false,
      });
      this.updateUser(user);
    }
  }

  shouldConfirmRolesChanges(user: User): boolean {
    const entry = this.changeMap.get(user.userName);
    if (entry) {
      return entry.rolesChange;
    }
    return false;
  }

  shouldConfirmButton(user: User): boolean {
    return this.shouldConfirmRolesChanges(user);
  }

  get isFilterOn(): boolean {
    return this.selectedUserRoles.length > 0;
  }

  removeChip(chip: UserRole): void {
    this.selectedUserRoles = this.selectedUserRoles.filter(
      (role) => role !== chip,
    );
    this.startFilter();
  }

  get allRolesSelected(): boolean {
    return (
      this.possibleRoles.length > 0 &&
      this.selectedUserRoles.length === this.possibleRoles.length
    );
  }

  toggleAllRoles(checked: boolean): void {
    this.selectedUserRoles = checked ? [...this.possibleRoles] : [];
    this.startFilter();
  }

  toggleRole(role: UserRole, checked: boolean): void {
    if (checked) {
      if (!this.selectedUserRoles.includes(role)) {
        this.selectedUserRoles = [...this.selectedUserRoles, role];
      }
    } else {
      this.selectedUserRoles = this.selectedUserRoles.filter((r) => r !== role);
    }
    this.startFilter();
  }

  toggleCardExpanded(card: 'roles'): void {
    this.expandedCards[card] = !this.expandedCards[card];
  }

  isCardExpanded(card: 'roles'): boolean {
    return this.expandedCards[card];
  }

  resetFilter(): void {
    this.selectedUserRoles = [];
    this.startFilter();
  }

  startFilter(): void {
    if (this.isFilterOn || this.searchText.trim().length > 0) {
      let filteredUsers: User[] = this.users;
      if (this.searchText.trim().length > 0) {
        const filterValue = this.searchText.toLowerCase();
        filteredUsers = filteredUsers.filter((user) =>
          user.userName.toLowerCase().includes(filterValue),
        );
      }
      if (this.selectedUserRoles.length > 0) {
        filteredUsers = filteredUsers.filter((user) =>
          user.roles.some((role) => this.selectedUserRoles.includes(role)),
        );
      }
      this.dataSource.data = this.mapValues(filteredUsers);
    } else {
      this.dataSource.data = this.mapValues(this.users);
    }
  }

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
    if (this.isSearchVisible) {
      setTimeout(() => this.searchInput?.nativeElement.focus());
    }
  }
}
