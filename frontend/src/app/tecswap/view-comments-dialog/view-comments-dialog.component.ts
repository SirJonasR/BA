import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommentResponse } from 'src/app/models/comment';

export interface HistoryDialogData {
  comments: CommentResponse[];
}

@Component({
  selector: 'app-view-comments-dialog',
  templateUrl: './view-comments-dialog.component.html',
  styleUrls: ['./view-comments-dialog.component.scss'],
})
export class ViewCommentsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HistoryDialogData,
    private dialogRef: MatDialogRef<ViewCommentsDialogComponent>,
  ) {}
  objectKeys = Object.keys;

  isBoolean(v: string): boolean {
    return v === 'true' || v === 'false';
  }

  close(): void {
    this.dialogRef.close();
  }

  getBeforeValue(change: string): string {
    return change.split(' -> ')[0]?.trim();
  }

  getAfterValue(change: string): string {
    return change.split(' -> ')[1]?.trim();
  }
}
