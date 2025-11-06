import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'capturas',
    pathMatch: 'full'
  },
  {
    path: 'capturas',
    loadComponent: () => import('./components/fish-table/fish-table').then(m => m.FishTable)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
  path: 'test-gallery',
  loadComponent: () => import('./components/test-gallery/test-gallery').then(m => m.TestGalleryComponent)
  },
  {
    path: '**',
    redirectTo: 'capturas'
  }
];