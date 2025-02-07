import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

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

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit() {
    // Update the service if username is passed via history.state.
    if (history.state && history.state.username) {
      this.userService.username = history.state.username;
    }
    this.username = this.userService.username;
  }

  goToPersonalDetails() {
    this.router.navigate(['/personal-details'], { state: { username: this.username } });
  }

  goToGiftSender() {
    this.router.navigate(['/gift-sender'], { state: { username: this.username } });
  }
}
