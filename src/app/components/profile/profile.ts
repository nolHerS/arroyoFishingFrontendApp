import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/auth-user';
import { FishCapture } from '../../models/fish-capture';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    FormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user: AuthUser | null = null;
  myCaptures: FishCapture[] = [];
  loading = false;

  // Dialog para editar captura
  displayEditDialog = false;
  editingCapture: FishCapture | null = null;

  // Dialog para confirmar eliminación
  displayDeleteDialog = false;
  deletingCapture: FishCapture | null = null;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.loadMyCaptures();
    }
  }

  loadMyCaptures(): void {
    if (!this.user) return;

    this.loading = true;
    this.http.get<FishCapture[]>(`http://localhost:8080/api/fish-captures/user/${this.user.username}`)
      .subscribe({
        next: (captures) => {
          this.myCaptures = captures;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando capturas:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar tus capturas'
          });
          this.loading = false;
        }
      });
  }

  openEditDialog(capture: FishCapture): void {
    this.editingCapture = { ...capture };
    this.displayEditDialog = true;
  }

  saveCapture(): void {
    if (!this.editingCapture) return;

    this.loading = true;
    this.http.put<FishCapture>(
      `http://localhost:8080/api/fish-captures/${this.editingCapture.id}`,
      this.editingCapture
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Captura actualizada correctamente'
        });
        this.displayEditDialog = false;
        this.loadMyCaptures();
      },
      error: (err) => {
        console.error('Error actualizando captura:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la captura'
        });
        this.loading = false;
      }
    });
  }

  openDeleteDialog(capture: FishCapture): void {
    this.deletingCapture = capture;
    this.displayDeleteDialog = true;
  }

  confirmDelete(): void {
    if (!this.deletingCapture) return;

    this.loading = true;
    this.http.delete(`http://localhost:8080/api/fish-captures/${this.deletingCapture.id}`)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Captura eliminada correctamente'
          });
          this.displayDeleteDialog = false;
          this.loadMyCaptures();
        },
        error: (err) => {
          console.error('Error eliminando captura:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la captura'
          });
          this.loading = false;
        }
      });
  }
}