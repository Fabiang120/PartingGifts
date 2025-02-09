Clone the repository to your local machine using Git. Once you have the code, open a terminal in the project directory.

GOLANG
Next, install Go by downloading it from golang.org/dl. Follow the installer instructions for your operating system, then verify the installation by running go version in your terminal.

SQLITE3

For SQLite3 on Windows, download the precompiled binary from the SQLite Download Page. Look for the "sqlite-tools" package for Windows. After downloading, extract the zip file and place the resulting folder (containing sqlite3.exe) in a convenient location. To make it easier to run SQLite from any command prompt, add the folder path to your system’s PATH environment variable. You can verify the installation by opening a new Command Prompt or PowerShell window and running sqlite3 --version.

The project automatically creates or opens an SQLite database file named app.db. If you want to create a new database manually, open your terminal and type sqlite3 app.db to start the SQLite command-line interface. You can then run SQL commands (like CREATE TABLE IF NOT EXISTS ...) to set up your database schema. This project’s Go code handles this automatically.

RUN THE BACKEND
Before running the project, execute go mod tidy in the project directory to install all required dependencies. Finally, start the server by running go run main.go. The server will open or create the app.db file, ensure a users table exists (with unique usernames and passwords), and listen on port 8080 for JSON registration requests at the /create-account endpoint, with CORS enabled for requests coming from http://localhost:4200.


GOMAIL

This project uses the gomail.v2 package to handle email sending with attachments. To install gomail, run the following command in your project directory:go get gopkg.in/gomail.v2

This command downloads and installs the gomail package, which simplifies the process of creating and sending emails, including handling attachments. In the code, gomail is imported with the line import "gopkg.in/gomail.v2"