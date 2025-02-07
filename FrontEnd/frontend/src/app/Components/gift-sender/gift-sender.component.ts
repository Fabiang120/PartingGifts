import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-gift-sender',
    standalone: true,
    imports: [FormsModule, CommonModule],
    template: `
    <h2>Set Up Gift</h2>
    <p>Your username: {{ username }}</p>
    <form (ngSubmit)="uploadGift()" #giftForm="ngForm">
      <div>
        <input type="file" (change)="onFileSelected($event)" required>
      </div>
      <button type="submit" [disabled]="!selectedFile">Upload Gift</button>
      <button type="button" (click)="goBack()">Back</button>
    </form>
    <p *ngIf="message">{{ message }}</p>
  `,
    styleUrls: ['./gift-sender.component.css']
})
export class GiftSenderComponent implements OnInit {
    username = '';
    selectedFile: File | null = null;
    message = '';

    constructor(
        private http: HttpClient,
        private router: Router,
        private userService: UserService
    ) { }

    ngOnInit() {
        if (history.state && history.state.username) {
            this.userService.username = history.state.username;
        }
        this.username = this.userService.username;
    }

    onFileSelected(event: any) {
        if (event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
        }
    }

    uploadGift() {
        if (!this.selectedFile) {
            this.message = 'Please select a file.';
            return;
        }
        const formData = new FormData();
        formData.append('username', this.username);
        formData.append('file', this.selectedFile, this.selectedFile.name);

        this.http
            .post('http://localhost:8080/upload-gift', formData, { responseType: 'text' })
            .subscribe({
                next: (response) => {
                    console.log('Upload response:', response);
                    this.message = response;
                },
                error: (err) => {
                    console.error('Upload error:', err);
                    this.message = 'Gift upload failed. Please try again.';
                }
            });
    }

    goBack() {
        this.router.navigate(['/blank'], { state: { username: this.username } });
    }
}
