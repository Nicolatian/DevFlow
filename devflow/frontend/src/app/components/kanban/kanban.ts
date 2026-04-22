import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css'
})
export class KanbanComponent implements OnInit {
  projects: any[] = [];
  editingProject: any = null;

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
  
  console.log('Form data received:', formValue);

  const projectData = {
    title: formValue.title,
    desc: formValue.desc,
    imageUrl: formValue.imageUrl,
    year: formValue.year || '',
    role: formValue.role || '',
    githubUrl: formValue.githubUrl || '',
    color: formValue.color || '#6FAF8F',
    clicks: this.editingProject?.clicks || 0
  };

    if (this.editingProject) {
      this.projectService.updateProject(this.editingProject._id, projectData).subscribe({
        next: () => {
          this.loadProjects();
          this.editingProject = null;
          alert('Project updated!');
        },
        error: (err) => {
          console.error('Update Error:', err);
          alert('Update failed.');
        }
      });
    } else {
      this.projectService.addProject(projectData).subscribe({
        next: () => {
          this.loadProjects();
          alert('Project created!');
        },
        error: (err) => {
          console.error('Creation Error:', err);
          alert('Creation failed! Check if your token is expired.');
        }
      });
    }
  }

  viewProjectDetails(id: string) {
  this.projectService.getProjectById(id).subscribe({
    next: (project) => {
      console.log('Detailed Project Data:', project);
      alert(`Project: ${project.title}\nTasks: ${project.tasks.length}`);
    },
    error: (err) => {
      console.error('Fetch error:', err);
      alert('Could not load project details.');
    }
  });
}

  removeProject(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe(() => this.loadProjects());
    }
  }

  editProject(project: any) {
    this.editingProject = { ...project }; 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingProject = null;
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
