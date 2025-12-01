import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map } from 'rxjs';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { FishCapture } from '../../models/fish-capture';
import { User } from '../../models/user';
import { CaptureImage } from '../../models/capture-image';
import { CreateCaptureComponent } from '../create-capture/create-capture';
import { environment } from '../../../environments/environment';
import { CaptureImageService } from '../../services/capture-image.service';

interface CaptureWithImages extends FishCapture {
  images: CaptureImage[];
  userName: string;
}

@Component({
  selector: 'app-fish-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    ButtonModule,
    SkeletonModule,
    CreateCaptureComponent
  ],
  templateUrl: './fish-table.html',
  styleUrls: ['./fish-table.css'],
})
export class FishTable implements OnInit {
  capturesWithImages: CaptureWithImages[] = [];
  filteredCaptures: CaptureWithImages[] = [];
  users: User[] = [];
  loading = true;

  private apiUrl = environment.apiUrl;

  // Imagen por defecto para capturas sin foto
  private readonly DEFAULT_FISH_IMAGE = '/assets/placeholder-fish.png';

  // Filtros
  fishTypeSearch: string = '';
  locationSearch: string = '';
  userSearch: string = '';

  // Opciones maestras
  fishTypeOptions: string[] = [];
  locationOptions: string[] = [];
  userOptions: string[] = [];

  // Sugerencias
  fishTypeSuggestions: string[] = [];
  locationSuggestions: string[] = [];
  userSuggestions: string[] = [];

  constructor(
    private http: HttpClient,
    private captureImageService: CaptureImageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    console.log('🎣 Cargando capturas con imágenes...');

    forkJoin({
      users: this.http.get<User[]>(`${this.apiUrl}/api/users`),
      captures: this.http.get<FishCapture[]>(`${this.apiUrl}/api/fish-captures`)
    }).subscribe({
      next: ({ users, captures }) => {
        this.users = users;

        // Cargar imágenes para cada captura
        const capturesWithImagesObservables = captures.map(capture =>
          this.captureImageService.getImagesByCapture(capture.id).pipe(
            map(images => ({
              ...capture,
              images: images || [],
              userName: this.getUserName(capture.userId)
            } as CaptureWithImages))
          )
        );

        forkJoin(capturesWithImagesObservables).subscribe({
          next: (capturesWithImages) => {
            this.capturesWithImages = capturesWithImages;
            this.filteredCaptures = [...this.capturesWithImages];
            this.initializeFilters(captures);
            this.loading = false;
            console.log('✅ Capturas con imágenes cargadas:', this.capturesWithImages);
          },
          error: (err) => {
            console.error('❌ Error cargando imágenes:', err);
            // Mostrar capturas sin imágenes si falla
            this.capturesWithImages = captures.map(c => ({
              ...c,
              images: [],
              userName: this.getUserName(c.userId)
            }));
            this.filteredCaptures = [...this.capturesWithImages];
            this.initializeFilters(captures);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error cargando datos:', err);
        this.loading = false;
      }
    });
  }

  initializeFilters(captures: FishCapture[]): void {
    this.fishTypeOptions = Array.from(new Set(captures.map(c => c.fishType)));
    this.locationOptions = Array.from(
      new Set(captures.map(c => c.location).filter((l): l is string => !!l))
    );
    this.userOptions = this.users.map(u => u.fullName);

    this.fishTypeSuggestions = [...this.fishTypeOptions];
    this.locationSuggestions = [...this.locationOptions];
    this.userSuggestions = [...this.userOptions];
  }

  applyFilters(): void {
    this.filteredCaptures = this.capturesWithImages.filter(capture => {
      const fishTypeMatch = !this.fishTypeSearch ||
        capture.fishType.toLowerCase().includes(this.fishTypeSearch.toLowerCase());

      const locationMatch = !this.locationSearch ||
        (capture.location || '').toLowerCase().includes(this.locationSearch.toLowerCase());

      const userMatch = !this.userSearch ||
        capture.userName.toLowerCase().includes(this.userSearch.toLowerCase());

      return fishTypeMatch && locationMatch && userMatch;
    });
  }

  filterFishType(event: any): void {
    const query = event.query?.toLowerCase() || '';
    this.fishTypeSuggestions = this.fishTypeOptions.filter(ft =>
      ft.toLowerCase().includes(query)
    );
  }

  filterLocation(event: any): void {
    const query = event.query?.toLowerCase() || '';
    this.locationSuggestions = this.locationOptions.filter(loc =>
      loc.toLowerCase().includes(query)
    );
  }

  filterUser(event: any): void {
    const query = event.query?.toLowerCase() || '';
    this.userSuggestions = this.userOptions.filter(u =>
      u.toLowerCase().includes(query)
    );
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.fullName : 'Desconocido';
  }

  clearFilters(): void {
    this.fishTypeSearch = '';
    this.locationSearch = '';
    this.userSearch = '';
    this.filteredCaptures = [...this.capturesWithImages];
    this.fishTypeSuggestions = [...this.fishTypeOptions];
    this.locationSuggestions = [...this.locationOptions];
    this.userSuggestions = [...this.userOptions];
  }

  onCaptureCreated(): void {
    console.log('🎣 Nueva captura creada, recargando...');
    this.loadData();
  }

  /**
   * Obtiene la imagen principal de la captura o una imagen por defecto
   * @param capture Captura con imágenes
   * @returns URL de la imagen a mostrar
   */
  getMainImage(capture: CaptureWithImages): string {
    // Si tiene imágenes, usar la primera
    if (capture.images && capture.images.length > 0) {
      return capture.images[0].thumbnailUrl || capture.images[0].originalUrl;
    }

    // Si no tiene imágenes, retornar imagen por defecto
    return this.DEFAULT_FISH_IMAGE;
  }

  /**
   * Maneja el error de carga de imagen
   * @param event Evento de error
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.DEFAULT_FISH_IMAGE;
  }
}