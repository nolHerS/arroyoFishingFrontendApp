import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth-user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onLogin(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    console.log('🔐 Intentando login con:', this.credentials);
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/capturas';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage = error.error?.message || 'Usuario o contraseña incorrectos';
        this.loading = false;
      }
    });
  }
}