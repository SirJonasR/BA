import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Certificate } from 'src/app/models/technology';
import { firstValueFrom, map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { CertificateService } from 'src/app/services/certificate.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-certificate-searchfield',
  templateUrl: './certificate-searchfield.component.html',
  styleUrls: ['./certificate-searchfield.component.css'],
})
export class CertificateSearchfieldComponent implements OnInit, OnChanges {
  @Output() selectedCertificatesOutput: EventEmitter<{
    id: number;
    name: string;
  }> = new EventEmitter<{ id: number; name: string }>();
  @Output() removedCertificate: EventEmitter<string> =
    new EventEmitter<string>();
  @Output() value = new EventEmitter<string>();
  @Input() selectedCertificateIds: number[] = [];
  allCertificates: Certificate[] = [];
  filteredCertificates!: Observable<Certificate[]>;
  control = new FormControl<string | Certificate>('', []);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showError'] && changes['showError'].currentValue) {
      this.control.markAsTouched({ onlySelf: true });
      this.control.updateValueAndValidity();
    }
  }

  constructor(private certificateService: CertificateService) {}

  async ngOnInit(): Promise<void> {
    this.allCertificates = await firstValueFrom(
      this.certificateService.getCertificates(),
    );
    this.filteredCertificates = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this.filter(name as string)
          : this.allCertificates.filter(
              (certificate) =>
                !this.selectedCertificateIds.some(
                  (selected) => selected === certificate.id,
                ),
            );
      }),
    );
  }

  async emit(e: MatAutocompleteSelectedEvent): Promise<void> {
    this.selectedCertificateIds.push(e.option.value.id);
    this.selectedCertificatesOutput.emit({
      id: e.option.value.id,
      name: e.option.value.name,
    });
    this.control.setValue('');
    this.value.emit('');
  }

  filter(name: string): Certificate[] {
    this.value.emit(name);
    const filterValue: string = name.toLowerCase();
    return this.allCertificates.filter(
      (certificate) =>
        certificate.name.toLowerCase().includes(filterValue) &&
        !this.selectedCertificateIds.includes(certificate.id),
    );
  }

  displayCertificate(certificate: Certificate): string {
    return certificate.name;
  }

  removeItem(certificate: Certificate): void {
    const index = this.selectedCertificateIds.indexOf(certificate.id);
    this.selectedCertificateIds.splice(index, 1);
    this.control.updateValueAndValidity();
    this.removedCertificate.emit(certificate.name);
  }

  get selectedCertificates(): Certificate[] {
    const selectedCertificates: Certificate[] = [];
    if (this.selectedCertificateIds) {
      for (const id of this.selectedCertificateIds) {
        selectedCertificates.push(
          ...this.allCertificates.filter(
            (certificate) => certificate.id === id,
          ),
        );
      }
    }
    return selectedCertificates;
  }
}
