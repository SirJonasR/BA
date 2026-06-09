import { Component, OnInit } from '@angular/core';

import * as Papa from 'papaparse';
import {
  DeepExpertListItem,
  DeepExpertService,
} from 'src/app/services/deep-expert.service';

@Component({
  selector: 'app-deep-expert-management',
  templateUrl: './deep-expert-management.component.html',
  styleUrls: ['./deep-expert-management.component.scss'],
})
export class DeepExpertManagementComponent implements OnInit {
  public static readonly MESSAGES = {
    USAGE_INSTRUCTION_PRE_LINK:
      'Um die TecUniverse Deep Expert Liste herunterzuladen, klicke',
    USAGE_INSTRUCTION_POST_LINK:
      ". Wähle oben im Menü 'Export' und dann 'Export to CSV' aus. Diese kannst du dann auf der Schaltfläche rechts oben hochladen.",
    USAGE_INSTRICTION_LINK_TEXT: ' hier ',
    USAGE_INSTRUCTION_LINK_URL:
      'https://atos365.sharepoint.com/:l:/r/sites/teamstecswapamsad_migrated/Lists/Deep%20Experts1?e=E7RZEE',
    SUCCESSFULLY_IMPORTED:
      'Die Liste wurde erfolgreich importiert. Mit Klick auf "Speichern" wird sie im Backend aktualisiert. Bedenke dass die entsprechende Feature Flag aktiviert sein muss, damit die Einträge im Frontend angezeigt werden.',
    SUCCESSFULLY_SAVED: 'Die Liste wurde erfolgreich aktualisiert.',
    ERROR_NOT_CSV_FILETYPE: 'Bitte wähle eine Datei vom Typ CSV aus.',
    ERROR_NO_ROWS_FOUND_IN_FILE:
      'In dieser CSV-Datei wurden leider keine Zeilen gefunden. Bitte wähle eine gültige Datei aus.',
    ERROR_HEADERS_MISSING_IN_FILE: (missing_headers: string[]): string =>
      'Die folgenden Spalten konnten in der Datei nicht gefunden werden: ' +
      missing_headers.join(', ') +
      '. Dieser Fehler könnte auftreten, weil die Spaltenüberschriften der Deep Expert Tabelle geändert wurden. Du kannst die Spaltennamen manuell anpassen, indem du die CSV-Datei öffnest und die Spaltenüberschriften entsprechend änderst.',
    ERROR_CANNOT_READ_HEADERS:
      'Die Spaltenüberschriften konnten nicht aus der CSV-Datei gelesen werden.',
    ERROR_WHILE_SAVING_LIST: 'Das Speichern der Liste ist fehlgeschlagen.',
    ERROR_DURING_FILE_PROCESSING: 'Die Datei konnte nicht verarbeitet werden.',
  };
  readonly messages = DeepExpertManagementComponent.MESSAGES;

  public static readonly CSV_HEADER_MAPPING = {
    technologyName: 'Technologie / Thema',
    expertInformation: 'Deep Expert',
    scope: 'Eingrenzung',
    description: 'Beschreibung',
    comment: 'Kommentar / Hinweise',
  };

  resetState(): void {
    this.isLoading = false;
    this.error = null;
    this.success = null;
    this.expertList = [];
  }
  constructor(private expertService: DeepExpertService) {}
  isLoading = false;
  error: null | string = null;
  success: null | string = null;
  expertList: DeepExpertListItem[] = [];

  ngOnInit(): void {
    this.expertService.getDeepExpertList().subscribe({
      next: (results) => {
        this.expertList = results;
      },
      error: (error) => {
        console.error('Error fetching expert list:', error);
      },
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    this.resetState();
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      try {
        const data = await this.readCsvFile(file);
        if (data.length === 0) {
          this.error = this.messages.ERROR_NO_ROWS_FOUND_IN_FILE;
          return;
        }
        this.expertList = data;
        this.success = this.messages.SUCCESSFULLY_IMPORTED;
      } catch (err) {
        this.error = (err as Error).message;
      }
    } else if (file) {
      this.error = this.messages.ERROR_NOT_CSV_FILETYPE;
    }
    input.value = ''; // Reset the file input
  }
  private async readCsvFile(file: File): Promise<DeepExpertListItem[]> {
    return new Promise((resolve, reject) => {
      const requiredHeaders = Object.values(
        DeepExpertManagementComponent.CSV_HEADER_MAPPING,
      );
      const headerMap = DeepExpertManagementComponent.CSV_HEADER_MAPPING;
      Papa.parse<{ [key: string]: string }>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const fileHeaders = result.meta.fields;

          if (!fileHeaders) {
            return reject(new Error(this.messages.ERROR_CANNOT_READ_HEADERS));
          }

          const missingHeaders = requiredHeaders.filter(
            (h) => !fileHeaders.includes(h),
          );

          if (missingHeaders.length > 0) {
            return reject(
              new Error(
                this.messages.ERROR_HEADERS_MISSING_IN_FILE(missingHeaders),
              ),
            );
          }
          const mapped: DeepExpertListItem[] = (
            result.data as { [key: string]: string }[]
          ).map((row, index) => ({
            tableRow: index,
            technologyName: row[headerMap.technologyName] ?? '',
            expertInformation: row[headerMap.expertInformation] ?? '',
            scope: row[headerMap.scope] ?? '',
            description: row[headerMap.description] ?? '',
            comment: row[headerMap.comment] ?? '',
          }));
          resolve(mapped);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }
  saveExperts(): void {
    this.isLoading = true;
    this.expertService.updateDeepExpertList(this.expertList).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = this.messages.SUCCESSFULLY_SAVED;
        this.expertList = [];
      },
      error: (_err) => {
        this.isLoading = false;
        this.error = this.messages.ERROR_WHILE_SAVING_LIST;
      },
    });
  }
}
