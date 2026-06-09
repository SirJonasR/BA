import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepExpertManagementComponent } from './deep-expert-management.component';
import { DeepExpertService } from 'src/app/services/deep-expert.service';
import { of, throwError } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

describe('DeepExpertManagementComponent', () => {
  let component: DeepExpertManagementComponent;
  let fixture: ComponentFixture<DeepExpertManagementComponent>;
  let deepExpertServiceMock: jasmine.SpyObj<DeepExpertService>;
  const requiredHeaders = Object.values(
    DeepExpertManagementComponent.CSV_HEADER_MAPPING,
  );

  const mockExpertList = [
    {
      tableRow: 1,
      technologyName: 'Tech 1',
      expertInformation: 'Expert 1',
      scope: 'Scope 1',
      description: 'Desc 1',
      comment: 'Comment 1',
    },
  ];

  beforeEach(async () => {
    deepExpertServiceMock = jasmine.createSpyObj('DeepExpertService', [
      'updateDeepExpertList',
      'getDeepExpertList',
    ]);

    deepExpertServiceMock.getDeepExpertList.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [DeepExpertManagementComponent],
      imports: [
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressBarModule,
        MatButtonModule,
        MatIconModule,
      ],
      providers: [
        { provide: DeepExpertService, useValue: deepExpertServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeepExpertManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFileSelected', () => {
    it('should show error for non-csv file', async () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const event = { target: { files: [file] } } as unknown as Event;
      await component.onFileSelected(event);
      expect(component.error).toBe(
        DeepExpertManagementComponent.MESSAGES.ERROR_NOT_CSV_FILETYPE,
      );
    });

    it('should handle csv file with headers but no content', async () => {
      const csv = requiredHeaders.join(','); //`Technologie / Thema,Deep Expert,Eingrenzung,Beschreibung,Kommentar / Hinweise`;
      const file = new File([csv], 'test.csv', { type: 'text/csv' });
      const event = { target: { files: [file] } } as unknown as Event;
      await component.onFileSelected(event);
      expect(component.error).toBe(
        DeepExpertManagementComponent.MESSAGES.ERROR_NO_ROWS_FOUND_IN_FILE,
      );
    });

    it('should show error for csv with incorrect headers', async () => {
      // Create CSV with required headers, then remove the last character to simulate an incorrect header
      const csv = requiredHeaders.join(',').slice(0, -1);
      const file = new File([csv], 'test.csv', { type: 'text/csv' });
      const event = { target: { files: [file] } } as unknown as Event;
      await component.onFileSelected(event);
      expect(component.error).toContain(
        DeepExpertManagementComponent.MESSAGES.ERROR_HEADERS_MISSING_IN_FILE([
          requiredHeaders[requiredHeaders.length - 1],
        ]),
      );
    });

    it('should parse valid csv file', async () => {
      const csvHeader = requiredHeaders.join(',');
      const csvRow = requiredHeaders.join(',');
      const csv = `${csvHeader}\n${csvRow}`;
      const file = new File([csv], 'test.csv', { type: 'text/csv' });
      const event = { target: { files: [file] } } as unknown as Event;
      await component.onFileSelected(event);
      expect(component.expertList.length).toBe(1);
      expect(component.success).toBe(
        DeepExpertManagementComponent.MESSAGES.SUCCESSFULLY_IMPORTED,
      );
    });
  });

  describe('saveExperts', () => {
    beforeEach(() => {
      component.expertList = mockExpertList;
    });

    it('should call updateDeepExpertList and show success', () => {
      deepExpertServiceMock.updateDeepExpertList.and.returnValue(of(undefined));
      component.saveExperts();
      expect(component.isLoading).toBeFalse();
      expect(deepExpertServiceMock.updateDeepExpertList).toHaveBeenCalledWith(
        mockExpertList,
      );
      expect(component.success).toBe(
        DeepExpertManagementComponent.MESSAGES.SUCCESSFULLY_SAVED,
      );
      expect(component.expertList.length).toBe(0);
    });

    it('should handle error on updateDeepExpertList', () => {
      const error = { status: 500 };
      deepExpertServiceMock.updateDeepExpertList.and.returnValue(
        throwError(() => error),
      );
      component.saveExperts();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe(
        DeepExpertManagementComponent.MESSAGES.ERROR_WHILE_SAVING_LIST,
      );
    });
  });
});
