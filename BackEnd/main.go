package main

import (
	"database/sql"  // Used to interact with the SQLite database.
	"encoding/json" // Used to decode JSON requests.
	"fmt"           // Provides formatted I/O functions.
	"io"            // Provides functions for reading file data.
	"log"           // Used for logging errors and informational messages.
	"net/http"      // Provides HTTP server and routing functionality.
	"time"          // Provides time-related functions such as delays.

	"gopkg.in/gomail.v2" // Used for sending emails with attachments.

	_ "github.com/mattn/go-sqlite3" // SQLite3 driver for database connectivity.

	"regexp"  //NEW: Added for username validation
	"unicode" //NEW: Added for password validation

	"golang.org/x/crypto/bcrypt" //NEW: Added for password hashing
)

// User represents a user in the system. The JSON tags are set so that they match the keys sent by the Angular frontend.
type User struct {
	ID                     int    `json:"id"`                            // The unique ID for the user.
	Username               string `json:"username"`                      // The username of the user.
	Password               string `json:"password"`                      // The user's password.
	MyEmail                string `json:"myEmail,omitempty"`             // The user's own email address.
	PrimaryContactEmail    string `json:"primaryContactEmail,omitempty"` // The primary contact email.
	SecondaryContactEmails string `json:"contactEmail,omitempty"`        // The secondary contact emails, stored as a comma‐separated string.
}

var db *sql.DB // Global variable for the database connection.

// main opens the database, creates necessary tables, sets up HTTP routes, and starts the server.
func main() {
	// Open (or create) the SQLite database file.
	var err error
	db, err = sql.Open("sqlite3", "./app.db")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	// Ensures the database connection is closed when main exits.
	defer db.Close()

	// Creates the users table if it does not already exist.
	createUsersTableSQL := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE,
		password TEXT,
		my_email TEXT,
		primary_contact_email TEXT,
		secondary_contact_emails TEXT
	);
	`
	if _, err := db.Exec(createUsersTableSQL); err != nil {
		log.Fatalf("Failed to create users table: %v", err)
	}

	// Create the gifts table if it does not already exist.
	createGiftsTableSQL := `
	CREATE TABLE IF NOT EXISTS gifts (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER,
		file_name TEXT,
		file_data BLOB,
		upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);
	`
	if _, err := db.Exec(createGiftsTableSQL); err != nil {
		log.Fatalf("Failed to create gifts table: %v", err)
	}

	// Print a confirmation that the database and tables are ready.
	fmt.Println("SQLite database is set up and the tables are ready!")

	// Set up HTTP endpoints and assign handler functions for each route.
	http.HandleFunc("/create-account", createAccountHandler)
	http.HandleFunc("/update-emails", personalDetailsHandler)
	http.HandleFunc("/upload-gift", uploadGiftHandler)
	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/reset-password", resetPasswordHandler)

	// Start the HTTP server on port 8080.
	fmt.Println("Server listening on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// NEW: function to validate username(4-20 characters,only letters,numbers,underscores)
func isValidUsername(username string) bool {
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9_]{4,20}$`, username)
	return matched
}

