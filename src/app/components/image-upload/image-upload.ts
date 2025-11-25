import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { IMAGE_CONFIG } from '../../models/image-config';

interface ImagePreview {
  file: File;
  url: string;
  id: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressBarModule],
  template: `
    <div class="upload-container">
      <!-- Drag & Drop Area -->
      <div
        class="drop-zone"
        [class.drag-over]="isDragging"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)">

        <i class="pi pi-cloud-upload" style="font-size: 3rem; color: #94a3b8;"></i>
        <p class="drop-text">Arrastra imágenes aquí o haz clic para seleccionar</p>
        <p class="drop-hint">Máximo {{ maxImages }} imágenes • PNG, JPG, JPEG • Max {{ maxSizeMB }}MB c/u</p>
      </div>

      <!-- Hidden file input -->
      <input
        #fileInput
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg"
        (change)="onFileSelect($event)"
        style="display: none;" />

      <!-- Preview Grid -->
      <div class="preview-grid" *ngIf="imagePreviews.length > 0">
        <div class="preview-card" *ngFor="let preview of imagePreviews">
          <img [src]="preview.url" [alt]="preview.file.name" />
          <div class="preview-overlay">
            <span class="preview-name">{{ preview.file.name }}</span>
            <span class="preview-size">{{ formatFileSize(preview.file.size) }}</span>
          </div>
          <button
            class="remove-btn"
            (click)="removeImage(preview.id)"
            type="button">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <!-- Upload Progress -->
      <div class="upload-progress" *ngIf="isUploading">
        <p-progressBar [value]="uploadProgress"></p-progressBar>
        <p class="progress-text">Subiendo imágenes... {{ uploadProgress }}%</p>
      </div>

      <!-- Info -->
      <div class="upload-info" *ngIf="imagePreviews.length > 0">
        <span>{{ imagePreviews.length }} de {{ maxImages }} imágenes seleccionadas</span>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      width: 100%;
    }

    .drop-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #f8fafc;
    }

    .drop-zone:hover {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }

    .drop-zone.drag-over {
      border-color: #22c55e;
      background-color: #f0fdf4;
      transform: scale(1.02);
    }

    .drop-text {
      margin: 1rem 0 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: #475569;
    }

    .drop-hint {
      margin: 0;
      font-size: 0.875rem;
      color: #94a3b8;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .preview-card {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .preview-card:hover {
      transform: scale(1.05);
    }

    .preview-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      padding: 0.75rem 0.5rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .preview-name {
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .preview-size {
      color: #cbd5e1;
      font-size: 0.7rem;
    }

    .remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(239, 68, 68, 0.9);
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: white;
    }

    .remove-btn:hover {
      background: rgba(220, 38, 38, 1);
      transform: scale(1.1);
    }

    .upload-progress {
      margin-top: 1.5rem;
    }

    .progress-text {
      text-align: center;
      margin-top: 0.5rem;
      color: #64748b;
      font-size: 0.875rem;
    }

    .upload-info {
      margin-top: 1rem;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
    }
  `]
})
export class ImageUploadComponent {
  @Input() maxImages: number = 10;
  @Output() imagesSelected = new EventEmitter<File[]>();

  imagePreviews: ImagePreview[] = [];
  isDragging = false;
  isUploading = false;
  uploadProgress = 0;

  readonly maxSizeMB = IMAGE_CONFIG.maxFileSize / 1024 / 1024;

  constructor(private messageService: MessageService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  handleFiles(files: File[]): void {
    // Validar cantidad
    if (this.imagePreviews.length + files.length > this.maxImages) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Límite excedido',
        detail: `Solo puedes subir máximo ${this.maxImages} imágenes`,
        life: 3000
      });
      return;
    }

    // Validar y procesar cada archivo
    files.forEach(file => {
      if (this.validateFile(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviews.push({
            file,
            url: e.target?.result as string,
            id: Math.random().toString(36).substr(2, 9)
          });
          this.emitImages();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  validateFile(file: File): boolean {
    // Validar tipo
    if (!IMAGE_CONFIG.allowedTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Tipo no válido',
        detail: `${file.name} no es un tipo de imagen válido`,
        life: 3000
      });
      return false;
    }

    // Validar tamaño
    if (file.size > IMAGE_CONFIG.maxFileSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'Archivo muy grande',
        detail: `${file.name} excede el tamaño máximo de ${this.maxSizeMB}MB`,
        life: 3000
      });
      return false;
    }

    return true;
  }

  removeImage(id: string): void {
    this.imagePreviews = this.imagePreviews.filter(p => p.id !== id);
    this.emitImages();
  }

  emitImages(): void {
    const files = this.imagePreviews.map(p => p.file);
    this.imagesSelected.emit(files);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  clearImages(): void {
    this.imagePreviews = [];
    this.emitImages();
  }

  getFiles(): File[] {
    return this.imagePreviews.map(p => p.file);
  }
}