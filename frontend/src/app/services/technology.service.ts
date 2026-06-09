import { Injectable } from '@angular/core';

import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Category,
  CertificateForm,
  Lifecycle,
  Technology,
  TechnologyRequest,
  THistory,
} from 'src/app/models/technology';
import { environment } from 'src/environments/environment';
import { Customer } from './customer.service';
import { Project } from '../models/project';

/**
 * @description
 * Injectable service for managing technologies and their metadata.
 */
@Injectable()
export class TechnologyService {
  lifecycles: Lifecycle[] = [];
  categories: Category[] = [];
  tags: string[] = [];
  customers: Customer[] = [];
  projects: Project[] = [];

  private technologiesUrl = environment.apiUrl + '/technology';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  /**
   * @description Constructor for the TechnologyService class.
   * @param http HttpClient for making HTTP requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * @description Initializes the TechnologyService by fetching lifecycles, categories, tags and customers from the backend.
   * @returns Promise<void> A promise that resolves when the initialization is complete.
   */
  async initialize(): Promise<void> {
    const [lifecycles, categories, tags, customers, projects] =
      await Promise.all([
        firstValueFrom(this.getLifecycles()),
        firstValueFrom(this.getCategories()),
        firstValueFrom(this.getTagSelection()),
        firstValueFrom(this.getAllCustomers()),
        firstValueFrom(this.getAllProjects()),
      ]);

    this.lifecycles = lifecycles;
    this.categories = categories;
    this.tags = tags;
    this.customers = customers;
    this.projects = projects;
  }

  getCategoryById(id: number): Category | undefined {
    return this.categories.find((category) => category.id === id);
  }

  getLifecycleById(id: number): Lifecycle | undefined {
    return this.lifecycles.find((lifecycle) => lifecycle.id === id);
  }

  getTechnologies(): Observable<Technology[]> {
    return this.http.get<Technology[]>(this.technologiesUrl);
  }

  getTechnology(id: number): Observable<Technology> {
    const url = `${this.technologiesUrl}/${id}`;
    return this.http.get<Technology>(url);
  }

  getTechnologyHistory(id: number): Observable<THistory[]> {
    const url = `${environment.apiUrl}/history/${id}`;

    return this.http.get<THistory[]>(url);
  }

  createTechnology(technology: TechnologyRequest): Observable<Technology> {
    const url = `${this.technologiesUrl}`;
    const formDataTechnology = this.convertValuesToFormData(technology);
    return this.http.post<Technology>(url, formDataTechnology);
  }

  updateTechnology(
    id: number,
    technology: TechnologyRequest,
  ): Observable<Technology> {
    const url = `${this.technologiesUrl}/${id}`;
    const formDataTechnology = this.convertValuesToFormData(technology);

    return this.http.put<Technology>(url, formDataTechnology);
  }

  deleteTechnology(id: number): Observable<Technology> {
    const url = `${this.technologiesUrl}/${id}`;
    return this.http.delete<Technology>(url, this.httpOptions);
  }

  getLifecycles(): Observable<Lifecycle[]> {
    return this.http.get<Lifecycle[]>(environment.apiUrl + '/lifecycle');
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(environment.apiUrl + '/category');
  }

  /**
   * @description
   * Converts a TechnologyRequest object to FormData for HTTP request.
   *
   * @param values The TechnologyRequest object.
   * @returns FormData The FormData object suitable for an HTTP request.
   */
  convertValuesToFormData(values: TechnologyRequest): FormData {
    const formDataTechnology = new FormData();
    formDataTechnology.append('name', this.capitalizedWord(values.name));
    formDataTechnology.append('description', values.description);
    formDataTechnology.append(
      'shortDescription',
      values.shortDescription == null ? '' : values.shortDescription,
    );
    formDataTechnology.append('lifecycleId', values.lifecycleId.toString());
    formDataTechnology.append('categoryId', values.categoryId.toString());
    formDataTechnology.append('isNewPic', values.isNewPic.toString());
    formDataTechnology.append(
      'pictureData',
      values.pictureData == null ? '' : values.pictureData,
    );
    formDataTechnology.append('priority', values.priority.toString());

    // Use the tags property directly
    const validTags = values.tags.filter((tag) => tag && tag.trim().length > 0);

    // Append each tag to FormData
    validTags.forEach((tag) => {
      formDataTechnology.append('tags', this.capitalizedWord(tag.toString()));
    });

    values.projectIds.forEach((projectId: number) => {
      formDataTechnology.append('projectIds', projectId.toString());
    });

    values.certificates.forEach((certificate: CertificateForm) => {
      formDataTechnology.append(
        'certificateNames',
        this.capitalizedWord(certificate.name),
      );
      formDataTechnology.append(
        'certificateDescriptions',
        this.capitalizedWord(certificate.description),
      );
      certificate.prerequisites.forEach((pre) => {
        formDataTechnology.append('certificatePrerequisites', pre.toString());
      });
      formDataTechnology.append('certificatePrerequisites', '');

      certificate.followUps.forEach((followUp) => {
        formDataTechnology.append('certificateFollowUps', followUp.toString());
      });
      formDataTechnology.append('certificateFollowUps', '');
    });

    values.connectedTechnologyIds.forEach((connectedTechnologyId) => {
      formDataTechnology.append(
        'connectedTechnologyIds',
        connectedTechnologyId.toString(),
      );
    });

    return formDataTechnology;
  }

  /**
   * @description
   * Retrieves an array of existing tags that users can choose from when creating or editing technologies.
   *
   * @returns Observable<Array<string>> An observable containing an array of existing tags.
   */
  getTagSelection(): Observable<string[]> {
    return this.http.get<string[]>(environment.apiUrl + '/tag');
  }

  /**
   * @description
   * Retrieves an array of all existing customers
   *
   * @returns Observable<Array<Customer>> An observable containing an array of existing customers.
   */
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(environment.apiUrl + '/customer');
  }

  /**
   * @description
   * Retrieves an array of all existing projects
   *
   * @returns Observable<Array<Project>> An observable containing an array of existing projects.
   */
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(environment.apiUrl + '/project');
  }

  /**
   * @description
   * Fetches technology similarity information based on an ID.
   *
   * @param id The technology ID.
   * @returns Observable<any> An observable containing the similarity information.
   */
  getSimilarity(id: number): Observable<object> {
    const url = `${environment.apiUrl}/similarity/${id}`;
    return this.http.get<object>(url);
  }

  /**
   * @description
   * increment visit counter based on ID
   *
   * @param id the technology ID
   */
  incrementVisitCounter(id: number): Observable<string> {
    const url = `${this.technologiesUrl}/count/${id}`;
    return this.http.get<string>(url);
  }

  capitalizedWord(word: string): string {
    if (!word) return word;
    word = word.trim();
    return word[0].toUpperCase() + word.slice(1);
  }
}