// NEW: function to validate password
func isValidPassword(password string) bool {
	var hasLetter, hasNumber, hasSpecial bool

	for _, char := range password {
		switch {
		case unicode.IsLetter(char):
			hasLetter = true
		case unicode.IsNumber(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}
	return len(password) >= 8 && hasLetter && hasNumber && hasSpecial
}

// NEW: username validation,password validation adn password hashing
func createAccountHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	//handles pre flight OPTIONS requests
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	//only allows POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	// Decodes the JSON payload into a User struct.
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid username. Must be 4-20 characters,only letters,numbers and underscore.", http.StatusBadRequest)
		return
	}
	if !isValidPassword(user.Password) {
		http.Error(w, "Invalid Password.Must be  at least 8 characters with a mix of letters,numbers and special characters.", http.StatusBadRequest)
		return
	}

	//NEW: check if username already exists
	var existingID int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", user.Username).Scan(&existingID)
	if err == nil { // If a row is found, username exists
		http.Error(w, "Username is taken. Please choose another.", http.StatusConflict)
		return
	}
	// NEW: Hash the password before storing it
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// NEW: Store hashed password instead of plain text
	stmt, err := db.Prepare("INSERT INTO users(username, password) VALUES(?, ?)")
	if err != nil {
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(user.Username, hashedPassword) // ✅ NEW: Using hashed password
	if err != nil {
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Account created successfully"))
}

// enableCors sets the CORS headers so that the Angular frontend (http://localhost:4200) is allowed to access the backend.
func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// personalDetailsHandler updates a user's email details by decoding the JSON payload and updating the database record.
func personalDetailsHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)

	// Handles pre-flight OPTIONS request.
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	// Only allow POST requests.
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Decode the JSON payload into a User struct.
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Prepare the SQL statement to update the email fields for the given username.
	stmt, err := db.Prepare("UPDATE users SET my_email = ?, primary_contact_email = ?, secondary_contact_emails = ? WHERE username = ?")
	if err != nil {
		log.Printf("Error preparing update statement: %v", err)
		http.Error(w, fmt.Sprintf("Update failed: %v", err), http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	// Execute the update statement.
	res, err := stmt.Exec(user.MyEmail, user.PrimaryContactEmail, user.SecondaryContactEmails, user.Username)
	if err != nil {
		log.Printf("Error executing update: %v", err)
		http.Error(w, fmt.Sprintf("Update failed: %v", err), http.StatusInternalServerError)
		return
	}

	// Check if any rows were affected, to determine if the username existed.
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		log.Printf("Error retrieving affected rows: %v", err)
		http.Error(w, fmt.Sprintf("Update failed: %v", err), http.StatusInternalServerError)
		return
	}
	if rowsAffected == 0 {
		http.Error(w, "No user found with that username", http.StatusNotFound)
		return
	}

	// Respond with a success message.
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Personal details updated successfully"))
}

// uploadGiftHandler processes file uploads (gifts), inserts the file into the database, and starts a timer to send the gift via email.
func uploadGiftHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)

	// Handles pre-flight OPTIONS request.
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	// Only allow POST requests.
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Parses the multipart form, with a maximum file size of 10MB.
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Error parsing multipart form", http.StatusBadRequest)
		return
	}

	// Retrieves the username from the form values.
	username := r.FormValue("username")
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	// Retrieves the custom email message (if provided) from the form.
	customMessage := r.FormValue("emailMessage")

	// Retrieves the file from the form.
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Reads the file data into memory.
	fileData, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file data", http.StatusInternalServerError)
		return
	}

	// Retrieves the user's ID from the database using the provided username.
	var userID int
	err = db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Prepares the SQL statement to insert the gift into the gifts table.
	stmt, err := db.Prepare("INSERT INTO gifts(user_id, file_name, file_data) VALUES(?, ?, ?)")
	if err != nil {
		log.Printf("Error preparing gift insert: %v", err)
		http.Error(w, fmt.Sprintf("Upload failed: %v", err), http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	// Executes the statement to insert the gift.
	_, err = stmt.Exec(userID, header.Filename, fileData)
	if err != nil {
		log.Printf("Error executing gift insert: %v", err)
		http.Error(w, fmt.Sprintf("Upload failed: %v", err), http.StatusInternalServerError)
		return
	}

	// Starts a timer to send the gift via email after a set delay (e.g., 1 minute).
	delay := time.Minute * 1 // This delay can be adjusted as needed.
	go func(username, fileName string, fileData []byte, customMessage string) {
		time.Sleep(delay)
		// Calls sendGiftByEmail to send the gift email with the custom message.
		err := sendGiftByEmail(username, fileName, fileData, customMessage)
		if err != nil {
			log.Printf("Error sending gift email: %v", err)
		} else {
			log.Printf("Gift email sent successfully for user: %s", username)
		}
	}(username, header.Filename, fileData, customMessage)

	// Responds with a success message.
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Gift uploaded successfully"))
}

// resetPasswordHandler handles password reset requests by decoding the JSON payload and verifying the user.
func resetPasswordHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)

	// Handles pre-flight OPTIONS request.
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	// Only allow POST requests.
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Decodes the JSON payload that contains the email.
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Retrieves the user ID by matching the provided email with my_email or contact_email.
	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE my_email = ? OR contact_email = ?", req.Email, req.Email).Scan(&userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Responds that password reset instructions have been sent.
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password reset instructions have been sent to your email."))
}

// loginHandler handles user login by decoding the credentials and checking them against the database.
func loginHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)

	// Handle pre-flight OPTIONS requests.
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	// Only allow POST requests.
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Decode the JSON payload containing the username and password.
	var credentials struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Retrieve the stored password from the database for the given username.
	var storedPassword string
	err := db.QueryRow("SELECT password FROM users WHERE username = ?", credentials.Username).Scan(&storedPassword)
	if err != nil {
		// If no rows are returned, the user does not exist.
		if err == sql.ErrNoRows {
			log.Printf("No user found with username: %s", credentials.Username)
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			log.Printf("Encountered a login error: %v", err)
			http.Error(w, "Login error", http.StatusInternalServerError)
		}
		return
	}

	// Check if the provided password matches the stored password.
	if credentials.Password != storedPassword {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// If credentials are valid, respond with a success message.
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Login successful"))
}

// sendGiftByEmail sends the uploaded gift file to the user's contact email using gomail.
// It uses a custom email body if provided; otherwise, it uses a default message.
func sendGiftByEmail(username, fileName string, fileData []byte, customBody string) error {
	// Retrieve the user's primary contact email from the database.
	var contactEmail string
	err := db.QueryRow("SELECT primary_contact_email FROM users WHERE username = ?", username).Scan(&contactEmail)
	if err != nil {
		return fmt.Errorf("failed to retrieve primary contact email: %v", err)
	}

	smtpHost := "smtp.gmail.com"            // SMTP server host.
	smtpPort := 587                         // SMTP server port.
	senderEmail := "f3243329@gmail.com"     // Sender's email address.
	senderPassword := "auca xxpm lziz vrjg" // Sender's email password.

	m := gomail.NewMessage()
	m.SetHeader("From", senderEmail)            // Set the sender's email.
	m.SetHeader("To", contactEmail)             // Set the recipient's email.
	m.SetHeader("Subject", "Your Parting Gift") // Set the email subject.

	var body string
	if customBody != "" {
		body = customBody
	} else {
		body = fmt.Sprintf("Hello,\n\nPlease find attached your parting gift: %s", fileName)
	}
	m.SetBody("text/plain", body)

	m.Attach(fileName, gomail.SetCopyFunc(func(w io.Writer) error {
		_, err := w.Write(fileData)
		return err
	}))

	d := gomail.NewDialer(smtpHost, smtpPort, senderEmail, senderPassword)
	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	return nil
}
