import { Routes } from '@angular/router';
import { PortfolioComponent } from './components/portfolio/portfolio';
import { KanbanComponent } from './components/kanban/kanban';
import { ProjectDetail } from './components/project-detail/project-detail';

export const routes: Routes = [
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'admin', component: KanbanComponent },
  { path: '', redirectTo: '/portfolio', pathMatch: 'full' },
  { path: 'portfolio/:id', component: ProjectDetail }
];
