import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'vistoria/:token',
    loadComponent: () => import('./features/public-inspection/public-inspection.page').then(m => m.PublicInspectionPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { path: 'modelos', loadComponent: () => import('./features/templates/templates.page').then(m => m.TemplatesPage) },
      { path: 'vistorias', loadComponent: () => import('./features/inspections/inspections.page').then(m => m.InspectionsPage) }
    ]
  },
  { path: '**', redirectTo: '' }
];
