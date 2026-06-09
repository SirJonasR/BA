import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { firstValueFrom, map, Observable, startWith } from 'rxjs';
import { TechnologyReference } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';

export function lengthValidator(
  length: number,
  customError: string,
): ValidatorFn {
  return (): ValidationErrors | null => {
    const isValidLength = length >= 1;
    return isValidLength
      ? null
      : {
          customError: customError,
        };
  };
}

@Component({
  selector: 'app-tech-searchbar',
  templateUrl: './tech-searchbar.component.html',
  styleUrls: ['./tech-searchbar.component.css'],
})
/**
 * TechSearchbar component
 *
 * Component for searchbar.
 * Searching for existing technologies
 */
export class TechSearchbarComponent implements OnInit, OnChanges {
  // @ViewChild('searchbox') inputSearchbox: any;
  @Output() selectTechnology: EventEmitter<void> = new EventEmitter<void>();
  @Output() value = new EventEmitter<string>();
  @Input() searchFieldPlaceholder = 'Suche eine Technologie ...';
  @Input() showError = false;
  @Input() validate = false;
  @Input() multipleSelect = false;
  @Input() selectedItems: TechnologyReference[] = [];
  control = new FormControl<string | TechnologyReference>('', []);

  technologies: TechnologyReference[] = [];
  filteredTechnologies!: Observable<TechnologyReference[]>;

  constructor(
    private technologyService: TechnologyService,
    private router: Router,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showError'] && changes['showError'].currentValue) {
      this.control.markAsTouched({ onlySelf: true });
      this.control.updateValueAndValidity();
    }
  }

  onInputFocus(): void {
    if (!this.control.value) {
      this.control.setValue('');
    }
  }

  async ngOnInit(): Promise<void> {
    if (this.validate) {
      this.control = new FormControl<string | TechnologyReference>('', [
        lengthValidator(
          this.selectedItems.length,
          `Bitte wähle mindestens eine Technologie aus.`,
        ),
      ]);
    }

    this.technologies = await firstValueFrom(
      this.technologyService.getTechnologies(),
    );

    this.filteredTechnologies = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        const availableTechs = this.technologies.filter(
          (technology) =>
            !this.selectedItems.some(
              (selected) => selected.id === technology.id,
            ),
        );
        return name ? this._filter(name as string) : availableTechs;
      }),
    );

    this.router.routeReuseStrategy.shouldReuseRoute = function (): boolean {
      return false;
    };

    this.control.updateValueAndValidity();
  }

  private _filter(name: string): TechnologyReference[] {
    this.value.emit(name);
    const filterValue = name.toLowerCase();
    return this.technologies.filter(
      (technology) =>
        technology.name.toLowerCase().includes(filterValue) &&
        !this.selectedItems.some((item) => item.id === technology.id),
    );
  }

  async emit(e: MatAutocompleteSelectedEvent): Promise<void> {
    if (this.multipleSelect) {
      this.selectedItems.push(e.option.value);
    }
    if (this.validate) {
      this.control.setValidators([
        lengthValidator(
          this.selectedItems.length,
          `Bitte wähle mindestens eine Technologie aus.`,
        ),
      ]);
    }
    this.selectTechnology.emit(e.option.value);
    this.control.setValue('');

    this.control.updateValueAndValidity();
    this.value.emit('');
  }

  get sortedSelectedItems(): TechnologyReference[] {
    return [...this.selectedItems].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }

  displayTechnology(technology: TechnologyReference): string {
    return technology.name;
  }

  removeItem(item: TechnologyReference): void {
    const index = this.selectedItems.indexOf(item);
    this.selectedItems.splice(index, 1);
    this.control.setValidators([
      lengthValidator(
        this.selectedItems.length,
        `Bitte wähle mindestens eine Technologie aus.`,
      ),
    ]);
    this.control.updateValueAndValidity();
  }
}
