import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CertificateFieldComponent } from './certificate-field.component';
import { CertificateForm } from 'src/app/models/technology';

describe('CertificateFieldComponent', () => {
  let component: CertificateFieldComponent;
  let fixture: ComponentFixture<CertificateFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CertificateFieldComponent],
      imports: [
        HttpClientTestingModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
      ],
      providers: [FormBuilder],
    });
    fixture = TestBed.createComponent(CertificateFieldComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize ', () => {
    expect(component.certificateFormArray.length).toBe(0);
    component.certificates = [
      {
        name: 'testCertificate',
      } as CertificateForm,
      {
        name: 'testCertificate2',
      } as CertificateForm,
    ];
    component.ngOnInit();
    expect(component.certificateFormArray.length).toBe(2);
  });

  it('should add a certificate form group', () => {
    component.ngOnInit();
    component.addCertificate();
    expect(component.certificateFormArray.length).toBe(2);
  });

  it('should remove a certificate form group', () => {
    component.addCertificate();

    component.removeCertificate(0);
    expect(component.certificateFormArray.length).toBe(0);
  });

  it('should test if getting length of text works correctly', () => {
    const certificate = {
      name: 'test',
      description: 'description of certificate',
    };
    expect(component.getLengthOfCertificateName(certificate)).toBe(4);
    expect(component.getLengthOfDescription(certificate)).toBe(26);
  });
});
