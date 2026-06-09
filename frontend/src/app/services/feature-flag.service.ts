import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  private apiUrl = `${environment.apiUrl}/feature-flags`;
  private flags = new Map<string, boolean>();
  private isInitialized = false;

  constructor(private http: HttpClient) {}

  getFeatureFlags(): Observable<FeatureFlag[]> {
    return this.http.get<FeatureFlag[]>(this.apiUrl);
  }

  async init(): Promise<void> {
    if (this.isInitialized) return; // guard against double call
    try {
      const list = await firstValueFrom(this.getFeatureFlags());
      this.flags = new Map(list.map((f) => [f.name, f.enabled]));
      this.isInitialized = true;
    } catch (err) {
      console.error('Feature‑flag init failed', err);
    }
  }

  isEnabled(name: string): boolean {
    return this.flags.get(name) ?? false;
  }

  /**
   * Only possible with admin permission
   */
  updateFeatureFlag(name: string, enabled: boolean): Observable<FeatureFlag> {
    return this.http.put<FeatureFlag>(`${this.apiUrl}/${name}`, { enabled });
  }
}
