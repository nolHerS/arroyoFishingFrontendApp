import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { CaptureImage } from '../../models/capture-image';
import { CaptureImageService } from '../../services/capture-image.service';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [],
  templateUrl: './image-gallery.html',
  styleUrls: ['./image-gallery.css']
})
export class ImageGalleryComponent implements OnInit {
  @Input() captureId!: number;
  @Input() images: CaptureImage[] = [];
  @Input() readonly: boolean = false; // Si es true, no permite eliminar
  @Output() imageDeleted = new EventEmitter<number>();
  @Output() imagesLoaded = new EventEmitter<CaptureImage[]>();

  selectedImage: CaptureImage | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  isModalOpen: boolean = false;

  constructor(private imageService: CaptureImageService) {}

  ngOnInit(): void {
    // Si no se pasan imágenes como Input, las cargamos
    if (this.images.length === 0 && this.captureId) {
      this.loadImages();
    }
  }

  /**
   * Carga las imágenes de la captura
   */
  loadImages(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.imageService.getImagesByCapture(this.captureId).subscribe({
      next: (images) => {
        this.images = images;
        this.isLoading = false;
        this.imagesLoaded.emit(images);
        console.log('✅ Imágenes cargadas:', images);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        console.error('❌ Error cargando imágenes:', error);
      }
    });
  }

  /**
   * Abre el modal para ver la imagen en grande
   */
  openImageModal(image: CaptureImage): void {
    this.selectedImage = image;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this.selectedImage = null;
    this.isModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  /**
   * Elimina una imagen
   */
  deleteImage(image: CaptureImage, event: Event): void {
    event.stopPropagation(); // Evitar que abra el modal

    if (!confirm(`¿Estás seguro de que quieres eliminar "${image.fileName}"?`)) {
      return;
    }

    this.imageService.deleteImage(image.id).subscribe({
      next: (response) => {
        console.log('✅ Imagen eliminada:', response);
        this.images = this.images.filter(img => img.id !== image.id);
        this.imageDeleted.emit(image.id);

        // Cerrar modal si la imagen eliminada estaba abierta
        if (this.selectedImage?.id === image.id) {
          this.closeModal();
        }
      },
      error: (error) => {
        alert(`Error al eliminar la imagen: ${error.message}`);
        console.error('❌ Error eliminando imagen:', error);
      }
    });
  }

  /**
   * Formatea el tamaño del archivo
   */
  getFileSize(bytes: number): string {
    return this.imageService.formatFileSize(bytes);
  }

  /**
   * Formatea la fecha de subida
   */
  getUploadDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Navegación entre imágenes en el modal
   */
  previousImage(): void {
    if (!this.selectedImage) return;

    const currentIndex = this.images.findIndex(img => img.id === this.selectedImage!.id);
    if (currentIndex > 0) {
      this.selectedImage = this.images[currentIndex - 1];
    }
  }

  nextImage(): void {
    if (!this.selectedImage) return;

    const currentIndex = this.images.findIndex(img => img.id === this.selectedImage!.id);
    if (currentIndex < this.images.length - 1) {
      this.selectedImage = this.images[currentIndex + 1];
    }
  }

  /**
   * Manejo de teclas en el modal
   */
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isModalOpen) return;

    switch (event.key) {
      case 'Escape':
        this.closeModal();
        break;
      case 'ArrowLeft':
        this.previousImage();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
    }
  }
}