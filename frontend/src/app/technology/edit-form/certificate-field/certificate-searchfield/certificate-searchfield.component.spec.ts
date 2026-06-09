import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { CertificateSearchfieldComponent } from './certificate-searchfield.component';
import { CertificateService } from 'src/app/services/certificate.service';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { Certificate } from 'src/app/models/technology';
import { of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('CertificateSearchfieldComponent', () => {
  let component: CertificateSearchfieldComponent;
  let fixture: ComponentFixture<CertificateSearchfieldComponent>;
  let mockCertificateService: jasmine.SpyObj<CertificateService>;

  const mockCertificates: Certificate[] = [
    { id: 1, name: 'z1' } as Certificate,
    { id: 2, name: 'z2' } as Certificate,
    { id: 3, name: 'z4' } as Certificate,
    { id: 4, name: 'z4' } as Certificate,
  ];

  beforeEach(async () => {
    mockCertificateService = jasmine.createSpyObj('CertificateService', [
      'getCertificates',
    ]);
    mockCertificateService.getCertificates.and.returnValue(
      of(mockCertificates),
    );
    await TestBed.configureTestingModule({
      declarations: [CertificateSearchfieldComponent],
      providers: [
        { provide: CertificateService, useValue: mockCertificateService },
      ],
      imports: [ReactiveFormsModule, FormsModule, MatAutocompleteModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificateSearchfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and filter certificates', fakeAsync(() => {
    tick();
    expect(component.allCertificates.length).toBe(4);
    expect(component.filter('z1').length).toBe(1);
  }));

  it('should emit selected certificate', () => {
    spyOn(component.selectedCertificatesOutput, 'emit');
    spyOn(component.value, 'emit');

    const selectedCert = mockCertificates[0];
    const mockEvent = {
      option: {
        value: selectedCert,
      },
    } as MatAutocompleteSelectedEvent;

    component.emit(mockEvent);

    expect(component.selectedCertificateIds).toContain(selectedCert.id);
    expect(component.selectedCertificatesOutput.emit).toHaveBeenCalledWith({
      id: selectedCert.id,
      name: selectedCert.name,
    });
    expect(component.value.emit).toHaveBeenCalledWith('');
  });

  it('should remove selected certificate', () => {
    spyOn(component.removedCertificate, 'emit');
    component.allCertificates = mockCertificates;
    component.selectedCertificateIds = [1, 2];

    component.removeItem(mockCertificates[0]);

    expect(component.selectedCertificateIds).not.toContain(1);
    expect(component.removedCertificate.emit).toHaveBeenCalledWith('z1');
  });

  it('should mark control as touched if showError is true', () => {
    component.control.markAsUntouched();
    component.ngOnChanges({
      showError: {
        currentValue: true,
        previousValue: false,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.control.touched).toBeTrue();
  });
});
