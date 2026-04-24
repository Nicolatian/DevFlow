import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, RouterModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  project: any;

  // One input per column
  newTask = { ideas: '', doing: '', review: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.getProjectById(id).subscribe({
        next: (data) => {
          this.project = data;
          if (!this.project.techStack) {
          this.project.techStack = [];
                                      }
          // Migrate old flat tasks array → new column structure
          if (!this.project.tasks || Array.isArray(this.project.tasks)) {
            const old: string[] = Array.isArray(this.project.tasks) ? this.project.tasks : [];
            this.project.tasks = { ideas: old, doing: [], review: [] };
          }
          // Ensure all columns exist
          this.project.tasks.ideas  ??= [];
          this.project.tasks.doing  ??= [];
          this.project.tasks.review ??= [];
        },
        error: (err) => console.error('Failed to load project:', err)
      });
    }
  }

  // Drop — handles reorder within a column AND transfer between columns
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
    this.projectService.updateProject(this.project._id, { tasks: this.project.tasks }).subscribe();
  }

  goBack() {
    this.router.navigate(['/portfolio']);
  }
}
