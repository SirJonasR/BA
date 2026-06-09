import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { RemoveDialogComponent } from './remove-dialog.component';

describe('RemoveDialogComponent', () => {
  let component: RemoveDialogComponent;
  let fixture: ComponentFixture<RemoveDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close'),
  };

  const mockDialogData = {
    technology: {
      /* mock Technology object */
    },
    onDelete: jasmine.createSpy('onDelete'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RemoveDialogComponent],
      imports: [MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog when onAbort is called', () => {
    component.onAbort();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should call onDelete when onConfirm is called', () => {
    component.onConfirm();
    expect(mockDialogData.onDelete).toHaveBeenCalled();
  });
});
