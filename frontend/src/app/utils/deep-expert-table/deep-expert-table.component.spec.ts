import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeepExpertTableComponent } from './deep-expert-table.component';

describe('DeepExpertTableComponent', () => {
  let component: DeepExpertTableComponent;
  let fixture: ComponentFixture<DeepExpertTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeepExpertTableComponent],
    });
    fixture = TestBed.createComponent(DeepExpertTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
