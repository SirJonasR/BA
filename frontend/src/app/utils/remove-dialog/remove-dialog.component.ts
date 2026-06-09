import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

type DialogData = {
  /**
   * The type of the resource being deleted (e.g., "Technologie", "Abonnement", "Projekt").
   * Used in the title of the dialogue (e.g. "Technologie löschen")
   */
  resourceType: string;

  /**
   * The name or identifier of the specific resource instance to be deleted.
   * Möchtest du XY wirklich unwiderruflich löschen?
   */
  resourceName: string;

  /**
   * Callback to be executed when the user confirms the deletion.
   */
  onDelete: () => void;
};

@Component({
  selector: 'app-remove-dialog',
  templateUrl: './remove-dialog.component.html',
  styleUrls: ['./remove-dialog.component.css'],
})
export class RemoveDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RemoveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
  ) {}

  onAbort(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogData.onDelete();
  }
}
