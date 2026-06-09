import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CustomerService } from 'src/app/services/customer.service';
import { firstValueFrom, map, Observable, startWith } from 'rxjs';
import { Router } from '@angular/router';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Customer } from 'src/app/models/customer';

export function lengthValidator(length: number): ValidatorFn {
  return (): ValidationErrors | null => {
    const isValidLength = length >= 1;
    return isValidLength
      ? null
      : {
          customError: `Bitte wähle mindestens einen Kunden aus.`,
        };
  };
}

@Component({
  selector: 'app-customer-searchbar',
  templateUrl: './customer-searchbar.component.html',
  styleUrls: ['./customer-searchbar.component.css'],
})
export class CustomerSearchbarComponent implements OnInit, OnChanges {
  // @ViewChild('searchbox') inputSearchbox: any;
  @Output() selectCustomer: EventEmitter<void> = new EventEmitter<void>();
  @Input() searchFieldPlaceholder = 'Suche ein Kunden ...';
  @Input() showError = false;
  @Input() validate = false;
  @Input() multipleSelect = false;
  @Input() selectedItems: Customer[] = [];
  control = new FormControl<string | Customer>('', []);

  customers: Customer[] = [];
  filteredCustomers!: Observable<Customer[]>;

  constructor(
    private customerService: CustomerService,
    private router: Router,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showError'] && changes['showError'].currentValue) {
      this.control.markAsTouched({ onlySelf: true });
      this.control.updateValueAndValidity();
    }
  }

  async ngOnInit(): Promise<void> {
    if (this.validate) {
      this.control = new FormControl<string | Customer>('', [
        lengthValidator(this.selectedItems.length),
      ]);
    }

    this.customers = await firstValueFrom(this.customerService.getCustomers());

    this.filteredCustomers = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string)
          : this.customers.filter(
              (customer) => !this.selectedItems.includes(customer),
            );
      }),
    );
    this.router.routeReuseStrategy.shouldReuseRoute = function (): boolean {
      return false;
    };
  }

  private _filter(name: string): Customer[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(filterValue) &&
        !this.selectedItems.includes(customer),
    );
  }

  async emit(e: MatAutocompleteSelectedEvent): Promise<void> {
    if (this.multipleSelect) {
      this.selectedItems.push(e.option.value);
    }
    if (this.validate) {
      this.control.setValidators([lengthValidator(this.selectedItems.length)]);
    }
    this.selectCustomer.emit(e.option.value);
    this.control.setValue('');

    this.control.updateValueAndValidity();
  }

  displayCustomer(customer: Customer): string {
    return customer.name;
  }

  removeItem(item: Customer): void {
    const index = this.selectedItems.indexOf(item);
    this.selectedItems.splice(index, 1);
    this.control.setValidators([lengthValidator(this.selectedItems.length)]);
    this.control.updateValueAndValidity();
  }
}
