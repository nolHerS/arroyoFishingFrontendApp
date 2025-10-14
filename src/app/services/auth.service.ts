import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthUser, LoginRequest, LoginResponse, RegisterRequest } from '../models/auth-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';

  // Estado de autenticación reactivo
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario desde localStorage al iniciar
    this.loadUserFromStorage();
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => this.setSession(response))
      );
  }

  /**
   * Registro de usuario
   */
  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/register`, data)
      .pipe(
        tap(response => this.setSession(response))
      );
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Guardar sesión en localStorage
   */
  private setSession(authResult: LoginResponse): void {
  console.log('💾 Guardando sesión:', authResult);
  console.log('💾 Token recibido:', authResult.accessToken); // ✅ Cambiar a accessToken

  localStorage.setItem('token', authResult.accessToken);      // ✅ Cambiar a accessToken
  localStorage.setItem('refreshToken', authResult.refreshToken);
  localStorage.setItem('user', JSON.stringify(authResult.user));

  console.log('💾 Token guardado en localStorage:', localStorage.getItem('token'));

  this.currentUserSubject.next(authResult.user);
  this.isAuthenticatedSubject.next(true);
}

  /**
   * Cargar usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as AuthUser;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        this.logout();
      }
    }
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
  const token = localStorage.getItem('token');
  console.log('🔑 getToken llamado, valor:', token);
  return token;
}

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: 'USER' | 'ADMIN' | 'MODERATOR'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
}