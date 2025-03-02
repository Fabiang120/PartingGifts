package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"
	"regexp"
	"strings" // required for splitting secondary emails
	"time"
	"unicode"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
)

// User represents a user in the system.
type User struct {
	ID                     int    `json:"id"`
	Username               string `json:"username"`
	Password               string `json:"password"`
	PrimaryContactEmail    string `json:"primary_contact_email,omitempty"`
	SecondaryContactEmails string `json:"secondary_contact_emails,omitempty"`
}

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("sqlite3", "./app.db")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Create tables if they do not exist.
	createUsersTableSQL := `
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        primary_contact_email TEXT,
        secondary_contact_emails TEXT,
        receivers Text,
        force_password_change BOOLEAN DEFAULT 0
    );
    `

	if _, err := db.Exec(createUsersTableSQL); err != nil {
		log.Fatalf("Failed to create users table: %v", err)
	}

	createGiftsTableSQL := `
    CREATE TABLE IF NOT EXISTS gifts (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        file_name TEXT,
        file_data BLOB,
        custom_message TEXT,
        upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    `
	if _, err := db.Exec(createGiftsTableSQL); err != nil {
		log.Fatalf("Failed to create gifts table: %v", err)
	}

	fmt.Println("SQLite database is set up and the tables are ready!")

    // Register endpoints.
    http.HandleFunc("/create-account", createAccountHandler)
    http.HandleFunc("/update-emails", personalDetailsHandler)
    http.HandleFunc("/upload-gift", uploadGiftHandler)
    http.HandleFunc("/login", loginHandler)
    http.HandleFunc("/reset-password", resetPasswordHandler)
    http.HandleFunc("/change-password", changePasswordHandler)
    http.HandleFunc("/setup-receivers", setupReceiversHandler)
    http.HandleFunc("/gift-count", giftCountHandler)
    http.HandleFunc("/gifts", getGiftsHandler)
    http.HandleFunc("/download-gift", downloadGiftHandler)
    http.HandleFunc("/dashboard/pending-gifts", pendingGiftsHandler)
    http.HandleFunc("/get-receivers", GetReceiverHandler)
    http.HandleFunc("/schedule-check", scheduleInactivityCheckHandler)


	fmt.Println("Server listening on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func generateRandomPassword(length int) (string, error) {
	const charset = "abcdefghijklmnopqrstuvwxyz" +
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"
	password := make([]byte, length)
	for i := range password {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", err
		}
		password[i] = charset[num.Int64()]
	}
	return string(password), nil
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func createAccountHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if !isValidPassword(user.Password) {
		http.Error(w, "Invalid Password. Must be at least 8 characters with a mix of letters, numbers and special characters.", http.StatusBadRequest)
		return
	}

	// Check if the username already exists.
	var existingID int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", user.Username).Scan(&existingID)
	if err == nil {
		http.Error(w, "Username is taken. Please choose another.", http.StatusConflict)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// Insert both primary and secondary emails.
	stmt, err := db.Prepare("INSERT INTO users(username, password, primary_contact_email, secondary_contact_emails) VALUES(?, ?, ?, ?)")
	if err != nil {
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	// If SecondaryContactEmails is empty, pass an empty string.
	_, err = stmt.Exec(user.Username, hashedPassword, user.PrimaryContactEmail, user.SecondaryContactEmails)
	if err != nil {
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Account created successfully"))
}

// Endpoint to return the count of gifts for a given username.
func giftCountHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Get the username from the query parameters.
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	// Retrieve the user ID for the provided username.
	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Count the number of gifts for this user.
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM gifts WHERE user_id = ?", userID).Scan(&count)
	if err != nil {
		http.Error(w, "Error retrieving gift count", http.StatusInternalServerError)
		return
	}

	// Respond with the count as JSON.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"count": count})
}

func pendingGiftsHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w) // Ensure CORS is enabled

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Query to count pending gifts (messages that haven't been sent)
	var pendingCount int
	err := db.QueryRow(`
        SELECT COUNT(*) FROM gifts g
        LEFT JOIN users u ON g.user_id = u.id
        WHERE u.receivers IS NULL OR u.receivers = '';
    `).Scan(&pendingCount)

	if err != nil {
		log.Printf("Error retrieving pending messages count: %v", err)
		http.Error(w, "Error retrieving pending messages count", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"pending_messages": pendingCount})
}

