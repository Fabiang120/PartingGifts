# Backend API Documentation

## Overview
This document provides a detailed explanation of the backend API endpoints for the application along with a walkthrough of the work for sprint2. The backend is built using Go and SQLite, handling user authentication, file uploads, and automated email notifications.


## Base URL
```
http://localhost:8080
```

## Sprint 2 Work Walkthrough 



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

