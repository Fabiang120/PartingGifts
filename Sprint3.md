## Links
https://youtu.be/nWV9nsUX-U4
https://youtu.be/P36uWemHHO0


## Overview
This document provides a detailed explanation of the backend API endpoints for the application along with a walkthrough of the work for sprint3. The backend is built using Go and SQLite, handling user authentication, file uploads, and automated email notifications. The frontend ---- devin and sanya continue this


## Base  - backend
```
http://localhost:8080
```

## Base -frontend
```
http://localhost:4200
```

## Sprint 3 Work Walkthrough 


## Brief Details
During Sprint 3, we made numerous backend improvements to enhance overall functionality and user experience. We documented all API routes with Swagger so that developers can easily understand and test the endpoints, and updated the dashboard to display the total number of pending gifts. We also added toggle features on both the login and registration pages so users can choose to show or hide their passwords. Our gift scheduling system was completed, allowing users to decide whether to send a gift at a specific time or upon death, while security questions were integrated into the registration and login flows for added protection. Users can now cancel pending gifts if they change their minds, and we introduced a visually engaging three.js gift unwrapping animation on the dashboard. In addition, we implemented encrypted private messaging with secure storage, improved privacy settings and notification systems, and refined various UI elements—including farewell message recording, login, registration, and home screens—to ensure a smoother, more responsive experience.

## Specific Issues Finished 
1.Add Swagger documentation for API.
2.Add missing backend implementation to dashboard to show total pending gifts created.
3.Add Show password on login.
4.Add Show password on register.
5.Backend for System of screens that asks the user if they want to send a gift at death or at a time.
6.Add Security Question logic for login/register.
7.Add a way for users to stop pending gifts from being sent.
8.Implement private messaging encryption and storage.
9.Added gift animation to dashboard with three.js
10.Develop backend logic for privacy settings and access control.
11.Develop notification system for new messages
12.Enhance farewell message recording UI
13.Implement message notification UI 
Implement private messaging UI 
14.Finish up security question screens.
15.Make the Swagger screen look better.
16.Improve show password frontend on login screen.
17.Add Show password on register.
18.Further improve security question frontend.
19.Fix privacy screen taking a while to load
20.Enhance Dashboard
21.Enhance Login In
22.Enhance Registration
23.Enhance Home


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

Enhance farewell message recording UI
Improved the farewell message recording interface to be more intuitive and visually appealing, making it easier for users to record and review their farewell messages.

Implement message notification UI & Implement private messaging UI
Developed a dedicated UI for message notifications that promptly alerts users of new messages. Additionally, crafted a streamlined private messaging interface that seamlessly integrates with the overall design for a smooth conversation experience.

Finish up security question screens
Completed the security question screens, refining their layout and interaction to ensure a consistent and user-friendly experience during account recovery and verification.

Make the Swagger screen look better
Revamped the Swagger documentation screen with improved styling and responsive design, resulting in a more polished and user-friendly interface.

Improve show password frontend on login screen
Enhanced the login screen’s show password feature to be more responsive and intuitive, allowing users to toggle password visibility effortlessly.

Add Show password on register
Integrated a similar toggle feature on the registration screen, enabling users to reveal their password input for verification, aligning it with the improved login functionality.

Further improve security question frontend
Enhanced the visual and interactive aspects of the security question component, making the selection and answering process smoother and more engaging for users.

Fix privacy screen taking a while to load
Optimized the privacy screen by addressing performance bottlenecks, reducing load times and ensuring a faster, more responsive user experience.

Enhance Dashboard
Upgraded the dashboard with refined design elements and improved performance, offering a more engaging and informative overview for users.

Enhance Login
Streamlined the login interface by refining its design and functionality, ensuring a more secure and user-friendly sign-in process.

Enhance Registration
Revamped the registration process with improved form layouts, better input validation, and an optimized user flow for a smoother onboarding experience.

Enhance Home
Updated the home screen with enhanced navigation, a cleaner design, and more intuitive interactions, providing users with a welcoming and efficient starting point.

## Specific Issues Not Finished
Implement farewell message recording backend logic. 

The backend team has not yet laid the groundwork for saving and retrieving farewell message recordings with the gift feature.

## Why Not Finished
We still have some trouble communicating between the frontend and backend team as new dependencies often do not get written down or communication is just overall faulty.

## Backend Unit Tests

CreateAccountHandler:
Tests the account creation process by ensuring that a new user is successfully created and stored in the database.

PersonalDetailsHandler:
Checks that the user's personal details—such as primary and secondary contact emails—are correctly updated.

UploadGiftHandler:
Verifies that gift files can be uploaded along with associated metadata (like email messages), ensuring the gift is stored properly.

LoginHandler:
Confirms that the login endpoint validates user credentials correctly by comparing submitted credentials with stored hashes.

