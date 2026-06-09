import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { Technology } from 'src/app/models/technology';
import { ProjectService } from 'src/app/services/project.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RemoveDialogComponent } from 'src/app/utils/remove-dialog/remove-dialog.component';
import { Project } from 'src/app/models/project';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-project-detail-page',
  templateUrl: './project-detail-page.component.html',
  styleUrls: ['./project-detail-page.component.css'],
})
export class ProjectDetailPageComponent implements OnInit {
  project!: Project;
  id!: number;
  technologies: Technology[] = [];
  technologyNames: string[] = [];
  isLoaded = false;
  lastChangeDate: Date | null = null;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private userHandling: UserHandlingService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.initProject();

    this.projectService
      .getProjectHistories(this.id)
      .pipe(
        catchError((_error) => {
          this.snackBar.open('Historie konnte nicht geladen werden.');
          return of([]);
        }),
      )
      .subscribe({
        next: (histories) => {
          if (histories.length > 0) {
            const latestChangeDate = histories[histories.length - 1].changeDate;
            this.lastChangeDate = latestChangeDate
              ? new Date(latestChangeDate)
              : null;
          } else {
            this.lastChangeDate = null;
          }
        },
      });
  }

  initProject(): void {
    this.projectService.getProject(this.id).subscribe((project) => {
      this.project = project;
      this.technologyNames = project.technologyNames;
      this.isLoaded = true;
    });
  }

  getTechnologyId(technologyName: string): number {
    const index = this.project.technologyNames.indexOf(technologyName);
    return this.project.technologyIds[index];
  }

  isAdmin(): boolean {
    return this.userHandling.hasRole(UserRole.ADMIN);
  }
  openDeleteDialog(): void {
    this.dialog.open(RemoveDialogComponent, {
      data: {
        resourceType: 'Projekt',
        resourceName: this.project.name,
        onDelete: () => this.deleteProject(),
      },
    });
  }
  deleteProject(): void {
    const n = this.project.name;
    this.projectService.deleteProject(this.project.id).subscribe(() => {
      this.dialog.closeAll();
      this.router.navigate([`/`]);
      this.snackBar.open(`Das Projekt ${n} wurde erfolgreich gelöscht.`);
    });
  }
}
