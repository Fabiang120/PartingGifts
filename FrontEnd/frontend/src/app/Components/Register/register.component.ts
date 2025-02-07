import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    username: '',
    password: ''
  };
  message = '';

  constructor(private router: Router, private http: HttpClient) { }

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
          if (err.error == "Registration failed: UNIQUE constraint failed: users.username\n") this.message = 'Sorry, that username is taken. Please try again.';
          else this.message = 'Registration failed. Please try again.';
        }
      });
  }
}
