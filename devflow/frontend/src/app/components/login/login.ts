import { Component } from '@angular/core';
import { ProjectService } from '../../services/project';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  error: string = '';

  constructor(private projectService: ProjectService, private router: Router) {}

  onLogin(event: Event, username: string, password: string) {
    event.preventDefault();
    this.projectService.login({ username, password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token); // Save the badge!
        this.router.navigate(['/kanban']); // Send to Admin page
      },
      error: () => this.error = 'Access Denied: Who do you think you are?'
    });
  }
}
