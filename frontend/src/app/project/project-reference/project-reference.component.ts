import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProjectService } from 'src/app/services/project.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Industry, Technology } from 'src/app/models/technology';

export type ProjectReference = {
  projectName: string;
  industryName: string;
  allTechnologiesFromProject: Technology[];
  givenTechnologies: Technology[];
  overlappedTechnologies: Technology[];
};

@Component({
  selector: 'app-project-reference',
  templateUrl: './project-reference.component.html',
  styleUrls: ['./project-reference.component.css'],
})
export class ProjectReferenceComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'projectName',
    'matchingPercentage',
    'overlapCount',
    'industry',
  ];
  dataSource: MatTableDataSource<ProjectReference> =
    new MatTableDataSource<ProjectReference>();
  selectedTechnologies: Technology[] = [];
  selectedIndustries: Industry[] = [];
  selectedIndustryIds: number[] = [];
  allIndustries: Industry[] = [];
  maxTechNumber = 50;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private projectService: ProjectService,
    private location: Location,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.assignPaginatorAndSort();
    this.projectService.getIndustries().subscribe((industries) => {
      this.allIndustries = industries;
    });
  }

  private assignPaginatorAndSort(): void {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (
        item: ProjectReference,
        property: string,
      ): string | number => {
        switch (property) {
          case 'matchingPercentage':
            return item.givenTechnologies.length > 0
              ? item.overlappedTechnologies.length /
                  item.givenTechnologies.length
              : 0;
          case 'overlapCount':
            return item.overlappedTechnologies.length;
          default:
            return (
              ((item as Record<string, unknown>)[property] as
                | string
                | number) ?? ''
            );
        }
      };
    });
  }

  searchProjectReference(): void {
    if (this.selectedTechnologies.length === 0) {
      this.snackBar.open('Bitte wählen Sie mindestens eine Technologie.', '', {
        duration: 3000,
      });
      return;
    }

    if (this.selectedTechnologies.length > this.maxTechNumber) {
      this.snackBar.open(
        `Sie haben zu viele Technologien ausgewählt (max. ${this.maxTechNumber})`,
        '',
        {
          duration: 3000,
        },
      );
      return;
    }

    this.projectService
      .getProjectReferences(this.selectedTechnologies, this.selectedIndustryIds)
      .subscribe({
        next: (references) => {
          console.log(references);
          this.dataSource.data = references;

          if (references.length === 0) {
            this.snackBar.open('Keine Projektreferenzen gefunden.', '', {
              duration: 3000,
            });
          }

          this.cdr.detectChanges();
          this.assignPaginatorAndSort();
        },
        error: (error) => {
          console.error('Fehler beim Abrufen der Projektreferenzen:', error);
          this.snackBar.open('Fehler beim Laden der Daten.', '', {
            duration: 3000,
          });
        },
      });
  }

  goBackToPrevPage(): void {
    this.location.back();
  }

  navigate(projectReference: ProjectReference): void {
    this.projectService.getProjects().subscribe((projects) => {
      const project = projects.find(
        (p) => p.name === projectReference.projectName,
      );
      if (project) {
        this.router.navigate(['/project', project.id]);
      } else {
        this.snackBar.open('Projekt nicht gefunden.', '', { duration: 3000 });
      }
    });
  }
}
