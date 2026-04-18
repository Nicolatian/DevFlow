import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule],
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
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;
    });
  }

  submitProject(event: Event, title: string, desc: string, imageUrl: string) {
    event.preventDefault();
    const projectData = { 
      title, 
      desc, 
      imageUrl, 
      clicks: this.editingProject?.clicks || 0, 
      color: '#007bff' 
    };

    if (this.editingProject) {
      this.projectService.updateProject(this.editingProject._id, projectData).subscribe(() => {
        this.editingProject = null;
        this.loadProjects();
      });
    } else {
      this.projectService.addProject(projectData).subscribe(() => {
        this.loadProjects();
      });
    }
  }

  removeProject(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe(() => {
        this.loadProjects(); 
      });
    }
  }

  editProject(project: any) {
    this.editingProject = project; 
    window.scrollTo(0, 0); 
  }

  cancelEdit() {
    this.editingProject = null;
  }
}
