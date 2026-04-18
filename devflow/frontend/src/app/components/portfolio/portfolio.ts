import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class PortfolioComponent implements OnInit {
  projects: any[] = [];

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    // (data: any) for strict mode
    this.projectService.getProjects().subscribe((data: any) => {
      this.projects = data;
    });
  }

  trackClick(id: string) {
    this.projectService.incrementClick(id).subscribe(() => {
      this.loadProjects();
      this.router.navigate(['/portfolio', id]);
    });
  }
}

