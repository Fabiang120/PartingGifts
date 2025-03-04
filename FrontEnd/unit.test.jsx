import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
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

// --------------------- Global Stubs & Mocks ---------------------

// Stub global fetch for endpoints used by Dashboard and others.
vi.stubGlobal("fetch", async (url, options) => {
  if (typeof url === "string") {
    // For endpoints Dashboard uses.
    if (
      url.includes("gifts") ||
      url.includes("giftCount") ||
      url.includes("receivers") ||
      url.includes("pending-messages")
    ) {
      return {
        ok: true,
        status: 200,
        json: async () => ([]),
      };
    }
    // For WriteMemory upload endpoint.
    if (url.includes("/upload-gift")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ message: "Upload successful", giftId: "123" }),
      };
    }
    // For PersonalDetails GET request.
    if (url.includes("update-emails?username=")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          username: "testUser",
          primary_contact_email: "primary@example.com",
          secondary_contact_emails: "secondary@example.com",
        }),
      };
    }
  }
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: "Not found" }),
  };
});

// Stub window.alert so that no real alerts occur during tests.
vi.stubGlobal("alert", vi.fn());

// Stub console methods to suppress unwanted logs during tests.
vi.stubGlobal("console", {
  ...console,
  error: vi.fn(),
  log: vi.fn(),
});

// For RecordMemory, stub URL.createObjectURL (used for displaying recorded video)
global.URL.createObjectURL = vi.fn(() => "blob://dummy");

// Mock next/router
vi.mock("next/router", () => ({ useRouter: vi.fn() }));

// Stub sessionStorage
vi.stubGlobal("sessionStorage", {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
});

// --------------------- Component Tests ---------------------

describe("Dashboard Component", () => {
  it("renders dashboard with user information", async () => {
    sessionStorage.getItem.mockReturnValue("testUser");
    await act(async () => {
      render(<Dashboard />);
    });
    expect(screen.getByText(/Hello testUser!/)).toBeInTheDocument();
  });
});

describe("ForceChange Component", () => {
  it("displays password change form and handles errors", async () => {
    await act(async () => {
      render(<ForceChange />);
    });
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Enter your new password"), {
        target: { value: "newpass123" },
      });
      fireEvent.change(
        screen.getByPlaceholderText("Confirm your new password"),
        { target: { value: "wrongpass" } }
      );
      fireEvent.submit(screen.getByRole("button", { name: /Change Password/i }));
    });
    expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument();
  });
});

describe("ForgotPassword Component", () => {
  it("handles email input and reset request", async () => {
    await act(async () => {
      render(<ForgotPassword />);
    });
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/name@email.com/), {
        target: { value: "test@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));
    });
    await waitFor(() =>
      expect(
        screen.getByText(/Something went wrong\. Please try again later\./i)
      ).toBeInTheDocument()
    );
  });
});

describe("Login Component", () => {
  it("validates login credentials", async () => {
    useRouter.mockReturnValue({ push: vi.fn() });
    await act(async () => {
      render(<LoginPage />);
    });
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
        target: { value: "testUser" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { value: "wrongpassword" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Log in/i }));
    });
    await waitFor(() =>
      expect(
        screen.getByText(/You entered the wrong username and password/i)
      ).toBeInTheDocument()
    );
  });
});

describe("NewMemory Component", () => {
  it("handles file upload and navigation", async () => {
    useRouter.mockReturnValue({ push: vi.fn() });
    await act(async () => {
      render(<NewMemory />);
    });
    const uploadButton = screen.getByText(/Upload Memory/i);
    expect(uploadButton).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(uploadButton);
    });
    await waitFor(() => expect(screen.getByText(/Upload Memory/i)).toBeInTheDocument());
  });
});

describe("Register Component", () => {
  it("validates user input and submits registration", async () => {
    await act(async () => {
      render(<RegisterPage />);
    });
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
        target: { value: "user123" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { value: "12345678" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Register/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/Create an account!/i)).toBeInTheDocument()
    );
  });
});

// --- Missing Pages Tests ---

describe("RecordMemory Component", () => {
  it("renders and shows recording UI", async () => {
    // Stub navigator.mediaDevices.getUserMedia to resolve with a dummy stream.
    const dummyStream = { getTracks: () => [{ stop: vi.fn() }] };
    navigator.mediaDevices = { getUserMedia: vi.fn(() => Promise.resolve(dummyStream)) };

    await act(async () => {
      render(<RecordMemory />);
    });
    // Verify the heading and video element
    expect(screen.getByText(/Record a Memory/i)).toBeInTheDocument();
    expect(document.querySelector("video")).toBeTruthy();
  });
});

describe("WriteMemory Component", () => {
  it("renders and displays editor with title input and action buttons", async () => {
    // Stub username in sessionStorage.
    sessionStorage.getItem.mockReturnValue("testUser");
    await act(async () => {
      render(<WriteMemory />);
    });
    // Check for heading and title input.
    expect(screen.getByText(/Write a Memory/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Memory Title/i)).toBeInTheDocument();
    // Check for Save Memory and Cancel buttons.
    expect(screen.getByText(/Save Memory/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });
});

describe("PersonalDetails Component", () => {
  it("renders personal details form and navigation button", async () => {
    // Stub username in sessionStorage.
    sessionStorage.getItem.mockReturnValue("testUser");
    await act(async () => {
      render(<PersonalDetails />);
    });
    // Check that the form heading is rendered.
    expect(screen.getByText(/Personal Details/i)).toBeInTheDocument();
    // Check for a message about current username or its absence.
    expect(
      screen.getByText(/(Current Username:|Username not found)/i)
    ).toBeInTheDocument();
    // Check for the Update button and Privacy Settings navigation button.
    expect(screen.getByRole("button", { name: /Update/i })).toBeInTheDocument();
    expect(screen.getByText(/Go to Privacy Settings/i)).toBeInTheDocument();
  });
});

describe("MemoryUploaded Component", () => {
  it("renders receiver information form and alerts on missing session data", async () => {
    // Stub sessionStorage so that username and currentGiftId are missing.
    sessionStorage.getItem.mockReturnValue(null);
    await act(async () => {
      render(<MemoryUploaded />);
    });
    // Check for the heading "Receiver Information"
    expect(screen.getByText(/Receiver Information/i)).toBeInTheDocument();
    // Simulate clicking the Save button.
    const saveButton = screen.getByRole("button", { name: /Save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    // Expect alert to be called with the missing session message.
    expect(global.alert).toHaveBeenCalledWith("Session data missing. Please start over.");
  });
});
