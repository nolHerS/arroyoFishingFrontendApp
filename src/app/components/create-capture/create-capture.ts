import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../environments/environment';

interface NewCapture {
  fishType: string;
  location: string;
  weight: number;
  captureData: Date;
}

@Component({
  selector: 'app-create-capture',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './create-capture.html',
  styleUrls: ['./create-capture.css']
})
export class CreateCaptureComponent {

  private apiUrl = environment.apiUrl;

   @Output() captureCreated = new EventEmitter<void>(); // AÑADIR ESTA LÍNEA

  displayDialog = false;
  loading = false;
  maxDate: Date = new Date();

  newCapture: NewCapture = {
    fishType: '',
    location: '',
    weight: 0,
    captureData: new Date()
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  openDialog(): void {
    this.displayDialog = true;
    this.resetForm();
  }

  resetForm(): void {
    this.newCapture = {
      fishType: '',
      location: '',
      weight: 0,
      captureData: new Date()
    };
  }

   createCapture(): void {
    if (!this.newCapture.fishType || this.newCapture.weight <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor completa todos los campos obligatorios'
      });
      return;
    }

    this.loading = true;
    this.http.post(`${this.apiUrl}/api/fish-captures`, this.newCapture)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: '¡Captura registrada correctamente!',
            life: 3000
          });
          this.displayDialog = false;
          this.loading = false;

          // REEMPLAZAR window.location.reload() POR:
          this.captureCreated.emit();
        },
        error: (err) => {
          console.error('Error creando captura:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar la captura',
            life: 3000
          });
          this.loading = false;
        }
      });
  }
}