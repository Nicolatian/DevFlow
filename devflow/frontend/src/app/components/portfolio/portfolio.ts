import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProjectService } from '../../services/project'; 
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class PortfolioComponent implements OnInit {
  @ViewChild('cardViewer') viewer!: ElementRef; 

  projects: any[] = [];
  currentIndex = 0; 
  readonly CARD_WIDTH = 460; // 420px card + 40px gap

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe((data: any) => {
      this.projects = data;
    });
  }

  scroll(direction: number) {
    const targetIndex = this.currentIndex + direction;
    if (targetIndex >= 0 && targetIndex < this.projects.length) {
      this.currentIndex = targetIndex;
      this.viewer.nativeElement.scrollTo({
        left: targetIndex * this.CARD_WIDTH,
        behavior: 'smooth'
      });
    }
  }

  onScroll() {
    const scrollPosition = this.viewer.nativeElement.scrollLeft;
    const newIndex = Math.round(scrollPosition / this.CARD_WIDTH);
    if (this.currentIndex !== newIndex) {
      this.currentIndex = newIndex;
    }
  }

  trackClick(id: string) {
    this.projectService.incrementClick(id).subscribe(() => {
      this.router.navigate(['/portfolio', id]); 
    });
  }

  copyEmail() {
    navigator.clipboard.writeText('nicolaivestergaard2@gmail.com');
    alert('Email copied to clipboard!');
  }
}
