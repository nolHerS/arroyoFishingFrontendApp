import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import '@angular/platform-browser/animations'; // habilita animaciones globales

bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
})
  .catch((err) => console.error(err));
