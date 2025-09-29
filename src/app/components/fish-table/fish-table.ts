import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table'
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-fish-table',
  imports: [ CommonModule, TableModule, HttpClientModule],
  templateUrl: './fish-table.html',
  styleUrl: './fish-table.css'
})
export class FishTable {

}
