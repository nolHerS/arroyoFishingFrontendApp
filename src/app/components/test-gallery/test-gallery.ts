import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ImageGalleryComponent } from '../image-gallery/image-gallery';

@Component({
  selector: 'app-test-gallery',
  standalone: true,
  imports: [ImageGalleryComponent, FormsModule],
  template: `
    <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
      <h2>Test Galería de Imágenes</h2>
      <p>Ingresa el ID de una captura para ver sus imágenes:</p>
      <input
        type="number"
        [(ngModel)]="captureId"
        placeholder="ID de captura"
        style="padding: 0.5rem; margin-bottom: 1rem;"
        />
        <button (click)="loadGallery()" style="padding: 0.5rem 1rem; margin-left: 0.5rem;">
          Cargar
        </button>
    
        @if (showGallery) {
          <app-image-gallery
            [captureId]="captureId"
            (imageDeleted)="onImageDeleted($event)"
          ></app-image-gallery>
        }
      </div>
    `
})
export class TestGalleryComponent {
  captureId: number = 1;
  showGallery: boolean = false;

  loadGallery() {
    this.showGallery = true;
  }

  onImageDeleted(imageId: number) {
    console.log('Imagen eliminada:', imageId);
  }
}