import { Component, OnInit } from '@angular/core';
import { FormValues } from '../edit-form/edit-form.component';
import { TechnologyService } from 'src/app/services/technology.service';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TechnologyRequest } from 'src/app/models/technology';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PictureService } from 'src/app/services/picture.service';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-edit-view',
  templateUrl: './edit-view.component.html',
  styleUrls: ['./edit-view.component.css'],
})
/**
 * EditView component
 *
 * Component for editing technologies
 */
export class EditViewComponent implements OnInit {
  id: number;
  values!: FormValues;
  hasLoaded = false;
  isSubmitting = false;
  hasError = false;
  oldValues!: FormValues;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly technologyService: TechnologyService,
    private readonly projectService: ProjectService,
    private readonly pictureService: PictureService,
    private snackBar: MatSnackBar,
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    const pictureData = null;
    this.technologyService.getTechnology(this.id).subscribe((technology) => {
      this.values = {
        name: technology.name,
        description: technology.description,
        shortDescription: technology.shortDescription,
        pictureData: pictureData,
        isNewPic: false,
        categoryId: technology.categoryId,
        lifecycleId: technology.lifecycleId,
        tags: technology.tags,
        certificates: technology.certificates,
        projectIds: technology.projects.map((project) => project.id),
        connectedTechnologyIds: technology.connectedTechnologyIds || [],
        priority: technology.priority,
      };
      if (technology.pictureId) {
        this.getPictureDataById(technology.pictureId);
      } else {
        this.hasLoaded = true;
      }
      this.oldValues = structuredClone(this.values);
    });
  }

  getPictureDataById(id: number): void {
    this.pictureService.getPicture(id).subscribe((picture) => {
      this.hasLoaded = true;
      this.values.pictureData = picture.data;
      this.oldValues.pictureData = picture.data;
    });
  }

  changes(): boolean {
    if (this.isSubmitting) {
      return false;
    }
    return (
      this.oldValues.name !== this.values.name ||
      this.oldValues.description !== this.values.description ||
      this.oldValues.shortDescription !== this.values.shortDescription ||
      this.oldValues.lifecycleId !== this.values.lifecycleId ||
      this.oldValues.categoryId !== this.values.categoryId ||
      this.oldValues.priority !== this.values.priority ||
      this.oldValues.isNewPic !== this.values.isNewPic ||
      JSON.stringify(this.oldValues.tags) !==
        JSON.stringify(this.values.tags) ||
      JSON.stringify(this.oldValues.connectedTechnologyIds) !==
        JSON.stringify(this.values.connectedTechnologyIds) ||
      (this.oldValues.certificates.length === 0 &&
        this.values.certificates[0]?.name.trim() !== '') ||
      (this.oldValues.certificates.length !== 0 &&
        JSON.stringify(this.oldValues.certificates) !==
          JSON.stringify(this.values.certificates)) ||
      (this.oldValues.projectIds.length !== 0 &&
        JSON.stringify(this.oldValues.projectIds) !==
          JSON.stringify(this.values.projectIds))
    );
  }

  onSubmit = async (): Promise<void> => {
    this.isSubmitting = true;
    this.hasError = false;
    try {
      const response = await firstValueFrom(
        this.technologyService.updateTechnology(
          this.id,
          this.values as TechnologyRequest,
        ),
      );
      this.pictureService.discardPictureFromCache(response.pictureId || -1);
      // Refresh tags in TechnologyService to ensure filter dropdown is up-to-date
      this.technologyService.tags = await firstValueFrom(
        this.technologyService.getTagSelection(),
      );
      await this.router.navigate([`/detail/${response.id}`]);
      this.snackBar.open(
        `Die Technologie ${response.name} wurde erfolgreich aktualisiert.`,
      );
    } catch (error) {
      this.hasError = true;
    } finally {
      this.isSubmitting = false;
    }
  };
}
