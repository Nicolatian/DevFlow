import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, RouterModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  project: any;
  isAdmin: boolean = false;
  commitDays: string[] = [];
  newTask = { ideas: '', doing: '', review: '' };
  yearSquares: number[] = Array.from({ length: 365 }, (_, i) => i);
  monthLabels: { name: string, col: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private http: HttpClient 
  ) {}

 ngOnInit(): void {
    this.isAdmin = !!localStorage.getItem('token'); // check if admin 
    this.commitDays = [];
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.getProjectById(id).subscribe({
        next: (data: any) => {
          this.project = data;
          const repoPath = `Nicolatian/${this.project.repoName}`; 

          this.projectService.incrementClick(id).subscribe({
          next: (updatedProject) => {
            this.project.clicks = updatedProject.clicks; // Ajax updates the UI live
            console.log('Ajax Success: View count++');
          },
          error: (err) => console.error('Ajax failed:', err)
        });

          // 1. PHP/MySQL: Track the click
          this.http.post('http://localhost/project_devflow/track.php', { projectId: id })
            .subscribe(() => console.log('Click tracked!'));

          // 2. PHP/MySQL: Fetch cached GitHub history
          this.http.get<any>(`http://localhost/project_devflow/github_proxy.php?repo=${repoPath}`)
            .subscribe({
              next: (response: any) => {
                const commits = typeof response === 'string' ? JSON.parse(response) : response;
                if (Array.isArray(commits)) {
                  this.commitDays = commits.map((c: any) => c.commit.author.date.split('T')[0]);
                }
              },
              error: (err: any) => console.error("PHP Fetch failed:", err)
            });

          // Kanban initialization
          if (!this.project.techStack) this.project.techStack = [];
          if (!this.project.tasks || Array.isArray(this.project.tasks)) {
            const old = Array.isArray(this.project.tasks) ? this.project.tasks : [];
            this.project.tasks = { ideas: old, doing: [], review: [] };
          }
          this.yearSquares = Array.from({ length: 365 }, (_, i) => i);
          this.generateMonthLabels();
        },
        error: (err: any) => console.error('Failed to load project:', err)
      });
    }
  }

  // --- GitHub Grid Logic ---
  getDateFromIndex(index: number): string {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - (364 - index));
    return d.toISOString().split('T')[0];
  }

  getCommitLevel(index: number): number {
    const date = this.getDateFromIndex(index);
    const count = this.commitDays.filter(d => d === date).length;
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
  }

  generateMonthLabels() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  this.monthLabels = [];
  let lastMonth = -1;

  for (let i = 0; i < 365; i += 7) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (364 - i));
    const monthIndex = date.getUTCMonth();

    if (monthIndex !== lastMonth) {
      this.monthLabels.push({
        name: months[monthIndex],
        col: Math.floor(i / 7) + 1 // CSS grid columns are 1-indexed
      });
      lastMonth = monthIndex;
    }
  }
}

  countCommits(date: string): number {
    return this.commitDays.filter(d => d === date).length;
  }

  // --- Kanban Task Logic ---
  drop(event: CdkDragDrop<string[]>, _col: string) {
    if (!this.isAdmin) return;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.save();
  }

  addTask(col: 'ideas' | 'doing' | 'review') {
    if (!this.isAdmin) return;
    const text = this.newTask[col].trim();
    if (text) {
      this.project.tasks[col].push(text);
      this.newTask[col] = '';
      this.save();
    }
  }

  deleteTask(col: 'ideas' | 'doing' | 'review', index: number) {
    if (!this.isAdmin) return;
    this.project.tasks[col].splice(index, 1);
    this.save();
  }

  private save() {
    if (!this.isAdmin) return;
    this.projectService.updateProject(this.project._id, { tasks: this.project.tasks }).subscribe();
  }

  goBack() {
    this.router.navigate(['/portfolio']);
  }
}
