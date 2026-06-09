import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CommentDialogAction,
  CommentDialogComponent,
} from './comment-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';

describe('CommentDialogComponent', () => {
  let component: CommentDialogComponent;
  let fixture: ComponentFixture<CommentDialogComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CommentDialogComponent>>;

  beforeEach(() => {
    mockDialog = jasmine.createSpyObj('Dialog', ['open']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [CommentDialogComponent],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { message: 'Mock message' } },
      ],
    });
    fixture = TestBed.createComponent(CommentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with correct commentDialogAction and trimmed comment on submit', () => {
    component.comment = '   my comment  ';
    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      action: CommentDialogAction.SAVE_WITH_COMMENT,
      comment: 'my comment',
    });
  });

  it('should close dialog with CommentDialogAction.SAVE_WITHOUT_COMMENT on skip', () => {
    component.onSkip();
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      action: CommentDialogAction.SAVE_WITHOUT_COMMENT,
    });
  });

  it('should close dialog with CommentDialogAction.ABORT_SAVE when closed', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      action: CommentDialogAction.ABORT_SAVE,
    });
  });
});
