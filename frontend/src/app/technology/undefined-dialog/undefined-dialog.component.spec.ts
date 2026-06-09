import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UndefinedDialogComponent } from './undefined-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('UndefinedDialogComponent', () => {
  let component: UndefinedDialogComponent;
  let fixture: ComponentFixture<UndefinedDialogComponent>;
  let matDialogRefStub: Partial<MatDialogRef<UndefinedDialogComponent>>;

  beforeEach(() => {
    matDialogRefStub = {
      close: jasmine.createSpy('close'),
    };

    TestBed.configureTestingModule({
      declarations: [UndefinedDialogComponent],
      imports: [MatDialogModule],
      providers: [{ provide: MatDialogRef, useValue: matDialogRefStub }],
    });

    fixture = TestBed.createComponent(UndefinedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
