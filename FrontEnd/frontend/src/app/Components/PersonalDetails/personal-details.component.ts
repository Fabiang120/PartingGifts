import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';        // Supports template-driven forms.
import { CommonModule } from '@angular/common';       // Provides common Angular directives.
import { Router } from '@angular/router';             // Enables navigation.
import { HttpClient } from '@angular/common/http';    // Used to communicate with the backend.

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent {
  // 'details' holds the user's data:
  // - 'myEmail' is the user's own email,
  // - 'primaryContactEmail' is the primary contact email,
  // - 'secondaryContactEmails' is an array for additional contact emails.
  details = {
    username: '',
    myEmail: '',
    primaryContactEmail: '',
    secondaryContactEmails: ['']  // Start with one empty secondary email field.
  };
  message = '';  // Used to display feedback messages.

  constructor(private http: HttpClient, private router: Router) {
    if (history.state && history.state.username) {
      this.details.username = history.state.username;
    }
  }

  // Track function for ngFor to keep inputs independent.
  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Adds a new empty secondary email field.
  addSecondaryEmail() {
    this.details.secondaryContactEmails.push('');
  }

  // Removes a secondary email field by index, ensuring at least one field remains.
  removeSecondaryEmail(index: number) {
    if (this.details.secondaryContactEmails.length > 1) {
      this.details.secondaryContactEmails.splice(index, 1);
    }
  }

  // Prepares the payload and sends updated details to the backend.
  // Joins secondary emails into a comma-separated string.
  submitDetails() {
    console.log('Submitted details:', this.details);
    const payload = {
      username: this.details.username,
      myEmail: this.details.myEmail,
      primaryContactEmail: this.details.primaryContactEmail,
      contactEmail: this.details.secondaryContactEmails.join(',')
    };
    this.http.post('http://localhost:8080/update-emails', payload, { responseType: 'text' })
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

  // Navigates back to the blank page.
  goBack() {
    this.router.navigate(['/blank']);
  }
}
