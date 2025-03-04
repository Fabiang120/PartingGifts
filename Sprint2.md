# Backend API Documentation

## Overview
This document provides a detailed explanation of the backend API endpoints for the application along with a walkthrough of the work for sprint2. The backend is built using Go and SQLite, handling user authentication, file uploads, and automated email notifications.


## Base URL
```
http://localhost:8080
```

## Sprint 2 Work Walkthrough 


## Brief Overview
We completed Issue #4 which was password reset functionality with an email. However, we needed to come up with some additional issues below as our previous user stories didnt cover everything. Below is almost everything we implemented this sprint 2.

## Specific Issues Finished 

Implement a backend for showing receivers and saving receiver emails somewhere in the dashboard possibly.
Make gifts show up from the backend on the dashboard.
Set up session storage for username tracking.
Complete password reset functionality with secure token validation (Issue #4)
Add missing backend implementation to dashboard to show total gifts created.
System to track how long a user has been inactive and then send preset messages to primary contact email.
Add missing backend implementation to dashboard to show total gifts created.
Complete Password Reset UI with email and security question options (Issue #4)
Display receivers of gifts somewhere.
Ensure gifts pop up on dashboard of the user.
Add missing backend implementation to dashboard to show total pending gifts created.
Add a way for users to stop pending gifts from being sent.


## Issues Completed descriptions 

1. Dashboard Enhancements
Receivers & Emails: We built a backend feature that grabs and displays receiver info and saves their emails in a dedicated spot for easy review.
Gifts Display: The dashboard now shows both created and pending gifts, giving users a clear view of their gift activity.
Gift Totals: Added backend support to display the total number of gifts (both created and pending (needs some improvement)).
Cancel Pending Gifts: Introduced a way for users to cancel any pending gifts for better control (needs slight improvements)

2. User Authentication and Session Management
Username Tracking: Set up session storage to remember usernames, making the overall user experience smoother.

3. Password Reset Functionality
Enhanced Reset UI: Upgraded the password reset interface to include an email for a temp password.
Password change : Made sure that the backend makes the user make a new password after logging in with the temp password sent from the reset email.


4. User Inactivity Management
Inactivity Alerts: Developed a system that tracks user inactivity and automatically sends preset messages to the primary contact email.

## Issues Not Finished
Some of these issues not finished were set up in sprint 1 and others were created in sprint 2.

## Specific Issues Not Finished
Implement UI for privacy settings (Issue #7)
Enhance farewell message recording UI (Issue #5)
Implement message notification UI (Issue #9)
Implement private messaging UI (Issue #10)
Develop a way to set up files / record from our site.
Make users have their own email

## Why Not Finished
We had some trouble getting the entire team to communicate and as a result some issues were left unattended to.

## Backend Unit tests
CreateAccountHandler:
Tests the account creation process by validating that a new user is successfully created.

PersonalDetailsHandler:
Checks that user personal details (emails) are correctly updated.

UploadGiftHandler:
Verifies that gift files can be uploaded along with associated metadata like email messages.

LoginHandler:
Confirms that the login endpoint correctly validates user credentials.

SetupReceiversHandler:
Ensures that receivers can be set up for a gift by updating the corresponding record.

GiftCountHandler:
Tests that the correct gift count is returned for a given user.

DownloadGiftHandler:
Validates that a gift file can be successfully retrieved and matches the expected file content.

StopPendingGiftHandler:
Checks the deletion or cancellation process for a pending gift.

sendGiftEmailToReceivers Function:
Verifies that email notifications to gift receivers are sent without error.

sendCheckEmail Function:
Tests the functionality of sending a test (check) email.

ChangePasswordHandler:
Ensures that a user's password can be changed, updates the stored hash, and resets the force-password-change flag.

## Frontend Unit Tests
Dashboard Component:
Displays the dashboard and shows user-specific information (e.g., greeting with username).

ForceChange Component:
Provides a form for changing passwords and handles error display when the passwords do not match.

ForgotPassword Component:
Manages the email input and reset password request, and shows an error message if the reset fails.

LoginPage Component:
Validates login credentials, handles error feedback for wrong username/password, and manages routing upon successful login.

NewMemory Component:
Handles file uploads for a new memory and verifies navigation or UI updates after the upload process.

RegisterPage Component:
Validates user input during registration and submits the registration form while handling potential errors.

RecordMemory Component:
Renders the recording interface for capturing a memory (including video elements) and ensures proper handling of recording functionalities.

WriteMemory Component:
Displays an editor for writing a memory, including a title input and action buttons like "Save Memory" and "Cancel."

PersonalDetails Component:
Renders a form for updating personal details, shows current username information, and includes navigation to privacy settings.

MemoryUploaded Component:
Renders a form for receiver information and triggers an alert when essential session data is missing.

## Cypress Test


## Endpoints

### 1. User Management

#### Create Account
**Endpoint:**
```
POST /create-account
```
**Request Body:**
```json
{
  "username": "exampleUser",
  "password": "SecurePass123!",
  "primary_contact_email": "user@example.com",
  "secondary_contact_emails": "alt@example.com,alt2@example.com"
}
```
**Response:**
- `201 Created` – Account successfully created
- `409 Conflict` – Username already exists
- `400 Bad Request` – Invalid input

---

#### Login
**Endpoint:**
```
POST /login
```
**Request Body:**
```json
{
  "username": "exampleUser",
  "password": "SecurePass123!"
}
```
**Response:**
- `200 OK` – Login successful
- `401 Unauthorized` – Invalid credentials
- `404 Not Found` – User not found

---

#### Reset Password
**Endpoint:**
```
POST /reset-password
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
- `200 OK` – Password reset instructions sent
- `404 Not Found` – Email not found

---

#### Change Password
**Endpoint:**
```
POST /change-password
```
**Request Body:**
```json
{
  "username": "exampleUser",
  "newPassword": "NewSecurePass123!"
}
```
**Response:**
- `200 OK` – Password changed successfully
- `400 Bad Request` – Weak password
- `404 Not Found` – User not found

---

#### Update Personal Details
**Endpoint:**
```
POST /update-emails
```
**Request Body:**
```json
{
  "username": "exampleUser",
  "primary_contact_email": "user@example.com",
  "secondary_contact_emails": "alt@example.com"
}
```
**Response:**
- `200 OK` – Personal details updated
- `404 Not Found` – User not found

---

### 2. Gift Management

#### Upload Gift
**Endpoint:**
```
POST /upload-gift
```
**Form Data:**
- `username` (string) – User uploading the gift
- `file` (binary) – File to be uploaded
- `emailMessage` (string, optional) – Custom message

**Response:**
- `200 OK` – File uploaded successfully
- `404 Not Found` – User not found

---

#### Get Gift Count
**Endpoint:**
```
GET /gift-count?username=exampleUser
```
**Response:**
```json
{
  "count": 5
}
```

---

#### Retrieve Gifts
**Endpoint:**
```
GET /gifts?username=exampleUser
```
**Response:**
```json
[
  {
    "id": 1,
    "file_name": "gift1.pdf",
    "custom_message": "Happy birthday!",
    "upload_time": "2025-03-04T12:00:00Z"
  }
]
```

---

#### Download Gift
**Endpoint:**
```
GET /download-gift?id=1
```
**Response:**
- File download

---

#### Stop Pending Gift
**Endpoint:**
```
DELETE /stop-pending-gift?id=1
```
**Response:**
- `200 OK` – Gift stopped successfully
- `404 Not Found` – Gift not found

---

#### Get Pending Gifts
**Endpoint:**
```
GET /dashboard/pending-gifts?username=exampleUser
```
**Response:**
```json
{
  "pending_messages": 3
}
```

---

### 3. Receivers Management

#### Set Up Receivers
**Endpoint:**
```
POST /setup-receivers
```
**Request Body:**
```json
{
  "giftId": 1,
  "receivers": "receiver1@example.com, receiver2@example.com",
  "customMessage": "Please keep this safe"
}
```
**Response:**
- `200 OK` – Receivers set up successfully

---

#### Get Receivers
**Endpoint:**
```
GET /get-receivers?username=exampleUser
```
**Response:**
```json
["receiver1@example.com", "receiver2@example.com"]
```

---

### 4. Scheduled Notifications

#### Schedule Inactivity Check
**Endpoint:**
```
POST /schedule-check
```
**Request Body:**
```json
{
  "username": "exampleUser",
  "customMessage": "If you do not respond, your gifts will be sent."
}
```
**Response:**
- `200 OK` – Inactivity check scheduled

---

## Error Handling
- `400 Bad Request` – Invalid input
- `401 Unauthorized` – Authentication failure
- `404 Not Found` – Resource not found
- `409 Conflict` – Duplicate resource

## Security Considerations
- Passwords are hashed using bcrypt.
- CORS enabled for cross-origin requests.
- Email notifications for password resets and gift delivery.

