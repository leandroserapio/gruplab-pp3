import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './guards/auth.guard';

const authPage = () => import('./pages/auth/auth-page').then((m) => m.AuthPage);

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: authPage,
    canActivate: [guestGuard],
    data: { initialState: 'signIn' },
  },
  {
    path: 'register',
    loadComponent: authPage,
    canActivate: [guestGuard],
    data: { initialState: 'signUp' },
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'mis-aulas', pathMatch: 'full' },
      {
        path: 'mis-aulas',
        loadComponent: () => import('./pages/mis-aulas/mis-aulas').then((m) => m.MisAulas),
      },
      {
        path: 'aula/:id',
        loadComponent: () =>
          import('./pages/aula-detalle/aula-detalle').then((m) => m.AulaDetalle),
      },
      {
        path: 'grupo/:id',
        loadComponent: () =>
          import('./pages/grupo-detalle/grupo-detalle').then((m) => m.GrupoDetalle),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
