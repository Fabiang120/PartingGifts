import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app.routes'; // or './app/app-routing.module'

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(FormsModule, HttpClientModule, AppRoutingModule)
  ]
}).catch(err => console.error(err));
