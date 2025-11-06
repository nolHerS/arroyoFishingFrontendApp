import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CaptureImage,
  ImageUploadResponse,
  ImageDeleteResponse
} from '../models/capture-image';
import { IMAGE_CONFIG } from '../models/image-config';

@Injectable({
  providedIn: 'root'
})
export class CaptureImageService {
  private apiUrl = `${environment.apiUrl}/api/captures`;

  constructor(private http: HttpClient) {}

  /**
   * Sube una imagen a una captura
   */
  uploadImage(captureId: number, file: File): Observable<CaptureImage> {
    // Validar antes de enviar
    this.validateFile(file);

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<CaptureImage>(
      `${this.apiUrl}/${captureId}/images`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sube múltiples imágenes con progress tracking
   */
  uploadMultipleImages(
    captureId: number,
    files: File[]
  ): Observable<ImageUploadResponse> {
    // Validar todas las imágenes
    files.forEach(file => this.validateFile(file));

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<ImageUploadResponse>(
      `${this.apiUrl}/${captureId}/images/multiple`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sube múltiples imágenes con barra de progreso
   */
  uploadMultipleImagesWithProgress(
    captureId: number,
    files: File[]
  ): Observable<{ progress: number; response?: ImageUploadResponse }> {
    files.forEach(file => this.validateFile(file));

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<ImageUploadResponse>(
      `${this.apiUrl}/${captureId}/images/multiple`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      map((event: HttpEvent<ImageUploadResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total
              ? Math.round((100 * event.loaded) / event.total)
              : 0;
            return { progress };
          case HttpEventType.Response:
            return { progress: 100, response: event.body! };
          default:
            return { progress: 0 };
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene todas las imágenes de una captura
   */
  getImagesByCapture(captureId: number): Observable<CaptureImage[]> {
    return this.http.get<CaptureImage[]>(
      `${this.apiUrl}/${captureId}/images`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene una imagen específica
   */
  getImageById(imageId: number): Observable<CaptureImage> {
    return this.http.get<CaptureImage>(
      `${this.apiUrl}/images/${imageId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina una imagen
   */
  deleteImage(imageId: number): Observable<ImageDeleteResponse> {
    return this.http.delete<ImageDeleteResponse>(
      `${this.apiUrl}/images/${imageId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina todas las imágenes de una captura
   */
  deleteAllImages(captureId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${captureId}/images`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cuenta las imágenes de una captura
   */
  countImages(captureId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.apiUrl}/${captureId}/images/count`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Valida un archivo antes de subirlo
   */
  validateFile(file: File): void {
    // Validar tamaño
    if (file.size > IMAGE_CONFIG.maxFileSize) {
      throw new Error(
        `El archivo ${file.name} excede el tamaño máximo de ${IMAGE_CONFIG.maxFileSize / 1024 / 1024}MB`
      );
    }

    // Validar tipo
    if (!IMAGE_CONFIG.allowedTypes.includes(file.type)) {
      throw new Error(
        `El archivo ${file.name} no es un tipo de imagen válido. Tipos permitidos: ${IMAGE_CONFIG.allowedTypes.join(', ')}`
      );
    }
  }

  /**
   * Formatea el tamaño del archivo para mostrar
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors && error.error.errors.length > 0) {
        errorMessage = error.error.errors.join(', ');
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('❌ Error en CaptureImageService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}