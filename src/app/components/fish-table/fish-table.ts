import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { FishCapture } from '../../models/fish-capture';
import { User } from '../../models/user';
import { UserFilterPipe } from '../../pipes/user-filter.pipe';

@Component({
  selector: 'app-fish-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    AutoCompleteModule,
    FormsModule,
    HttpClientModule,
    UserFilterPipe
  ],
  templateUrl: './fish-table.html',
  styleUrls: ['./fish-table.css'],
})
export class FishTable implements OnInit {

  captures: FishCapture[] = [];
  users: User[] = [];

  // Filtros
  fishTypeSearch: string = '';
  locationSearch: string = '';
  userSearch: string = '';

  // Opciones maestras
  fishTypeOptions: string[] = [];
  locationOptions: string[] = [];
  userOptions: string[] = [];

  // Sugerencias para autocomplete
  fishTypeSuggestions: string[] = [];
  locationSuggestions: string[] = [];
  userSuggestions: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    forkJoin({
      users: this.http.get<User[]>('http://localhost:8080/api/users'),
      captures: this.http.get<FishCapture[]>('http://localhost:8080/api/fishCaptures')
    }).subscribe({
      next: ({ users, captures }) => {
        this.users = users;
        this.captures = captures;

        // Crear listas únicas para autocompletar
        this.fishTypeOptions = Array.from(new Set(captures.map(c => c.fishType)));
        this.locationOptions = Array.from(new Set(captures.map(c => c.location).filter((l): l is string => !!l)));
        this.userOptions = users.map(u => u.fullName);

        // Inicializar sugerencias con todas las opciones
        this.fishTypeSuggestions = [...this.fishTypeOptions];
        this.locationSuggestions = [...this.locationOptions];
        this.userSuggestions = [...this.userOptions];
      },
      error: (err) => console.error('Error cargando datos:', err)
    });
  }

  filterFishType(event: any) {
  const query = event.query?.toLowerCase() || '';
  if (!query) {
    // Si no escribes nada, muestra todas las opciones
    this.fishTypeSuggestions = [...this.fishTypeOptions];
  } else {
    this.fishTypeSuggestions = this.fishTypeOptions.filter(ft =>
      ft.toLowerCase().includes(query)
    );
  }
}

filterLocation(event: any) {
  const query = event.query?.toLowerCase() || '';
  if (!query) {
    this.locationSuggestions = [...this.locationOptions];
  } else {
    this.locationSuggestions = this.locationOptions.filter(loc => loc.toLowerCase().includes(query));
  }
}


  filterUser(event: any) {
  const query = event.query?.toLowerCase() || '';
  if (!query) {
    // Si no escribes nada, muestra todos los usuarios
    this.userSuggestions = [...this.userOptions];
  } else {
    this.userSuggestions = this.userOptions.filter(u => u.toLowerCase().includes(query));
  }
}


  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.fullName : 'Desconocido';
  }
}
