import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface CommentDialogData {
  message: string;
}

export enum CommentDialogAction {
  ABORT_SAVE = 'ABORT_SAVE',
  SAVE_WITHOUT_COMMENT = 'SAVE_WITHOUT_COMMENT',
  SAVE_WITH_COMMENT = 'SAVE_WITH_COMMENT',
}

export type CommentDialogResult =
  | { action: CommentDialogAction.SAVE_WITH_COMMENT; comment: string }
  | { action: CommentDialogAction.SAVE_WITHOUT_COMMENT }
  | { action: CommentDialogAction.ABORT_SAVE };

@Component({
  selector: 'app-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.scss'],
})
export class CommentDialogComponent {
  comment = '';

  constructor(
    public dialogRef: MatDialogRef<CommentDialogComponent, CommentDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: CommentDialogData,
  ) {}

  onSkip(): void {
    this.dialogRef.close({ action: CommentDialogAction.SAVE_WITHOUT_COMMENT });
  }

  onSubmit(): void {
    this.dialogRef.close({
      action: CommentDialogAction.SAVE_WITH_COMMENT,
      comment: this.comment.trim(),
    });
  }

  close(): void {
    this.dialogRef.close({ action: CommentDialogAction.ABORT_SAVE });
  }
}
