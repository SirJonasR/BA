import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { TechnologyFormDialogComponent } from './technology-form-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

describe('TechnologyFormPopupComponent', () => {
  let component: TechnologyFormDialogComponent;
  let fixture: ComponentFixture<TechnologyFormDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TechnologyFormDialogComponent>>;

  const mockDialogData = {
    formValue: {
      name: 'Test Technology',
      description: 'Test Description',
      shortDescription: 'Test Short Description',
      pictureData: null,
      isNewPic: false,
      categoryId: 1,
      lifecycleId: 1,
      tags: ['tag1', 'tag2'],
      projectIds: [],
      priority: false,
      connectedTechnologyIds: [],
      certificates: [],
    },
    listOfTechnologyNames: ['Tech1', 'Tech2'],
  };

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
      declarations: [TechnologyFormDialogComponent],
    });
    fixture = TestBed.createComponent(TechnologyFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with given data', () => {
    expect(component.values).toEqual(mockDialogData.formValue);
    expect(component.listOfTechnologyNames).toEqual(
      mockDialogData.listOfTechnologyNames,
    );
  });

  it('should close dialog with data on submit', fakeAsync(() => {
    component.onSubmit();
    tick();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      event: 'addNewTechnology',
      data: component.values,
    });
    expect(component.isSubmitting).toBeTrue();
    expect(component.hasError).toBeFalse();
  }));
});
