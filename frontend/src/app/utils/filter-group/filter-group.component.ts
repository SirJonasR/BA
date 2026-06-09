import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-filter-group',
  templateUrl: './filter-group.component.html',
  styleUrls: ['./filter-group.component.css'],
})
export class FilterGroupComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('panelContent', { read: ElementRef })
  panelContentRef!: ElementRef<HTMLElement>;

  @Input() tooltip = 'Filtern und Sortieren';
  @Input() panelTitle = 'Filter';
  @Input() resetButtonText = 'Filter zurücksetzen';

  @Output() resetClicked = new EventEmitter<void>();

  activeFiltersCount = 0;

  private panelObserver?: MutationObserver;
  private refreshTimerId?: number;

  onFilterClick(): void {
    if (this.sidenav?.opened) {
      this.sidenav.close();
      return;
    }
    this.sidenav?.open();
    this.scheduleRefreshTemplateState();
  }

  onResetClick(): void {
    this.resetClicked.emit();
    this.scheduleRefreshTemplateState();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.normalizeProjectedPanelLayout();
      this.observePanelChanges();
      this.refreshTemplateState();
    });
  }

  ngOnDestroy(): void {
    this.panelObserver?.disconnect();
    if (this.refreshTimerId !== undefined) {
      window.clearTimeout(this.refreshTimerId);
      this.refreshTimerId = undefined;
    }
  }

  private observePanelChanges(): void {
    const panel = this.getProjectedPanel();
    if (!panel) {
      return;
    }

    this.panelObserver = new MutationObserver(() => {
      this.scheduleRefreshTemplateState();
    });

    this.panelObserver.observe(panel, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['checked', 'aria-checked', 'aria-selected', 'class'],
    });
  }

  private scheduleRefreshTemplateState(): void {
    if (this.refreshTimerId !== undefined) {
      return;
    }

    this.refreshTimerId = window.setTimeout(() => {
      this.refreshTimerId = undefined;
      this.refreshTemplateState();
    }, 0);
  }

  private refreshTemplateState(): void {
    const panel = this.getProjectedPanel();
    if (!panel) {
      return;
    }

    this.updateCardSelectionStates(panel);
    this.activeFiltersCount = this.getTotalActiveCount(panel);
  }

  private normalizeProjectedPanelLayout(): void {
    const panel = this.getProjectedPanel();
    if (!panel) {
      return;
    }

    panel.classList.add('side-nav');

    const header = panel.querySelector('.filter-header') as HTMLElement | null;
    if (header) {
      header.style.display = 'none';
      const next = header.nextElementSibling as HTMLElement | null;
      if (next && next.tagName.toLowerCase() === 'mat-divider') {
        next.style.display = 'none';
      }
    }

    const looseHead = panel.querySelector('.filterHead') as HTMLElement | null;
    if (looseHead) {
      looseHead.style.display = 'none';
      const next = looseHead.nextElementSibling as HTMLElement | null;
      if (next && next.tagName.toLowerCase() === 'mat-divider') {
        next.style.display = 'none';
      }
    }
  }

  private updateCardSelectionStates(panel: HTMLElement): void {
    const cards = Array.from(panel.querySelectorAll('.filter-card'));
    cards.forEach((card) => {
      const chipCount = card.querySelectorAll(
        'mat-chip, mat-chip-option',
      ).length;
      const checkedToggleCount = Array.from(
        card.querySelectorAll('mat-slide-toggle input[type="checkbox"]'),
      ).filter((el) => (el as HTMLInputElement).checked).length;

      if (chipCount + checkedToggleCount > 0) {
        card.classList.add('has-selections');
      } else {
        card.classList.remove('has-selections');
      }
    });
  }

  private getTotalActiveCount(panel: HTMLElement): number {
    const chipCount = panel.querySelectorAll(
      'mat-chip, mat-chip-option',
    ).length;
    const checkedToggleCount = Array.from(
      panel.querySelectorAll('mat-slide-toggle input[type="checkbox"]'),
    ).filter((el) => (el as HTMLInputElement).checked).length;

    return chipCount + checkedToggleCount;
  }

  private getProjectedPanel(): HTMLElement | null {
    return this.panelContentRef?.nativeElement.querySelector(
      '[filter-panel]',
    ) as HTMLElement | null;
  }
}
