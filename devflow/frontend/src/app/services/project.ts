import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
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
