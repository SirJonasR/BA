import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';

import { CustomerSearchbarComponent } from './customer-searchbar.component';
import { CustomerService } from 'src/app/services/customer.service';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { of } from 'rxjs';
import { Customer } from 'src/app/models/customer';
import { SimpleChanges } from '@angular/core';

describe('CustomerSearchbarComponent', () => {
  let component: CustomerSearchbarComponent;
  let fixture: ComponentFixture<CustomerSearchbarComponent>;
  let customerServiceSpy: jasmine.SpyObj<CustomerService>;

  beforeEach(waitForAsync(() => {
    const spy = jasmine.createSpyObj('CustomerService', ['getCustomers']);
    TestBed.configureTestingModule({
      declarations: [CustomerSearchbarComponent],
      imports: [ReactiveFormsModule, MatAutocompleteModule],
      providers: [{ provide: CustomerService, useValue: spy }],
    }).compileComponents();
    customerServiceSpy = TestBed.inject(
      CustomerService,
    ) as jasmine.SpyObj<CustomerService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSearchbarComponent);
    component = fixture.componentInstance;
    customerServiceSpy.getCustomers.and.returnValue(
      of([
        {
          id: 1,
          name: 'Customer',
        },
      ]),
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark control as touched and update validity when show Error input changes to true', () => {
    component.showError = true;
    component.control.markAsUntouched();
    spyOn(component.control, 'markAsTouched');
    spyOn(component.control, 'updateValueAndValidity');

    component.ngOnChanges({
      showError: { currentValue: true },
    } as unknown as SimpleChanges);

    expect(component.control.markAsTouched).toHaveBeenCalledWith({
      onlySelf: true,
    });
    expect(component.control.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should filter customers based on input value and selected items', () => {
    const customers: Customer[] = [
      {
        id: 1,
        name: 'Customer1',
      },
      {
        id: 2,
        name: 'Customer2',
      },
    ];
    component.customers = customers;
    component.selectedItems = [customers[0]];

    const filteredCustomers = component['_filter']('Customer');
    expect(filteredCustomers.length).toBe(1);
    expect(filteredCustomers[0].name).toBe('Customer2');
  });

  it('should initialize filteredCustomers with proper filtering logic', fakeAsync(() => {
    const customers: Customer[] = [
      {
        id: 1,
        name: 'Customer1',
      },
      {
        id: 2,
        name: 'Customer2',
      },
    ];
    component.ngOnInit();
    tick();
    component.customers = customers;
    component.selectedItems = [customers[0]];
    component.control.setValue('Customer1');
    fixture.detectChanges();
    tick();
    component.filteredCustomers.subscribe((filtered) => {
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Customer2');
    });
  }));

  it('should emit selected customer on selection from autocomplete', fakeAsync(() => {
    const selectedCustomers: Customer[] = [
      {
        id: 1,
        name: 'Customer',
      },
    ];
    const event: MatAutocompleteSelectedEvent = {
      option: { value: selectedCustomers },
    } as MatAutocompleteSelectedEvent;
    const emitSpy = spyOn(component.selectCustomer, 'emit');
    component.emit(event);
    tick();
    expect(emitSpy).toHaveBeenCalled();
  }));

  it('should add selected customer to selectedItems on selection from autocomplete', fakeAsync(() => {
    component.multipleSelect = true;
    const selectedCustomer: Customer = {
      id: 1,
      name: 'Customer',
    };
    component.customers.push(selectedCustomer);
    const event: MatAutocompleteSelectedEvent = {
      option: { value: selectedCustomer },
    } as MatAutocompleteSelectedEvent;
    component.emit(event);
    tick();
    expect(component.selectedItems).toContain(selectedCustomer);
  }));

  it('should remove item from selectedItems when removeItem is called', () => {
    const selectedCustomer: Customer = {
      id: 1,
      name: 'Customer',
    };
    component.selectedItems = [selectedCustomer];
    component.removeItem(selectedCustomer);
    expect(component.selectedItems.length).toBe(0);
  });

  it('should update validator when an item is added or removed', () => {
    const selectedCustomer: Customer = { id: 1, name: 'Customer' };
    component.selectedItems = [selectedCustomer];
    const controlValidatorSpy = spyOn(component.control, 'setValidators');
    component.removeItem(selectedCustomer);
    expect(controlValidatorSpy).toHaveBeenCalledOnceWith([
      jasmine.any(Function),
    ]);
  });

  it('should fetch customers from service on initialization', fakeAsync(() => {
    const customers: Customer[] = [
      {
        id: 1,
        name: 'Customer1',
      },
      {
        id: 1,
        name: 'Customer2',
      },
    ];
    customerServiceSpy.getCustomers.and.returnValue(of(customers));
    component.ngOnInit();
    tick();
    expect(component.customers).toEqual(customers);
  }));

  it('should initialize control with validators if validate input is true', () => {
    component.validate = true;
    component.ngOnInit();
    expect(component.control.validator).toBeTruthy();
  });

  it('should emit selected customer when emit method is called for single select mode', () => {
    component.multipleSelect = false;
    const selectedCustomer: Customer = {
      id: 1,
      name: 'Customer',
    };
    const event: MatAutocompleteSelectedEvent = {
      option: { value: selectedCustomer },
    } as MatAutocompleteSelectedEvent;
    const emitSpy = spyOn(component.selectCustomer, 'emit');
    component.multipleSelect = false;
    component.emit(event);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should clear the input control value after emitting a selection', () => {
    const selectedCustomer: Customer = {
      id: 1,
      name: 'Customer',
    };
    const event: MatAutocompleteSelectedEvent = {
      option: { value: selectedCustomer },
    } as MatAutocompleteSelectedEvent;
    spyOn(component.selectCustomer, 'emit');
    component.emit(event);
    expect(component.control.value).toBe('');
  });
});
