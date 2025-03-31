import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Added username state
  const [selectedMethod, setSelectedMethod] = useState("email");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1); // Added step management
  const router = useRouter();

  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What is your favorite teacher's name?",
    "What was the make of your first car?",
    "What city were you born in?"
  ];

  // Function to fetch security question by email
  const fetchSecurityQuestion = async () => {
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/get-security-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve user information");
      }

      const data = await response.json();
      setSecurityQuestion(data.securityQuestion || "");
      setUsername(data.username || "");

      if (!data.securityQuestion) {
        setMessage("Security question not set up for this email. Please use email reset.");
        return false;
      }

      setStep(2); // Move to security question step
      return true;
    } catch (error) {
      setMessage("Email not found or server error.");
      return false;
    }
  };

  const verifySecurityAnswer = async () => {
    if (!securityAnswer) {
      setMessage("Please provide an answer to the security question.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/verify-security-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          securityAnswer
        }),
      });

      if (!response.ok) {
        throw new Error("Incorrect security answer");
      }

      // Security answer was correct
      const data = await response.json();
      console.log("Verification successful:", data);

      // Store the username in sessionStorage
      sessionStorage.setItem("username", username);

      // Set a special flag in sessionStorage to indicate we came from security verification
      sessionStorage.setItem("fromSecurityVerification", "true");

      // Redirect to the password change page without query parameters
      router.push("/forcechange");
      return true;
    } catch (error) {
      console.error("Security answer verification error:", error);
      setMessage("Incorrect answer to security question.");
      return false;
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      if (selectedMethod === "email") {
        const response = await fetch("http://localhost:8080/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.text();
        if (response.ok) {
          setMessage(data);
        } else {
          setMessage(data || "Failed to reset password.");
        }
      } else {
        // For security question method, first fetch the question
        const success = await fetchSecurityQuestion();
        // Step handling is done inside fetchSecurityQuestion
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again later.");
    }
  };

  // Handle verification of security answer
  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    setMessage("");
    await verifySecurityAnswer();
  };

  // Back button handler
  const handleBack = () => {
    setStep(1);
    setMessage("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-foreground">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <img
            src="https://i.postimg.cc/VsRBMLgn/pglogo.png"
            alt="Parting Gifts Logo"
            className="mx-auto mb-4 w-24 cursor-pointer"
            onClick={() => router.push("/")}
          />
          <h1 className="text-xl font-bold text-black">Forgot Password</h1>
        </div>

        {step === 1 && (
          <form onSubmit={handleResetPassword}>
            <p className="mb-4 text-sm text-gray-700">
              Choose a method to reset your password.
            </p>
            <div className="flex mb-4 space-x-4">
              <button
                type="button"
                className={`w-1/2 px-4 py-2 rounded-md focus:outline-none focus:ring ${selectedMethod === "email" ? "bg-primary text-white" : "bg-gray-200"
                  }`}
                onClick={() => setSelectedMethod("email")}
              >
                Email Reset
              </button>
              <button
                type="button"
                className={`w-1/2 px-4 py-2 rounded-md focus:outline-none focus:ring ${selectedMethod === "security" ? "bg-primary text-white" : "bg-gray-200"
                  }`}
                onClick={() => setSelectedMethod("security")}
              >
                Security Question
              </button>
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="email" className="text-sm font-medium text-black">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="border-gray-600 border rounded-lg p-2 mt-1 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <Button className="w-full h-12 text-white mb-3" type="submit">
            {selectedMethod === "email" ? "Reset Password" : "Continue"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAnswer}>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-black mb-2">Security Question:</h2>
              <p className="bg-gray-100 p-3 rounded-lg">{securityQuestion}</p>
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="securityAnswer" className="text-sm font-medium text-black">
                Your Answer
              </label>
              <input
                type="text"
                id="securityAnswer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Enter your answer"
                className="border-gray-600 border rounded-lg p-2 mt-1 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleBack} variant="secondary" className="w-1/3 h-12 text-white mb-3" type="button">
              Back
              </Button>
              <Button className="w-2/3 h-12 text-white mb-3" type="submit">
              Verify & Login
              </Button>
            </div>
          </form>
        )}

        <div className="text-center">
          <a
            onClick={() => router.push("/login")}
            className="text-sm text-blue-500 hover:underline cursor-pointer"
          >
            Back to Log in
          </a>
        </div>
        {message && <p className="mt-4 text-sm text-center text-red-600">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;