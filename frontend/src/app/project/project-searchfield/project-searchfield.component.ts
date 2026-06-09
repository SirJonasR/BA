import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { FormControl } from '@angular/forms';
import { firstValueFrom, map, Observable, startWith } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { lengthValidator } from '../../reports/tech-searchbar/tech-searchbar.component';
import { ProjectForm } from 'src/app/models/project';

@Component({
  selector: 'app-project-searchfield',
  templateUrl: './project-searchfield.component.html',
  styleUrls: ['./project-searchfield.component.css'],
})
export class ProjectSearchfieldComponent implements OnInit, OnChanges {
  @Output() selectedProjectsOutput: EventEmitter<void> =
    new EventEmitter<void>();
  @Output() value = new EventEmitter<string>();
  @Input() selectedProjectIds: number[] = [];
  @Input() showError = false;
  @Input() validate = false;
  allProjects: ProjectForm[] = [];
  filteredProjects!: Observable<ProjectForm[]>;
  control = new FormControl<string | ProjectForm>('', []);
  selectedProjects: ProjectForm[] = [];
  constructor(private projectService: ProjectService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showError'] && changes['showError'].currentValue) {
      this.control.markAsTouched({ onlySelf: true });
      this.control.updateValueAndValidity();
    }
  }

  async ngOnInit(): Promise<void> {
    this.allProjects = (
      await firstValueFrom(this.projectService.getProjects())
    ).map((p) => ({
      ...p,
      industrySpecificInformation: p.industrySpecificInformation || '',
    })) as ProjectForm[];
    this.selectedProjects = this.allProjects.filter((project) =>
      this.selectedProjectIds.includes(project.id),
    );
    this.filteredProjects = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this.filter(name as string)
          : this.allProjects.filter(
              (project) =>
                !this.selectedProjects.some(
                  (selected) => selected.name === project.name,
                ),
            );
      }),
    );
  }

  async emit(e: MatAutocompleteSelectedEvent): Promise<void> {
    this.selectedProjects.push(e.option.value);
    this.selectedProjects.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically after each addition
    this.selectedProjectIds.push(e.option.value.id);
    if (this.validate) {
      this.control.setValidators([
        lengthValidator(
          this.selectedProjects.length,
          'Bitte wähle mindestens ein Projekt aus',
        ),
      ]);
    }
    this.selectedProjectsOutput.emit(e.option.value.id);

    // Empty Input Field
    this.control.setValue('', { emitEvent: false });
    this.control.updateValueAndValidity();
    this.value.emit('');
  }

  filter(name: string): ProjectForm[] {
    this.value.emit(name);
    const filterValue: string = name.toLowerCase();
    return this.allProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(filterValue) &&
        !this.selectedProjects.includes(project),
    );
  }

  displayProject(project: ProjectForm): string {
    return project.name;
  }

  removeItem(project: ProjectForm): void {
    const index = this.selectedProjects.indexOf(project);
    const index2 = this.selectedProjectIds.indexOf(project.id);
    this.selectedProjects.splice(index, 1);
    this.selectedProjectIds.splice(index2, 1);
    this.control.setValidators([
      lengthValidator(
        this.selectedProjects.length,
        'Bitte wähle mindestens ein Projekt aus',
      ),
    ]);
    this.control.updateValueAndValidity();
  }
}
