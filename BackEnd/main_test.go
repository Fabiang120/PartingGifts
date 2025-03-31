package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"golang.org/x/crypto/bcrypt"

	_ "github.com/mattn/go-sqlite3"
)

// setupTestDB creates an in-memory SQLite database for testing.
func setupTestDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		return nil, err
	}

	_, err = db.Exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        primary_contact_email TEXT,
        secondary_contact_emails TEXT,
        security_question TEXT,
        security_answer TEXT,
        receivers TEXT,
        force_password_change BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS gifts (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        file_name TEXT,
        file_data BLOB,
        custom_message TEXT,
        receivers TEXT,
        upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        scheduled_time DATETIME,
        pending BOOLEAN DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS privacy_settings (
        user_id INTEGER PRIMARY KEY,
        can_receive_messages BOOLEAN DEFAULT 1,
        can_be_seen BOOLEAN DEFAULT 1,
        can_receive_gifts BOOLEAN DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER,
        subject TEXT,
        content TEXT,
        is_read BOOLEAN DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(sender_id) REFERENCES users(id),
        FOREIGN KEY(receiver_id) REFERENCES users(id)
    );


`)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// performRequest simulates an HTTP request to the given handler.
func performRequest(handlerFunc http.HandlerFunc, method, url string, body []byte) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, url, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	handlerFunc(recorder, req)
	return recorder
}

// Test create account handler.
func TestCreateAccountHandler(t *testing.T) {
	db, _ = setupTestDB()

	requestBody := `{"username": "testuser", "password": "Test@1234"}`
	rec := performRequest(createAccountHandler, "POST", "/create-account", []byte(requestBody))

	if rec.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d", rec.Code)
	}
}

// Test updating personal details.
func TestPersonalDetailsHandler(t *testing.T) {
	db, _ = setupTestDB()

	_, _ = db.Exec("INSERT INTO users (username, password, primary_contact_email) VALUES (?, ?, ?)", "testuser", "password", "test@example.com")

	requestBody := `{"username": "testuser", "primary_contact_email": "new@example.com", "secondary_contact_emails": "alt@example.com"}`
	rec := performRequest(personalDetailsHandler, "POST", "/update-emails", []byte(requestBody))

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}
}

// Test uploading a gift.
func TestUploadGiftHandler(t *testing.T) {
	db, _ = setupTestDB()
	_, _ = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", "password")

	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)
	_ = writer.WriteField("username", "testuser")
	_ = writer.WriteField("emailMessage", "Hello, this is a test email.")

	part, _ := writer.CreateFormFile("file", "example.txt")
	_, _ = part.Write([]byte("This is a test file content."))
	writer.Close()

	req := httptest.NewRequest("POST", "/upload-gift", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()

	uploadGiftHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}
}

// Test login handler.
func TestLoginHandler(t *testing.T) {
	db, _ = setupTestDB()
	hashed, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}
	_, _ = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", hashed)

	requestBody := `{"username": "testuser", "password": "password"}`

	rec := performRequest(loginHandler, "POST", "/login", []byte(requestBody))
	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}
}

// Test setting up receivers.
func TestSetupReceiversHandler(t *testing.T) {
	db, _ = setupTestDB()
	// Insert a user with a non-NULL primary_contact_email.
	_, _ = db.Exec("INSERT INTO users (username, password, primary_contact_email) VALUES (?, ?, ?)", "testuser", "password", "test@example.com")
	_, _ = db.Exec("INSERT INTO gifts (user_id, file_name) VALUES (1, 'testfile.txt')")

	requestBody := `{"giftId": 1, "receivers": "receiver@example.com", "customMessage": "Gift Message"}`
	rec := performRequest(setupReceiversHandler, "POST", "/setup-receivers", []byte(requestBody))
	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}
}

// Test gift count handler.
func TestGiftCountHandler(t *testing.T) {
	testDB, err := setupTestDB()
	if err != nil {
		t.Fatalf("Failed to setup test database: %v", err)
	}
	db = testDB

	_, err = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", "password")
	if err != nil {
		t.Fatalf("Failed to insert test user: %v", err)
	}

	_, err = db.Exec("INSERT INTO gifts (user_id, file_name) VALUES (1, 'testfile.txt')")
	if err != nil {
		t.Fatalf("Failed to insert test gift: %v", err)
	}

	rec := performRequest(giftCountHandler, "GET", "/gift-count?username=testuser", nil)
	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	var response map[string]int
	err = json.Unmarshal(rec.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("Failed to parse response: %v", err)
	}

	if response["count"] != 1 {
		t.Errorf("Expected gift count 1, got %d", response["count"])
	}
}

// Test downloading a gift.
func TestDownloadGiftHandler(t *testing.T) {
	testDB, err := setupTestDB()
	if err != nil {
		t.Fatalf("Failed to setup test database: %v", err)
	}
	db = testDB

	_, err = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", "password")
	if err != nil {
		t.Fatalf("Failed to insert test user: %v", err)
	}

	fileContent := []byte("This is test file data")
	_, err = db.Exec("INSERT INTO gifts (user_id, file_name, file_data) VALUES (?, ?, ?)", 1, "testfile.txt", fileContent)
	if err != nil {
		t.Fatalf("Failed to insert test gift: %v", err)
	}

	rec := performRequest(downloadGiftHandler, "GET", "/download-gift?id=1", nil)
	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Response: %s", rec.Code, rec.Body.String())
	}

	if !bytes.Equal(rec.Body.Bytes(), fileContent) {
		t.Errorf("Downloaded file content does not match expected content")
	}
}

// Test stopping a pending gift.
func TestStopPendingGiftHandler(t *testing.T) {
	testDB, err := setupTestDB()
	if err != nil {
		t.Fatalf("Failed to setup test database: %v", err)
	}
	db = testDB

	_, _ = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", "password")
	_, _ = db.Exec("INSERT INTO gifts (user_id, file_name) VALUES (1, 'testfile.txt')")

	rec := performRequest(stopPendingGiftHandler, "DELETE", "/stop-pending-gift?id=1", nil)
	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	var count int
	_ = db.QueryRow("SELECT COUNT(*) FROM gifts WHERE id = 1").Scan(&count)
	if count != 0 {
		t.Errorf("Expected 0 gifts remaining, found %d", count)
	}
}

// Test sending gift emails.
func TestSendGiftEmailToReceivers(t *testing.T) {
	err := sendGiftEmailToReceivers("testfile.txt", []byte("test data"), "Test Message", "recipient@example.com")
	if err != nil {
		t.Errorf("Failed to send email: %v", err)
	}
}

// Test sending check email.
func TestSendCheckEmail(t *testing.T) {
	err := sendCheckEmail("test@example.com", "Check Subject", "Check Body")
	if err != nil {
		t.Errorf("Failed to send check email: %v", err)
	}
}

// Test change password handler.
func TestChangePasswordHandler(t *testing.T) {
	testDB, err := setupTestDB()
	if err != nil {
		t.Fatalf("Failed to setup test database: %v", err)
	}
	db = testDB

	initialPassword := "OldPass@123"
	hashed, err := bcrypt.GenerateFromPassword([]byte(initialPassword), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}
	_, err = db.Exec("INSERT INTO users (username, password, force_password_change) VALUES (?, ?, 1)", "testuser", hashed)
	if err != nil {
		t.Fatalf("Failed to insert test user: %v", err)
	}

	newPassword := "NewPass@1234"
	requestBody := fmt.Sprintf(`{"username": "testuser", "newPassword": "%s"}`, newPassword)

	recorder := performRequest(changePasswordHandler, "POST", "/change-password", []byte(requestBody))
	if recorder.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", recorder.Code)
	}

	var response map[string]string
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Errorf("Failed to decode response JSON: %v", err)
	}
	if msg, ok := response["message"]; !ok || msg != "Password changed successfully" {
		t.Errorf("Unexpected response message: %v", response)
	}

	var updatedHash string
	err = db.QueryRow("SELECT password FROM users WHERE username = ?", "testuser").Scan(&updatedHash)
	if err != nil {
		t.Errorf("Failed to query updated user: %v", err)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(updatedHash), []byte(newPassword)); err != nil {
		t.Errorf("Password was not updated correctly")
	}

	var forceFlag bool
	err = db.QueryRow("SELECT force_password_change FROM users WHERE username = ?", "testuser").Scan(&forceFlag)
	if err != nil {
		t.Errorf("Failed to query force_password_change flag: %v", err)
	}
	if forceFlag != false {
		t.Errorf("Expected force_password_change to be false, got %v", forceFlag)
	}
}

func TestGetMessagesHandler(t *testing.T) {
	db, _ = setupTestDB()
	_, _ = db.Exec("INSERT INTO users (id, username) VALUES (?, ?)", 1, "testuser")
	_, _ = db.Exec("INSERT INTO users (id, username) VALUES (?, ?)", 2, "sender")
	encrypted, _ := encrypt("Hello!")
	_, _ = db.Exec("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)", 2, 1, encrypted)

	req := httptest.NewRequest("GET", "/get-messages?username=testuser", nil)
	rec := httptest.NewRecorder()
	getMessagesHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rec.Code)
	}
}
func TestGetPrivacyHandler(t *testing.T) {
	db, _ = setupTestDB()

	// Insert test user and associated privacy settings
	_, _ = db.Exec("INSERT INTO users (id, username) VALUES (?, ?)", 1, "testuser")
	_, _ = db.Exec("INSERT INTO privacy_settings (user_id, can_receive_messages, can_be_seen, can_receive_gifts) VALUES (?, ?, ?, ?)",
		1, true, false, true)

	req := httptest.NewRequest("GET", "/get-privacy?username=testuser", nil)
	rec := httptest.NewRecorder()

	getPrivacyHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rec.Code)
	}
}
func TestUpdatePrivacyHandler(t *testing.T) {

	db, _ = setupTestDB()
	_, _ = db.Exec("INSERT INTO users (id, username) VALUES (?, ?)", 1, "testuser")

	body := []byte(`{
    "username": "testuser",
    "canReceiveMessages": true,
    "canBeSeen": false,
    "canReceiveGifts": true
    }`)

	rec := performRequest(updatePrivacyHandler, "POST", "/update-privacy", body)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rec.Code)
	}
}
func TestGetMessageNotificationHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/notifications?username=testuser", nil)
	rec := httptest.NewRecorder()

	getMessageNotificationHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rec.Code)
	}
}
func TestScheduleInactivityCheckHandler(t *testing.T) {
	db, _ = setupTestDB()
	_, _ = db.Exec("INSERT INTO users (username, primary_contact_email) VALUES (?, ?)", "testuser", "test@example.com")

	body := []byte(`{"username": "testuser", "customMessage": "Check for inactivity"}`)
	req := httptest.NewRequest("POST", "/schedule-check", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	scheduleInactivityCheckHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rec.Code)
	}
}
func TestGetReceiversHandler(t *testing.T) {
	db, _ = setupTestDB()

	// Insert user
	_, _ = db.Exec("INSERT INTO users (id, username) VALUES (?, ?)", 1, "testuser")

	// Insert gift with receivers
	_, _ = db.Exec("INSERT INTO gifts (user_id, receivers) VALUES (?, ?)", 1, "a@example.com,b@example.com")

	req := httptest.NewRequest("GET", "/get-receivers?username=testuser", nil)
	rec := httptest.NewRecorder()

	GetReceiverHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rec.Code)
	}
}
func TestVerifySecurityAnswerHandler(t *testing.T) {
	db, _ = setupTestDB()
	_, _ = db.Exec("INSERT INTO users (username, security_question, security_answer) VALUES (?, ?, ?)", "testuser", "Pet?", "fluffy")

	body := []byte(`{"username": "testuser", "securityAnswer": "fluffy"}`)

	rec := performRequest(verifySecurityAnswerHandler, "POST", "/verify-security-answer", body)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rec.Code)
	}
}
func TestGetSecurityInfoHandler(t *testing.T) {
	db, _ = setupTestDB()
	_, _ = db.Exec("INSERT INTO users (username, primary_contact_email, security_question) VALUES (?, ?, ?)", "testuser", "test@example.com", "Your color?")

	body := []byte(`{"email": "test@example.com"}`)
	req := httptest.NewRequest("POST", "/get-security-info", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder() // ✅ Missing recorder
	getSecurityInfoHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rec.Code)
	}
}
func TestResetPasswordHandler(t *testing.T) {
	db, _ = setupTestDB()
	_, _ = db.Exec("INSERT INTO users (username, primary_contact_email, password) VALUES (?, ?, ?)", "testuser", "test@example.com", "oldpass")

	body := []byte(`{"email": "test@example.com"}`)

	rec := performRequest(resetPasswordHandler, "POST", "/reset-password", body)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rec.Code)
	}
}
