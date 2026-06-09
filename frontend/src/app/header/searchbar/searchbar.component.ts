import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { firstValueFrom, map, Observable, startWith } from 'rxjs';
import { Technology } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css'],
})
/**
 * Searchbar component
 *
 * Component for searchbar.
 * Searching for existing technologies
 */
export class SearchbarComponent implements OnInit {
  @ViewChild('searchbox') inputSearchbox:
    | ElementRef<HTMLInputElement>
    | undefined;
  @Output() selectTechnology: EventEmitter<number> = new EventEmitter<number>();

  control = new FormControl<string | Technology>('');
  technologies: Technology[] = [];
  filteredTechnologies!: Observable<Technology[]>;
  showLastClicked = true;
  lastClickedTechnologies: Technology[] = [];

  constructor(
    private technologyService: TechnologyService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.refresh();
    this.filteredTechnologies = this.getFilteredTechnologies();
  }

  private _filter(name: string): Technology[] {
    const filterValue = name.toLowerCase();
    this.showLastClicked = false;

    return this.technologies.filter(
      (technology) =>
        technology.name.toLowerCase().includes(filterValue) ||
        technology.tags.some((item) => item.toLowerCase() === filterValue),
    );
  }

  async emit(e: MatAutocompleteSelectedEvent): Promise<void> {
    const id = e.option.value.id;
    if (this.inputSearchbox) {
      this.inputSearchbox.nativeElement.value = '';
    }
    e.option.deselect();
    this.filteredTechnologies = this.getFilteredTechnologies();
    this.selectTechnology.emit(id);
  }

  getFilteredTechnologies(): Observable<Technology[]> {
    const filteredTechnologies = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string)
          : this.technologies.filter(
              (item) =>
                !this.lastVisitedTechnologies.some(
                  (item2) => item2.id === item.id,
                ),
            );
      }),
    );

    this.router.routeReuseStrategy.shouldReuseRoute = function (): boolean {
      return false;
    };
    return filteredTechnologies;
  }

  get lastVisitedTechnologies(): Technology[] {
    return JSON.parse(localStorage.getItem('lastVisitedTechnologies') ?? '[]');
  }

  displayTechnology(technology: Technology): string {
    return technology.name;
  }

  async refresh(): Promise<void> {
    this.technologies = await firstValueFrom(
      this.technologyService.getTechnologies(),
    );
    this.showLastClicked = true;
    this.lastClickedTechnologies = [];
    this.filteredTechnologies = this.getFilteredTechnologies();
    for (const technology of this.lastVisitedTechnologies) {
      this.technologies.forEach((t) => {
        if (t.name === technology.name) {
          this.lastClickedTechnologies.push(technology);
        }
      });
    }
  }

  getCategoryAndLifecycle(categoryId: number, lifecycleId: number): string {
    const category: string =
      this.technologyService.getCategoryById(categoryId)?.name ?? '';
    const lifecycle: string =
      this.technologyService.getLifecycleById(lifecycleId)?.name ?? '';
    return category + ' | ' + lifecycle;
  }
}
