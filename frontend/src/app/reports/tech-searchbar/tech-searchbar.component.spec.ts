import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TechSearchbarComponent } from './tech-searchbar.component';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Technology, TechnologyReference } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SimpleChange } from '@angular/core';

describe('TechSearchbarComponent', () => {
  let component: TechSearchbarComponent;
  let fixture: ComponentFixture<TechSearchbarComponent>;
  let technologyServiceSpy: jasmine.SpyObj<TechnologyService>;

  beforeEach(waitForAsync(() => {
    const spy = jasmine.createSpyObj('TechnologyService', ['getTechnologies']);
    TestBed.configureTestingModule({
      declarations: [TechSearchbarComponent],
      imports: [ReactiveFormsModule, MatAutocompleteModule],
      providers: [{ provide: TechnologyService, useValue: spy }],
    }).compileComponents();
    technologyServiceSpy = TestBed.inject(
      TechnologyService,
    ) as jasmine.SpyObj<TechnologyService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TechSearchbarComponent);
    component = fixture.componentInstance;
    // Mock the response of getTechnologies method
    technologyServiceSpy.getTechnologies.and.returnValue(
      of([
        {
          id: 1,
          name: 'Test Technology',
          description: '',
          shortDescription: '',
          pictureId: null,
          categoryId: 1,
          lifecycleId: 1,
          status: 1,
          jumpDate: '',
          tags: [],
          projects: [],
          viewCount: 0,
          priority: false,
          connectedTechnologyIds: [],
          connectedTechnologyNames: [],
          certificates: [],
        },
      ]),
    ); // or any other value you expect
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark control as touched and update validity when showError input changes to true', () => {
    component.showError = true;
    component.control.markAsUntouched(); // Ensure control is initially untouched
    spyOn(component.control, 'markAsTouched');
    spyOn(component.control, 'updateValueAndValidity');

    component.ngOnChanges({
      showError: { currentValue: true } as SimpleChange,
    });

    expect(component.control.markAsTouched).toHaveBeenCalledWith({
      onlySelf: true,
    });
    expect(component.control.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should filter technologies based on input value and selected items', () => {
    const technologies: Technology[] = [
      {
        id: 1,
        name: 'Tech1',
        description: '',
        shortDescription: '',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        status: 1,
        jumpDate: '',
        tags: [],
        projects: [],
        viewCount: 0,
        priority: false,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
      {
        id: 2,
        name: 'Tech2',
        description: '',
        shortDescription: '',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        status: 1,
        jumpDate: '',
        tags: [],
        projects: [],
        viewCount: 0,
        priority: false,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ];
    component.technologies = technologies;
    component.selectedItems = [technologies[0]]; // Assume Tech1 is already selected

    const filteredTechnologies = component['_filter']('Tech');

    expect(filteredTechnologies.length).toBe(1); // Only Tech2 should be filtered
    expect(filteredTechnologies[0].name).toBe('Tech2');
  });

  it('should initialize filteredTechnologies with proper filtering logic', fakeAsync(() => {
    const technologies: Technology[] = [
      {
        id: 1,
        name: 'Tech1',
        description: '',
        shortDescription: '',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        status: 1,
        jumpDate: '',
        tags: [],
        projects: [],
        viewCount: 0,
        priority: false,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
      {
        id: 2,
        name: 'Tech2',
        description: '',
        shortDescription: '',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        status: 1,
        jumpDate: '',
        tags: [],
        projects: [],
        viewCount: 0,
        priority: false,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ];

    // WICHTIG: Mock und Daten VOR ngOnInit() setzen
    technologyServiceSpy.getTechnologies.and.returnValue(of(technologies));
    component.selectedItems = [technologies[0]]; // Tech1 ist bereits ausgewählt

    // Jetzt ngOnInit aufrufen - die Observable wird mit den richtigen Daten erstellt
    component.ngOnInit();
    tick();

    // Setze Wert für Filterung
    component.control.setValue('Tech');
    tick();

    // Sammle das Ergebnis
    let result: TechnologyReference[] = [];
    component.filteredTechnologies.subscribe((filtered) => {
      result = filtered;
    });

    tick();

    // Nur Tech2 sollte gefiltert werden (Tech1 ist bereits ausgewählt)
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Tech2');
  }));

  it('should emit selected technology on selection from autocomplete', fakeAsync(() => {
    const selectedTechnology: Technology = {
      id: 1,
      name: 'Test Technology',
      description: '',
      shortDescription: '',
      pictureId: null,
      categoryId: 1,
      lifecycleId: 1,
      status: 1,
      jumpDate: '',
      tags: [],
      projects: [],
      viewCount: 0,
      priority: false,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };
    const event: MatAutocompleteSelectedEvent = {
      option: { value: selectedTechnology },
    } as MatAutocompleteSelectedEvent;
    const emitSpy = spyOn(component.selectTechnology, 'emit');

    component.emit(event);
    tick();

    expect(emitSpy).toHaveBeenCalled();
  }));

  it('should add selected technology to selectedItems on selection from autocomplete', fakeAsync(() => {
    component.multipleSelect = true;
    const selectedTechnology: Technology = {
      id: 1,
      name: 'Test Technology',
      description: '',
      shortDescription: '',
      pictureId: null,
      categoryId: 1,
      lifecycleId: 1,
      status: 1,
      jumpDate: '',
      tags: [],
      projects: [],
      viewCount: 0,
      priority: false,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };
    component.technologies.push(selectedTechnology);

    const event: MatAutocompleteSelectedEvent = {
      option: { value: selectedTechnology },
    } as MatAutocompleteSelectedEvent;

    component.emit(event);
    tick();

    expect(component.selectedItems).toContain(selectedTechnology);
  }));

  it('should remove item from selectedItems when removeItem is called', () => {
    const selectedTechnology: Technology = {
      id: 1,
      name: 'Test Technology',
      description: '',
      shortDescription: '',
      pictureId: null,
      categoryId: 1,
      lifecycleId: 1,
      status: 1,
      jumpDate: '',
      tags: [],
      projects: [],
      viewCount: 0,
      priority: false,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };
    component.selectedItems = [selectedTechnology];

    component.removeItem(selectedTechnology);

    expect(component.selectedItems.length).toBe(0);
  });

  it('should update validators when an item is added or removed', () => {
    const selectedTechnology: Technology = {
      id: 1,
      name: 'Test Technology',
      description: '',
      shortDescription: '',
      pictureId: null,
      categoryId: 1,
      lifecycleId: 1,
      status: 1,
      jumpDate: '',
      tags: [],
      projects: [],
      viewCount: 0,
      priority: false,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };
    component.selectedItems = [selectedTechnology];
    const controlValidatorSpy = spyOn(component.control, 'setValidators');

    component.removeItem(selectedTechnology);

    expect(controlValidatorSpy).toHaveBeenCalledOnceWith([
      jasmine.any(Function),
    ]);
  });

  it('should fetch technologies from service on initialization', fakeAsync(() => {
    const technologies: Technology[] = [
      {
        id: 1,
        name: 'Tech1',
        description: '',
        shortDescription: '',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        status: 1,
        priority: false,
        jumpDate: '',
        tags: [],
        projects: [],
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
      {
        id: 2,
        name: 'Tech2',
        description: '',
        shortDescription: '',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        status: 1,
        priority: false,
        jumpDate: '',
        tags: [],
        projects: [],
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ];
    technologyServiceSpy.getTechnologies.and.returnValue(of(technologies));

    component.ngOnInit();
    tick();

    expect(component.technologies).toEqual(technologies);
  }));

  it('should initialize control with validators if validate input is true', () => {
    component.validate = true;
    component.ngOnInit();
    expect(component.control.validator).toBeTruthy();
  });

  it('should emit selected technology when emit method is called for single select mode', () => {
    component.multipleSelect = false;
    const selectedTechnology: Technology = {
      id: 1,
      name: 'Test Technology',
      description: '',
      shortDescription: '',
      pictureId: null,
      categoryId: 1,
      lifecycleId: 1,
      status: 1,
      priority: false,
      jumpDate: '',
      tags: [],
      projects: [],
      viewCount: 0,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };
    const event: MatAutocompleteSelectedEvent = {
      option: { value: selectedTechnology },
    } as MatAutocompleteSelectedEvent;
    const emitSpy = spyOn(component.selectTechnology, 'emit');

    component.multipleSelect = false;
    component.emit(event);

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should clear the input control value after emitting a selection', () => {
    const selectedTechnology: Technology = {
      id: 1,
      name: 'Test Technology',
      description: '',
      shortDescription: '',
      pictureId: null,
      categoryId: 1,
      lifecycleId: 1,
      status: 1,
      jumpDate: '',
      priority: false,
      tags: [],
      projects: [],
      viewCount: 0,
      connectedTechnologyIds: [],
      connectedTechnologyNames: [],
      certificates: [],
    };
    const event: MatAutocompleteSelectedEvent = {
      option: { value: selectedTechnology },
    } as MatAutocompleteSelectedEvent;
    spyOn(component.selectTechnology, 'emit');
    component.emit(event);

    expect(component.control.value).toBe('');
  });
});
