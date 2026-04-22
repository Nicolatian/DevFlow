import { Routes } from '@angular/router';
import { PortfolioComponent } from './components/portfolio/portfolio';
import { KanbanComponent } from './components/kanban/kanban';
import { ProjectDetail } from './components/project-detail/project-detail';
import { LoginComponent } from './components/login/login'; 
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [
  { path: 'portfolio', component: PortfolioComponent },
  { 
    path: 'kanban', 
    component: KanbanComponent, 
    canActivate: [authGuard] 
  }, 
  { path: 'login', component: LoginComponent }, 
  { path: '', redirectTo: '/portfolio', pathMatch: 'full' },
  { path: 'portfolio/:id', component: ProjectDetail }
];
