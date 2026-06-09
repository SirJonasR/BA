import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-undefined-dialog',
  templateUrl: './undefined-dialog.component.html',
  styleUrls: ['./undefined-dialog.component.css'],
})
export class UndefinedDialogComponent {
  constructor(public dialogRef: MatDialogRef<UndefinedDialogComponent>) {}
}
