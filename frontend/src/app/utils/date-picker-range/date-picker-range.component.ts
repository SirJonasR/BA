import { Component, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-date-picker-range',
  templateUrl: './date-picker-range.component.html',
  styleUrls: ['./date-picker-range.component.css'],
})
export class DatePickerRangeComponent implements AfterViewInit {
  @Output() dateRangeSelected = new EventEmitter<{
    startDate: Date;
    endDate: Date;
  }>();

  dateRangeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.dateRangeForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.dateRangeForm.valueChanges.subscribe((value) => {
      const startDate = value.startDate ? new Date(value.startDate) : null;
      const endDate = value.endDate ? new Date(value.endDate) : null;
      if (startDate && endDate && startDate <= endDate) {
        this.dateRangeSelected.emit({ startDate, endDate });
      }
    });
  }
}
