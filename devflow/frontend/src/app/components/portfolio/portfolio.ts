import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'; // Add ViewChild, ElementRef
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
  @ViewChild('cardViewer') viewer!: ElementRef; // This grabs the scroll container
  projects: any[] = [];
  currentIndex = 0; // Keeps track of which dot is active

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe((data: any) => {
      this.projects = data;
    });
  }

  // Navigation Logic
  scroll(direction: number) {
    const cardWidth = 340 + 24; // Width of card + gap
    this.viewer.nativeElement.scrollBy({
      left: direction * cardWidth,
      behavior: 'smooth'
    });
  }

  onScroll() {
    const cardWidth = 340 + 24;
    this.currentIndex = Math.round(this.viewer.nativeElement.scrollLeft / cardWidth);
  }

  trackClick(id: string) {
    this.projectService.incrementClick(id).subscribe(() => {
      this.loadProjects();
      this.router.navigate(['/portfolio', id]);
    });
  }
}
