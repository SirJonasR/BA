import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Industry, Technology } from 'src/app/models/technology';
import { environment } from 'src/environments/environment';
import { ProjectReference } from '../project/project-reference/project-reference.component';
import { Project, ProjectHistory } from '../models/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(environment.apiUrl + '/project');
  }

  getProjectHistories(id: number): Observable<ProjectHistory[]> {
    return this.http.get<ProjectHistory[]>(
      environment.apiUrl + '/project/history/' + id,
    );
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(environment.apiUrl + '/project/' + id);
  }

  createProject(newProject: Project): Observable<Project> {
    return this.http.post<Project>(environment.apiUrl + '/project', newProject);
  }

  updateProject(id: number, updatedProject: Project): Observable<Project> {
    return this.http.put<Project>(
      environment.apiUrl + '/project/' + id,
      updatedProject,
    );
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(
      environment.apiUrl + '/project/' + id,
      this.httpOptions,
    );
  }

  getProjectReferences(
    technologies: Technology[],
    industryIds: number[],
  ): Observable<ProjectReference[]> {
    let params = new HttpParams();

    technologies.forEach((tech) => {
      params = params.append('technologyIds', tech.id.toString());
    });
    industryIds.forEach((id) => {
      params = params.append('industryIds', id.toString());
    });

    return this.http.get<ProjectReference[]>(
      `${environment.apiUrl}/similarity/project-overlap`,
      { params },
    );
  }

  getIndustries(): Observable<Industry[]> {
    return this.http.get<Industry[]>(environment.apiUrl + '/industries');
  }
}
