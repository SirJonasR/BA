import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  ItemValues,
  SubscriptionFormComponent,
} from './subscription-form.component';
import { UserSubscriptionService } from 'src/app/services/user-subscription.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TechnologyService } from 'src/app/services/technology.service';
import { FormsModule } from '@angular/forms';
import { Lifecycle } from 'src/app/models/technology';
import { technologiesMock } from 'src/app/utils/mock-objekts/technologies.mock';
import { of } from 'rxjs';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { MatSelectChange } from '@angular/material/select';
import { SubscriptionItemType } from 'src/app/models/subscription';

describe('SubscriptionFormComponent', () => {
  let component: SubscriptionFormComponent;
  let fixture: ComponentFixture<SubscriptionFormComponent>;

  beforeEach(async () => {
    const userSubscriptionServiceSpyObj = jasmine.createSpyObj(
      'UserSubscriptionService',
      ['updateSubscription', 'getSubscriptionById'],
    );
    const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);
    const technologyServiceSbyObj = jasmine.createSpyObj('TechnologyService', [
      'getCategoryById',
      'getLifecycleById',
      'getTechnology',
    ]);
    const userHandlingServiceSpyObj = jasmine.createSpyObj(
      'UserHandlingService',
      ['getUserEmail'],
    );
    TestBed.configureTestingModule({
      declarations: [SubscriptionFormComponent],
      providers: [
        {
          provide: UserSubscriptionService,
          useValue: userSubscriptionServiceSpyObj,
        },
        { provide: MatSnackBar, useValue: snackBarSpyObj },
        { provide: TechnologyService, useValue: technologyServiceSbyObj },
        { provide: UserHandlingService, useValue: userHandlingServiceSpyObj },
      ],
      imports: [FormsModule],
    });
    fixture = TestBed.createComponent(SubscriptionFormComponent);
    component = fixture.componentInstance;

    technologyServiceSbyObj.getTechnology.and.returnValue(
      of(technologiesMock[0]),
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should alert when no selected Items', () => {
    const alertSpy = spyOn(window, 'alert');
    component.values = {
      name: 'Test',
      email: 'Test@test.de',
      timespan: 30,
      selectedItems: [],
    };
    component.onFormSubmit();
    expect(alertSpy).toHaveBeenCalledWith(
      'Mindestens ein Element, dass abonniert werden soll, muss ausgewählt sein!',
    );
  });

  it('should not emit submitForm event if form is invalid', () => {
    const submitSpy = spyOn(component.submitForm, 'emit');
    component.values = {
      name: 'Test',
      email: 'Test@test.de',
      timespan: 30,
      selectedItems: [],
    };
    component.onFormSubmit();
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should emit submitForm event if form is valid', () => {
    spyOn(component.submitForm, 'emit');
    component.values = {
      name: 'Test',
      email: 'Test@test.de',
      timespan: 30,
      selectedItems: [
        {
          type: SubscriptionItemType.LIFECYCLE,
          values: 1 as unknown as Lifecycle,
        },
      ],
    };
    component.onFormSubmit();
    expect(component.submitForm.emit).toHaveBeenCalled();
  });

  it('should remove item', () => {
    const item: ItemValues = {
      type: SubscriptionItemType.LIFECYCLE,
      values: 1 as unknown as Lifecycle,
    };
    component.values = {
      name: 'Test',
      email: 'Test@test.de',
      timespan: 30,
      selectedItems: [item],
    };
    expect(component.values.selectedItems.length).toBe(1);
    component.removeItem(item as ItemValues);
    expect(component.values.selectedItems.length).toBe(0);
  });

  it('should select category', () => {
    component.values = {
      name: 'Test',
      email: 'Test@test.de',
      timespan: 30,
      selectedItems: [],
    };
    component.onSelectCategory(-1 as unknown as MatSelectChange);
    expect(component.values.selectedItems.length).toBe(1);
  });

  it('should select lifecycle', () => {
    component.values = {
      name: 'Test',
      email: 'Test@test.de',
      timespan: 30,
      selectedItems: [],
    };
    component.onSelectLifecycle(-1 as unknown as MatSelectChange);
    expect(component.values.selectedItems.length).toBe(1);
  });

  it('should select technology', fakeAsync(() => {
    component.values = {
      name: 'Test',
      email: 'Test@test.de',
      timespan: 30,
      selectedItems: [],
    };

    component.onSelect(-1);
    tick();
    expect(component.values.selectedItems.length).toBe(1);
  }));
});
