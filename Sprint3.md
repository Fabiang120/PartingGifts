## Links



## Overview
This document provides a detailed explanation of the backend API endpoints for the application along with a walkthrough of the work for sprint3. The backend is built using Go and SQLite, handling user authentication, file uploads, and automated email notifications. The frontend ---- devin and sanya continue this


## Base URL
```
http://localhost:8080
```

## Sprint 3 Work Walkthrough 


## Brief Overview
During Sprint 3, we focused on rounding out key backend features and improving usability. We added Swagger docs to make the API easier to understand and work with. The dashboard now shows the total number of pending gifts thanks to a missing backend piece we filled in. We added the ability to show or hide passwords on both login and register pages. We also finished the backend logic for the gift scheduling system, giving users the choice to send a gift either at a specific time or after death. Security questions were added to both login and registration for an extra layer of protection. Users can now cancel pending gifts if they change their mind. We also added a gift animation with three.js to the dashboard for each gift. On top of that, we implemented encrypted private messaging with secure storage. 

## Specific Issues Finished 
Add Swagger documentation for API.
Add missing backend implementation to dashboard to show total pending gifts created.
Add Show password on login.
Add Show password on register.
Backend for System of screens that asks the user if they want to send a gift at death or at a time.
Add Security Question logic for login/register.
Add a way for users to stop pending gifts from being sent.
Implement private messaging encryption and storage.
Added gift animation to dashboard with three.js


## Issues Completed descriptions 
Add Swagger documentation for API
Documented all current API routes using Swagger to improve backend visibility and make it easier for developers to understand and test endpoints. There is now also a /swagger route that users can go to read the api documentation.

Add missing backend implementation to dashboard to show total pending gifts created
Connected the backend to the dashboard to accurately display the total number of pending gifts created by the user.

Add Show password on login
Added toggle logic to the login form to show or hide the password input, improving usability.

Add Show password on register
Same functionality as login — added the ability for users to show or hide their password on the registration form.

Backend for system of screens that asks the user if they want to send a gift at death or at a time
Built backend support for the gift-sending flow, allowing users to choose between sending a gift after death (th normal way) or at a specific future time.

Add Security Question logic for login/register
Integrated logic for users to select and answer a security question during registration and verify it during login if needed.

Add a way for users to stop pending gifts from being sent
Implemented functionality that lets users cancel any gift that hasn’t been sent yet, giving them more control.

Implement private messaging encryption and storage
Added encryption to private messages and securely stored them in the database to protect user conversations.

Added gift animation to dashboard with three.js
Integrated a 3D gift opening animation using Three.js to visually enhance the dashboard and make the user experience more engaging.

## Specific Issues Not Finished


## Why Not Finished
We still have some trouble communicating between the frontend and backend team as new dependencies often do not get written down or communication is just overall faulty.

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

Page Load Test
Ensures the Forgot Password page loads correctly.
Expected Result: The page displays the form, buttons, and input fields.

Method Selection Test
Allows users to toggle between Email Reset and Security Question options.
Expected Result: The UI updates based on the selected method.

Security Question Selection Test
Ensures users can select a security question and provide an answer.
Expected Result: The dropdown and input field for security questions appear when the method is selected.

Form Submission (Successful Case)
Mocks a successful API response when submitting the form.
Expected Result: Displays a success message if the request is valid.

Error Handling for Missing Email
Ensures an error message appears when trying to submit the form without an email.
Expected Result: Users are prompted to enter an email before submitting.

Navigation Test
Verifies that clicking "Back to Log in" navigates the user to the login page.
Expected Result: The user is redirected correctly.
Outcome
All tests passed successfully, confirming that the Forgot Password functionality works as expected.


# Backend API Documentation

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

#### Get Security Info
**Endpoint:**
```
POST /get-security-info
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "username": "exampleUser",
  "securityQuestion": "What is your favorite color?"
}
```

---

#### Verify Security Answer
**Endpoint:**
```
POST /verify-security-answer
```
**Request Body:**
```json
{
  "username": "exampleUser",
  "securityAnswer": "Blue"
}
```
**Response:**
- `200 OK` – Correct answer
- `401 Unauthorized` – Incorrect answer

---

### 2. Gift Management

#### Upload Gift
**Endpoint:**
```
POST /upload-gift
```
**Form Data:**
- `username` (string)
- `file` (binary)
- `emailMessage` (string, optional)

**Response:**
- `200 OK` – File uploaded
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
- `200 OK` – Gift stopped
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
- `200 OK` – Receivers set up

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

### 4. Messaging

#### Send Message
**Endpoint:**
```
POST /send-message
```
**Request Body:**
```json
{
  "sender": "user1",
  "receiver": "user2",
  "content": "Hey there!"
}
```
**Response:**
- `200 OK` – Message sent
- `403 Forbidden` – Receiver does not accept messages

---

#### Get Messages
**Endpoint:**
```
GET /get-messages?username=user2
```
**Response:**
```json
[
  {
    "from": "user1",
    "content": "Hey there!",
    "timestamp": "2025-03-28T16:20:00Z"
  }
]
```

---

#### Get Message Notifications
**Endpoint:**
```
GET /notifications?username=user2
```
**Response:**
```json
{
  "unreadMessages": 2
}
```

---

### 5. Privacy Settings

#### Get Privacy Settings
**Endpoint:**
```
GET /get-privacy?username=exampleUser
```
**Response:**
```json
{
  "canReceiveMessages": true,
  "canBeSeen": true,
  "canReceiveGifts": true
}
```

---

#### Update Privacy Settings
**Endpoint:**
```
POST /update-privacy
```
**Request Body:**
```json
{
  "username": "exampleUser",
  "canReceiveMessages": false,
  "canBeSeen": true,
  "canReceiveGifts": true
}
```
**Response:**
- `200 OK` – Settings updated

---

### 6. Scheduled Notifications

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

### 7. Swagger

#### Get API Documentation
**Endpoint:**
```
GET /swagger.json
```
**Response:**
- Swagger JSON definition for API documentation

---

## Error Handling
- `400 Bad Request` – Invalid input
- `401 Unauthorized` – Authentication failure
- `404 Not Found` – Resource not found
- `409 Conflict` – Duplicate resource

## Security Considerations
- Passwords are hashed using bcrypt.
- Sensitive messages are encrypted.
- CORS is enabled for cross-origin requests.
- Email notifications are sent for password resets and gift delivery.

