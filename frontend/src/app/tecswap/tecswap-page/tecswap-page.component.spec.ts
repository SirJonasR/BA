import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { TecswapPageComponent } from './tecswap-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of } from 'rxjs';
import { MatOption } from '@angular/material/core';
import { QueryList } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  CommentDialogAction,
  CommentDialogComponent,
} from '../comment-dialog/comment-dialog.component';
import { TechnologyService } from 'src/app/services/technology.service';
import { TecSwapService } from 'src/app/services/tec-swap-element.service';
import {
  Category,
  Lifecycle,
  Technology,
  TecSwapElement,
} from 'src/app/models/technology';

describe('TecswapPageComponent', () => {
  let component: TecswapPageComponent;
  let fixture: ComponentFixture<TecswapPageComponent>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockTecSwapService: jasmine.SpyObj<TecSwapService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockTecSwapElements: TecSwapElement[] = [
    {
      id: 1,
      technologyId: 101,
      tecSwap: 'Frontend',
      isCompleted: false,
      editDate: null,
      technologyName: 'Angular',
      technologyLifecycleId: 1,
      technologyCategoryId: 2,
      technologyIsPriority: false,
    },
    {
      id: 2,
      technologyId: 201,
      tecSwap: 'Frontend',
      isCompleted: false,
      editDate: null,
      technologyName: 'TypeScript',
      technologyLifecycleId: 1,
      technologyCategoryId: 2,
      technologyIsPriority: false,
    },
  ];

  const mockTechnology: Technology = {
    id: 101,
    name: 'Angular',
    description: 'desc',
    shortDescription: 'shortdesc',
    pictureId: 0,
    categoryId: 0,
    lifecycleId: 0,
    priority: false,
    tags: ['1', '2', '3', '4', '5'],
    projects: [],
    status: 1,
    jumpDate: '2023-08-20',
    viewCount: 0,
    connectedTechnologyIds: [],
    connectedTechnologyNames: [],
    certificates: [],
  };

  beforeEach(() => {
    mockDialog = jasmine.createSpyObj('Dialog', ['open']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockTechnologyService = jasmine.createSpyObj(
      'TechnologyService',
      ['getTechnology', 'updateTechnology'],
      {
        categories: [{ id: 1 } as Category],
        lifecycles: [{ id: 1 } as Lifecycle],
      },
    );
    mockTecSwapService = jasmine.createSpyObj('TecSwapService', [
      'getAll',
      'update',
    ]);
    TestBed.configureTestingModule({
      declarations: [TecswapPageComponent],
      providers: [
        { provide: TechnologyService, useValue: mockTechnologyService },
        { provide: TecSwapService, useValue: mockTecSwapService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog },
      ],
      imports: [
        HttpClientTestingModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        MatChipsModule,
        MatSidenavModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatButtonModule,
        MatTooltipModule,
        BrowserAnimationsModule,
      ],
    });

    const mockDialogRef = jasmine.createSpyObj<
      MatDialogRef<CommentDialogComponent>
    >('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(
      of({ action: CommentDialogAction.SAVE_WITHOUT_COMMENT }),
    );
    mockDialog.open.and.returnValue(mockDialogRef);

    fixture = TestBed.createComponent(TecswapPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch tecSwaps and populate dataSource on init', () => {
    mockTecSwapService.getAll.and.returnValue(of(mockTecSwapElements));
    component.ngOnInit();
    expect(mockTecSwapService.getAll).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(2);
    expect(component.tecSwaps[0].technologyName).toBe('Angular');
  });

  it('should mark tecSwap as changed on onTecSwapChange()', () => {
    const tecSwap = mockTecSwapElements[0];
    component.onTecSwapChange(tecSwap);
    expect(component.changeMap.get(tecSwap.id)?.tecSwapChange).toBeTrue();
  });

  it('should mark tecSwap as changed onTechnologyChange()', () => {
    const tecSwap = mockTecSwapElements[0];
    component.onTechnologyChange(tecSwap);
    expect(component.changeMap.get(tecSwap.id)?.technologyChange).toBeTrue();
  });

  it('should show confirm button', () => {
    component.oldTecSwaps = mockTecSwapElements;
    component.tecSwaps = mockTecSwapElements;
    const tecSwap = JSON.parse(JSON.stringify(mockTecSwapElements[0]));
    expect(component.shouldConfirmButton(tecSwap)).toBeFalse();
    tecSwap.technologyLifecycleId = -5;
    expect(component.shouldConfirmButton(tecSwap)).toBeFalse();
    component.onTechnologyChange(tecSwap);
    tecSwap.tecSwap = 'Noch nicht zugeordnet';
    expect(component.shouldConfirmButton(tecSwap)).toBeFalse();
    tecSwap.tecSwap = 'Frontend';
    component.onTecSwapChange(tecSwap);
    expect(component.changeMap.get(tecSwap.id)?.tecSwapChange).toBeTrue();
    expect(component.changeMap.get(tecSwap.id)?.technologyChange).toBeTrue();
    expect(component.shouldConfirmButton(tecSwap)).toBeTrue();
  });

  it('should update editDate on completed change to true', () => {
    const tecSwap = { ...mockTecSwapElements[0], isCompleted: true };
    component.onCompletedChange(tecSwap);
    expect(tecSwap.editDate).toBeTruthy();
  });

  it('should return true for shouldConfirmButton if changes exist', () => {
    const tecSwap = mockTecSwapElements[0];
    component.changeMap.set(tecSwap.id, {
      tecSwapChange: true,
      technologyChange: false,
    });
    expect(component.shouldConfirmButton(tecSwap)).toBeTrue();
  });

  it('should call update on confirmChanges', fakeAsync(() => {
    const tecSwap = mockTecSwapElements[0];
    component.changeMap.set(tecSwap.id, {
      technologyChange: true,
      tecSwapChange: true,
    });
    mockTechnologyService.getTechnology.and.returnValue(of(mockTechnology));
    mockTechnologyService.updateTechnology.and.returnValue(of(mockTechnology));
    mockTecSwapService.update.and.returnValue(of(mockTecSwapElements[0]));
    mockTecSwapService.getAll.and.returnValue(of(mockTecSwapElements));

    component.confirmChanges(tecSwap);
    tick();

    expect(mockTechnologyService.getTechnology).toHaveBeenCalled();
    expect(mockTechnologyService.updateTechnology).toHaveBeenCalled();
    expect(mockTecSwapService.update).toHaveBeenCalledWith(tecSwap.id, tecSwap);
  }));

  it('should reset all filters', () => {
    component.selectedTecSwaps = ['Noch nicht zugeordnet'];
    component.selectedLifecycles = [{ id: 1, name: 'Test' } as Lifecycle];
    component.selectedCategories = [{ id: 1, name: 'Cat' } as Category];
    component.onlyUncompleted = true;

    component.resetFilter();

    expect(component.selectedTecSwaps.length).toBe(0);
    expect(component.selectedLifecycles.length).toBe(0);
    expect(component.selectedCategories.length).toBe(0);
    expect(component.onlyUncompleted).toBeFalse();
  });

  it('should filter correctly with onlyUncompleted on', () => {
    const completedTecSwap: TecSwapElement = {
      ...mockTecSwapElements[0],
      isCompleted: true,
    } as TecSwapElement;
    const uncompletedTecSwap: TecSwapElement = {
      ...mockTecSwapElements[0],
      id: 2,
      isCompleted: false,
    };

    component.onlyUncompleted = true;
    component.selectedTecSwaps = ['Frontend'];
    component.selectedCategories = [{ id: 2 } as Category];
    component.selectedLifecycles = [{ id: 1 } as Lifecycle];
    component.tecSwaps = [completedTecSwap, uncompletedTecSwap];

    component.startFilter();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].id).toBe(2);

    component.selectedLifecycles = [];
    component.selectedCategories = [];
    component.selectedTecSwaps = [];
    component.onlyUncompleted = false;
    component.startFilter();
    expect(component.dataSource.data.length).toBe(2);
  });

  it('should test if get lifecycle and categories work', () => {
    expect(component.lifecycles.length).toBe(1);
    expect(component.categories.length).toBe(1);
  });

  it('should test if remove chip works', () => {
    const mockOption = {
      id: '1',
      deselect: jasmine.createSpy('deselect'),
    } as unknown as MatOption;
    component.options = [mockOption] as unknown as QueryList<MatOption>;
    component.removeChip('1');
    expect(mockOption.deselect).toHaveBeenCalled();
  });
  it('should filter tecswap elements by technology name', () => {
    component.tecSwaps = [
      {
        id: 1,
        technologyId: 101,
        tecSwap: 'Frontend',
        isCompleted: false,
        editDate: null,
        technologyName: 'Angular',
        technologyLifecycleId: 1,
        technologyCategoryId: 2,
        technologyIsPriority: false,
      },
      {
        id: 2,
        technologyId: 201,
        tecSwap: 'Backend',
        isCompleted: false,
        editDate: null,
        technologyName: 'Spring Boot',
        technologyLifecycleId: 1,
        technologyCategoryId: 2,
        technologyIsPriority: false,
      },
    ];

    component.searchText = 'ang';
    component.startFilter();

    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].technologyName).toBe('Angular');
  });

  it('should toggle search visibility for tecswap', () => {
    expect(component.isSearchVisible).toBeFalse();
    component.toggleSearch();
    expect(component.isSearchVisible).toBeTrue();
    component.toggleSearch();
    expect(component.isSearchVisible).toBeFalse();
  });
});
