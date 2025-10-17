import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { FishCapture } from '../../models/fish-capture';
import { User } from '../../models/user';
import { UserFilterPipe } from '../../pipes/user-filter.pipe';
import { CreateCaptureComponent } from '../create-capture/create-capture';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-fish-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    AutoCompleteModule,
    FormsModule,
    UserFilterPipe,
    CreateCaptureComponent
  ],
  templateUrl: './fish-table.html',
  styleUrls: ['./fish-table.css'],
})
export class FishTable implements OnInit {
  captures: FishCapture[] = [];
  users: User[] = [];

  private apiUrl = environment.apiUrl;

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    console.log('FishTable inicializado ✅');

    forkJoin({
      users: this.http.get<User[]>('${this.apiUrl}/api/users'),
      captures: this.http.get<FishCapture[]>('${this.apiUrl}/api/fish-captures')
    }).subscribe({
      next: ({ users, captures }) => {
        console.log('Usuarios cargados:', users);
        console.log('Capturas cargadas:', captures);

        this.users = users;
        this.captures = captures;

        this.fishTypeOptions = Array.from(new Set(captures.map(c => c.fishType)));
        this.locationOptions = Array.from(new Set(captures.map(c => c.location).filter((l): l is string => !!l)));
        this.userOptions = users.map(u => u.fullName);

        this.fishTypeSuggestions = [...this.fishTypeOptions];
        this.locationSuggestions = [...this.locationOptions];
        this.userSuggestions = [...this.userOptions];

        console.log('Opciones inicializadas:', {
          fishTypes: this.fishTypeOptions,
          locations: this.locationOptions,
          users: this.userOptions
        });
      },
      error: (err) => console.error('❌ Error cargando datos:', err)
    });
  }

  filterFishType(event: any) {
    const query = event.query?.toLowerCase() || '';
    this.fishTypeSuggestions = this.fishTypeOptions.filter(ft => ft.toLowerCase().includes(query));
  }

  filterLocation(event: any) {
    const query = event.query?.toLowerCase() || '';
    this.locationSuggestions = this.locationOptions.filter(loc => loc.toLowerCase().includes(query));
  }

  filterUser(event: any) {
    const query = event.query?.toLowerCase() || '';
    this.userSuggestions = this.userOptions.filter(u => u.toLowerCase().includes(query));
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.fullName : 'Desconocido';
  }

  clearFilters() {
    this.fishTypeSearch = '';
    this.locationSearch = '';
    this.userSearch = '';
    this.fishTypeSuggestions = [...this.fishTypeOptions];
    this.locationSuggestions = [...this.locationOptions];
    this.userSuggestions = [...this.userOptions];
  }

  onCaptureCreated(): void {
    console.log('🎣 Nueva captura creada, recargando tabla...');
    this.loadData(); // Recarga solo los datos de la tabla
  }
}