// downloadGiftHandler serves the gift file for inline viewing or download.
func downloadGiftHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	// Get the gift id from the query parameters.
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Gift id is required", http.StatusBadRequest)
		return
	}
	// Retrieve the file name and file data from the gifts table.
	var fileName string
	var fileData []byte
	err := db.QueryRow("SELECT file_name, file_data FROM gifts WHERE id = ?", id).Scan(&fileName, &fileData)
	if err != nil {
		http.Error(w, "Gift not found", http.StatusNotFound)
		return
	}
	if len(fileData) == 0 {
		http.Error(w, "No file data available", http.StatusInternalServerError)
		return
	}
	// Determine the Content-Type based on the file extension.
	contentType := "application/octet-stream"
	lowerName := strings.ToLower(fileName)
	if strings.HasSuffix(lowerName, ".jpg") || strings.HasSuffix(lowerName, ".jpeg") {
		contentType = "image/jpeg"
	} else if strings.HasSuffix(lowerName, ".png") {
		contentType = "image/png"
	} else if strings.HasSuffix(lowerName, ".gif") {
		contentType = "image/gif"
	}
	// Set headers.
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=%s", fileName))
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(fileData)))
	w.WriteHeader(http.StatusOK)
	w.Write(fileData)
}

func getGiftsHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}
	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	rows, err := db.Query("SELECT id, file_name, custom_message, upload_time FROM gifts WHERE user_id = ? ORDER BY upload_time DESC", userID)
	if err != nil {
		http.Error(w, "Error retrieving gifts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type Gift struct {
		ID            int    `json:"id"`
		FileName      string `json:"file_name"`
		CustomMessage string `json:"custom_message"`
		UploadTime    string `json:"upload_time"`
	}
	var gifts []Gift
	for rows.Next() {
		var gift Gift
		if err := rows.Scan(&gift.ID, &gift.FileName, &gift.CustomMessage, &gift.UploadTime); err != nil {
			continue
		}
		gifts = append(gifts, gift)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(gifts)
}

func isValidUsername(username string) bool {
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9_]{4,20}$`, username)
	return matched
}

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

func personalDetailsHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case http.MethodGet:
		// Retrieve user details.
		username := r.URL.Query().Get("username")
		if username == "" {
			http.Error(w, "Username is required", http.StatusBadRequest)
			return
		}
		var user User
		err := db.QueryRow("SELECT username, primary_contact_email, secondary_contact_emails FROM users WHERE username = ?", username).
			Scan(&user.Username, &user.PrimaryContactEmail, &user.SecondaryContactEmails)
		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	case http.MethodPost:
		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		stmt, err := db.Prepare("UPDATE users SET primary_contact_email = ?, secondary_contact_emails = ? WHERE username = ?")
		if err != nil {
			log.Printf("Error preparing update statement: %v", err)
			http.Error(w, fmt.Sprintf("Update failed: %v", err), http.StatusInternalServerError)
			return
		}
		defer stmt.Close()
		res, err := stmt.Exec(user.PrimaryContactEmail, user.SecondaryContactEmails, user.Username)
		if err != nil {
			log.Printf("Error executing update: %v", err)
			http.Error(w, fmt.Sprintf("Update failed: %v", err), http.StatusInternalServerError)
			return
		}
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
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Personal details updated successfully"))
	default:
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

func resetPasswordHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Look up user by primary_contact_email (or secondary_contact_emails if needed)
	var userID int
	var currentHash string
	err := db.QueryRow("SELECT id, password FROM users WHERE primary_contact_email = ? OR secondary_contact_emails = ?", req.Email, req.Email).Scan(&userID, &currentHash)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	newPassword, err := generateRandomPassword(12)
	if err != nil {
		http.Error(w, "Error generating new password", http.StatusInternalServerError)
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error generating password", http.StatusInternalServerError)
		return
	}

	_, err = db.Exec("UPDATE users SET password = ?, force_password_change = 1 WHERE id = ?", hashed, userID)
	if err != nil {
		http.Error(w, "Error updating password", http.StatusInternalServerError)
		return
	}

	smtpHost := "smtp.gmail.com"
	smtpPort := 587
	senderEmail := "f3243329@gmail.com"
	senderPassword := "auca xxpm lziz vrjg"

	m := gomail.NewMessage()
	m.SetHeader("From", senderEmail)
	m.SetHeader("Subject", "Your New Password")
	m.SetHeader("To", req.Email)
	body := fmt.Sprintf("Hello,\n\nYour new password is: %s\n\nYou will be required to change your password on next login.", newPassword)
	m.SetBody("text/plain", body)

	d := gomail.NewDialer(smtpHost, smtpPort, senderEmail, senderPassword)
	if err := d.DialAndSend(m); err != nil {
		log.Printf("Failed to send email for user %s: %v", req.Email, err)
		fmt.Println("Failed to send email")
	} else {
		fmt.Println("Succeeded")
	}

	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password reset instructions have been sent to your email."))
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	var credentials struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var storedPassword string
	var forceChange bool
	var userID int

	err := db.QueryRow("SELECT id, password, force_password_change FROM users WHERE username = ?",
		credentials.Username).Scan(&userID, &storedPassword, &forceChange)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No user found with username: %s", credentials.Username)
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			log.Printf("Encountered a login error: %v", err)
			http.Error(w, "Login error", http.StatusInternalServerError)
		}
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(credentials.Password))
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	response := struct {
		Message     string `json:"message"`
		ForceChange bool   `json:"forceChange"`
	}{
		Message:     "Login successful",
		ForceChange: forceChange,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func changePasswordHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Username    string `json:"username"`
		NewPassword string `json:"newPassword"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if !isValidPassword(req.NewPassword) {
		http.Error(w, "Invalid Password. Must be at least 8 characters with a mix of letters, numbers and special characters.", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	result, err := db.Exec("UPDATE users SET password = ?, force_password_change = 0 WHERE username = ?",
		hashedPassword, req.Username)
	if err != nil {
		http.Error(w, "Failed to update password", http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, "Error checking update status", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Password changed successfully"})
}

func uploadGiftHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	log.Printf("uploadGiftHandler called, method: %s", r.Method)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Error parsing multipart form", http.StatusBadRequest)
		return
	}

	username := r.FormValue("username")
	log.Printf("Username received: '%s'", username)
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	// Read custom message from form data.
	customMessage := r.FormValue("emailMessage")

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	fileData, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file data", http.StatusInternalServerError)
		return
	}
	log.Printf("Received file: %s, size: %d bytes", header.Filename, len(fileData))

	var userID int
	err = db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		log.Printf("Error retrieving user ID for username '%s': %v", username, err)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	log.Printf("User ID for username '%s': %d", username, userID)

	// Insert the gift record along with the custom message.
	stmt, err := db.Prepare("INSERT INTO gifts(user_id, file_name, file_data, custom_message) VALUES(?, ?, ?, ?)")
	if err != nil {
		log.Printf("Error preparing gift insert: %v", err)
		http.Error(w, fmt.Sprintf("Upload failed: %v", err), http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(userID, header.Filename, fileData, customMessage)
	if err != nil {
		log.Printf("Error executing gift insert: %v", err)
		http.Error(w, fmt.Sprintf("Upload failed: %v", err), http.StatusInternalServerError)
		return
	}
	log.Println("Gift record inserted successfully")

	// Do not send email here.
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Gift uploaded successfully"))
}

// Setting up new receiver logic //
func setupReceiversHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Expect giftId, receivers (comma-separated), and an optional custom message.
	var req struct {
		GiftID        int    `json:"giftId"`
		Receivers     string `json:"receivers"`
		CustomMessage string `json:"customMessage"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Retrieve the gift record to determine the user ID and get the gift file.
	var userID int
	var fileName string
	var fileData []byte
	err := db.QueryRow("SELECT user_id, file_name, file_data FROM gifts WHERE id = ?", req.GiftID).
		Scan(&userID, &fileName, &fileData)
	if err != nil {
		log.Printf("Error retrieving gift record: %v", err)
		http.Error(w, "Gift not found", http.StatusNotFound)
		return
	}

	// Update the user's receivers column with the provided receivers.
	_, err = db.Exec("UPDATE users SET receivers = ? WHERE id = ?", req.Receivers, userID)
	if err != nil {
		log.Printf("Error updating user receivers: %v", err)
		http.Error(w, "Failed to update receivers", http.StatusInternalServerError)
		return
	}

	// Optional: wait a few seconds to ensure the update propagates.
	time.Sleep(10 * time.Second)

	// Retrieve the stored receivers from the user record.
	var receivers string
	err = db.QueryRow("SELECT receivers FROM users WHERE id = ?", userID).Scan(&receivers)
	if err != nil {
		log.Printf("Error retrieving receivers from user record: %v", err)
		http.Error(w, "Failed to retrieve receivers", http.StatusInternalServerError)
		return
	}

	// Send the gift email using the receivers from the user record.
	if err := sendGiftEmailToReceivers(fileName, fileData, req.CustomMessage, receivers); err != nil {
		log.Printf("Error sending gift email: %v", err)
		http.Error(w, fmt.Sprintf("Failed to send gift email: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Gift email sent successfully to receivers."))
}

<<<<<<< Updated upstream

<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
func sendGiftEmailToReceivers(fileName string, fileData []byte, customMessage, receiversParam string) error {
	// Parse the receivers from the comma-separated string.
	var recipients []string
	if receiversParam != "" {
		recs := strings.Split(receiversParam, ",")
		for _, r := range recs {
			trimmed := strings.TrimSpace(r)
			if trimmed != "" {
				recipients = append(recipients, trimmed)
			}
		}
	} else {
		return fmt.Errorf("no receivers provided")
	}

	smtpHost := "smtp.gmail.com"
	smtpPort := 587
	senderEmail := "f3243329@gmail.com"
	senderPassword := "auca xxpm lziz vrjg"

	m := gomail.NewMessage()
	m.SetHeader("From", senderEmail)
	m.SetHeader("Subject", "Your Parting Gift")
	m.SetHeader("To", recipients...)

	var body string
	if customMessage != "" {
		body = customMessage
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
		log.Printf("Failed to send email: %v", err)
		return fmt.Errorf("failed to send email: %v", err)
	}
	return nil
}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
func GetReceiverHandler(w http.ResponseWriter, r *http.Request){
    enableCors(&w)
    if r.Method == http.MethodOptions {
        w.WriteHeader(http.StatusOK)
        return
    }
    if r.Method != http.MethodGet {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }
    username := r.URL.Query().Get("username")
    if username == "" {
        http.Error(w, "Username is required", http.StatusBadRequest)
        return
    }
    var receivers string
    err := db.QueryRow("SELECT receivers FROM users WHERE username = ?", username).Scan(&receivers)
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }
    // Split the receivers (assumed comma-separated) into an array.
    var emails []string
    if receivers != "" {
        emails = strings.Split(receivers, ",")
        for i, email := range emails {
            emails[i] = strings.TrimSpace(email)
        }
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(emails)
}
<<<<<<< Updated upstream
=======

// New scheduleInactivityCheckHandler: Accepts username and giftId.
// It waits 1 minute, sends a check email, then after an additional minute sends the gift email.
func scheduleInactivityCheckHandler(w http.ResponseWriter, r *http.Request) {
    enableCors(&w)
    if r.Method == http.MethodOptions {
        w.WriteHeader(http.StatusOK)
        return
    }
    if r.Method != http.MethodPost {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }
    // Expect payload with username and giftId.
    var req struct {
        Username string `json:"username"`
        GiftID   int    `json:"giftId"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    // Get the user's primary email.
    var primaryEmail string
    err := db.QueryRow("SELECT primary_contact_email FROM users WHERE username = ?", req.Username).Scan(&primaryEmail)
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }
    // Get gift details.
    var fileName string
    var fileData []byte
    var customMessage string
    err = db.QueryRow("SELECT file_name, file_data, custom_message FROM gifts WHERE id = ?", req.GiftID).
        Scan(&fileName, &fileData, &customMessage)
    if err != nil {
        http.Error(w, "Gift not found", http.StatusNotFound)
        return
    }
    // Schedule the inactivity check and gift sending in a goroutine.
    go func() {
        // Wait 1 minute, then send the inactivity check email.
        time.Sleep(1 * time.Minute)
        checkSubject := "Are you still alive? Your gifts will be sent soon"
        checkBody := "Hello,\n\nWe noticed you haven't been active recently. If you are still there, please log in and click the 'Stop' button to cancel the gift sending process."
        if err := sendCheckEmail(primaryEmail, checkSubject, checkBody); err != nil {
            log.Printf("Error sending inactivity check email to %s: %v", primaryEmail, err)
            return
        }
        log.Printf("Inactivity check email sent successfully to %s", primaryEmail)
        // Wait an additional minute.
        time.Sleep(1 * time.Minute)
        // Retrieve the receivers from the database.
        var receivers string
        err = db.QueryRow("SELECT receivers FROM users WHERE username = ?", req.Username).Scan(&receivers)
        if err != nil {
            log.Printf("Error retrieving receivers for user %s: %v", req.Username, err)
            return
        }
        // Send the gift email.
        if err := sendGiftEmailToReceivers(fileName, fileData, customMessage, receivers); err != nil {
            log.Printf("Error sending gift email to receivers for user %s: %v", req.Username, err)
        } else {
            log.Printf("Gift email sent successfully to receivers for user %s", req.Username)
        }
    }()
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Inactivity check scheduled."))
}


// sendCheckEmail sends a simple email with the given subject and body.
func sendCheckEmail(to, subject, body string) error {
    smtpHost := "smtp.gmail.com"
    smtpPort := 587
    senderEmail := "f3243329@gmail.com"
    senderPassword := "auca xxpm lziz vrjg"
    m := gomail.NewMessage()
    m.SetHeader("From", senderEmail)
    m.SetHeader("To", to)
    m.SetHeader("Subject", subject)
    m.SetBody("text/plain", body)
    d := gomail.NewDialer(smtpHost, smtpPort, senderEmail, senderPassword)
    return d.DialAndSend(m)
}

