package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
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
