package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"math/big"
	"net/http"
	"regexp"
	"strconv"
	"strings" // required for splitting secondary emails
	"time"
	"unicode"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
)

// User represents a user in the system.
// User represents a user in the system.
type User struct {
	ID                     int    `json:"id"`
	Username               string `json:"username"`
	Password               string `json:"password"`
	PrimaryContactEmail    string `json:"primary_contact_email,omitempty"`
	SecondaryContactEmails string `json:"secondary_contact_emails,omitempty"`
	SecurityQuestion       string `json:"security_question,omitempty"`
	SecurityAnswer         string `json:"security_answer,omitempty"`
}

// Gift represents a gift record in the system.
type Gift struct {
	ID            int    `json:"id"`
	FileName      string `json:"file_name"`
	CustomMessage string `json:"custom_message"`
	UploadTime    string `json:"upload_time"`
	Pending       bool   `json:"pending"`
	FileData      []byte `json:"-"`
	ScheduledRelease string `json:"scheduled_release,omitempty"` // Using consistent naming format (camelCase for JSON)
}

var db *sql.DB

var secretKey = []byte("mysecretkey12345") // Must be 16, 24, or 32 bytes for AES

func encrypt(text string) (string, error) {
	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return "", err
	}
	plaintext := []byte(text)
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return "", err
	}
	ciphertext := aesGCM.Seal(nonce, nonce, plaintext, nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func decrypt(encoded string) (string, error) {
	ciphertext, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return "", err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonceSize := aesGCM.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", errors.New("invalid ciphertext")
	}
	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}

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
        security_question TEXT,
        security_answer TEXT,
        receivers Text,
        force_password_change BOOLEAN DEFAULT 0
    );
    `

	if _, err := db.Exec(createUsersTableSQL); err != nil {
		log.Fatalf("Failed to create users table: %v", err)
	}

	createPrivacyTableSQL := `
	CREATE TABLE IF NOT EXISTS privacy_settings (
		user_id INTEGER PRIMARY KEY,
		can_receive_messages BOOLEAN DEFAULT 1,
		can_be_seen BOOLEAN DEFAULT 1,
		can_receive_gifts BOOLEAN DEFAULT 1,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);
	`
	if _, err := db.Exec(createPrivacyTableSQL); err != nil {
		log.Fatalf("Failed to create privacy_settings table: %v", err)
	}

	createGiftsTableSQL := `
    CREATE TABLE IF NOT EXISTS gifts (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        file_name TEXT,
        file_data BLOB,
        custom_message TEXT,
		pending BOOLEAN DEFAULT 1,
        receivers TEXT,  -- Add this column
        upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        scheduled_release DATETIME, 
		FOREIGN KEY(user_id) REFERENCES users(id)
    );
    `
	if _, err := db.Exec(createGiftsTableSQL); err != nil {
		log.Fatalf("Failed to create gifts table: %v", err)
	}

	createMessagesTableSQL := `
	CREATE TABLE IF NOT EXISTS messages (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		sender_id INTEGER,
		receiver_id INTEGER,
		subject TEXT,                     -- NEW
		content TEXT,
		is_read BOOLEAN DEFAULT 0,       -- NEW
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(sender_id) REFERENCES users(id),
		FOREIGN KEY(receiver_id) REFERENCES users(id)
	);
	`
	if _, err := db.Exec(createMessagesTableSQL); err != nil {
		log.Fatalf("Failed to create messages table: %v", err)
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
	http.HandleFunc("/stop-pending-gift", stopPendingGiftHandler)
	http.HandleFunc("/swagger.json", swaggerHandler)
	http.HandleFunc("/verify-security-answer", verifySecurityAnswerHandler)
	http.HandleFunc("/get-security-info", getSecurityInfoHandler)
	http.HandleFunc("/send-message", sendMessageHandler)
	http.HandleFunc("/get-messages", getMessagesHandler)
	http.HandleFunc("/get-privacy", getPrivacyHandler)
	http.HandleFunc("/update-privacy", updatePrivacyHandler)
	http.HandleFunc("/notifications", getMessageNotificationHandler)
	http.HandleFunc("/gift-calendar", giftCalendarHandler)

	fmt.Println("Server listening on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func getMessageNotificationHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if !handleGet(w,r){
		return
	}
	userID, boolval := QueryUser(w, r)
	if !boolval{
		return
	}

	var unreadCount int
	err := db.QueryRow("SELECT COUNT(*) FROM messages WHERE receiver_id = ? AND is_read = 0", userID).Scan(&unreadCount)
	if err != nil {
		http.Error(w, "Failed to fetch unread messages", http.StatusInternalServerError)
		return
	}

	resp := map[string]int{
		"unreadMessages": unreadCount,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func getPrivacyHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if !handleGet(w,r){
		return
	}
	userID, boolval := QueryUser(w, r)
	if !boolval{
		return
	}

	var canReceiveMessages, canBeSeen, canReceiveGifts bool
	err := db.QueryRow(`
		SELECT can_receive_messages, can_be_seen, can_receive_gifts
		FROM privacy_settings WHERE user_id = ?`, userID).Scan(
		&canReceiveMessages, &canBeSeen, &canReceiveGifts)

	if err == sql.ErrNoRows {
		// Return default settings if none exist
		canReceiveMessages, canBeSeen, canReceiveGifts = true, true, true
	} else if err != nil {
		http.Error(w, "Failed to retrieve privacy settings", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]bool{
		"canReceiveMessages": canReceiveMessages,
		"canBeSeen":          canBeSeen,
		"canReceiveGifts":    canReceiveGifts,
	})
}

func updatePrivacyHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if !handlePost(w,r){
		return
	}

	var req struct {
		Username           string `json:"username"`
		CanReceiveMessages bool   `json:"canReceiveMessages"`
		CanBeSeen          bool   `json:"canBeSeen"`
		CanReceiveGifts    bool   `json:"canReceiveGifts"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID, boolval := QueryUser(w, r)
	if !boolval{
		return
	}

	_, err := db.Exec(`
		INSERT INTO privacy_settings (user_id, can_receive_messages, can_be_seen, can_receive_gifts)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(user_id) DO UPDATE SET 
		can_receive_messages = excluded.can_receive_messages,
		can_be_seen = excluded.can_be_seen,
		can_receive_gifts = excluded.can_receive_gifts
	`, userID, req.CanReceiveMessages, req.CanBeSeen, req.CanReceiveGifts)

	if err != nil {
		http.Error(w, "Failed to update privacy settings", http.StatusInternalServerError)
		return
	}

	w.Write([]byte("Privacy settings updated successfully"))
}

func sendMessageHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if !handlePost(w,r){
		return
	}
	var req struct {
		Sender   string `json:"sender"`
		Receiver string `json:"receiver"`
		Content  string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var senderID, receiverID int
	if err := db.QueryRow("SELECT id FROM users WHERE username = ?", req.Sender).Scan(&senderID); err != nil {
		http.Error(w, "Sender not found", http.StatusNotFound)
		return
	}
	if err := db.QueryRow("SELECT id FROM users WHERE username = ?", req.Receiver).Scan(&receiverID); err != nil {
		http.Error(w, "Receiver not found", http.StatusNotFound)
		return
	}

	// Check if the receiver accepts messages
	var canReceiveMessages bool = true // default to true
	err := db.QueryRow("SELECT can_receive_messages FROM privacy_settings WHERE user_id = ?", receiverID).Scan(&canReceiveMessages)
	if err == nil && !canReceiveMessages {
		http.Error(w, "User does not accept messages", http.StatusForbidden)
		return
	}

	encrypted, err := encrypt(req.Content)
	if err != nil {
		http.Error(w, "Encryption failed", http.StatusInternalServerError)
		return
	}

	_, err = db.Exec("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)", senderID, receiverID, encrypted)
	if err != nil {
		http.Error(w, "Failed to store message", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Message sent successfully"))
}

func getMessagesHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if !handleGet(w,r){
		return
	}
	userID, boolval := QueryUser(w, r)
	if !boolval{
		return
	}

	rows, err := db.Query("SELECT sender_id, content, timestamp FROM messages WHERE receiver_id = ? ORDER BY timestamp DESC", userID)
	if err != nil {
		http.Error(w, "Failed to fetch messages", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type Message struct {
		From      string `json:"from"`
		Content   string `json:"content"`
		Timestamp string `json:"timestamp"`
	}
	var messages []Message
	
	for rows.Next() {
		var senderID int
		var encryptedContent, timestamp string
		if err := rows.Scan(&senderID, &encryptedContent, &timestamp); err != nil {
			continue
		}
		var senderUsername string
		db.QueryRow("SELECT username FROM users WHERE id = ?", senderID).Scan(&senderUsername)

		decrypted, err := decrypt(encryptedContent)
		if err != nil {
			decrypted = "[Could not decrypt]"
		}
		messages = append(messages, Message{From: senderUsername, Content: decrypted, Timestamp: timestamp})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func swaggerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	data, err := ioutil.ReadFile("swagger.json")
	if err != nil {
		http.Error(w, "Swagger file not found", http.StatusNotFound)
		return
	}
	w.Write(data)
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
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	(*w).Header().Set("Access-Control-Max-Age", "3600")
}

func createAccountHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if handleOptions(w,r){
		return
	}
	if !handlePost(w,r){
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
	if handleOptions(w,r){
		return
	}
	if !handleGet(w,r){
		return
	}
	userID, boolval := QueryUser(w, r)
	if !boolval{
		return
	}

	// Count the number of gifts for this user.
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM gifts WHERE user_id = ?", userID).Scan(&count)
	if err != nil {
		http.Error(w, "Error retrieving gift count", http.StatusInternalServerError)
		return
	}

	// Respond with the count as JSON.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"count": count})
}

func pendingGiftsHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if handleOptions(w,r){
		return
	}
	if !handleGet(w,r){
		return
	}
	userID, boolval := QueryUser(w, r)
	if !boolval{
		return
	}
	// Count pending gifts using the pending boolean.
	var pendingCount int
	err := db.QueryRow("SELECT COUNT(*) FROM gifts WHERE user_id = ? AND pending = 1", userID).Scan(&pendingCount)
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
	if !handleGet(w,r){
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Gift id is required", http.StatusBadRequest)
		return
	}

	var fileName string
	var fileData []byte
	// Log the ID being requested
	log.Printf("Attempting to download gift with ID: %s", id)

	err := db.QueryRow("SELECT file_name, file_data FROM gifts WHERE id = ?", id).Scan(&fileName, &fileData)
	if err != nil {
		log.Printf("Error retrieving gift (ID: %s): %v", id, err)
		http.Error(w, "Gift not found", http.StatusNotFound)
		return
	}

	if len(fileData) == 0 {
		log.Printf("Empty file data for gift ID: %s", id)
		http.Error(w, "No file data available", http.StatusInternalServerError)
		return
	}

	// Determine Content-Type
	contentType := "application/octet-stream"
	lowerName := strings.ToLower(fileName)
	switch {
	case strings.HasSuffix(lowerName, ".jpg"), strings.HasSuffix(lowerName, ".jpeg"):
		contentType = "image/jpeg"
	case strings.HasSuffix(lowerName, ".png"):
		contentType = "image/png"
	case strings.HasSuffix(lowerName, ".gif"):
		contentType = "image/gif"
	case strings.HasSuffix(lowerName, ".pdf"):
		contentType = "application/pdf"
	case strings.HasSuffix(lowerName, ".txt"):
		contentType = "text/plain"
	}

	// Log successful retrieval
	log.Printf("Serving file: %s (Type: %s, Size: %d bytes)", fileName, contentType, len(fileData))

	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=\"%s\"", fileName)) // Added quotes for filenames with spaces
	w.WriteHeader(http.StatusOK)
	w.Write(fileData)
}

func getGiftsHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if handleOptions(w,r){
		return
	}
	if r.Method != http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request method"})
		return
	}
	username := r.URL.Query().Get("username")
	if username == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Username is required"})
		return
	}
	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
		return
	}
	rows, err := db.Query("SELECT id, file_name, custom_message, upload_time, pending FROM gifts WHERE user_id = ? ORDER BY upload_time DESC", userID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Error retrieving gifts"})
		return
	}
	defer rows.Close()
	var gifts []Gift
	for rows.Next() {
		var gift Gift
		if err := rows.Scan(&gift.ID, &gift.FileName, &gift.CustomMessage, &gift.UploadTime, &gift.Pending); err != nil {
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
	if handleOptions(w,r){
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

		log.Printf("GET /update-emails - Retrieving details for user: %s", username)

		// Use SQL NULL handling - Define nullable types
		var user struct {
			Username               string         `json:"username"`
			PrimaryContactEmail    sql.NullString `json:"-"`
			SecondaryContactEmails sql.NullString `json:"-"`
			SecurityQuestion       sql.NullString `json:"-"`
			SecurityAnswer         sql.NullString `json:"-"`
		}

		err := db.QueryRow(`
            SELECT username, primary_contact_email, secondary_contact_emails, 
                   security_question, security_answer 
            FROM users WHERE username = ?`, username).
			Scan(&user.Username, &user.PrimaryContactEmail, &user.SecondaryContactEmails,
				&user.SecurityQuestion, &user.SecurityAnswer)

		if err != nil {
			log.Printf("Error retrieving user details for %s: %v", username, err)
			if err == sql.ErrNoRows {
				http.Error(w, "User not found", http.StatusNotFound)
			} else {
				http.Error(w, "Database error", http.StatusInternalServerError)
			}
			return
		}

		// Convert nullable fields to regular strings for JSON response
		response := map[string]interface{}{
			"username":                 user.Username,
			"primary_contact_email":    "",
			"secondary_contact_emails": "",
			"security_question":        "",
			"security_answer":          "",
		}

		// Only set values if they're valid (not NULL)
		if user.PrimaryContactEmail.Valid {
			response["primary_contact_email"] = user.PrimaryContactEmail.String
		}
		if user.SecondaryContactEmails.Valid {
			response["secondary_contact_emails"] = user.SecondaryContactEmails.String
		}
		if user.SecurityQuestion.Valid {
			response["security_question"] = user.SecurityQuestion.String
		}
		if user.SecurityAnswer.Valid {
			response["security_answer"] = user.SecurityAnswer.String
		}

		// Log retrieved data for debugging
		log.Printf("Retrieved data for %s: primaryEmail=%v, secondaryEmails=%v",
			username, response["primary_contact_email"], response["secondary_contact_emails"])

		w.Header().Set("Content-Type", "application/json")

		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Printf("Error encoding JSON response: %v", err)
			http.Error(w, "Error generating response", http.StatusInternalServerError)
		}

	case http.MethodPost:
		// Rest of your POST code remains the same
		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		log.Printf("POST /update-emails - Updating details for user: %s", user.Username)
		log.Printf("Received data: primaryEmail=%s, secondaryEmails=%s",
			user.PrimaryContactEmail, user.SecondaryContactEmails)

		stmt, err := db.Prepare(`
            UPDATE users SET 
                primary_contact_email = ?, 
                secondary_contact_emails = ?, 
                security_question = ?,
                security_answer = ? 
            WHERE username = ?`)
		if err != nil {
			log.Printf("Error preparing update statement: %v", err)
			http.Error(w, fmt.Sprintf("Update failed: %v", err), http.StatusInternalServerError)
			return
		}
		defer stmt.Close()

		res, err := stmt.Exec(
			user.PrimaryContactEmail,
			user.SecondaryContactEmails,
			user.SecurityQuestion,
			user.SecurityAnswer,
			user.Username)
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
			log.Printf("No rows affected when updating user %s", user.Username)
			http.Error(w, "No user found with that username", http.StatusNotFound)
			return
		}

		log.Printf("Successfully updated details for user: %s", user.Username)
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Personal details updated successfully"))

	default:
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

func verifySecurityAnswerHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if handleOptions(w,r){
		return
	}
	if !handlePost(w,r){
		return
	}

	var req struct {
		Username       string `json:"username"`
		SecurityAnswer string `json:"securityAnswer"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Log the received values for debugging
	log.Printf("Verifying security answer for %s: '%s'", req.Username, req.SecurityAnswer)

	var storedQuestion, storedAnswer string
	err := db.QueryRow("SELECT security_question, security_answer FROM users WHERE username = ?",
		req.Username).Scan(&storedQuestion, &storedAnswer)
	if err != nil {
		log.Printf("Error retrieving security info: %v", err)
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Database error", http.StatusInternalServerError)
		}
		return
	}

	// Log the values from database for debugging
	log.Printf("Stored security answer for %s: '%s'", req.Username, storedAnswer)

	if storedQuestion == "" || storedAnswer == "" {
		http.Error(w, "Security question not set up for this user", http.StatusBadRequest)
		return
	}

	// Case-insensitive comparison and trim spaces
	userAnswer := strings.TrimSpace(strings.ToLower(req.SecurityAnswer))
	dbAnswer := strings.TrimSpace(strings.ToLower(storedAnswer))

	// Log the trimmed and lowercased values for comparison
	log.Printf("Comparing: '%s' with '%s'", userAnswer, dbAnswer)

	if userAnswer != dbAnswer {
		log.Printf("Security answer mismatch for %s", req.Username)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Incorrect security answer"})
		return
	}

	// Set force_password_change to true when security answer is used for login
	_, err = db.Exec("UPDATE users SET force_password_change = 1 WHERE username = ?", req.Username)
	if err != nil {
		log.Printf("Failed to set force_password_change: %v", err)
		// Continue anyway, as authentication was successful
	}

	// If answer is correct, return success
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message":     "Security answer verified successfully",
		"username":    req.Username,
		"forceChange": "true",
	})
}

func getSecurityInfoHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if handleOptions(w,r){
		return
	}
	if !handlePost(w,r){
		return
	}
	var req struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get user info by email
	var username string
	var securityQuestion string
	err := db.QueryRow(`
        SELECT username, security_question 
        FROM users 
        WHERE primary_contact_email = ? OR secondary_contact_emails LIKE ?
    `, req.Email, "%"+req.Email+"%").Scan(&username, &securityQuestion)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			log.Printf("Database error in getSecurityInfoHandler: %v", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
		}
		return
	}

	// Return the security question and username
	response := struct {
		Username         string `json:"username"`
		SecurityQuestion string `json:"securityQuestion"`
	}{
		Username:         username,
		SecurityQuestion: securityQuestion,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func resetPasswordHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if handleOptions(w,r){
		return
	}
	if !handlePost(w,r){
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
	if handleOptions(w,r){
		return
	}
	if r.Method != http.MethodPost {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request method"})
		return
	}
	var credentials struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	var storedPassword string
	var forceChange bool
	var userID int

	err := db.QueryRow("SELECT id, password, force_password_change FROM users WHERE username = ?",
		credentials.Username).Scan(&userID, &storedPassword, &forceChange)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if err == sql.ErrNoRows {
			json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
		} else {
			json.NewEncoder(w).Encode(map[string]string{"error": "Login error"})
		}
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(credentials.Password)); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid username or password"})
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
	if handleOptions(w,r){
		return
	}
	if !handlePost(w,r){
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
	if handleOptions(w,r){
		return
	}
	if !handlePost(w,r){
		return
	}

	// Parse multipart form with 10MB limit
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	userID, boolval := QueryUser(w, r)
	if !boolval{
		return
	}

	// Check if user allows receiving gifts
	var canReceiveGifts bool = true // default to true
	err := db.QueryRow("SELECT can_receive_gifts FROM privacy_settings WHERE user_id = ?", userID).Scan(&canReceiveGifts)
	if err == nil && !canReceiveGifts {
		http.Error(w, "User has disabled gift receiving", http.StatusForbidden)
		return
	}

	// Get file from form data
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Read file data
	fileData, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file", http.StatusInternalServerError)
		return
	}

	// Get custom message
	customMessage := r.FormValue("emailMessage")

	// Store in database
	result, err := db.Exec(
		"INSERT INTO gifts (user_id, file_name, file_data, custom_message, pending) VALUES (?, ?, ?, ?, 1)",
		userID, header.Filename, fileData, customMessage,
	)
	if err != nil {
		log.Printf("Database insert error: %v", err)
		http.Error(w, "Failed to store gift", http.StatusInternalServerError)
		return
	}

	// Get the inserted gift ID
	giftID, err := result.LastInsertId()
	if err != nil {
		log.Printf("Error getting last insert ID: %v", err)
		http.Error(w, "Failed to retrieve gift ID", http.StatusInternalServerError)
		return
	}

	// Return success response with gift ID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "File uploaded successfully",
		"giftId":  giftID,
	})
}

func stopPendingGiftHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if handleOptions(w,r){
		return
	}
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Log request details
	giftID := r.URL.Query().Get("id")
	log.Printf("Received request to stop gift ID: %s", giftID)

	if giftID == "" {
		http.Error(w, "Invalid gift ID", http.StatusBadRequest)
		return
	}

	// Convert ID to int
	id, err := strconv.Atoi(giftID)
	if err != nil {
		http.Error(w, "Invalid gift ID format", http.StatusBadRequest)
		return
	}

	// Ensure gift exists before deleting
	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM gifts WHERE id = ?)", id).Scan(&exists)
	if err != nil || !exists {
		http.Error(w, "Gift not found", http.StatusNotFound)
		return
	}

	// Delete gift from database
	_, err = db.Exec("DELETE FROM gifts WHERE id = ?", id)
	if err != nil {
		http.Error(w, "Failed to delete gift", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Gift stopped successfully"))
}

// Setting up new receiver logic //
func setupReceiversHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if handleOptions(w,r){
		return
	}
	if !handlePost(w,r){
		return
	}
	// Extend the request payload to include an optional scheduledTime.
	var req struct {
		GiftID        int    `json:"giftId"`
		Receivers     string `json:"receivers"`
		CustomMessage string `json:"customMessage"`
		ScheduledTime string `json:"scheduledTime"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate that the gift exists and retrieve its details.
	var userID int
	var fileName string
	var fileData []byte
	err := db.QueryRow("SELECT user_id, file_name, file_data FROM gifts WHERE id = ?", req.GiftID).
		Scan(&userID, &fileName, &fileData)
	if err != nil {
		log.Printf("Error retrieving gift: %v", err)
		http.Error(w, "Gift not found", http.StatusNotFound)
		return
	}

	// Parse the scheduled time for database storage 
	var scheduledTimeSQL sql.NullString

	if req.ScheduledTime != ""{
		scheduledTime, err := time.Parse(time.RFC3339, req.ScheduledTime)
		if err !=nil {
			scheduledTime, err = time.Parse("2006-01-02T15:04", req.ScheduledTime)
		}
		if err == nil {
        // If parsing succeeded with either format, store in database format
        // SQLite typically expects time in this format for DATETIME columns
        scheduledTimeSQL.String = scheduledTime.Format("2006-01-02 15:04:05")
        scheduledTimeSQL.Valid = true
        log.Printf("Storing scheduled time %s for gift %d", scheduledTimeSQL.String, req.GiftID)
    	} else {
        	log.Printf("Invalid scheduled time format: %s, not storing in database", req.ScheduledTime)
    	}
	}

	// Update the gift record with the receivers and possibly scheduled_release
	var updateErr error
	if scheduledTimeSQL.Valid{
		_, updateErr = db.Exec(
			"UPDATE gifts SET receivers = ?, scheduled_release = ? WHERE id = ?",
			req.Receivers, scheduledTimeSQL.String, req.GiftID)
	}else{
		_, updateErr = db.Exec(
			"UPDATE gifts SET receivers = ? WHERE id = ?",
			req.Receivers, req.GiftID)
	}
	if updateErr != nil {
    	log.Printf("Error updating gift: %v", updateErr)
    	http.Error(w, "Failed to update gift", http.StatusInternalServerError)
    	return
	}
	

	// Retrieve the custom message stored in the gift record.
	var storedCustomMessage string
	err = db.QueryRow("SELECT custom_message FROM gifts WHERE id = ?", req.GiftID).Scan(&storedCustomMessage)
	if err != nil {
		log.Printf("Error retrieving custom message for gift %d: %v", req.GiftID, err)
		// Fallback to the provided custom message if retrieval fails.
		storedCustomMessage = req.CustomMessage
	}

	// In a separate goroutine, schedule sending of the gift email.
	go func() {
		// Determine the delay:
		// If a scheduled time is provided, parse it and wait until that time;
		// otherwise, wait a default of 1 minute.
		var delay time.Duration = 1 * time.Minute

		if req.ScheduledTime != "" {
			scheduledTime, err := time.Parse(time.RFC3339, req.ScheduledTime)
			if err != nil{
				scheduledTime, err = time.Parse("2006-01-02T15:04", req.ScheduledTime)
				if err != nil {
                	log.Printf("Error parsing scheduled time '%s' for gift %d: %v", req.ScheduledTime, req.GiftID, err)
            	}
			}
			if err ==nil{
				computedDelay := scheduledTime.Sub(time.Now())
				if computedDelay >0{
					delay = computedDelay
				}
			}
		}
		log.Printf("Waiting %v before sending gift email for gift %d", delay, req.GiftID)
		time.Sleep(delay)

		// Final check: verify the gift is still pending.
		var stillPending bool
		if err := db.QueryRow("SELECT pending FROM gifts WHERE id = ?", req.GiftID).Scan(&stillPending); err != nil {
			log.Printf("Error checking pending status for gift %d: %v", req.GiftID, err)
			return
		}
		if !stillPending {
			log.Printf("Gift %d is no longer pending; aborting send.", req.GiftID)
			return
		}

		// Send the gift email to the receivers.
		if err := sendGiftEmailToReceivers(fileName, fileData, storedCustomMessage, req.Receivers); err != nil {
			log.Printf("Error sending gift email for gift %d: %v", req.GiftID, err)
		} else {
			// Mark the gift as no longer pending.
			if _, err := db.Exec("UPDATE gifts SET pending = 0 WHERE id = ?", req.GiftID); err != nil {
				log.Printf("Error updating pending status for gift %d: %v", req.GiftID, err)
			} else {
				log.Printf("Gift email sent successfully and pending status updated for gift %d", req.GiftID)
			}
		}
	}()

	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Receivers set up successfully. Gift scheduled."))
}

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

func GetReceiverHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if handleOptions(w,r){
		return
	}
	if r.Method != http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request method"})
		return
	}
	// Get username from query parameters.
	username := r.URL.Query().Get("username")
	if username == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Username is required"})
		return
	}
	

	// First, retrieve the user ID based on the username.
	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
		return
	}

	// Now query the gifts table for all receivers linked to this user.
	rows, err := db.Query("SELECT receivers FROM gifts WHERE user_id = ? AND receivers IS NOT NULL AND receivers <> ''", userID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Error retrieving receivers"})
		return
	}
	defer rows.Close()

	// Use a set to collect unique receiver email addresses.
	receiverSet := make(map[string]bool)
	for rows.Next() {
		var receivers string
		if err := rows.Scan(&receivers); err != nil {
			continue
		}
		if receivers != "" {
			// Split comma-separated list and add each trimmed email to the set.
			parts := strings.Split(receivers, ",")
			for _, part := range parts {
				trimmed := strings.TrimSpace(part)
				if trimmed != "" {
					receiverSet[trimmed] = true
				}
			}
		}
	}
	// Convert the set into a slice.
	var uniqueReceivers []string
	for rec := range receiverSet {
		uniqueReceivers = append(uniqueReceivers, rec)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(uniqueReceivers)
}

func scheduleInactivityCheckHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if handleOptions(w,r){
		return
	}
	if !handlePost(w,r){
		return
	}
		// Expect payload with username and customMessage.
	var req struct {
		Username      string `json:"username"`
		CustomMessage string `json:"customMessage"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	// Get the user's primary email and id.
	var primaryEmail string
	var userID int
	err := db.QueryRow("SELECT id, primary_contact_email FROM users WHERE username = ?", req.Username).Scan(&userID, &primaryEmail)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Schedule the inactivity check and gift sending in a separate goroutine.
	go func() {
		// A helper to check if there is any pending gift for this user.
		hasPending := func() bool {
			var exists bool
			err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM gifts WHERE user_id = ? AND pending = 1)", userID).Scan(&exists)
			return err != nil || exists
		}

		// Wait 1 minute, checking every 10 seconds.
		for i := 0; i < 6; i++ {
			time.Sleep(10 * time.Second)
			// If there are no pending gifts, abort.
			if !hasPending() {
				log.Printf("No pending gifts for user %s; aborting inactivity check.", req.Username)
				return
			}
		}

		// Before sending the inactivity check email, re-check.
		if !hasPending() {
			log.Printf("No pending gifts for user %s; aborting inactivity check email.", req.Username)
			return
		}

		// Send inactivity check email.
		checkSubject := "Are you still alive? Your gifts will be sent soon"
		checkBody := "Hello,\n\nWe noticed you haven't been active recently. If you are still there, please log in and click the 'Stop' button to cancel the gift sending process."
		if err := sendCheckEmail(primaryEmail, checkSubject, checkBody); err != nil {
			log.Printf("Error sending inactivity check email to %s: %v", primaryEmail, err)
			return
		}
		log.Printf("Inactivity check email sent successfully to %s", primaryEmail)

		// Wait an additional minute, checking every 10 seconds.
		for i := 0; i < 6; i++ {
			time.Sleep(10 * time.Second)
			if !hasPending() {
				log.Printf("No pending gifts for user %s; aborting gift email send.", req.Username)
				return
			}
		}

		// Retrieve the latest receivers.
		var latestReceivers string
		if err := db.QueryRow("SELECT receivers FROM users WHERE username = ?", req.Username).Scan(&latestReceivers); err != nil {
			log.Printf("Error retrieving receivers for user %s: %v", req.Username, err)
			return
		}
		// Retrieve all pending gifts for this user.
		rows, err := db.Query("SELECT file_name, file_data, custom_message FROM gifts WHERE user_id = ? AND pending = 1", userID)
		if err != nil {
			log.Printf("Error retrieving pending gifts for user %s: %v", req.Username, err)
			return
		}
		defer rows.Close()
		var gifts []Gift
		for rows.Next() {
			var g Gift
			if err := rows.Scan(&g.FileName, &g.FileData, &g.CustomMessage); err != nil {
				continue
			}
			gifts = append(gifts, g)
		}
		// Send the gift email with all pending gifts attached.
		if err := sendAllGiftsEmail(primaryEmail, gifts, req.CustomMessage, latestReceivers); err != nil {
			log.Printf("Error sending gift email for user %s: %v", req.Username, err)
		} else {
			log.Printf("Gift email sent successfully to receivers for user %s", req.Username)
		}
	}()
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Inactivity check scheduled."))
}

// sendAllGiftsEmail sends an email to the primary email with all gifts attached.
// The receivers parameter (a comma-separated string) is added to the "To" field.
func sendAllGiftsEmail(primaryEmail string, gifts []Gift, customMessage, receivers string) error {
	smtpHost := "smtp.gmail.com"
	smtpPort := 587
	senderEmail := "f3243329@gmail.com"
	senderPassword := "auca xxpm lziz vrjg"

	m := gomail.NewMessage()
	m.SetHeader("From", senderEmail)
	m.SetHeader("To", primaryEmail)
	if receivers != "" {
		recipients := strings.Split(receivers, ",")
		for i := range recipients {
			recipients[i] = strings.TrimSpace(recipients[i])
		}
		m.SetHeader("Cc", recipients...)
	}
	body := "Hello,\n\nPlease find attached your gifts."
	if customMessage != "" {
		body = fmt.Sprintf("%s\n\n%s", body, customMessage)
	}
	m.SetBody("text/plain", body)
	for _, g := range gifts {
		m.Attach(g.FileName, gomail.SetCopyFunc(func(w io.Writer) error {
			_, err := w.Write(g.FileData)
			return err
		}))
	}
	d := gomail.NewDialer(smtpHost, smtpPort, senderEmail, senderPassword)
	return d.DialAndSend(m)
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

func giftCalendarHandler(w http.ResponseWriter, r *http.Request) {
    enableCors(&w)

    if handleOptions(w,r){
		return
	}
    if !handleGet(w,r){
		return
	}
    userID, boolval := QueryUser(w, r)
	if !boolval{
		return
	}

    // Get all gifts with scheduled release dates
    rows, err := db.Query(`
        SELECT id, file_name, custom_message, scheduled_release, pending, receivers
        FROM gifts 
        WHERE user_id = ? 
        ORDER BY scheduled_release ASC
    `, userID)
    if err != nil {
        http.Error(w, "Error retrieving gift calendar", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    type CalendarEvent struct {
        ID          int    `json:"id"`
        Title       string `json:"title"`
        ReleaseDate string `json:"releaseDate"`
        Message     string `json:"message"`
        IsPending   bool   `json:"isPending"`
        Receivers   string `json:"receivers"`
    }

    events := make([]CalendarEvent, 0)
	rowCount := 0
    for rows.Next() {
		rowCount++
        var fileName, message, releaseDate sql.NullString
        var receivers sql.NullString
        var pending bool
        var id int

        if err := rows.Scan(&id, &fileName, &message, &releaseDate, &pending, &receivers); err != nil {
            continue
        }

        title := "Gift"
        if fileName.Valid && fileName.String != "" {
            title = fileName.String
        }

        event := CalendarEvent{
            ID:        id,
            Title:     title,
            IsPending: pending,
        }

        if message.Valid {
            event.Message = message.String
        }

        if releaseDate.Valid {
            event.ReleaseDate = releaseDate.String
        }

        if receivers.Valid {
            event.Receivers = receivers.String
        }

        events = append(events, event)
    }
	if err = rows.Err(); err != nil{
		log.Printf("Error after row iteration: %v", err)
		http.Error(w,"Error processing gift data", http.StatusInternalServerError)
		return
	}

    w.Header().Set("Content-Type", "application/json")
	if err:= json.NewEncoder(w).Encode(events); err !=nil{
		http.Error(w, "Error generating response", http.StatusInternalServerError)
		return
	}
}

func handleOptions(w http.ResponseWriter, r *http.Request) bool{
	if r.Method == http.MethodOptions{
		w.WriteHeader(http.StatusOK)
		return true
	}
	return false
}

func handleGet(w http.ResponseWriter, r *http.Request) bool{
	if r.Method != http.MethodGet{
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return false
	}
	return true
}

func handlePost(w http.ResponseWriter, r *http.Request) bool{
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return false
	}
	return true
}

func QueryUser (w http.ResponseWriter, r *http.Request) (int,bool){
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return 0, false
	}

	var userID int
	if err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID); err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return 0, false
	}
	return userID, true
}