import { Component, OnInit } from '@angular/core';
import { FormValuesProject } from '../project-form/project-form.component';
import { firstValueFrom, Subscription } from 'rxjs';
import { Industry, TechnologyRequest } from 'src/app/models/technology';
import { Customer } from 'src/app/services/customer.service';
import { TechnologyService } from 'src/app/services/technology.service';
import { PictureService } from 'src/app/services/picture.service';
import { ProjectService } from 'src/app/services/project.service';
import { Utility } from 'src/app/utility';
import { Project } from 'src/app/models/project';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css'],
})
export class AddProjectComponent implements OnInit {
  values: FormValuesProject;
  isSubmitting = false;
  hasError = false;
  allIndustries: Industry[] = [];

  constructor(
    private technologyService: TechnologyService,
    private projectService: ProjectService,
    private pictureService: PictureService,
  ) {
    this.values = {
      customerNames: [],
      projectName: null,
      industry: '',
      description: '',
      contact: [],
      salesServiceLink: '',
      info: '',
      industrySpecificInformation: '',
      startDate: '',
      endDate: '',
      selectedTechnologies: [],
      newTechnologies: [],
      sbom: null,
    };
  }

  ngOnInit(): void {
    this.projectService.getIndustries().subscribe((industries) => {
      this.allIndustries = industries;
    });
  }

  changes(): boolean {
    if (this.isSubmitting) {
      return false;
    }
    return (
      this.values.customerNames.length > 0 ||
      this.values.projectName != null ||
      this.values.newTechnologies.length > 0 ||
      this.values.selectedTechnologies.length > 0 ||
      this.values.customerNames.length > 0 ||
      this.values.description !== '' ||
      this.values.contact.length > 0 ||
      this.values.salesServiceLink !== '' ||
      this.values.industry !== '' ||
      this.values.info !== '' ||
      this.values.startDate !== ''
    );
  }

  onSubmit = async (): Promise<void> => {
    this.isSubmitting = true;
    this.hasError = false;
    const startDate = new Date(this.values.startDate);
    const endDate = new Date(this.values.endDate);
    let formattedStartDate = '';
    if (this.values.startDate !== null && this.values.startDate !== '') {
      formattedStartDate =
        startDate.getFullYear().toString() +
        '-' +
        (startDate.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        startDate.getDate().toString().padStart(2, '0');
    }
    let formattedEndDate: string;
    if (this.values.endDate !== '') {
      formattedEndDate =
        endDate.getFullYear().toString() +
        '-' +
        (endDate.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        endDate.getDate().toString().padStart(2, '0');
    } else {
      formattedEndDate = '';
    }
    const newProject: Project = {
      id: -1,
      name: this.values.projectName?.toString() || '',
      industry: this.values.industry,
      description: this.values.description,
      contact: this.values.contact,
      salesServiceLink: Utility.normalizeUrl(this.values.salesServiceLink),
      info: this.values.info,
      industrySpecificInformation: this.values.industrySpecificInformation,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      customers: [],
      technologyIds: [],
      technologyNames: [],
    };
    if (this.values.selectedTechnologies.length > 0) {
      for (const technology of this.values.selectedTechnologies) {
        newProject.technologyIds.push(technology.id);
      }
    }
    for (const customerName of this.values.customerNames) {
      const customer: Customer = {
        id: -1,
        name: this.technologyService.capitalizedWord(customerName),
      };
      newProject.customers.push(customer);
    }
    this.projectService
      .createProject(newProject)
      .subscribe(async (newProject) => {
        if (this.values.newTechnologies.length > 0) {
          for (const technology of this.values.newTechnologies) {
            technology.projectIds = [newProject.id];
            await firstValueFrom(
              this.technologyService.createTechnology(
                technology as TechnologyRequest,
              ),
            );
          }
          // Refresh tags in TechnologyService after creating new technologies
          this.technologyService.tags = await firstValueFrom(
            this.technologyService.getTagSelection(),
          );
        }
      });
  };

  getPictureDataById(id: number | null): Subscription | null {
    if (id == null) return null;
    return this.pictureService
      .getPicture(id)
      .subscribe((picture) => picture.data);
  }
}
