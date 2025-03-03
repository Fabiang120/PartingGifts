import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Dashboard from "./src/pages/dashboard";
import ForceChange from "./src/pages/forcechange";
import ForgotPassword from "./src/pages/forgot-password";
import LoginPage from "./src/pages/login";
import MemoryUploaded from "./src/pages/memory-uploaded";
import NewMemory from "./src/pages/new-memory";
import PersonalDetails from "./src/pages/personal-details";
import RecordMemory from "./src/pages/record-memory";
import RegisterPage from "./src/pages/register";
import WriteMemory from "./src/pages/write-memory";
import { useRouter } from "next/router";

vi.mock("next/router", () => ({ useRouter: vi.fn() }));

// Mock sessionStorage
vi.stubGlobal("sessionStorage", {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
});

describe("Dashboard Component", () => {
  it("renders dashboard with user information", async () => {
    sessionStorage.getItem.mockReturnValue("testUser");
    render(<Dashboard />);
    expect(screen.getByText(/Hello testUser!/)).toBeInTheDocument();
  });
});

describe("ForceChange Component", () => {
  it("displays password change form and handles errors", async () => {
    render(<ForceChange />);
    fireEvent.change(screen.getByPlaceholderText("Enter your new password"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your new password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Change Password/i }));
    expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument();
  });
});

describe("ForgotPassword Component", () => {
  it("handles email input and reset request", async () => {
    render(<ForgotPassword />);
    fireEvent.change(screen.getByPlaceholderText(/name@email.com/), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));
    await waitFor(() => expect(screen.getByText(/Failed to send email/)).toBeInTheDocument());
  });
});

describe("Login Component", () => {
  it("validates login credentials", async () => {
    useRouter.mockReturnValue({ push: vi.fn() });
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "testUser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Log in/i }));
    await waitFor(() => expect(screen.getByText(/wrong username or password/i)).toBeInTheDocument());
  });
});

describe("NewMemory Component", () => {
  it("handles file upload and navigation", async () => {
    useRouter.mockReturnValue({ push: vi.fn() });
    render(<NewMemory />);
    fireEvent.click(screen.getByText(/Upload Memory/i));
    await waitFor(() => expect(screen.getByText(/Upload failed/i)).toBeInTheDocument());
  });
});

describe("Register Component", () => {
  it("validates user input and submits registration", async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "user123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "12345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));
    await waitFor(() => expect(screen.getByText(/Registration failed/i)).toBeInTheDocument());
  });
});
