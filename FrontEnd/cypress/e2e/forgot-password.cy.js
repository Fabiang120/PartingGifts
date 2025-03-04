describe("Forgot Password Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4200/forgot-password"); // Ensure correct URL
  });

  it("should load the Forgot Password page", () => {
    cy.contains("Forgot Password").should("be.visible");
  });

  it("should toggle between Email Reset and Security Question", () => {
    cy.get("button").contains("Security Question").click();
    cy.get("select#securityQuestion").should("be.visible");
  });

  it("should show validation error when submitting without an email", () => {
    cy.get("input#email").should("exist").clear(); // Ensure email input exists & clear any value
    cy.get("button[type='submit']").click();
    
    // Ensure the correct validation error appears
    cy.contains("Please enter your email address.", { timeout: 8000 }).should("be.visible");
  });

  it("should allow selecting a security question and entering an answer", () => {
    cy.get("button").contains("Security Question").click();
    cy.get("select#securityQuestion").should("exist").select("What is your mother's maiden name?");
    cy.get("input#securityAnswer").should("exist").type("Charlie").should("have.value", "Charlie");
  });

  it("should submit the form successfully (mock API response)", () => {
    cy.intercept("POST", "http://localhost:8080/reset-password", {
      statusCode: 200,
      body: "Password reset link sent to your email!",
    });

    cy.get("input#email").should("exist").type("test@example.com");
    cy.get("button[type='submit']").click();

    cy.contains("Password reset link sent to your email!", { timeout: 8000 }).should("be.visible");
  });

  it("should show error message on failed API request", () => {
    cy.intercept("POST", "http://localhost:8080/reset-password", {
      statusCode: 400,
      body: "Failed to reset password.",
    });

    cy.get("input#email").should("exist").type("invalid@example.com");
    cy.get("button[type='submit']").click();

    cy.contains("Failed to reset password.", { timeout: 8000 }).should("be.visible");
  });

  it("should navigate back to login when clicking 'Back to Log in'", () => {
    cy.get("a").contains("Back to Log in").click();
    cy.url().should("include", "/login");
  });
});
