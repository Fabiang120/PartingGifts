describe("Forgot Password Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4200/forgot-password"); // Ensure this matches your frontend URL
  });

  it("should load the Forgot Password page", () => {
    cy.contains("Forgot Password").should("be.visible");
  });

  it("should toggle between Email Reset and Security Question", () => {
    cy.get("button").contains("Security Question").click();
    cy.get("button").contains("Security Question").should("be.visible");

    // Verify the security question dropdown appears
    cy.get("select#securityQuestion").should("be.visible");
  });

  it("should show validation error when submitting without an email", () => {
    cy.get("button[type='submit']").click();
    cy.contains("Please enter your email address.").should("be.visible");
  });

  it("should allow selecting a security question and entering an answer", () => {
    cy.get("button").contains("Security Question").click();
    cy.get("select#securityQuestion").select("What was the name of your first pet?");
    cy.get("input#securityAnswer").type("Charlie");
    cy.get("input#securityAnswer").should("have.value", "Charlie");
  });

  it("should submit the form successfully (mock API response)", () => {
    cy.intercept("POST", "/reset-password", {
      statusCode: 200,
      body: "Password reset link sent to your email!",
    }).as("resetRequest");

    cy.get("input#email").type("test@example.com");
    cy.get("button").contains("Reset Password").click();
    cy.wait("@resetRequest");
    cy.contains("Password reset link sent to your email!").should("be.visible");
  });

  it("should show error message on failed API request", () => {
    cy.intercept("POST", "/reset-password", {
      statusCode: 400,
      body: "Invalid email address",
    }).as("failedReset");

    cy.get("input#email").type("invalid@example.com");
    cy.get("button").contains("Reset Password").click();
    cy.wait("@failedReset");
    cy.contains("Invalid email address").should("be.visible");
  });

  it("should navigate back to login when clicking 'Back to Log in'", () => {
    cy.get("a").contains("Back to Log in").click();
    cy.url().should("include", "/login"); // Ensure this matches your actual login page URL
  });
});
