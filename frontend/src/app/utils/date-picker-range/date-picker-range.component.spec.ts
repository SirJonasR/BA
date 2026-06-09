import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DatePickerRangeComponent } from './date-picker-range.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DatePickerRangeComponent', () => {
  let component: DatePickerRangeComponent;
  let fixture: ComponentFixture<DatePickerRangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [DatePickerRangeComponent],
    });
    fixture = TestBed.createComponent(DatePickerRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit date range when both start and end dates are selected', fakeAsync(() => {
    const startDate = new Date('2022-01-01');
    const endDate = new Date('2022-01-10');

    const emitterSpy = spyOn(component.dateRangeSelected, 'emit');

    // Simulate selecting start date
    component.dateRangeForm.get('startDate')?.setValue(startDate);
    tick();

    // Simulate selecting end date
    component.dateRangeForm.get('endDate')?.setValue(endDate);
    tick();

    // Expectation
    expect(emitterSpy).toHaveBeenCalledWith({ startDate, endDate });
  }));

  it('should not emit date range when only start date is selected', fakeAsync(() => {
    const startDate = new Date('2022-01-01');

    const emitterSpy = spyOn(component.dateRangeSelected, 'emit');

    // Simulate selecting start date
    component.dateRangeForm.get('startDate')?.setValue(startDate);
    tick();

    // Expectation
    expect(emitterSpy).not.toHaveBeenCalled();
  }));

  it('should not emit date range when only end date is selected', fakeAsync(() => {
    const endDate = new Date('2022-01-10');

    const emitterSpy = spyOn(component.dateRangeSelected, 'emit');

    // Simulate selecting end date
    component.dateRangeForm.get('endDate')?.setValue(endDate);
    tick();

    // Expectation
    expect(emitterSpy).not.toHaveBeenCalled();
  }));

  it('should not emit date range when end date is before start date', fakeAsync(() => {
    const startDate = new Date('2022-01-10');
    const endDate = new Date('2022-01-01');

    const emitterSpy = spyOn(component.dateRangeSelected, 'emit');

    // Simulate selecting start date
    component.dateRangeForm.get('startDate')?.setValue(startDate);
    tick();

    // Simulate selecting end date
    component.dateRangeForm.get('endDate')?.setValue(endDate);
    tick();

    // Expectation
    expect(emitterSpy).not.toHaveBeenCalled();
  }));
});
