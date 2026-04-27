import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // --- NEW METHODS REPLACING PHP/XAMPP ---
  getGitHubStats(repoPath: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/github-proxy?repo=${repoPath}`);
  }

  getGitHubActivity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/github-activity`);
  }

  trackClick(id: string): Observable<any> {
    return this.incrementClick(id);
  }

  // --- METHODS LOGIC ---
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getProjects(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/projects`); 
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/projects/${id}`);
  }

  incrementClick(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/projects/${id}/click`, {});
  }
  
  addProject(project: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects`, project, { headers: this.getHeaders() });
  }

  updateProject(id: string, project: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/projects/${id}`, project, { headers: this.getHeaders() });
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${id}`, { headers: this.getHeaders() });
  }
}
