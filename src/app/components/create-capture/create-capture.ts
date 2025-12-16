import { Component, EventEmitter, Output, ViewChild } from '@angular/core';

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
import { CaptureImageService } from '../../services/capture-image.service';
import { ImageUploadComponent } from '../image-upload/image-upload';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    ToastModule,
    ImageUploadComponent
],
  providers: [MessageService],
  templateUrl: './create-capture.html',
  styleUrls: ['./create-capture.css']
})
export class CreateCaptureComponent {
  private apiUrl = environment.apiUrl;

  @Output() captureCreated = new EventEmitter<void>();
  @ViewChild(ImageUploadComponent) imageUpload!: ImageUploadComponent;

  displayDialog = false;
  loading = false;
  maxDate: Date = new Date();
  selectedImages: File[] = [];

  newCapture: NewCapture = {
    fishType: '',
    location: '',
    weight: 0,
    captureData: new Date()
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private captureImageService: CaptureImageService
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
    this.selectedImages = [];
    if (this.imageUpload) {
      this.imageUpload.clearImages();
    }
  }

  onImagesSelected(images: File[]): void {
    this.selectedImages = images;
    console.log('📸 Imágenes seleccionadas:', images.length);
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

    // 1. Crear la captura primero
    this.http.post<any>(`${this.apiUrl}/api/fish-captures`, this.newCapture)
      .subscribe({
        next: (captureResponse) => {
          const captureId = captureResponse.id;
          console.log('✅ Captura creada con ID:', captureId);

          // 2. Si hay imágenes, subirlas
          if (this.selectedImages.length > 0) {
            this.uploadImages(captureId);
          } else {
            // Sin imágenes, terminar
            this.finishCreation('Captura registrada correctamente');
          }
        },
        error: (err) => {
          console.error('❌ Error creando captura:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'No se pudo registrar la captura',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  /**
   * Sube todas las imágenes seleccionadas a Cloudinary a través del backend
   */
  uploadImages(captureId: number): void {
    console.log(`🚀 Iniciando subida de ${this.selectedImages.length} imagen(es) a Cloudinary...`);

    // Subir todas las imágenes en paralelo
    const uploadObservables = this.selectedImages.map(file =>
      this.captureImageService.uploadImage(captureId, file).pipe(
        catchError(error => {
          console.error(`❌ Error subiendo ${file.name}:`, error);
          return of(null); // Continuar con las demás aunque una falle
        })
      )
    );

    forkJoin(uploadObservables).subscribe({
      next: (responses) => {
        const successfulUploads = responses.filter(r => r !== null);
        const failedUploads = responses.length - successfulUploads.length;

        console.log(`✅ ${successfulUploads.length} imagen(es) subida(s) correctamente`);

        if (failedUploads > 0) {
          console.warn(`⚠️ ${failedUploads} imagen(es) no se pudieron subir`);
        }

        let message = '';
        if (successfulUploads.length > 0 && failedUploads === 0) {
          message = `Captura registrada con ${successfulUploads.length} imagen(es)`;
        } else if (successfulUploads.length > 0 && failedUploads > 0) {
          message = `Captura creada. ${successfulUploads.length} imagen(es) subida(s), ${failedUploads} fallaron`;
        } else {
          message = 'Captura creada pero no se pudieron subir las imágenes';
        }

        const severity = failedUploads > 0 ? 'warn' : 'success';
        this.finishCreation(message, severity);
      },
      error: (err) => {
        console.error('❌ Error general subiendo imágenes:', err);
        this.finishCreation(
          'Captura creada pero hubo problemas al subir las imágenes',
          'warn'
        );
      }
    });
  }

  /**
   * Finaliza el proceso de creación de captura
   */
  finishCreation(message: string, severity: 'success' | 'warn' = 'success'): void {
    this.messageService.add({
      severity: severity,
      summary: severity === 'success' ? 'Éxito' : 'Advertencia',
      detail: message,
      life: 3000
    });

    this.displayDialog = false;
    this.loading = false;
    this.captureCreated.emit();
    this.resetForm();
  }
}