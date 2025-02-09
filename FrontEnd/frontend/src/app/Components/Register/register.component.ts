// ------------------------------
// RegisterComponent (register.component.ts)
// ------------------------------
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';        // Provides support for template-driven forms.
import { CommonModule } from '@angular/common';       // Provides common Angular directives.
import { Router } from '@angular/router';             // Used for navigation between routes.
import { HttpClient } from '@angular/common/http';    // Used to send HTTP requests to the backend.

/*
  RegisterComponent manages user registration.
  It collects a username and password from the user, sends a registration request to the backend,
  and then navigates to the blank page with the username if registration is successful.
  It also provides navigation options for forgot password and login.
*/
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = { // Stores registration details.
    username: '',
    password: ''
  };
  message = ''; // Stores messages for user feedback.

  // The constructor injects Router for navigation and HttpClient for backend communication.
  constructor(private router: Router, private http: HttpClient) { }

  // register sends the user's registration details to the backend.
  // On success, it navigates to the blank page and passes the username.
  register() {
    this.http.post('http://localhost:8080/create-account', this.user, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Registration response:', response);
          this.message = response;
          setTimeout(() => {
            this.router.navigate(['/blank'], { state: { username: this.user.username } });
          }, 2000);
        },
        error: (err) => {
          console.error('Registration error:', err);
          if (err.error === "Registration failed: UNIQUE constraint failed: users.username\n") {
            this.message = 'Sorry, that username is taken. Please try again.';
          } else {
            this.message = 'Registration failed. Please try again.';
          }
        }
      });
  }

  // forgotPassword navigates to the forgot-password page.
  forgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  // goToLogin navigates to the login page.
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
