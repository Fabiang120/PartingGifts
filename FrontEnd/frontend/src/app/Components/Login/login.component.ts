// ------------------------------
// LoginComponent (login.component.ts)
// ------------------------------
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';        // Supports template-driven forms.
import { CommonModule } from '@angular/common';       // Provides common Angular directives.
import { HttpClient } from '@angular/common/http';    // Enables HTTP requests to the backend.
import { Router } from '@angular/router';             // Facilitates navigation.

/*
  LoginComponent handles user login.
  It collects the user's credentials, sends them to the backend for verification,
  and navigates to the blank page upon successful login.
*/
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { // Stores the username and password entered by the user.
    username: '',
    password: ''
  };
  message = ''; // Stores feedback messages for the user.

  // Injects HttpClient for making HTTP requests and Router for navigation.
  constructor(private http: HttpClient, private router: Router) { }

  // login sends the user's credentials to the backend.
  // On a successful response, it navigates to the blank page with the username passed as state.
  login() {
    this.http.post('http://localhost:8080/login', this.credentials, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Login response:', response);
          this.message = response;
          setTimeout(() => {
            this.router.navigate(['/blank'], { state: { username: this.credentials.username } });
          }, 2000);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.message = 'Login failed. Please try again.';
        }
      });
  }
}
