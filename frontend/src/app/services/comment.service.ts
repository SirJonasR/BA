import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentPostRequest, CommentResponse } from 'src/app/models/comment';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly baseUrl = environment.apiUrl + '/comments';

  constructor(private http: HttpClient) {}

  getCommentsForTecSwap(tecSwapId: number): Observable<CommentResponse[]> {
    const url = `${this.baseUrl}/${tecSwapId}`;
    return this.http.get<CommentResponse[]>(url);
  }

  post(body: CommentPostRequest, tecSwapId: number): Observable<void> {
    const url = `${this.baseUrl}/${tecSwapId}`;
    return this.http.post<void>(url, body);
  }
}
