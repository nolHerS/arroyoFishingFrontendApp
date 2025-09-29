import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FishTable } from './components/fish-table/fish-table';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FishTable],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('arroyo-fishing-frontend-app');
}
