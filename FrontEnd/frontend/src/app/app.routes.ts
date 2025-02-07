import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './Components/Register/register.component';
import { BlankComponent } from './Components/blank/blank.component';
import { PersonalDetailsComponent } from './Components/PersonalDetails/personal-details.component';
import { GiftSenderComponent } from './Components/gift-sender/gift-sender.component';
import { ForgotPasswordComponent } from './Components/forgot-password/forgot-password.component';  

export const routes: Routes = [
    { path: '', redirectTo: '/register', pathMatch: 'full' },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent }, 
    { path: 'blank', component: BlankComponent },
    { path: 'personal-details', component: PersonalDetailsComponent },
    { path: 'gift-sender', component: GiftSenderComponent },
    { path: '**', redirectTo: '/register' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
