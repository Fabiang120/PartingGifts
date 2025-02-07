import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blank',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p>Blank page works!</p>
    <button (click)="goToPersonalDetails()">Enter Personal Details</button>
    <button (click)="goToGiftSender()">Set Up Gift?</button>
  `,
  styleUrls: ['./blank.component.css']
})
export class BlankComponent {
  username = '';

  constructor(private router: Router) {
    if (history.state && history.state.username) {
      this.username = history.state.username;
    }
  }

  goToPersonalDetails() {
    this.router.navigate(['/personal-details'], { state: { username: this.username } });
  }

  goToGiftSender() {
    this.router.navigate(['/gift-sender'], { state: { username: this.username } });
  }
}
