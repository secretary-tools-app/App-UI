import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'atas' },
  {
    path: 'login',
    data: { animation: 'auth' },
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    data: { animation: 'auth' },
    loadComponent: () => import('./features/auth/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'atas',
    canActivate: [authGuard],
    data: { animation: 'atas' },
    loadComponent: () =>
      import('./features/atas/ata-list/ata-list.component').then((m) => m.AtaListComponent),
  },
  {
    path: 'atas/nova',
    canActivate: [authGuard],
    data: { actionBar: true, animation: 'detail' },
    loadComponent: () =>
      import('./features/atas/nova-ata/nova-ata.component').then((m) => m.NovaAtaComponent),
  },
  {
    path: 'atas/planning',
    canActivate: [authGuard],
    data: { animation: 'planning' },
    loadComponent: () =>
      import('./features/atas/planning/planning.component').then((m) => m.PlanningComponent),
  },
  {
    path: 'atas/:id/sacramental',
    canActivate: [authGuard],
    data: { actionBar: true, animation: 'detail' },
    loadComponent: () =>
      import('./features/atas/sacramental-form/sacramental-form.component').then(
        (m) => m.SacramentalFormComponent
      ),
  },
  {
    path: 'atas/:id/batismo',
    canActivate: [authGuard],
    data: { actionBar: true, animation: 'detail' },
    loadComponent: () =>
      import('./features/atas/batismo-form/batismo-form.component').then(
        (m) => m.BatismoFormComponent
      ),
  },
  {
    path: 'atas/:id/preview',
    canActivate: [authGuard],
    data: { actionBar: true, animation: 'detail' },
    loadComponent: () =>
      import('./features/atas/ata-preview/ata-preview.component').then(
        (m) => m.AtaPreviewComponent
      ),
  },
  {
    path: 'tarefas',
    canActivate: [authGuard],
    data: { animation: 'tarefas' },
    loadComponent: () =>
      import('./features/tarefas/tarefas.component').then((m) => m.TarefasComponent),
  },
  {
    path: 'configuracoes',
    canActivate: [authGuard],
    data: { animation: 'config' },
    loadComponent: () =>
      import('./features/configuracoes/configuracoes.component').then((m) => m.ConfiguracoesComponent),
  },
  { path: '**', redirectTo: 'atas' },
];
