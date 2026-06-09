import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentCharactersCounterComponent } from './current-characters-counter.component';

describe('CurrentCharactersCounterComponent', () => {
  let component: CurrentCharactersCounterComponent;
  let fixture: ComponentFixture<CurrentCharactersCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentCharactersCounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentCharactersCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
