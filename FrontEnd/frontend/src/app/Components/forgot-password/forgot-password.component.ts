// ------------------------------
// ForgotPasswordComponent (forgot-password.component.ts)
// ------------------------------
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Supports template-driven forms.
import { CommonModule } from '@angular/common'; // Provides common Angular directives.
import { HttpClient } from '@angular/common/http'; // Enables HTTP communication with the backend.
import { Router } from '@angular/router'; // Used for navigation if needed.

/*
  ForgotPasswordComponent provides a form for users to request a password reset.
  It sends the email entered by the user to the backend and displays feedback messages.
*/
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';    // Stores the email entered by the user.
  message: string = '';  // Stores a success or error message.

  // Inject HttpClient for making requests and Router for potential navigation.
  constructor(private http: HttpClient, private router: Router) { }

  // resetPassword sends a POST request to the backend with the user's email.
  // It updates the message property based on the response.
  resetPassword() {
    this.http.post('http://localhost:8080/reset-password', { email: this.email }, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          this.message = 'Check your email for instructions to reset your password.';
        },
        error: (err) => {
          console.error('Error resetting password:', err);
          this.message = 'Failed to send password reset email. Please try again later.';
        }
      });
  }
}
