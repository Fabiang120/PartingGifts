// ------------------------------
// BlankComponent (blank.component.ts)
// ------------------------------
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

/*
  BlankComponent is a simple landing page that provides navigation options.
  It retrieves the current username from the shared UserService or history state and
  offers buttons to navigate to the personal details page or the gift sender page.
*/
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
export class BlankComponent implements OnInit {
  username = '';

  // Inject Router for navigation and UserService for sharing the username.
  constructor(private router: Router, private userService: UserService) { }

  // On initialization, update the UserService with the username from history.state (if available)
  // and then set the local username.
  ngOnInit() {
    if (history.state && history.state.username) {
      this.userService.username = history.state.username;
    }
    this.username = this.userService.username;
  }

  // Navigates to the personal details page with the username in state.
  goToPersonalDetails() {
    this.router.navigate(['/personal-details'], { state: { username: this.username } });
  }

  // Navigates to the gift sender page with the username in state.
  goToGiftSender() {
    this.router.navigate(['/gift-sender'], { state: { username: this.username } });
  }
}
