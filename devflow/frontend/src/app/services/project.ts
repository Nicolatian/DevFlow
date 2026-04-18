import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:3000/api/projects';

  constructor(private http: HttpClient) { }

  //  Ajax GET request
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Ajax PATCH request for the hit counter
  incrementClick(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/click`, {});
  }
  // new project data to the server
  addProject(projectData: any): Observable<any> {
    return this.http.post(this.apiUrl, projectData);
  }
  getProjectById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  // deletes a project by its ID
  deleteProject(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
// updates a project by its ID
updateProject(id: string, projectData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, projectData);
}
}
