import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  message = '';

  constructor(private http: HttpClient, private router: Router) { }

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
