import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormValues } from 'src/app/technology/edit-form/edit-form.component';

@Component({
  selector: 'app-technology-form-popup',
  templateUrl: './technology-form-dialog.component.html',
  styleUrls: ['./technology-form-dialog.component.css'],
})
export class TechnologyFormDialogComponent {
  values: FormValues;
  listOfTechnologyNames: string[];
  readonly data = inject(MAT_DIALOG_DATA);
  isSubmitting = false;
  hasError = false;
  constructor(public dialogRef: MatDialogRef<TechnologyFormDialogComponent>) {
    this.values = this.data.formValue;
    this.listOfTechnologyNames = this.data.listOfTechnologyNames;
  }

  async onSubmit(): Promise<void> {
    this.isSubmitting = true;
    this.hasError = false;
    this.dialogRef.close({ event: 'addNewTechnology', data: this.values });
  }
}
