import React, { useState } from "react";
import { useRouter } from "next/router";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleResetPassword = (e) => {
    e.preventDefault();
    // Placeholder for API call to send a reset password link
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }
    setMessage("If this email exists in our system, a reset link has been sent.");
  };

  const handleLoginLink = () => {
    // Placeholder for API call to send a login link
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }
    setMessage("If this email exists in our system, a login link has been sent.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <img
            src="https://i.postimg.cc/VsRBMLgn/pglogo.png"
            alt="Parting Gifts Logo"
            className="mx-auto mb-4 w-24"
          />
          <h1 className="text-xl font-bold text-black">Forgot Password</h1>
        </div>
        <form onSubmit={handleResetPassword}>
          <p className="mb-4 text-sm text-gray-700">
            Enter the email address you use on Parting Gifts. We’ll send you a
            link to reset your password.
          </p>
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
          <button
            type="submit"
            className="w-full px-4 py-2 mb-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Reset Password
          </button>
        </form>
        <div className="flex items-center justify-center mb-4 text-gray-400">
          <hr className="w-full border-gray-300" />
          <span className="px-2 text-sm">or</span>
          <hr className="w-full border-gray-300" />
        </div>
        <button
          onClick={handleLoginLink}
          className="w-full px-4 py-2 mb-4 text-blue-500 border border-blue-500 rounded-md hover:bg-blue-100 focus:outline-none focus:ring focus:ring-blue-300"
        >
          Email me a login link
        </button>
        <div className="text-center">
          <a
            onClick={() => router.push("/login")}
            className="text-sm text-blue-500 hover:underline cursor-pointer"
          >
            Back to Log in
          </a>
        </div>
        {message && (
          <p className="mt-4 text-sm text-center text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
