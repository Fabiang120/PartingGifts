import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';

  constructor(private http: HttpClient, private router: Router) { }

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
