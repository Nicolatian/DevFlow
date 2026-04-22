import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; 
import { ProjectService } from '../../services/project';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for adding tasks
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop'; // The Trello Magic

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, RouterModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  project: any;
  newTaskText: string = ''; // For the "Add Task" input

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.getProjectById(id).subscribe((data) => {
        this.project = data;
        // Ensure tasks exists so the board doesn't crash
        if (!this.project.tasks) this.project.tasks = [];
      });
    }
  }

  // Handle Drag & Drop reordering
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.project.tasks, event.previousIndex, event.currentIndex);
    this.updateBackend();
  }

  // Add a new card
  addTask() {
    if (this.newTaskText.trim()) {
      this.project.tasks.push(this.newTaskText.trim());
      this.newTaskText = '';
      this.updateBackend();
    }
  }

  // Remove a card
  deleteTask(index: number) {
    this.project.tasks.splice(index, 1);
    this.updateBackend();
  }

  // Save the new state to MongoDB
  updateBackend() {
    this.projectService.updateProject(this.project._id, { tasks: this.project.tasks }).subscribe();
  }

  goBack() {
    this.router.navigate(['/portfolio']);
  }
}
