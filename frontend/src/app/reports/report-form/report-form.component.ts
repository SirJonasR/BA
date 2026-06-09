import { Component, OnInit } from '@angular/core';
import { Technology } from 'src/app/models/technology';
import { NgForm } from '@angular/forms';
import { ReportService } from 'src/app/services/report.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Customer } from 'src/app/models/customer';

interface Period {
  name: string;
  periodDetail: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.css'],
})
export class ReportFormComponent implements OnInit {
  constructor(
    private reportService: ReportService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit(): Promise<void> {
    const params = await firstValueFrom(this.route.queryParams);
    this.reportTyp = params['reportTyp'] || undefined; // Set reportTyp or undefined if not provided
  }
  isSubmitting = false;
  showError = false;
  reportTypList: string[] = ['Technologien'];
  reportTyp!: string;
  maxAllowedTechnologies = 30;
  errorText = '';

  selectedTechnologies: Technology[] = [];
  selectedCustomers: Customer[] = [];
  periodList: Period[] = [
    {
      name: 'Bis dato',
      periodDetail: `Gesamter Zeitraum`,
      startDate: undefined,
      endDate: undefined,
    },
    {
      name: 'Dieser Monat',
      periodDetail: `${this.getMonthName(new Date())} 01 - ${this.getMonthName(
        new Date(),
      )} ${new Date().getDate()}`,
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
    },
    {
      name: 'Letzter Monat',
      periodDetail: `${this.getMonthName(
        this.getLastMonthEndDate(),
      )} 01 - ${this.getMonthName(
        this.getLastMonthEndDate(),
      )} ${this.getLastMonthEndDate().getDate()}`,
      startDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 1,
        1,
      ),
      endDate: this.getLastMonthEndDate(),
    },
    {
      name: 'Letztes Quartal',
      periodDetail: `${this.getMonthName(
        this.getQuarterStartDate(),
      )} 01 - ${this.getMonthName(
        this.getLastQuarterEndDate(),
      )} ${this.getLastQuarterEndDate().getDate()}`,
      startDate: this.getQuarterStartDate(),
      endDate: this.getLastQuarterEndDate(),
    },
    {
      name: 'Dieses Jahr',
      periodDetail: `Jan 01 - ${this.getMonthName(
        new Date(),
      )} ${new Date().getDate()}, ${new Date().getFullYear()}`,
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(),
    },
    {
      name: 'Letztes Jahr',
      periodDetail: `Jan 01 - Dez 31, ${new Date().getFullYear() - 1}`,
      startDate: new Date(new Date().getFullYear() - 1, 0, 1),
      endDate: new Date(new Date().getFullYear() - 1, 11, 31),
    },
    {
      name: 'Benutzerdefiniert',
      periodDetail: '',
      startDate: undefined,
      endDate: undefined,
    },
  ];
  selectedPeriod: Period | undefined;

  // Hilfsmethode für die Monatsnamen
  getMonthName(date: Date): string {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mai',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Okt',
      'Nov',
      'Dez',
    ];
    return monthNames[date.getMonth()];
  }

  // Hilfsmethode für das letzte Datum des vorherigen Monats
  getLastMonthEndDate(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 0);
  }

  // Hilfsmethode für den Startdatum des letzten Quartals
  getQuarterStartDate(): Date {
    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3);
    return new Date(today.getFullYear(), quarter * 3 - 3, 1);
  }

  getLastQuarterEndDate(): Date {
    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3);
    const startFullQuarter = new Date(today.getFullYear(), quarter * 3 - 3, 1);
    return new Date(
      startFullQuarter.getFullYear(),
      startFullQuarter.getMonth() + 3,
      0,
    );
  }

  onDateRangeSelected(dateRange: { startDate: Date; endDate: Date }): void {
    if (this.selectedPeriod) {
      this.selectedPeriod.startDate = dateRange.startDate;
      this.selectedPeriod.endDate = dateRange.endDate;
    }
  }

  resetSelectedPeriod(): void {
    this.selectedPeriod = undefined; // Setzen Sie selectedPeriod zurück
  }

  async createReport(): Promise<void> {
    this.isSubmitting = true;
    this.showError = false;
    if (this.reportTyp === 'Technologien') {
      try {
        const technologyIds: number[] = [];
        for (const technology of this.selectedTechnologies) {
          technologyIds.push(technology.id);
        }
        const data = await firstValueFrom(
          this.reportService.createTechnologyDetailReport(
            technologyIds,
            this.selectedPeriod?.startDate,
            this.selectedPeriod?.endDate,
          ),
        );
        this.reportService.downloadPDF(data, 'technologyDetailReport.pdf');
        this.snackBar.open('Bericht erfolgreich erstellt', 'Schließen', {
          duration: 3000,
        });
      } catch (error) {
        this.isSubmitting = false;
        const e: HttpErrorResponse = error as HttpErrorResponse;
        if (e.status === 429) {
          const retryAfter = e.headers.get('Retry-After');
          this.errorText = `Zu viele Anfragen. Bitte versuche es ${
            retryAfter ? `in ${retryAfter} Sekunden` : 'später'
          } erneut.`;
        }
        this.showError = true;
        this.snackBar.open(
          `Beim Senden des Bug Reports ist ein Fehler aufgetreten`,
        );
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  createCustomerReport(): void {
    this.isSubmitting = true;
    if (this.reportTyp === 'Kunden') {
      const customerNames: string[] = [];

      for (const customer of this.selectedCustomers) {
        customerNames.push(customer.name);
      }

      this.reportService
        .createCustomerStatsReport(customerNames)
        .subscribe((data: Blob) => {
          this.reportService.downloadPDF(data, 'customerStatsReport.pdf');

          this.isSubmitting = false;
        });
    }
  }

  async onFormSubmit(form: NgForm): Promise<void> {
    this.showError = true;

    if (this.selectedCustomers.length > 0 && this.reportTyp === 'Kunden') {
      this.createCustomerReport();
    } else if (
      form.valid === true &&
      this.reportTyp === 'Technologien' &&
      this.selectedTechnologies.length > 0 &&
      this.selectedTechnologies.length <= this.maxAllowedTechnologies
    ) {
      await this.createReport();
    } else {
      if (this.selectedTechnologies.length > this.maxAllowedTechnologies) {
        this.snackBar.open(
          `Maximal ${this.maxAllowedTechnologies} Technologien dürfen ausgewählt werden.`,
          'Schließen',
          { duration: 5000 },
        );
      }
      return;
    }
  }
}