SetupReceiversHandler:
Ensures that receivers for a gift are correctly set up by updating the gift record with receiver information.

GiftCountHandler:
Tests that the endpoint returns the accurate count of gifts associated with a user, confirming proper aggregation.

DownloadGiftHandler:
Validates that a gift file can be retrieved and that its content exactly matches what was originally uploaded.

StopPendingGiftHandler:
Checks the process to cancel a pending gift, confirming that the gift is removed or marked as canceled appropriately.

sendGiftEmailToReceivers Function:
Verifies that the function responsible for sending gift email notifications to receivers completes without errors.

sendCheckEmail Function:
Tests the functionality of sending a test (check) email, ensuring that email communication works as expected.

ChangePasswordHandler:
Ensures that a user's password can be changed successfully, updating the stored hash and resetting the force-password-change flag.

GetMessagesHandler:
Tests retrieval of user messages, ensuring that messages are decrypted and formatted correctly for display.

GetPrivacyHandler:
Verifies that a user's privacy settings are fetched correctly from the database.

UpdatePrivacyHandler:
Checks that updates to a user's privacy settings are properly processed and stored in the database.

GetMessageNotificationHandler:
Confirms that message notifications are accurately retrieved, ensuring timely alerts for new messages.

ScheduleInactivityCheckHandler:
Validates that an inactivity check is scheduled according to user settings, ensuring the correct backend logic is triggered.

GetReceiversHandler:
Tests that the gift receivers' information is successfully retrieved for display or further processing.

VerifySecurityAnswerHandler:
Checks that the provided security answer is validated against stored data, ensuring proper verification during account recovery.

GetSecurityInfoHandler:
Tests that the endpoint correctly retrieves security information, aiding in password reset and verification workflows.

ResetPasswordHandler:
Validates that the password reset process works as intended by confirming the password is updated and the response indicates success.

## Frontend Unit Tests Documentation

Page Component Tests

Dashboard Component
Verifies dashboard correctly displays personalized user greeting ("Hello testUser!")

ForceChange Component
Tests password change form validation shows errors when passwords don't match

ForgotPassword Component
Confirms email submission works and error handling functions when reset fails

Login Component
Checks error messages appear after invalid login attempts

NewMemory Component
Verifies upload interface renders properly with functional upload button

Register Component
Ensures all registration fields (name, email, password) render correctly

RecordMemory Component
Tests video recording interface loads with proper media controls

WriteMemory Component
Confirms editor displays with title field, formatting options and action buttons

PersonalDetails Component
Verifies user details display with update functionality and navigation controls

MemoryUploaded Component
Tests alert functionality when session data is missing during form submission

UI Component Tests

UserHeader Component
Verifies username appears when authenticated and redirects when not

WriteMemory Editor
Tests text input and formatting button functionality

Dashboard Gift Display
Confirms gifts render properly and unwrapping animation triggers correctly

SimpleGiftBox Component
Tests gift rendering in both closed and opening states with proper callbacks

Basic UI Components

Header: Tests navigation display and mobile menu toggle

Hero: Verifies marketing headline and image appear correctly

LoginForm: Confirms all login fields render with proper labels

UI Library Tests

Button: Tests rendering variants, sizes, click handling and child composition

Card: Verifies all card subcomponents render with proper customization

Input: Tests rendering of different input types and change event handling

Label: Confirms text rendering and form control associations

Badge: Tests variant styling and custom class application

Checkbox: Verifies basic rendering and customization
NavigationMenu: Tests proper rendering of navigation hierarchy

Component Integration: Confirms UI components work together properly in forms

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

Explanation:
This endpoint registers a new user account. The client must provide a unique username, a secure password (meeting complexity requirements), and at least a primary contact email. Optional secondary contact emails may be provided. If the username already exists, the server returns a conflict error; otherwise, the account is created and a success status is returned.
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

Explanation:
This endpoint authenticates a user. The client sends a username and password. If the credentials match an existing user, the server responds with a success status. In case of invalid credentials or if the user does not exist, the server returns an error status accordingly.
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

Explanation:
This endpoint initiates a password reset process. The client provides an email address (either primary or secondary). If the email matches a registered user, the server sends password reset instructions (usually via email) and returns a success status. If no user is found with the given email, a not found error is returned.
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

Explanation:
This endpoint allows a user to change their password. The client must provide the username and a new password that meets the defined complexity requirements. If the new password is too weak or the user does not exist, the appropriate error is returned. Otherwise, the password is updated and a success status is sent.
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

Explanation:
This endpoint updates a user’s contact details. The client sends the username along with new primary and optional secondary email addresses. The server updates the user's record with the new information. If the user is not found, an error is returned.
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
Explanation:
This endpoint retrieves a user’s security question and username based on the provided email. It is used when a user has forgotten their password or needs to verify their identity. The server searches for the email among both primary and secondary contact emails and returns the associated security question.
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

