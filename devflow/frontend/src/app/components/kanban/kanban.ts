import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css'
})
export class KanbanComponent implements OnInit {
  projects: any[] = [];
  editingProject: any = {};
  skillsString: string = '';
  activityData: any[] = [];
  isUploading: boolean = false;

  private cloudName = "dpxd9sp8e";
  private uploadPreset = "DevFlowImages";

  loadActivity() {
    this.http.get<any[]>('http://localhost/project_devflow/get_activity.php').subscribe(data => {
    this.activityData = data;
    });
  }


  constructor(private projectService: ProjectService, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadProjects();
    this.loadActivity();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    console.log("Attempting upload to:", this.cloudName);
    console.log("Using Preset:", this.uploadPreset);

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    this.http.post(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, formData)
      .subscribe({
        next: (res: any) => {
          this.editingProject.imageUrl = res.secure_url;
          this.isUploading = false;
        },
        error: (err) => {
          console.error('Upload failed:', err);
          this.isUploading = false;
          alert('Image upload failed. Check Cloudinary settings.');
        }
      });
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: (err) => console.error('Failed to load projects:', err)
    });
  }

 
  submitProject(event: Event, formValue: any) {
    event.preventDefault();
    const skillsArray = this.skillsString ? this.skillsString.split(',').map(s => s.trim()) : [];

    const projectData = {
      ...this.editingProject,
      techStack: skillsArray
    };

    if (this.editingProject?._id) {
      this.projectService.updateProject(this.editingProject._id, projectData).subscribe(() => {
        this.loadProjects();
        this.cancelEdit();
      });
    } else {
      this.projectService.addProject(projectData).subscribe(() => {
        this.loadProjects();
        this.cancelEdit();
      });
    }
  }

  removeProject(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe(() => this.loadProjects());
    }
  }

  editProject(project: any) {
    this.editingProject = { ...project };
    this.skillsString = project.techStack?.join(', ') || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }

  cancelEdit() {
    this.editingProject = {};
    this.skillsString = '';    
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
