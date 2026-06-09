import { Component } from '@angular/core';
import { FormValues } from '../edit-form/edit-form.component';
import { TechnologyService } from 'src/app/services/technology.service';
import { TechnologyRequest } from 'src/app/models/technology';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PictureService } from 'src/app/services/picture.service';

@Component({
  selector: 'app-add-view',
  templateUrl: './add-view.component.html',
  styleUrls: ['./add-view.component.css'],
})
/**
 * AddView component
 *
 * component for adding new technologies
 */
export class AddViewComponent {
  values: FormValues;
  isSubmitting = false;
  hasError = false;

  constructor(
    private readonly router: Router,
    private readonly technologyService: TechnologyService,
    private snackBar: MatSnackBar,
    private pictureService: PictureService,
  ) {
    this.values = {
      name: null,
      description: null,
      shortDescription: null,
      pictureData: null,
      isNewPic: false,
      categoryId: null,
      lifecycleId: null,
      tags: [],
      certificates: [],
      projectIds: [],
      connectedTechnologyIds: [],
      priority: false,
    };
  }

  changes(): boolean {
    if (this.isSubmitting) {
      return false;
    }
    return (
      this.values.name !== null ||
      this.values.description !== null ||
      this.values.shortDescription !== null ||
      this.values.categoryId !== null ||
      this.values.lifecycleId !== null ||
      this.values.isNewPic ||
      this.values.priority
    );
  }

  onSubmit = async (): Promise<void> => {
    this.isSubmitting = true;
    this.hasError = false;
    try {
      const response = await firstValueFrom(
        this.technologyService.createTechnology(
          this.values as TechnologyRequest,
        ),
      );
      // Refresh tags in TechnologyService to ensure filter dropdown is up-to-date
      this.technologyService.tags = await firstValueFrom(
        this.technologyService.getTagSelection(),
      );
      await this.router.navigate([`/detail/${response.id}`]);
      this.snackBar.open(
        `Die Technologie ${response.name} wurde erfolgreich erstellt.`,
      );
      this.pictureService.discardPictureFromCache(response.pictureId || -1);
    } catch (error) {
      this.hasError = true;
    } finally {
      this.isSubmitting = false;
    }
  };
}
