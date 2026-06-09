import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Technology } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';

@Component({
  selector: 'app-certificate-view',
  templateUrl: './certificate-view.component.html',
  styleUrls: ['./certificate-view.component.css'],
})
export class CertificateViewComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() technologies: Array<Technology> = [];
  @ViewChild(Option) sortSelect!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  dataSource: MatTableDataSource<Technology> = new MatTableDataSource();
  displayedColumns: string[] = ['name', 'certificates'];

  isSearchVisible = false;
  searchText = '';
  private allTechnologies: Technology[] = [];

  constructor(
    private router: Router,
    private technologyService: TechnologyService,
  ) {}

  ngOnChanges(): void {
    this.loadTechnologies();
  }

  ngOnInit(): void {
    this.loadTechnologies();
  }

  private loadTechnologies(): void {
    this.technologyService.getTechnologies().subscribe((technologies) => {
      this.allTechnologies = technologies.filter(
        (tech) => tech.certificates && tech.certificates.length > 0,
      );
      this.applySearch();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.paginator._intl.itemsPerPageLabel = 'Zertifikate pro Seite';
    this.paginator._intl.nextPageLabel = 'Nächste Seite';
    this.paginator._intl.lastPageLabel = 'Letzte Seite';
    this.paginator._intl.firstPageLabel = 'Erste Seite';
    this.paginator._intl.previousPageLabel = 'Vorherige Seite';
  }

  navigate(navElement: Technology): void {
    this.router.navigate([`/detail/${navElement.id}`]);
  }

  getCertificateNames(technologies: Technology): string {
    return (
      technologies.certificates
        ?.map((certificate) => certificate.name)
        .join(', ') || 'Keine Zertifikate'
    );
  }
  applySearch(): void {
    if (this.searchText.trim().length > 0) {
      const filterValue = this.searchText.toLowerCase();
      this.dataSource.data = this.allTechnologies.filter((tech) =>
        tech.name.toLowerCase().includes(filterValue),
      );
    } else {
      this.dataSource.data = this.allTechnologies;
    }
  }

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
    if (this.isSearchVisible) {
      setTimeout(() => this.searchInput?.nativeElement.focus());
      return;
    }

    if (!this.isSearchVisible) {
      this.searchText = '';
      this.applySearch();
    }
  }
}
