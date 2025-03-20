Overview

This project has a Go based backend API that works with the frontend to provide a gift sharing platform. Currently users can create accounts, upload digital gifts (files), assign gifts to receivers, automate email notifications, and securely manage their passwords / accounts.

Setup & Installation

1. Clone the repository to your local machine using Git. 

2. Install Go
https://go.dev/doc/install

After installation, verify the installation with the command go version in the terminal.

3. Install SQLite3
The backend uses SQLite3 as its database engine.

https://www.sqlite.org/download.html

4. Configure the Database
The backend automatically creates and configures the database when you start the server.

5. Install Go Dependencies
Run the following command to install all required Go dependencies:

go mod tidy

This ensures all necessary packages go packages are installed.

6.Install & Configure Gomail
This project uses Gomail to send emails with attachments.

Install Gomail:

go get gopkg.in/gomail.v2

Set Up SMTP Credentials:
The server requires SMTP credentials for sending emails.
In main.go, update the SMTP settings:

smtpHost := "smtp.gmail.com"
smtpPort := 587
senderEmail := "your-email@gmail.com"
senderPassword := "your-app-password"

For Gmail users:
Enable "Less secure apps" access or create an App Password in your Google account.

7.Run the Backend
Start the Go server:
go run main.go

The backend will start listening at http://localhost:8080.

If successful, you should see:

SQLite database is set up and the tables are ready!
Server listening on http://localhost:8080