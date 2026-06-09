import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { Certificate, Technology } from 'src/app/models/technology';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TechnologyService } from 'src/app/services/technology.service';
import { PictureService } from 'src/app/services/picture.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProjectReference } from 'src/app/models/project';

@Component({
  selector: 'app-tool-list',
  templateUrl: './tool-list.component.html',
  styleUrls: ['./tool-list.component.css'],
})
export class ToolListComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() technologies: Array<Technology> = [];
  @ViewChild(Option) sortSelect!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loadedLogos: { [key: number]: SafeResourceUrl } = {};

  dataSource: MatTableDataSource<Technology> = new MatTableDataSource();
  displayedColumns: string[] = [
    'picture',
    'name',
    'category',
    'lifecycle',
    'tags',
    'projects',
    'customers',
  ];

  constructor(
    private router: Router,
    private technologyService: TechnologyService,
    private sanitizer: DomSanitizer,
    private pictureService: PictureService,
  ) {}

  ngOnInit(): void {
    this.dataSource.data = this.mapValues(this.technologies);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.paginator._intl.itemsPerPageLabel = 'Technologien pro Seite';
    this.paginator._intl.nextPageLabel = 'Nächste Seite';
    this.paginator._intl.lastPageLabel = 'Letzte Seite';
    this.paginator._intl.firstPageLabel = 'Erste Seite';
    this.paginator._intl.previousPageLabel = 'Vorherige Seite';
  }

  ngOnChanges(): void {
    this.dataSource.data = this.mapValues(this.technologies);
  }

  mapValues(technologies: Technology[]): {
    projects: ProjectReference[];
    projectNames: string[];
    hasLogo: boolean;
    description: string;
    certificates: Certificate[];
    connectedTechnologyIds: number[];
    connectedTechnologyNames: string[];
    shortDescription: string;
    priority: boolean;
    tags: string[];
    lifecycle: string | undefined;
    pictureId: number | null;
    name: string;
    id: number;
    lifecycleId: number;
    viewCount: number;
    customers: string[];
    jumpDate: string;
    category: string | undefined;
    categoryId: number;
    status: number;
  }[] {
    this.loadLogos(technologies);
    return technologies.map((technology) => ({
      ...technology,
      category: this.technologyService.getCategoryById(technology.categoryId)
        ?.name,
      lifecycle: this.technologyService.getLifecycleById(technology.lifecycleId)
        ?.name,
      tags: technology.tags.filter((tag) => tag !== '').map((tag) => ' ' + tag),
      projectNames: [
        ...new Set(technology.projects.map((project) => ' ' + project.name)),
      ],
      customers: [
        ...new Set(
          technology.projects
            .flatMap((project) =>
              project.customers.map((customer) => ' ' + customer.name),
            )
            .sort(),
        ),
      ],
      hasLogo: technology.pictureId !== null,
    }));
  }

  loadLogos(technologies: Technology[]): void {
    technologies.forEach((technology) => {
      if (technology.pictureId !== null)
        this.getPictureUrl(technology.pictureId);
    });
  }

  getPictureUrl(pictureId: number): void {
    this.pictureService.loadPicture(pictureId).subscribe({
      next: (picture: SafeResourceUrl | null) => {
        if (picture !== null) {
          this.loadedLogos[pictureId] =
            this.sanitizer.sanitize(4, picture) || '';
        } else {
          this.loadedLogos[pictureId] =
            'assets/defaultLogo.jpg' as SafeResourceUrl;
        }
      },
      error: (error: HttpErrorResponse) => {
        alert('Etwas lief schief beim Bild laden: ' + error.message);
      },
    });
  }

  navigate(navElement: Technology): void {
    this.router.navigate([`/detail/${navElement.id}`]);
  }
}
