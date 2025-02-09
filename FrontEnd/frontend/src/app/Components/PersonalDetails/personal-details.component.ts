// ------------------------------
// PersonalDetailsComponent (personal-details.component.ts)
// ------------------------------
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';        // Supports template-driven forms.
import { CommonModule } from '@angular/common';       // Provides common Angular directives.
import { Router } from '@angular/router';             // Enables navigation.
import { HttpClient } from '@angular/common/http';    // Used to communicate with the backend.

/*
  PersonalDetailsComponent allows users to update their personal email details.
  It retrieves the current username from the navigation state and sends the updated
  email information to the backend for storage.
*/
@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent {
  details = { // Holds user details to be updated.
    username: '',
    myEmail: '',
    contactEmail: ''
  };
  message = ''; // Stores feedback messages.

  // The constructor injects HttpClient and Router; it also retrieves the username from history state.
  constructor(private http: HttpClient, private router: Router) {
    if (history.state && history.state.username) {
      this.details.username = history.state.username;
    }
  }

  // submitDetails sends the updated email details to the backend.
  // It logs the submission and updates the message based on the backend response.
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

  // goBack navigates back to the blank page.
  goBack() {
    this.router.navigate(['/blank']);
  }
}
