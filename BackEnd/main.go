package main

import (
    "database/sql"
    "encoding/json"
    "crypto/rand"
    "math/big"
    "fmt"
    "io"
    "log"
	"time"
    "net/http"
    "strings" // required for splitting secondary emails
    "regexp"
    "unicode"
    "gopkg.in/gomail.v2"
    _ "github.com/mattn/go-sqlite3"
    "golang.org/x/crypto/bcrypt"
)

// User represents a user in the system.
type User struct {
    ID                     int    `json:"id"`
    Username               string `json:"username"`
    Password               string `json:"password"`
    MyEmail                string `json:"myEmail,omitempty"`
    PrimaryContactEmail    string `json:"primaryContactEmail,omitempty"`
    SecondaryContactEmails string `json:"contactEmail,omitempty"`
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
        my_email TEXT,
        primary_contact_email TEXT,
        secondary_contact_emails TEXT,
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
    (*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
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
        http.Error(w, "Invalid username. Must be 4-20 characters, only letters, numbers and underscore.", http.StatusBadRequest)
        return
    }
    if !isValidPassword(user.Password) {
        http.Error(w, "Invalid Password. Must be at least 8 characters with a mix of letters, numbers and special characters.", http.StatusBadRequest)
        return
    }

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

    stmt, err := db.Prepare("INSERT INTO users(username, password) VALUES(?, ?)")
    if err != nil {
        http.Error(w, "Registration failed", http.StatusInternalServerError)
        return
    }
    defer stmt.Close()

    _, err = stmt.Exec(user.Username, hashedPassword)
    if err != nil {
        http.Error(w, "Registration failed", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    w.Write([]byte("Account created successfully"))
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
    if r.Method != http.MethodPost {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    stmt, err := db.Prepare("UPDATE users SET my_email = ?, primary_contact_email = ?, secondary_contact_emails = ? WHERE username = ?")
    if err != nil {
        log.Printf("Error preparing update statement: %v", err)
        http.Error(w, fmt.Sprintf("Update failed: %v", err), http.StatusInternalServerError)
        return
    }
    defer stmt.Close()
    res, err := stmt.Exec(user.MyEmail, user.PrimaryContactEmail, user.SecondaryContactEmails, user.Username)
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
    
    // Look up user by email
    var userID int
    var currentHash string
    err := db.QueryRow("SELECT id, password FROM users WHERE my_email = ? OR secondary_contact_emails = ?", req.Email, req.Email).Scan(&userID, &currentHash)
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }
    
    newPassword, err := generateRandomPassword(12)
    if err != nil {
        http.Error(w, "Error generating new password", http.StatusInternalServerError)
        return
    }
    
    // Hash the new password.
    hashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Error generating password", http.StatusInternalServerError)
        return
    }
    
    // Update the user's password in the database.
    _, err = db.Exec("UPDATE users SET password = ? WHERE id = ?", hashed, userID)
    if err != nil {
        http.Error(w, "Error updating password", http.StatusInternalServerError)
        return
    }
    
    // Now send the new password by email.
    smtpHost := "smtp.gmail.com"
    smtpPort := 587
    senderEmail := "f3243329@gmail.com"
    senderPassword := "auca xxpm lziz vrjg"
    
    m := gomail.NewMessage()
    m.SetHeader("From", senderEmail)
    m.SetHeader("Subject", "Your New Password")
    m.SetHeader("To", req.Email)
    body := fmt.Sprintf("Hello,\n\nYour new password is: %s", newPassword)
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
    err := db.QueryRow("SELECT password FROM users WHERE username = ?", credentials.Username).Scan(&storedPassword)
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
    w.Header().Set("Content-Type", "text/plain")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Login successful"))
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

    // Retrieve username and log it for debugging.
    username := r.FormValue("username")
    log.Printf("Username received: '%s'", username)
    if username == "" {
        http.Error(w, "Username is required", http.StatusBadRequest)
        return
    }

    // Retrieve additional fields.
    customMessage := r.FormValue("emailMessage")
    sendToAll := r.FormValue("sendToAll") // Expected "true" or "false"
    log.Printf("sendToAll: %s, emailMessage: %s", sendToAll, customMessage)

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

    // Query the database for the user's ID.
    var userID int
    err = db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
    if err != nil {
        log.Printf("Error retrieving user ID for username '%s': %v", username, err)
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }
    log.Printf("User ID for username '%s': %d", username, userID)

    stmt, err := db.Prepare("INSERT INTO gifts(user_id, file_name, file_data) VALUES(?, ?, ?)")
    if err != nil {
        log.Printf("Error preparing gift insert: %v", err)
        http.Error(w, fmt.Sprintf("Upload failed: %v", err), http.StatusInternalServerError)
        return
    }
    defer stmt.Close()

    _, err = stmt.Exec(userID, header.Filename, fileData)
    if err != nil {
        log.Printf("Error executing gift insert: %v", err)
        http.Error(w, fmt.Sprintf("Upload failed: %v", err), http.StatusInternalServerError)
        return
    }
    log.Println("Gift record inserted successfully")

    // Delay email sending by 1 minute.
    delay := time.Minute * 1
    go func(username, fileName string, fileData []byte, customMessage, sendToAll string) {
        time.Sleep(delay)
        sendAll := false
        if sendToAll == "true" {
            sendAll = true
        }
        err := sendGiftByEmail(username, fileName, fileData, customMessage, sendAll)
        if err != nil {
            log.Printf("Error sending gift email: %v", err)
        } else {
            log.Printf("Gift email sent successfully for user: %s", username)
        }
    }(username, header.Filename, fileData, customMessage, sendToAll)

    w.Header().Set("Content-Type", "text/plain")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Gift uploaded successfully"))
}


func sendGiftByEmail(username, fileName string, fileData []byte, customBody string, sendToAll bool) error {
    // Retrieve primary contact email.
    var primary string
    err := db.QueryRow("SELECT primary_contact_email FROM users WHERE username = ?", username).Scan(&primary)
    if err != nil {
        log.Printf("Error retrieving primary contact email for user %s: %v", username, err)
        return fmt.Errorf("failed to retrieve primary contact email: %v", err)
    }
    if primary == "" {
        log.Printf("No primary contact email found for user %s", username)
        return fmt.Errorf("primary contact email is empty for user %s", username)
    }
    recipients := []string{primary}
    log.Printf("Primary contact email: %s", primary)

    if sendToAll {
        var secondary string
        err = db.QueryRow("SELECT secondary_contact_emails FROM users WHERE username = ?", username).Scan(&secondary)
        if err != nil && err != sql.ErrNoRows {
            log.Printf("Error retrieving secondary contact emails for user %s: %v", username, err)
            return fmt.Errorf("failed to retrieve secondary contact emails: %v", err)
        }
        if secondary != "" {
            emails := strings.Split(secondary, ",")
            for _, email := range emails {
                trimmed := strings.TrimSpace(email)
                if trimmed != "" {
                    recipients = append(recipients, trimmed)
                }
            }
        }
        log.Printf("All recipients: %v", recipients)
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
        log.Printf("Failed to send email for user %s: %v", username, err)
        return fmt.Errorf("failed to send email: %v", err)
    }
    return nil
}

