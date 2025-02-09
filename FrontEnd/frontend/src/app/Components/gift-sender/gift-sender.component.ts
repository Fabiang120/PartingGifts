// ------------------------------
// GiftSenderComponent (gift-sender.component.ts)
// ------------------------------
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';      // Supports template-driven forms.
import { CommonModule } from '@angular/common';     // Provides common Angular directives.
import { HttpClient } from '@angular/common/http';  // Enables HTTP communication with the backend.
import { Router } from '@angular/router';           // Facilitates navigation.
import { UserService } from '../../services/user.service'; // Shares the current user's username.

/*
  GiftSenderComponent allows users to upload a gift file and optionally enter a custom email message.
  After the file is uploaded, a timer is started that will eventually trigger sending the gift via email.
*/
@Component({
    selector: 'app-gift-sender',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './gift-sender.component.html',
    styleUrls: ['./gift-sender.component.css']
})
export class GiftSenderComponent implements OnInit {
    username = '';                // Stores the current username.
    selectedFile: File | null = null; // Holds the file selected by the user.
    emailMessage: string = '';    // Holds the custom email message entered by the user.
    message = '';                 // Displays feedback messages.

    // Inject HttpClient, Router, and UserService.
    constructor(
        private http: HttpClient,
        private router: Router,
        private userService: UserService
    ) { }

    // On initialization, the component retrieves the username from history.state or the UserService.
    ngOnInit() {
        if (history.state && history.state.username) {
            this.userService.username = history.state.username;
        }
        this.username = this.userService.username;
    }

    // onFileSelected is triggered when the user selects a file; it saves the first selected file.
    onFileSelected(event: any) {
        if (event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
        }
    }

    // uploadGift packages the username, selected file, and custom email message into a FormData object
    // and sends it to the backend to be processed. It also starts a timer to send an email with the gift.
    uploadGift() {
        if (!this.selectedFile) {
            this.message = 'Please select a file.';
            return;
        }
        const formData = new FormData();
        formData.append('username', this.username);
        formData.append('file', this.selectedFile, this.selectedFile.name);
        formData.append('emailMessage', this.emailMessage);

        this.http.post('http://localhost:8080/upload-gift', formData, { responseType: 'text' })
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

    // goBack navigates back to the blank page, preserving the username.
    goBack() {
        this.router.navigate(['/blank'], { state: { username: this.username } });
    }
}
