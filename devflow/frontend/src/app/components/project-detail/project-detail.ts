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
  commitDays: string[] = [];
  newTask = { ideas: '', doing: '', review: '' };
  yearSquares: number[] = Array.from({ length: 365 }, (_, i) => i);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private http: HttpClient 
  ) {}

 ngOnInit(): void {
   this.commitDays = [];
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.projectService.getProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        const repoPath = `Nicolatian/${this.project.repoName}`; 

        // 1. PHP/MySQL: Track the click
        this.http.post('http://localhost/project_devflow/track.php', { projectId: id })
          .subscribe(() => console.log('Click tracked!'));

        // 2. PHP/MySQL: Fetch cached GitHub history
        this.http.get<any>(`http://localhost/project_devflow/github_proxy.php?repo=${repoPath}`)
          .subscribe({
            next: (response) => {
              const commits = typeof response === 'string' ? JSON.parse(response) : response;
              if (Array.isArray(commits)) {
                this.commitDays = commits.map(c => c.commit.author.date.split('T')[0]);
              }
            },
            error: (err) => console.error("PHP Fetch failed:", err)
          });

        // --- Rest of your Kanban initialization ---
        if (!this.project.techStack) this.project.techStack = [];
        if (!this.project.tasks || Array.isArray(this.project.tasks)) {
          const old = Array.isArray(this.project.tasks) ? this.project.tasks : [];
          this.project.tasks = { ideas: old, doing: [], review: [] };
        }
      },
      error: (err) => console.error('Failed to load project:', err)
    });
  }
}
    // --- GitHub Grid Logic ---
    // square id for GitHub grid
    getDateFromIndex(index: number): string {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0); 
    d.setUTCDate(d.getUTCDate() - (364 - index));
    return d.toISOString().split('T')[0];
  }
    hasCommit(index: number): boolean {
      if (!this.commitDays || this.commitDays.length === 0) return false;
  
    const dateToCheck = this.getDateFromIndex(index);
    const match = this.commitDays.includes(dateToCheck);
  
    if (index > 360) {
        console.log(`Square ${index} is ${dateToCheck}. Match found: ${match}`);
    }
  
    return match;
  }

    countCommits(date: string): number {
    return this.commitDays.filter(d => d === date).length;
  }

  // --- Kanban Task Logic ---
  // Handles reordering tasks within a column and transferring tasks between columns
  drop(event: CdkDragDrop<string[]>, _col: string) {
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
    const text = this.newTask[col].trim();
    if (text) {
      this.project.tasks[col].push(text);
      this.newTask[col] = '';
      this.save();
    }
  }

  deleteTask(col: 'ideas' | 'doing' | 'review', index: number) {
    this.project.tasks[col].splice(index, 1);
    this.save();
  }

  private save() {
    // Persist the updated Kanban state to the MongoDB backend
    this.projectService.updateProject(this.project._id, { tasks: this.project.tasks }).subscribe();
  }

  goBack() {
    this.router.navigate(['/portfolio']);
  }
}
