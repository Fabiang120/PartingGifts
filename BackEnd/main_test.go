package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"

	"testing"

	_ "github.com/mattn/go-sqlite3"
)

// Mock database setup
func setupTestDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", ":memory:") // Use in-memory database for testing
	if err != nil {
		return nil, err
	}

	// Create tables
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            primary_contact_email TEXT,
            secondary_contact_emails TEXT
        );
        CREATE TABLE IF NOT EXISTS gifts (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            file_name TEXT,
            file_data BLOB,
            custom_message TEXT,
            receivers TEXT,
            upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            scheduled_time DATETIME
        );
    `)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// Mock HTTP request helper
func performRequest(handlerFunc http.HandlerFunc, method, url string, body []byte) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, url, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	handlerFunc(recorder, req)
	return recorder
}

// ✅ Test create account
func TestCreateAccountHandler(t *testing.T) {
	db, _ = setupTestDB()

	requestBody := `{"username": "testuser", "password": "Test@1234"}`
	rec := performRequest(createAccountHandler, "POST", "/create-account", []byte(requestBody))

	if rec.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d", rec.Code)
	}
}

// ✅ Test updating personal details
func TestPersonalDetailsHandler(t *testing.T) {
	db, _ = setupTestDB()

	// Insert test user
	_, _ = db.Exec("INSERT INTO users (username, password, primary_contact_email) VALUES (?, ?, ?)", "testuser", "password", "test@example.com")

	requestBody := `{"username": "testuser", "primary_contact_email": "new@example.com", "secondary_contact_emails": "alt@example.com"}`
	rec := performRequest(personalDetailsHandler, "POST", "/update-emails", []byte(requestBody))

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}
}

// ✅ Test uploading gift
func TestUploadGiftHandler(t *testing.T) {
	// Setup test database
	db, _ = setupTestDB()
	_, _ = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", "password")

	// Create a buffer to store multipart form data
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)

	// Add text fields
	_ = writer.WriteField("username", "testuser")
	_ = writer.WriteField("emailMessage", "Hello, this is a test email.")

	// Create a fake file and attach it to the request
	part, _ := writer.CreateFormFile("file", "example.txt")
	_, _ = part.Write([]byte("This is a test file content.")) // File content

	writer.Close() // Close the writer to finalize the form data

	// Create a new request with the multipart form data
	req := httptest.NewRequest("POST", "/upload-gift", body)
	req.Header.Set("Content-Type", writer.FormDataContentType()) // Set proper Content-Type header

	// Recorder to capture response
	rec := httptest.NewRecorder()

	// Call the handler
	uploadGiftHandler(rec, req)

	// ✅ **Check if the response status is 200 OK**
	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}
}

// ✅ Test login
func TestLoginHandler(t *testing.T) {
	db, _ = setupTestDB()
	_, _ = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", "password")

	requestBody := `{"username": "testuser", "password": "password"}`

	rec := performRequest(loginHandler, "POST", "/login", []byte(requestBody))

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}
}

// ✅ Test setting up receivers
func TestSetupReceiversHandler(t *testing.T) {
	db, _ = setupTestDB()
	_, _ = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", "password")
	_, _ = db.Exec("INSERT INTO gifts (user_id, file_name) VALUES (1, 'testfile.txt')")

	requestBody := `{"giftId": 1, "receivers": "receiver@example.com", "customMessage": "Gift Message"}`

	rec := performRequest(setupReceiversHandler, "POST", "/setup-receivers", []byte(requestBody))

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}
}

// ✅ **Test gift count handler**
func TestGiftCountHandler(t *testing.T) {
	testDB, err := setupTestDB()
	if err != nil {
		t.Fatalf("Failed to setup test database: %v", err)
	}
	db = testDB // Replace global DB with test DB

	// Insert a test user and gift
	_, err = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", "password")
	if err != nil {
		t.Fatalf("Failed to insert test user: %v", err)
	}

	_, err = db.Exec("INSERT INTO gifts (user_id, file_name) VALUES (1, 'testfile.txt')")
	if err != nil {
		t.Fatalf("Failed to insert test gift: %v", err)
	}

	// Perform request
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

// ✅ Test downloading a gift
func TestDownloadGiftHandler(t *testing.T) {
	testDB, err := setupTestDB()
	if err != nil {
		t.Fatalf("Failed to setup test database: %v", err)
	}
	db = testDB

	// ✅ Insert a test user
	_, err = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", "password")
	if err != nil {
		t.Fatalf("Failed to insert test user: %v", err)
	}

	// ✅ Insert a test gift (WITH file data)
	fileContent := []byte("This is test file data")
	_, err = db.Exec("INSERT INTO gifts (user_id, file_name, file_data) VALUES (?, ?, ?)", 1, "testfile.txt", fileContent)
	if err != nil {
		t.Fatalf("Failed to insert test gift: %v", err)
	}

	// ✅ Perform request to download the gift
	rec := performRequest(downloadGiftHandler, "GET", "/download-gift?id=1", nil)

	// ✅ **Check Response**
	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Response: %s", rec.Code, rec.Body.String())
	}

	// ✅ **Verify Content**
	if !bytes.Equal(rec.Body.Bytes(), fileContent) {
		t.Errorf("Downloaded file content does not match expected content")
	}
}

// ✅ **Test stopping a pending gift**
func TestStopPendingGiftHandler(t *testing.T) {
	testDB, err := setupTestDB()
	if err != nil {
		t.Fatalf("Failed to setup test database: %v", err)
	}
	db = testDB

	// Insert a user and a gift
	_, _ = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", "testuser", "password")
	_, _ = db.Exec("INSERT INTO gifts (user_id, file_name) VALUES (1, 'testfile.txt')")

	// Perform request
	rec := performRequest(stopPendingGiftHandler, "DELETE", "/stop-pending-gift?id=1", nil)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}

	// Check if the gift was deleted
	var count int
	_ = db.QueryRow("SELECT COUNT(*) FROM gifts WHERE id = 1").Scan(&count)
	if count != 0 {
		t.Errorf("Expected 0 gifts remaining, found %d", count)
	}
}

// ✅ **Test sending gift emails**
func TestSendGiftEmailToReceivers(t *testing.T) {
	err := sendGiftEmailToReceivers("testfile.txt", []byte("test data"), "Test Message", "recipient@example.com")
	if err != nil {
		t.Errorf("Failed to send email: %v", err)
	}
}

// ✅ **Test sending check email**
func TestSendCheckEmail(t *testing.T) {
	err := sendCheckEmail("test@example.com", "Check Subject", "Check Body")
	if err != nil {
		t.Errorf("Failed to send check email: %v", err)
	}
}
