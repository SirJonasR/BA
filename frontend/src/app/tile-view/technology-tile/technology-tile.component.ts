import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Technology } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';
import { PictureService } from 'src/app/services/picture.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

/**
 * Technology Tile Component
 *
 * Technology displayed as a Tile.
 * This Component is Part of the Tile View
 */
@Component({
  selector: 'app-technology-tile',
  templateUrl: './technology-tile.component.html',
  styleUrls: ['./technology-tile.component.css'],
})
export class TechnologyTileComponent implements OnInit, OnChanges {
  @Input() id!: number;
  @Input() hoveredTechnologyId!: number;
  @Output() hoveredTile: EventEmitter<number> = new EventEmitter<number>();
  technology!: Technology;
  pictureUrl!: SafeResourceUrl;
  hovering!: boolean;
  constructor(
    private pictureService: PictureService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private technologyService: TechnologyService,
  ) {}

  ngOnInit(): void {
    this.getTechnology();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hoveredTechnologyId']?.currentValue) {
      this.hovering = this.hoveredTechnologyId === this.id;
    }
  }

  sendHoveredTile(id: number | undefined): void {
    this.hovering = !this.hovering;
    this.hoveredTile.emit(id);
  }

  getTechnology(): void {
    this.technologyService.getTechnology(this.id).subscribe((technology) => {
      this.technology = technology;
      this.getPicture();
    });
  }
  /**
   * Get Picture of Technology
   *
   * If the Technology has no Picture then a default Picture will be shown for this Technology Tile.
   */
  getPicture(): void {
    if (this.technology && this.technology.pictureId) {
      this.pictureService.loadPicture(this.technology.pictureId).subscribe({
        next: (picture: SafeResourceUrl | null) => {
          this.pictureUrl = this.sanitizer.sanitize(4, picture) || '';
        },
        error: (error: HttpErrorResponse) => {
          alert('Etwas lief schief beim Bild laden: ' + error.message);
        },
      });
    } else {
      //Default Logo
      this.pictureUrl = 'assets/defaultLogo.jpg';
    }
  }

  navigate(): void {
    this.router.navigate([`/detail/${this.id}`]);
  }
}