Explanation:
This endpoint verifies the answer to the user’s security question. The client sends the username and the answer provided by the user. The server compares this answer with the stored answer (ignoring case and extra spaces). If the answer is correct, a success status is returned; if incorrect, an unauthorized error is sent.
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

**Explanation:**  
This endpoint allows a user to upload a gift file. The request must include the user's username and the file to be uploaded. Optionally, a custom email message can be provided. The server validates the username, processes the file upload, and stores the file data along with the message in the database. If the file is successfully stored, a success message along with the gift ID is returned; if the user does not exist, a 404 error is returned.
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
Explanation:
This endpoint returns the total number of gifts that have been uploaded by a specific user. The username is passed as a query parameter. The server retrieves the user’s gift count from the database and returns it in JSON format. This is useful for providing a summary of a user’s gift activity.


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
Explanation:
This endpoint retrieves a list of all gifts uploaded by a specific user. The username is provided as a query parameter. The response is a JSON array of gift objects, each containing details such as the gift ID, file name, custom message, and upload time. The list is typically sorted by the upload time in descending order, allowing the most recent gifts to appear first.
---

#### Download Gift
**Endpoint:**
```
GET /download-gift?id=1
```
**Response:**
- File download

Explanation:
This endpoint facilitates the download of a specific gift file. The gift ID is passed as a query parameter. The server retrieves the file data from the database and serves it with the correct MIME type and inline disposition, so the file can either be viewed in the browser or downloaded by the user. If the gift is not found, an error is returned.
---

#### Stop Pending Gift
**Endpoint:**
```
DELETE /stop-pending-gift?id=1
```
**Response:**
- `200 OK` – Gift stopped
- `404 Not Found` – Gift not found

Explanation:
This endpoint is used to cancel a pending gift before it is sent. The gift ID is provided as a query parameter. The server checks if the gift exists and is still pending; if so, it deletes or cancels the gift, returning a success message. If the gift cannot be found or is no longer pending, an appropriate error is returned.
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
Explanation:
This endpoint provides the number of pending gifts for a specific user. The username is passed as a query parameter. The server calculates the count of gifts that are marked as pending in the database and returns this information in a JSON object under the key pending_messages. This helps users monitor if there are any gifts scheduled to be sent.
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

Explanation:
This endpoint assigns one or more receiver email addresses to a specific gift identified by giftId. The receivers field accepts a comma-separated list of email addresses. The optional customMessage allows the sender to include a personalized note with the gift. Once the receivers are set up, the system schedules the gift email to be sent, subject to pending status checks and any scheduled delay if applicable.
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
Explanation:
This endpoint retrieves a unique list of receiver email addresses associated with the specified user. It scans through the gifts records for the given user, aggregates the receivers fields (splitting comma-separated values), and returns the consolidated list in JSON format.
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

Explanation:
This endpoint allows a user (sender) to send a message to another user (receiver). The message content is encrypted using AES before being stored in the database to ensure confidentiality. If the receiver’s privacy settings indicate that they do not accept messages, the API returns a 403 Forbidden error.


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
Explanation:
This endpoint retrieves all messages for the specified user, sorted by timestamp (most recent first). The stored message content is decrypted before being returned so that the client receives the original text. Each message object includes the sender's username, the decrypted content, and the timestamp in ISO 8601 format.


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
Explanation:
This endpoint returns the number of unread messages for a given user. It queries the database to count messages that have not been marked as read and returns the count in a JSON object, allowing the client to notify the user accordingly.
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

Explanation:
This endpoint retrieves the current privacy settings for the specified user. The response includes boolean values indicating whether the user can receive messages, be seen by others, and receive gifts. If no custom settings exist in the database, the default values (true) are returned.

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

Explanation:
This endpoint allows the user to update their privacy settings. The request body should include the username and the new boolean values for each privacy option. On success, the system updates the settings in the database (or inserts new settings if they do not exist) and returns a confirmation message.

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

- **Schedule Inactivity Check Endpoint:**  
  The Schedule Inactivity Check endpoint (POST /schedule-check) initiates an asynchronous process that monitors user activity. Once triggered, the system periodically checks for any pending gifts associated with the user. If no action is taken within a predefined period (default of 1 minute with additional checks every 10 seconds), an inactivity email is sent to the user's primary email address. This email warns that pending gifts may be dispatched if no response is received, allowing the user an opportunity to cancel the process if desired.

---

### 7. Swagger

#### Get API Documentation
**Endpoint:**
```
GET /swagger.json
```
**Response:**
- Returns the Swagger JSON definition that documents all API endpoints

- **Swagger Endpoint:**  
  The Swagger endpoint (`GET /swagger.json`) returns a comprehensive JSON document that describes all available API endpoints. This documentation is used by developers to understand how to interact with the API, including details about request and response formats.
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

