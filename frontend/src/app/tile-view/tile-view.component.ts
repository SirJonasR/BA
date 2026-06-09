import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { Technology } from 'src/app/models/technology';

/**
 * Tile View Component
 *
 * Technologies displayed as a Tile View with a sorting option
 */
@Component({
  selector: 'app-tile-view',
  templateUrl: './tile-view.component.html',
  styleUrls: ['./tile-view.component.css'],
})
export class TileViewComponent implements OnChanges {
  @Input() technologies: Array<Technology> = [];
  @Input() hoveredTechnologyId!: number;
  @Output() hoveredTile: EventEmitter<number> = new EventEmitter<number>();
  sortedTechnologies: Array<Technology> = [];
  selectedSort: number | undefined;

  ngOnChanges(): void {
    this.sortedTechnologies = this.technologies;
  }

  receiveHoveredTile(data: number | undefined): void {
    this.hoveredTile.emit(data);
  }

  /**
   * Sort Technologies according to selected Sorting Method
   */
  sortTechnologies(): void {
    if (this.selectedSort === 1) this.sortByNameAscending();
    else if (this.selectedSort === 2) this.sortByNameDescending();
  }

  sortByNameDescending(): void {
    this.sortedTechnologies.sort((a, b) => -1 * a.name.localeCompare(b.name));
  }

  sortByNameAscending(): void {
    this.sortedTechnologies.sort((a, b) => a.name.localeCompare(b.name));
  }
}
