import { Component, signal } from '@angular/core';
import { FishTable } from './components/fish-table/fish-table';

@Component({
  selector: 'app-root',
  imports: [FishTable],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('arroyo-fishing-frontend-app');
}
