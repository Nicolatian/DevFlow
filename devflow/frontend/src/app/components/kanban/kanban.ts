import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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


  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: (err) => console.error('Failed to load projects:', err)
    });
  }

 
  submitProject(event: Event, formValue: any) {
    event.preventDefault();
    
    // Convert the string into an array for the database
    const skillsArray = this.skillsString
      ? this.skillsString.split(',').map(s => s.trim()).filter(s => s !== '')
      : [];

    const projectData = {
      ...formValue, //(All the variables)
      techStack: skillsArray, // Make sure your backend/service expects this name
      clicks: this.editingProject?.clicks || 0
    };

    if (this.editingProject?._id) {
      this.projectService.updateProject(this.editingProject._id, projectData).subscribe({
        next: () => {
          this.loadProjects();
          this.cancelEdit();
          alert('Project updated!');
        }
      });
    } else {
      this.projectService.addProject(projectData).subscribe({
        next: () => {
          this.loadProjects();
          this.cancelEdit();
          alert('Project created!');
        }
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
