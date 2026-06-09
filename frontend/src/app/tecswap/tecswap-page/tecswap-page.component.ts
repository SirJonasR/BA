import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  QueryList,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatOption } from '@angular/material/core';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import {
  catchError,
  firstValueFrom,
  forkJoin,
  Observable,
  switchMap,
} from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isEqual } from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import {
  CommentDialogAction,
  CommentDialogComponent,
  CommentDialogData,
  CommentDialogResult,
} from '../comment-dialog/comment-dialog.component';
import { ViewCommentsDialogComponent } from '../view-comments-dialog/view-comments-dialog.component';
import {
  Category,
  Lifecycle,
  Technology,
  TechnologyRequest,
  TecSwapElement,
} from 'src/app/models/technology';
import { CommentPostRequest, CommentResponse } from 'src/app/models/comment';
import { TecSwapService } from 'src/app/services/tec-swap-element.service';
import { CommentService } from 'src/app/services/comment.service';
import { TechnologyService } from 'src/app/services/technology.service';
import { PictureService } from 'src/app/services/picture.service';

@Component({
  selector: 'app-tecswap-page',
  templateUrl: './tecswap-page.component.html',
  styleUrls: ['./tecswap-page.component.scss'],
})
export class TecswapPageComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild(Option) sortSelect!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('historySidenav') historySidenav!: MatSidenav;
  options: QueryList<MatOption> | MatOption[] | undefined;
  dataSource: MatTableDataSource<TecSwapElement> = new MatTableDataSource();
  displayedColumns: string[] = [
    'technologyName',
    'lifecycle',
    'category',
    'priority',
    'tecSwap',
    'completed',
    'editDate',
    'confirm',
    'history',
  ];
  tecSwaps: TecSwapElement[] = [];
  oldTecSwaps: TecSwapElement[] = [];
  tecSwapOptions: string[] = [
    'AI4Dev',
    'Architecture and Business Analysis',
    'Backend',
    'DevSecOps',
    'Frontend',
    'Secure Software Engineering',
    'Noch nicht zugeordnet',
  ];
  changeMap = new Map<
    number,
    { technologyChange: boolean; tecSwapChange: boolean }
  >();
  selectedTecSwaps: string[] = [];
  selectedCategories: Category[] = [];
  selectedLifecycles: Lifecycle[] = [];
  onlyUncompleted = false;
  isSearchVisible = false;
  searchText = '';
  expandedCards: {
    tecSwaps: boolean;
    categories: boolean;
    lifecycles: boolean;
  } = {
    tecSwaps: false,
    categories: false,
    lifecycles: false,
  };
  comments: CommentResponse[] = [];
  objectKeys = Object.keys;

  get categories(): Category[] {
    return this.technologyService.categories;
  }

  get lifecycles(): Lifecycle[] {
    return this.technologyService.lifecycles;
  }

  constructor(
    private router: Router,
    private tecSwapService: TecSwapService,
    private commentService: CommentService,
    private technologyService: TechnologyService,
    private pictureService: PictureService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.tecSwapService.getAll().subscribe((tecSwaps) => {
      this.tecSwaps = tecSwaps;
      this.oldTecSwaps = tecSwaps;
      this.dataSource.data = this.mapValues(tecSwaps);
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.paginator._intl.itemsPerPageLabel = 'Technologien pro Seite';
    this.paginator._intl.nextPageLabel = 'Nächste Seite';
    this.paginator._intl.lastPageLabel = 'Letzte Seite';
    this.paginator._intl.firstPageLabel = 'Erste Seite';
    this.paginator._intl.previousPageLabel = 'Vorherige Seite';
    this.sort.active = 'technologyName';
    this.sort.direction = 'asc';
    this.sort.sortChange.emit();

    this.dataSource.sortingDataAccessor = (
      tecSwapElement,
      property,
    ): string | number => {
      switch (property) {
        case 'technologyName':
          return tecSwapElement.technologyName?.toLowerCase() || '';
        case 'lifecycle':
          return (
            this.lifecycles.find(
              (lifecycle) =>
                lifecycle.id === tecSwapElement.technologyLifecycleId,
            )?.name || ''
          );
        case 'category':
          return (
            this.categories.find(
              (category) => category.id === tecSwapElement.technologyCategoryId,
            )?.name || ''
          );
        case 'editDate':
          return tecSwapElement.editDate
            ? new Date(tecSwapElement.editDate).getTime()
            : Number.MAX_SAFE_INTEGER;
        case 'priority':
          return tecSwapElement.technologyIsPriority ? 1 : 0;
        case 'tecSwap':
          return tecSwapElement.tecSwap?.toLowerCase() || '';
        case 'completed':
          return tecSwapElement.isCompleted ? 1 : 0;
        default:
          return '';
      }
    };

    //special case for editDate and tecSwap, every empty Date and 'Noch nicht zugeordnet' is listed in the bottom
    this.dataSource.sortData = (data, sort): TecSwapElement[] => {
      const isAsc = sort.direction === 'asc';
      return data.slice().sort((a, b) => {
        const valueA = this.dataSource.sortingDataAccessor(a, sort.active);
        const valueB = this.dataSource.sortingDataAccessor(b, sort.active);

        if (sort.active === 'editDate') {
          const isMaxA = valueA === Number.MAX_SAFE_INTEGER;
          const isMaxB = valueB === Number.MAX_SAFE_INTEGER;

          if (isMaxA && isMaxB) return 0;
          if (isMaxA) return 1;
          if (isMaxB) return -1;

          return (valueA < valueB ? -1 : 1) * (isAsc ? 1 : -1);
        }

        if (sort.active === 'tecSwap') {
          const isUnassignedA = a.tecSwap === 'Noch nicht zugeordnet';
          const isUnassignedB = b.tecSwap === 'Noch nicht zugeordnet';

          if (isUnassignedA && isUnassignedB) return 0;
          if (isUnassignedA) return 1;
          if (isUnassignedB) return -1;

          return (valueA < valueB ? -1 : 1) * (isAsc ? 1 : -1);
        }

        return (valueA < valueB ? -1 : 1) * (isAsc ? 1 : -1);
      });
    };
  }

  ngOnChanges(): void {
    this.dataSource.data = this.mapValues(this.tecSwaps);
  }

  navigate(tecSwap: TecSwapElement): void {
    this.router.navigate([`/detail/${tecSwap.technologyId}`]);
  }

  mapValues(tecSwaps: TecSwapElement[]): {
    id: number;
    technologyId: number;
    tecSwap: string;
    isCompleted: boolean;
    editDate: string | null;
    technologyName: string;
    technologyLifecycleId: number;
    technologyCategoryId: number;
    technologyIsPriority: boolean;
  }[] {
    return tecSwaps.map((tecSwap) => ({
      ...tecSwap,
      id: tecSwap.id,
      technologyId: tecSwap.technologyId,
      tecSwap: tecSwap.tecSwap,
      isCompleted: tecSwap.isCompleted,
      editDate: tecSwap.editDate,
      technologyName: tecSwap.technologyName,
      technologyLifecycleId: tecSwap.technologyLifecycleId,
      technologyIsPriority: tecSwap.technologyIsPriority,
    }));
  }
  getBeforeValue(change: string): string {
    return change.split(' -> ')[0]?.trim();
  }

  getAfterValue(change: string): string {
    return change.split(' -> ')[1]?.trim();
  }
  onTecSwapChange(tecSwap: TecSwapElement): void {
    const current = this.changeMap.get(tecSwap.id) || {
      technologyChange: false,
      tecSwapChange: false,
    };
    this.changeMap.set(tecSwap.id, { ...current, tecSwapChange: true });
  }

  onCompletedChange(tecSwap: TecSwapElement): void {
    const current = this.changeMap.get(tecSwap.id) || {
      technologyChange: false,
      tecSwapChange: false,
    };
    this.changeMap.set(tecSwap.id, { ...current, tecSwapChange: true });
    tecSwap.editDate = tecSwap.isCompleted
      ? new Date().toISOString().split('T')[0]
      : null;
  }

  updateTecSwap(tecSwap: TecSwapElement): Observable<TecSwapElement[]> {
    return this.tecSwapService.update(tecSwap.id, tecSwap).pipe(
      switchMap(() => this.tecSwapService.getAll()),
      tap((tecSwaps) => {
        this.oldTecSwaps = tecSwaps;
        this.tecSwaps = tecSwaps;
        this.snackBar.open('TecSwap Element wurde aktualisiert');
      }),
      catchError((error) => {
        console.error(error);
        throw error;
      }),
    );
  }

  onTechnologyChange(tecSwap: TecSwapElement): void {
    const current = this.changeMap.get(tecSwap.id) || {
      technologyChange: false,
      tecSwapChange: false,
    };
    this.changeMap.set(tecSwap.id, { ...current, technologyChange: true });
  }

  updateTechnology(tecSwap: TecSwapElement): Observable<Technology> {
    return this.technologyService.getTechnology(tecSwap.technologyId).pipe(
      switchMap(async (technology) => {
        let pictureData = null;
        if (technology.pictureId) {
          pictureData = await this.getPictureDataById(technology.pictureId);
        }
        const updatedTechnologyRequest: TechnologyRequest = {
          name: technology.name,
          description: technology.description,
          shortDescription: technology.shortDescription,
          pictureData: pictureData,
          isNewPic: false,
          categoryId: tecSwap.technologyCategoryId,
          lifecycleId: tecSwap.technologyLifecycleId,
          tags: technology.tags,
          certificates: technology.certificates,
          projectIds: technology.projects.map((project) => project.id),
          connectedTechnologyIds: technology.connectedTechnologyIds || [],
          priority: tecSwap.technologyIsPriority,
        };
        return this.technologyService.updateTechnology(
          technology.id,
          updatedTechnologyRequest,
        );
      }),
      switchMap((updateObservable) => updateObservable), // Flatten the nested Observable
      tap((updatedTechnology) => {
        this.snackBar.open(
          'Die Technologie ' + updatedTechnology.name + ' wurde geändert',
        );
      }),
      catchError((error) => {
        console.error(error);
        throw error;
      }),
    );
  }

  async getPictureDataById(pictureId: number): Promise<string> {
    const picture = await firstValueFrom(
      this.pictureService.getPicture(pictureId),
    );
    return picture.data;
  }

  shouldShowConfirmTecSwapChange(tecSwap: TecSwapElement): boolean {
    const entry = this.changeMap.get(tecSwap.id);
    if (entry) {
      return entry.tecSwapChange;
    }
    return false;
  }

  shouldConfirmTechnologyChange(tecSwap: TecSwapElement): boolean {
    const entry = this.changeMap.get(tecSwap.id);
    if (entry) {
      return entry.technologyChange;
    }
    return false;
  }

  showHistory(tecSwap: TecSwapElement): void {
    this.commentService
      .getCommentsForTecSwap(tecSwap.id)
      .subscribe((comments) => {
        this.comments = comments;
        this.dialog.open(ViewCommentsDialogComponent, {
          data: {
            comments: this.comments,
          },
          // Tweak size & behaviour
          width: '95vw',
          maxWidth: '95vw',
          height: '95vh',
          panelClass: 'history-dialog-panel',
          autoFocus: false,
          restoreFocus: false,
          // close on backdrop or ESC by default
        });
      });
  }

  async confirmChanges(tecSwap: TecSwapElement): Promise<void> {
    const current = this.changeMap.get(tecSwap.id);
    if (current) {
      const dialogRef = this.dialog.open<
        CommentDialogComponent,
        CommentDialogData,
        CommentDialogResult
      >(CommentDialogComponent, {
        width: '90%',
        maxWidth: '600px',
        disableClose: true,
        data: {
          message: 'Möchtest du der Änderung einen Kommentar hinzufügen?',
        },
      });

      const commentDialogResult: CommentDialogResult | undefined =
        await dialogRef.afterClosed().toPromise();

      if (
        !commentDialogResult ||
        commentDialogResult.action === CommentDialogAction.ABORT_SAVE
      ) {
        this.snackBar.open('Änderungen nicht gespeichert');
        return;
      }
      let comment = '';
      if (
        commentDialogResult.action === CommentDialogAction.SAVE_WITH_COMMENT
      ) {
        comment = commentDialogResult.comment;
      }

      const requests: Observable<TecSwapElement[] | Technology>[] = [];

      if (this.shouldConfirmTechnologyChange(tecSwap)) {
        this.changeMap.set(tecSwap.id, { ...current, technologyChange: false });
        requests.push(this.updateTechnology(tecSwap));
        tecSwap.isCompleted = true;
        this.onCompletedChange(tecSwap);
      }

      this.changeMap.set(tecSwap.id, {
        ...current,
        tecSwapChange: false,
        technologyChange: false,
      });
      requests.push(this.updateTecSwap(tecSwap));

      // Call postComment after all update requests are finished
      if (requests.length > 0) {
        forkJoin(requests).subscribe({
          next: (_) => {
            if (comment != null) {
              this.postComment(
                comment,
                tecSwap.id,
                current.technologyChange,
                current.tecSwapChange,
              );
            }
          },
          error: (error) => {
            console.error('Error in update requests:', error);
          },
        });
      } else if (comment != null) {
        this.postComment(
          comment,
          tecSwap.id,
          current.technologyChange,
          current.tecSwapChange,
        );
      }
    }
  }

  private postComment(
    comment: string,
    tecSwapId: number,
    didTechnologyChange: boolean,
    didTecSwapElementChange: boolean,
  ): void {
    const body: CommentPostRequest = {
      content: comment,
      didTechnologyChange: didTechnologyChange,
      didTecSwapElementChange: didTecSwapElementChange,
    };
    this.commentService.post(body, tecSwapId).subscribe({
      error: (error) => {
        console.error('Error posting comment:', error);
      },
    });
  }

  shouldConfirmButton(tecSwap: TecSwapElement): boolean {
    const originalTecSwap = this.oldTecSwaps.find(
      (oldTecSwap) => oldTecSwap.id === tecSwap.id,
    );
    if (originalTecSwap && isEqual(originalTecSwap, tecSwap)) return false;
    if (
      this.shouldConfirmTechnologyChange(tecSwap) &&
      tecSwap.tecSwap === 'Noch nicht zugeordnet'
    )
      return false;
    return (
      this.shouldConfirmTechnologyChange(tecSwap) ||
      this.shouldShowConfirmTecSwapChange(tecSwap)
    );
  }

  removeTecSwapChip(chip: string): void {
    this.selectedTecSwaps = this.selectedTecSwaps.filter(
      (selectedTecSwap) => selectedTecSwap !== chip,
    );
    this.startFilter();
  }

  removeCategoryChip(chipName: string): void {
    this.selectedCategories = this.selectedCategories.filter(
      (selectedCategory) => selectedCategory.name !== chipName,
    );
    this.startFilter();
  }

  removeLifecycleChip(chipName: string): void {
    this.selectedLifecycles = this.selectedLifecycles.filter(
      (selectedLifecycle) => selectedLifecycle.name !== chipName,
    );
    this.startFilter();
  }

  // Backwards-compatible API used by legacy tests and old call sites.
  removeChip(chip: string): void {
    const optionToRemove = this.options?.find(
      (chip_: MatOption) => chip_.id === chip,
    );
    if (optionToRemove) {
      optionToRemove.deselect();
    }

    this.selectedTecSwaps = this.selectedTecSwaps.filter(
      (selectedTecSwap) => selectedTecSwap !== chip,
    );
    this.selectedCategories = this.selectedCategories.filter(
      (selectedCategory) => selectedCategory.name !== chip,
    );
    this.selectedLifecycles = this.selectedLifecycles.filter(
      (selectedLifecycle) => selectedLifecycle.name !== chip,
    );
    this.startFilter();
  }

  get allTecSwapsSelected(): boolean {
    return (
      this.tecSwapOptions.length > 0 &&
      this.selectedTecSwaps.length === this.tecSwapOptions.length
    );
  }

  toggleAllTecSwaps(checked: boolean): void {
    this.selectedTecSwaps = checked ? [...this.tecSwapOptions] : [];
    this.startFilter();
  }

  toggleTecSwapOption(tecSwap: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedTecSwaps.includes(tecSwap)) {
        this.selectedTecSwaps = [...this.selectedTecSwaps, tecSwap];
      }
    } else {
      this.selectedTecSwaps = this.selectedTecSwaps.filter(
        (selectedTecSwap) => selectedTecSwap !== tecSwap,
      );
    }
    this.startFilter();
  }

  get allCategoriesSelected(): boolean {
    return (
      this.categories.length > 0 &&
      this.selectedCategories.length === this.categories.length
    );
  }

  toggleAllCategories(checked: boolean): void {
    this.selectedCategories = checked ? [...this.categories] : [];
    this.startFilter();
  }

  toggleCategory(category: Category, checked: boolean): void {
    if (checked) {
      if (
        !this.selectedCategories.some((selected) => selected.id === category.id)
      ) {
        this.selectedCategories = [...this.selectedCategories, category];
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(
        (selected) => selected.id !== category.id,
      );
    }
    this.startFilter();
  }

  isCategorySelected(category: Category): boolean {
    return this.selectedCategories.some(
      (selected) => selected.id === category.id,
    );
  }

  get allLifecyclesSelected(): boolean {
    return (
      this.lifecycles.length > 0 &&
      this.selectedLifecycles.length === this.lifecycles.length
    );
  }

  toggleAllLifecycles(checked: boolean): void {
    this.selectedLifecycles = checked ? [...this.lifecycles] : [];
    this.startFilter();
  }

  toggleLifecycle(lifecycle: Lifecycle, checked: boolean): void {
    if (checked) {
      if (
        !this.selectedLifecycles.some(
          (selected) => selected.id === lifecycle.id,
        )
      ) {
        this.selectedLifecycles = [...this.selectedLifecycles, lifecycle];
      }
    } else {
      this.selectedLifecycles = this.selectedLifecycles.filter(
        (selected) => selected.id !== lifecycle.id,
      );
    }
    this.startFilter();
  }

  isLifecycleSelected(lifecycle: Lifecycle): boolean {
    return this.selectedLifecycles.some(
      (selected) => selected.id === lifecycle.id,
    );
  }

  toggleCardExpanded(card: 'tecSwaps' | 'categories' | 'lifecycles'): void {
    this.expandedCards[card] = !this.expandedCards[card];
  }

  isCardExpanded(card: 'tecSwaps' | 'categories' | 'lifecycles'): boolean {
    return this.expandedCards[card];
  }

  resetFilter(): void {
    this.selectedTecSwaps = [];
    this.selectedLifecycles = [];
    this.selectedCategories = [];
    this.onlyUncompleted = false;
    this.startFilter();
  }

  startFilter(): void {
    let filteredTecSwaps = this.tecSwaps;

    if (this.onlyUncompleted) {
      filteredTecSwaps = filteredTecSwaps.filter(
        (tecSwap) => !tecSwap.isCompleted,
      );
    }
    if (this.selectedTecSwaps.length > 0) {
      filteredTecSwaps = filteredTecSwaps.filter((tecSwap) =>
        this.selectedTecSwaps.some(
          (selectedTecSwap) => tecSwap.tecSwap === selectedTecSwap,
        ),
      );
    }
    if (this.selectedLifecycles.length > 0) {
      filteredTecSwaps = filteredTecSwaps.filter((tecSwap) =>
        this.selectedLifecycles.some(
          (selectedLifecycle) =>
            tecSwap.technologyLifecycleId === selectedLifecycle.id,
        ),
      );
    }
    if (this.selectedCategories.length > 0) {
      filteredTecSwaps = filteredTecSwaps.filter((tecSwap) =>
        this.selectedCategories.some(
          (selectedCategory) =>
            tecSwap.technologyCategoryId === selectedCategory.id,
        ),
      );
    }

    if (this.searchText.trim().length > 0) {
      const filterValue = this.searchText.toLowerCase();
      filteredTecSwaps = filteredTecSwaps.filter((tecSwap) =>
        tecSwap.technologyName.toLowerCase().includes(filterValue),
      );
    }

    this.dataSource.data = this.mapValues(filteredTecSwaps);
  }

  get isFilterOn(): boolean {
    return (
      this.selectedTecSwaps.length > 0 ||
      this.onlyUncompleted ||
      this.selectedCategories.length > 0 ||
      this.selectedLifecycles.length > 0
    );
  }

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
    if (this.isSearchVisible) {
      setTimeout(() => this.searchInput?.nativeElement.focus());
      return;
    }

    if (!this.isSearchVisible) {
      this.searchText = '';
      this.startFilter();
    }
  }
}
