import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { CertificateForm, Technology } from 'src/app/models/technology';
import {
  DeepExpertListItem,
  DeepExpertService,
} from 'src/app/services/deep-expert.service';
import { TechnologyService } from 'src/app/services/technology.service';
import { PictureService } from 'src/app/services/picture.service';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { FeatureFlagService } from 'src/app/services/feature-flag.service';
import { RemoveDialogComponent } from 'src/app/utils/remove-dialog/remove-dialog.component';

@Component({
  selector: 'app-technology-details',
  templateUrl: './technology-details.component.html',
  styleUrls: ['./technology-details.component.css'],
})
/**
 * Technology Details Component
 *
 * Component that displays all technology details
 */
export class TechnologyDetailsComponent implements OnInit {
  technology!: Technology;
  id!: number;
  pictureUrl!: string;
  similarity = {};
  similarityName: string[] = [];
  similarityId: string[] = [];
  certificates: CertificateForm[] = [];
  pictureAvailable = false;
  lastVisitedTechnologies: Technology[] =
    JSON.parse(localStorage.getItem('lastVisitedTechnologies') ?? '[]') || [];
  deepExpertList: DeepExpertListItem[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private technologyService: TechnologyService,
    private pictureService: PictureService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private userHandling: UserHandlingService,
    private deepExpertService: DeepExpertService,
    private featureFlagService: FeatureFlagService,
  ) {}

  displayedColumns: string[] = [
    'expertInformation',
    'technologyName',
    'comment',
    'scope',
    'description',
  ];

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.initTechnology();
    this.technologyService.incrementVisitCounter(this.id).subscribe();
  }

  isAdmin(): boolean {
    return this.userHandling.hasRole(UserRole.ADMIN);
  }

  getCategoryName(): string | undefined {
    return this.technologyService.getCategoryById(this.technology.categoryId)
      ?.name;
  }

  getLifecycleName(): string | undefined {
    return this.technologyService.getLifecycleById(this.technology.lifecycleId)
      ?.name;
  }

  getLifecycleNameById(lifecycleId: number): string | undefined {
    return this.technologyService.getLifecycleById(lifecycleId)?.name;
  }

  /**
   * initialize picture
   * if technology has a picture, it initializes picture data and convert it to an image url
   */
  getPicture(): void {
    if (this.technology.pictureId) {
      this.pictureService
        .loadPicture(this.technology.pictureId, true)
        .subscribe({
          next: (picture: SafeResourceUrl | null) => {
            this.pictureUrl = this.sanitizer.sanitize(4, picture) || '';
            this.pictureAvailable = true;
          },
          error: (error: HttpErrorResponse) => {
            alert('Etwas lief schief beim Bild laden: ' + error.message);
          },
        });
    }
  }

  /**
   * initialize technology
   */
  initTechnology(): void {
    this.technologyService.getTechnology(this.id).subscribe((technology) => {
      this.technology = technology;
      this.saveLastClickedTechnology();
      this.getPicture();
      this.getSimilarity();
      this.getAllCertificates();

      if (
        this.featureFlagService.isEnabled(
          'SHOW_DEEP_EXPERTS_IN_TECHNOLOGY_DETAIL',
        )
      ) {
        this.getDeepExpertInformation();
      }
    });
  }

  getSimilarity(): void {
    this.technologyService
      .getSimilarity(this.technology.id)
      .subscribe((data: object) => {
        this.similarity = data;
        this.similarityName = Object.keys(this.similarity);
        this.similarityId = Object.values(this.similarity);
      });
  }

  /**
   * Initialize Certificates
   */
  getAllCertificates(): void {
    for (const certificate of this.technology.certificates) {
      const name = certificate.name;
      const description = certificate.description;
      const pre = certificate.prerequisites;
      const followUps = certificate.followUps;

      let search = this.certificates.find((c) => c.name === name);
      if (!search) {
        search = {
          name: name,
          description: description,
          prerequisites: pre,
          followUps: followUps,
        };
        this.certificates.push(search);
      }
    }
  }

  handleClickOnSimilarityRedirect(index: number): void {
    const id = this.similarityId[index];
    this.router.navigate(['/detail', id]);
  }

  handleClickOnConnectedTechnologyRedirect(id: number): void {
    this.router.navigate(['/detail', id]);
  }

  openDeleteConfirmationDialog(): void {
    this.dialog.open(RemoveDialogComponent, {
      data: {
        resourceType: 'Technologie',
        resourceName: this.technology.name,
        onDelete: this.deleteTechnology,
      },
    });
  }

  /**
   * deletes technology
   */
  deleteTechnology = (): void => {
    this.technologyService
      .deleteTechnology(this.technology.id)
      .subscribe(() => {
        this.dialog.closeAll();
        this.router.navigate([`/`]);
        this.snackBar.open(
          `Die Technologie ${this.technology.name} wurde erfolgreich gelöscht.`,
        );
      });
  };

  isShortDescriptionAvailable(): boolean {
    if (!this.technology.shortDescription) {
      return false;
    }
    return this.technology.shortDescription.trim() !== '';
  }

  saveLastClickedTechnology(): void {
    this.lastVisitedTechnologies = this.lastVisitedTechnologies.filter(
      (technology) => technology.id !== this.technology.id,
    );
    this.lastVisitedTechnologies.push(this.technology);
    if (this.lastVisitedTechnologies.length > 3) {
      this.lastVisitedTechnologies.shift();
    }
    localStorage.setItem(
      'lastVisitedTechnologies',
      JSON.stringify(this.lastVisitedTechnologies),
    );
  }

  private getDeepExpertInformation(): void {
    this.deepExpertService
      .getDeepExpertByTechnologyId(this.technology.id)
      .subscribe((deepExpert) => {
        this.deepExpertList = deepExpert;
      });
  }
}
