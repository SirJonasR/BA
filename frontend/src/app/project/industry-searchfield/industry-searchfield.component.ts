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
import { Industry } from 'src/app/models/technology';
import { firstValueFrom, map, Observable, startWith } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-industry-searchfield',
  templateUrl: './industry-searchfield.component.html',
  styleUrls: ['./industry-searchfield.component.css'],
})
export class IndustrySearchfieldComponent implements OnInit, OnChanges {
  @Output() selectedIndustriesOutput: EventEmitter<void> =
    new EventEmitter<void>();
  @Output() value = new EventEmitter<string>();
  @Output() selectedIndustryIdsChange = new EventEmitter<number[]>();
  @Input() selectedIndustryIds: number[] = [];
  allIndustries: Industry[] = [];
  filteredIndustries!: Observable<Industry[]>;
  control = new FormControl('');
  selectedIndustries: Industry[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showError'] && changes['showError'].currentValue) {
      this.control.markAsTouched({ onlySelf: true });
      this.control.updateValueAndValidity();
    }
  }

  async ngOnInit(): Promise<void> {
    this.allIndustries = await firstValueFrom(
      this.projectService.getIndustries(),
    );
    this.filteredIndustries = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value.toLowerCase() : '';
        return this.allIndustries.filter(
          (industry) =>
            industry.name.toLowerCase().includes(name) &&
            !this.selectedIndustries.includes(industry),
        );
      }),
    );
  }

  async emit(e: MatAutocompleteSelectedEvent): Promise<void> {
    this.selectedIndustries.push(e.option.value);
    this.selectedIndustryIds.push(e.option.value.id);
    this.selectedIndustryIdsChange.emit(this.selectedIndustryIds);

    this.selectedIndustriesOutput.emit(e.option.value.id);
    this.control.setValue('');
    this.control.updateValueAndValidity();
    this.value.emit('');
  }

  filter(name: string): Industry[] {
    this.value.emit(name);
    const filterValue: string = name.toLowerCase();
    return this.allIndustries.filter(
      (industry) =>
        industry.name.toLowerCase().includes(filterValue) &&
        !this.selectedIndustries.includes(industry),
    );
  }

  displayIndustryName(industry: Industry): string {
    return industry.name;
  }

  removeItem(industry: Industry): void {
    const index = this.selectedIndustries.indexOf(industry);
    const index2 = this.selectedIndustryIds.indexOf(industry.id);
    this.selectedIndustries.splice(index, 1);
    this.selectedIndustryIds.splice(index2, 1);
    this.selectedIndustryIdsChange.emit(this.selectedIndustryIds);
    this.control.updateValueAndValidity();
  }
}
