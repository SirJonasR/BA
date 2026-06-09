import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, of } from 'rxjs';
import { CertificateForm } from 'src/app/models/technology';

@Component({
  selector: 'app-certificate-field',
  templateUrl: './certificate-field.component.html',
  styleUrls: ['./certificate-field.component.css'],
})
export class CertificateFieldComponent implements OnInit {
  @Input() certificates: CertificateForm[] = [];
  @Output() certificateData = new EventEmitter<{
    certificates: CertificateForm[];
  }>();
  @Output() valid = new EventEmitter<boolean>();
  maxCharactersName = 60;
  maxCharactersDescription = 1800;
  mainForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.mainForm = this.fb.group({
      certificates: this.fb.array([]),
    });
  }

  async ngOnInit(): Promise<void> {
    this.mainForm.valueChanges.pipe(debounceTime(300)).subscribe((value) => {
      this.certificates = value.certificate;
      this.certificateData.emit(value);
    });
    this.setExistingCertificate();
  }

  setExistingCertificate(): void {
    if (this.certificates && this.certificates.length > 0) {
      this.certificates.forEach((certificate) => {
        const certificateGroup = this.createCertificateGroup(true, certificate);
        this.certificateFormArray.push(certificateGroup);
      });
    } else {
      this.addCertificate();
    }
  }

  getLengthOfCertificateName(c: { name: string; description: string }): number {
    return c.name.length;
  }

  getLengthOfDescription(c: { name: string; description: string }): number {
    return c.description.length;
  }
  get certificateFormArray(): FormArray {
    return this.mainForm.get('certificates') as FormArray;
  }

  createCertificateGroup(
    disable: boolean,
    certificate?: CertificateForm,
  ): FormGroup {
    return this.fb.group({
      name: [certificate ? certificate.name : ''],
      description: [
        certificate
          ? certificate.description + '\n'
          : '**Beschreibung des Zertifikats:** \r\n\r\n**Empfohlene Schritte zur Vorbereitung:** Bspw. Buch, Onlinekurse etc. \r\n\r\n**Link zum Zertifikatsangebot:** \n',
      ],
      prerequisites: [
        certificate
          ? certificate.prerequisites
            ? certificate.prerequisites
            : []
          : [],
      ],
      followUps: [
        certificate ? (certificate.followUps ? certificate.followUps : []) : [],
      ],
      readonly: [disable],
    });
  }

  addCertificate(): void {
    this.certificateFormArray.push(this.createCertificateGroup(false));
  }

  removeCertificate(index: number): void {
    this.certificateFormArray.removeAt(index);
  }

  handleData(
    data: { id: number; name: string },
    index: number,
    text_: string,
  ): void {
    const control = this.certificateFormArray.at(index).get('description');
    if (control) {
      const text: string = control.value + text_ + data.name + '\n';
      this.certificateFormArray.at(index).get('description')?.setValue(text);
    }
  }

  handleRemovedData(name: string, index: number, text_: string): void {
    const control = this.certificateFormArray.at(index).get('description');
    if (control) {
      const text: string = text_ + name;
      const currentValue = control.value;
      let updatedText = currentValue.replace(text, '');
      updatedText = updatedText.replace(/(\n\s*){2,}/g, '\n\n');
      this.certificateFormArray
        .at(index)
        .get('description')
        ?.setValue(updatedText);
    }
  }

  protected readonly of = of;
}
