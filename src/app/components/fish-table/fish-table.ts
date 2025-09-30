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
import { ButtonDirective, Button } from "primeng/button";
import { ButtonIcon } from "../../../../node_modules/primeng/button/index";

@Component({
  selector: 'app-fish-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    AutoCompleteModule,
    FormsModule,
    HttpClientModule,
    UserFilterPipe,
    Button
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

  // Sugerencias
  fishTypeSuggestions: string[] = [];
  locationSuggestions: string[] = [];
  userSuggestions: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('FishTable inicializado ✅');
    forkJoin({
      users: this.http.get<User[]>('http://localhost:8080/api/users'),
      captures: this.http.get<FishCapture[]>('http://localhost:8080/api/fishCaptures')
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
    console.log('Filtrando fishType con:', query, '->', this.fishTypeSuggestions);
  }

  filterLocation(event: any) {
    const query = event.query?.toLowerCase() || '';
    this.locationSuggestions = this.locationOptions.filter(loc => loc.toLowerCase().includes(query));
    console.log('Filtrando location con:', query, '->', this.locationSuggestions);
  }

  filterUser(event: any) {
    const query = event.query?.toLowerCase() || '';
    this.userSuggestions = this.userOptions.filter(u => u.toLowerCase().includes(query));
    console.log('Filtrando user con:', query, '->', this.userSuggestions);
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.fullName : 'Desconocido';
  }

    clearFilters() {
  this.fishTypeSearch = '';
  this.locationSearch = '';
  this.userSearch = '';

  // Reiniciar sugerencias si quieres
  this.fishTypeSuggestions = [...this.fishTypeOptions];
  this.locationSuggestions = [...this.locationOptions];
  this.userSuggestions = [...this.userOptions];
}
}
