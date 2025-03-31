import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [securityQuestionIndex, setSecurityQuestionIndex] = useState(-1); // Index of selected security question
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [showQuestions, setShowQuestions] = useState(false); // Control display of security questions
  const router = useRouter();

  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What is your favorite teacher's name?",
    "What was the make of your first car?",
    "What city were you born in?"
  ];

  const handleResetPassword = async () => {
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("A reset password link has been sent to your registered email.");
      } else {
        setMessage("Failed to reset password. Please try again.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again later.");
    }
  };

  const handleSelectQuestion = (index) => {
    setSecurityQuestionIndex(index);
    setShowQuestions(true);
  };

  const verifySecurityAnswer = async () => {
    if (securityQuestionIndex === -1 || !securityAnswer) {
      setMessage("Please select a security question and provide an answer.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/verify-security-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          question: securityQuestions[securityQuestionIndex],
          answer: securityAnswer,
        }),
      });

      if (response.ok) {
        setMessage("Security answer verified successfully. You can now reset your password.");
        router.push("/reset-password"); // Assuming '/reset-password' is the route to change the password
      } else {
        setMessage("Incorrect answer to security question.");
      }
    } catch (error) {
      setMessage("Unable to verify your answer. Please try again later.");
    }
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
        <form onSubmit={(e) => e.preventDefault()}>
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
          <div className="flex mb-4 space-x-4">
            <Button className="w-full h-12 text-white" onClick={handleResetPassword}>
              Reset Password
            </Button>
          </div>
          <div className="flex mb-4 space-x-4">
            <Button className="w-full h-12 text-white" onClick={() => setShowQuestions(!showQuestions)}>
              Security Question
            </Button>
          </div>
          {showQuestions && (
            <div className="flex flex-col mb-4">
              <label htmlFor="securityQuestion" className="text-sm font-medium text-black">
                Choose a Security Question
              </label>
              <select
                id="securityQuestion"
                value={securityQuestionIndex}
                onChange={(e) => setSecurityQuestionIndex(e.target.value)}
                className="border-gray-600 border rounded-lg p-2 mt-1 focus:outline-none focus:ring focus:ring-blue-300"
                required
              >
                {securityQuestions.map((question, index) => (
                  <option key={index} value={index}>
                    {question}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Enter your answer"
                className="border-gray-600 border rounded-lg p-2 mt-1 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
              <Button className="w-full h-12 text-white mt-4" onClick={verifySecurityAnswer}>
                Verify Answer
              </Button>
            </div>
          )}
        </form>
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
