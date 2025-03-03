import React, { useState } from "react";
import { useRouter } from "next/router";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("email");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      let response;
      if (selectedMethod === "email") {
        response = await fetch("http://localhost:8080/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
      } else {
        response = await fetch("http://localhost:8080/reset-password-security", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, securityAnswer }),
        });
      }

      const data = await response.text();
      if (response.ok) {
        setMessage(data);
      } else {
        setMessage(data || "Failed to reset password.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
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
        <form onSubmit={handleResetPassword}>
          <p className="mb-4 text-sm text-gray-700">
            Choose a method to reset your password.
          </p>
          <div className="flex mb-4 space-x-4">
            <button
              type="button"
              className={`w-1/2 px-4 py-2 rounded-md focus:outline-none focus:ring ${
                selectedMethod === "email" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setSelectedMethod("email")}
            >
              Email Reset
            </button>
            <button
              type="button"
              className={`w-1/2 px-4 py-2 rounded-md focus:outline-none focus:ring ${
                selectedMethod === "security" ? "bg-blue-500 text-white" : "bg-gray-200"
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
          {selectedMethod === "security" && (
            <div className="flex flex-col mb-4">
              <label htmlFor="securityAnswer" className="text-sm font-medium text-black">
                Security Answer
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
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 mb-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Reset Password
          </button>
        </form>
        <div className="text-center">
          <a
            onClick={() => router.push("/login")}
            className="text-sm text-blue-500 hover:underline cursor-pointer"
          >
            Back to Log in
          </a>
        </div>
        {message && <p className="mt-4 text-sm text-center text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;