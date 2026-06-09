import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadarFiltersComponent } from './radar-filters.component';
import { Lifecycle } from 'src/app/models/technology';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Customer } from 'src/app/models/customer';
import { Project } from 'src/app/models/project';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RadarFiltersComponent', () => {
  let component: RadarFiltersComponent;
  let fixture: ComponentFixture<RadarFiltersComponent>;

  const mockCustomers: Customer[] = [
    { id: 1, name: 'Customer A' },
    { id: 2, name: 'Customer B' },
    { id: 3, name: 'Customer C' },
  ];

  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Project Alpha',
      customers: [mockCustomers[0]],
      technologyIds: [1],
      technologyNames: ['Tech1'],
      description: '',
      contact: [],
      info: '',
      industrySpecificInformation: '',
      startDate: '2024-01-01',
      salesServiceLink: '',
      endDate: '',
      industry: 'PSD - Public Sector & Defense',
    },
    {
      id: 2,
      name: 'Project Beta',
      customers: [mockCustomers[1]],
      technologyIds: [2],
      technologyNames: ['Tech2'],
      description: '',
      contact: [],
      info: '',
      industrySpecificInformation: '',
      startDate: '2024-02-01',
      salesServiceLink: '',
      endDate: '',
      industry: 'PSD - Public Sector & Defense',
    },
  ];

  const mockLifecycles: Lifecycle[] = [
    {
      id: 1,
      name: 'Adopt',
      description: 'Technologies we have high confidence in',
    },
    { id: 2, name: 'Trial', description: 'Technologies that are promising' },
    { id: 3, name: 'Assess', description: 'Technologies worth exploring' },
    {
      id: -5,
      name: 'Undefined',
      description: 'Technologies not yet assigned to a lifecycle',
    },
  ];

  const mockTags: string[] = ['Angular', 'TypeScript', 'Java', 'Spring'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RadarFiltersComponent],
      imports: [
        FormsModule,
        NoopAnimationsModule,
        MatSelectModule,
        MatOptionModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatRadioModule,
        MatCheckboxModule,
        HttpClientTestingModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(RadarFiltersComponent);
    component = fixture.componentInstance;

    // Set up basic inputs
    component.tags = [...mockTags];
    component.customers = [...mockCustomers];
    component.projects = [...mockProjects];
    component.lifecycles = [...mockLifecycles];
    component.filterState = {
      selectedTags: [],
      selectedCustomers: [],
      selectedProjects: [],
      selectedLifecycles: [],
      onlyPrio: false,
      selectedMostClickedOption: '',
    };

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty working copies by default', () => {
    expect(component.selectedTags_).toEqual([]);
    expect(component.selectedCustomers_).toEqual([]);
    expect(component.selectedProjects_).toEqual([]);
    expect(component.selectedLifecycles_).toEqual([]);
  });

  it('should have mostClickedOptions configured', () => {
    expect(component.mostClickedOptions.length).toBe(2);
    expect(component.mostClickedOptions[0]).toContain('Top 10');
    expect(component.mostClickedOptions[1]).toContain('Top 20');
  });

  it('should remove tag chip successfully', () => {
    component.selectedTags_ = ['Angular', 'TypeScript'];
    const originalLength = component.selectedTags_.length;

    component.removeTag('Angular');

    // Verify the tag was removed
    expect(component.selectedTags_.length).toBe(originalLength - 1);
    expect(component.selectedTags_).not.toContain('Angular');
    expect(component.selectedTags_).toContain('TypeScript');
  });

  it('should reset all filters correctly', () => {
    // Set some initial state
    component.selectedTags_ = ['Angular'];
    component.selectedCustomers_ = [mockCustomers[0]];
    component.filterState.onlyPrio = true;

    component.resetFilters();

    // Verify everything was reset
    expect(component.selectedTags_.length).toBe(0);
    expect(component.selectedCustomers_.length).toBe(0);
    expect(component.filterState.onlyPrio).toBe(false);
  });

  it('should handle priority toggle', () => {
    expect(component.filterState.onlyPrio).toBe(false);

    component.onPriorityToggle(true);
    expect(component.filterState.onlyPrio).toBe(true);

    component.onPriorityToggle(false);
    expect(component.filterState.onlyPrio).toBe(false);
  });

  it('should remove customer chips correctly', () => {
    component.selectedCustomers_ = [mockCustomers[0], mockCustomers[1]];

    component.removeCustomer(mockCustomers[0]);

    expect(component.selectedCustomers_.length).toBe(1);
    expect(component.selectedCustomers_).toContain(mockCustomers[1]);
    expect(component.selectedCustomers_).not.toContain(mockCustomers[0]);
  });

  it('should handle lifecycle selection correctly', () => {
    component.selectedLifecycles_ = [];

    // Add lifecycle
    component.addOrRemoveLifecycle(mockLifecycles[0]);
    expect(component.selectedLifecycles_.length).toBe(1);
    expect(component.isCheckedLifecycle(mockLifecycles[0])).toBe(true);

    // Remove same lifecycle
    component.addOrRemoveLifecycle(mockLifecycles[0]);
    expect(component.selectedLifecycles_.length).toBe(0);
    expect(component.isCheckedLifecycle(mockLifecycles[0])).toBe(false);
  });

  it('should check/uncheck all lifecycles correctly', () => {
    // Initially empty
    component.selectedLifecycles_ = [];
    expect(component.allLifecyclesSelected).toBe(false);

    // Check all (should only select filtered lifecycles, excluding Undefined)
    component.checkUncheckAllLifecycles();
    expect(component.selectedLifecycles_.length).toBe(
      component.filteredLifecycles.length,
    );
    expect(component.allLifecyclesSelected).toBe(true);

    // Uncheck all
    component.checkUncheckAllLifecycles();
    expect(component.selectedLifecycles_.length).toBe(0);
    expect(component.allLifecyclesSelected).toBe(false);
  });

  it('should handle radio button selection correctly', () => {
    const option = 'Top 10 am häufigsten angeklickten Technologien (gefiltert)';

    // Select option
    component.onMostClickedOptionToggle(option);
    expect(component.filterState.selectedMostClickedOption).toBe(option);

    // Deselect same option
    component.onMostClickedOptionToggle(option);
    expect(component.filterState.selectedMostClickedOption).toBe('');
  });

  it('should emit filter changes when selections are made', () => {
    spyOn(component.filtersChanged, 'emit');

    component.selectedTags_ = ['Angular'];
    component.selectedCustomers_ = [mockCustomers[0]];
    component.filterState.onlyPrio = true;

    component.emitFiltersChanged();

    expect(component.filtersChanged.emit).toHaveBeenCalled();
    const emittedState = (
      component.filtersChanged.emit as jasmine.Spy
    ).calls.mostRecent().args[0];
    expect(emittedState.selectedTags).toEqual(['Angular']);
    expect(emittedState.selectedCustomers).toEqual([mockCustomers[0]]);
    expect(emittedState.onlyPrio).toBe(true);
  });

  it('should filter out Undefined lifecycle from filteredLifecycles', () => {
    // Verify that all mock lifecycles are present including Undefined
    expect(component.lifecycles.length).toBe(4);
    expect(
      component.lifecycles.some(
        (lc) => lc.id === -5 && lc.name === 'Undefined',
      ),
    ).toBe(true);

    // Verify that filteredLifecycles excludes Undefined
    expect(component.filteredLifecycles.length).toBe(3);
    expect(component.filteredLifecycles.some((lc) => lc.id === -5)).toBe(false);
    expect(component.filteredLifecycles.every((lc) => lc.id !== -5)).toBe(true);
  });

  it('should work with lifecycle selection using filtered lifecycles', () => {
    // Verify that check all works with filtered lifecycles only
    component.selectedLifecycles_ = [];
    component.checkUncheckAllLifecycles();

    // Should select all filtered lifecycles (3) but not Undefined
    expect(component.selectedLifecycles_.length).toBe(3);
    expect(component.selectedLifecycles_.some((lc) => lc.id === -5)).toBe(
      false,
    );
    expect(component.allLifecyclesSelected).toBe(true);
  });
});
