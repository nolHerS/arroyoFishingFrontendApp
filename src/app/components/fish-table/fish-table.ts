import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table'
import { HttpClient } from '@angular/common/http';
import { FishCapture } from '../../models/fish-capture';

@Component({
  selector: 'app-fish-table',
  imports: [ CommonModule, TableModule],
  templateUrl: './fish-table.html',
  styleUrl: './fish-table.css'
})
export class FishTable implements OnInit{

  captures: FishCapture[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
      this.http.get<FishCapture[]>('http://localhost:8080/api/fishCaptures')
  .subscribe({
    next: (data) => this.captures = data,
    error: (err) => console.error('Error cargando capturas:', err)
  });

  }

}
