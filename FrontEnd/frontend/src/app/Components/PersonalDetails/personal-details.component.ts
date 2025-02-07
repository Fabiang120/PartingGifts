import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent {
  details = {
    username: '',
    myEmail: '',
    contactEmail: ''
  };
  message = '';

  constructor(private http: HttpClient, private router: Router) {
    if (history.state && history.state.username) {
      this.details.username = history.state.username;
    }
  }

  submitDetails() {
    console.log('Submitted details:', this.details);
    this.http.post('http://localhost:8080/update-emails', this.details, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Update response:', response);
          this.message = response;
        },
        error: (err) => {
          console.error('Update error:', err);
          this.message = 'Update failed. Please try again.';
        }
      });
  }

  goBack() {
    this.router.navigate(['/blank']);
  }
}
