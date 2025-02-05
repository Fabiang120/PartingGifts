import { Routes } from '@angular/router';
import { RegisterComponent } from './Components/Register/register.component';
import { BlankComponent } from './Components/blank/blank.component';

export const routes: Routes = [
    { path: 'register', component: RegisterComponent },
    { path: 'blank', component: BlankComponent },
    { path: '', redirectTo: '/register', pathMatch: 'full' }
];
