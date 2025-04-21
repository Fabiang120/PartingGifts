import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { UserHeader } from "../components/user-header";

export default function PersonalDetails() {
  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What is your favorite teacher's name?",
    "What was the make of your first car?",
    "What city were you born in?"
  ];

  const [details, setDetails] = useState({
    username: "",
    primaryContact: "",
    secondaryContacts: [""],
    securityQuestion: securityQuestions[0],
    securityAnswer: ""
  });

  const [userEmailDetails, setUserEmailDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Retrieve the username from sessionStorage on mount and immediately display it
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = sessionStorage.getItem("username");
      if (storedUsername) {
        console.log("Retrieved username from sessionStorage:", storedUsername);

        // Set username in both states
        setDetails(prev => ({ ...prev, username: storedUsername }));
        setUserEmailDetails(prev => ({
          ...prev,
          username: storedUsername
        }));

        // Fetch user details from API
        fetchUserDetails(storedUsername);
      } else {
        console.log("No username in sessionStorage");
      }
    }
  }, []);

  // Function to fetch user details
  const fetchUserDetails = async (username) => {
    if (!username) return;

    console.log("Fetching details for username:", username);
    try {
      const response = await fetch(`http://localhost:8080/update-emails?username=${username}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user details:", data);

        // Update userEmailDetails with API response (immediately update the display)
        setUserEmailDetails(data);

        // Update form fields with API data
        setDetails(prev => ({
          ...prev,
          primaryContact: data.primary_contact_email || "",
          secondaryContacts: data.secondary_contact_emails ?
            data.secondary_contact_emails.split(",").filter(email => email.trim() !== "") : [""],
          securityQuestion: data.security_question || securityQuestions[0],
          securityAnswer: data.security_answer || ""
        }));
      } else {
        console.error("Failed to fetch user details, status:", response.status);
      }
    } catch (err) {
      console.error("Error fetching email details:", err);
    }
  };

  const validateSecurityQuestion = () => {
    let isValid = true;
    const newErrors = {};

    if (!details.securityQuestion) {
      newErrors.securityQuestion = "Please select a security question";
      isValid = false;
    }

    if (!details.securityAnswer || details.securityAnswer.trim() === "") {
      newErrors.securityAnswer = "Please provide an answer to your security question";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateSecurityQuestion()) {
      return;
    }

    updatePersonalDetails();
  };

  const updatePersonalDetails = async () => {
    try {
      console.log("Submitted details:", details);
      const payload = {
        username: details.username,
        primary_contact_email: details.primaryContact,
        secondary_contact_emails: details.secondaryContacts.filter(email => email.trim() !== "").join(","),
        security_question: details.securityQuestion,
        security_answer: details.securityAnswer
      };

      console.log("Sending payload:", payload);

      const response = await fetch("http://localhost:8080/update-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Update failed. Please try again.");
      }

      const textResponse = await response.text();
      console.log("Update response:", textResponse);
      setMessage("Personal details updated successfully!");

      // Refresh user data after update
      fetchUserDetails(details.username);
    } catch (err) {
      console.error("Update error:", err);
      setMessage("Update failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-primary-foreground flex flex-col items-center">
      <UserHeader/>
      <div className="flex flex-col min-h-screen flex-grow justify-center items-center">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-10 text-black shadow-sm space-y-4 w-[500px]">
          <p className="font-bold text-2xl">Personal Details</p>

          {/* Always display username from session storage if available */}
          <div className="bg-gray-100 p-2 mb-2">
            Current Username: {userEmailDetails?.username || "Loading..."}
          </div>

          <div className="flex flex-col">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={details.username}
              readOnly
              className="border-gray-600 border rounded-lg p-1 bg-gray-100"
            />
            {errors.username && <div className="text-red-500">{errors.username}</div>}
          </div>

          <div className="flex flex-col">
            {userEmailDetails?.primary_contact_email ? (
              <div className="bg-gray-100 p-2 mb-2">
                Current Primary Email: {userEmailDetails.primary_contact_email}
              </div>
            ) : (
              <div className="bg-yellow-100 p-2 mb-2">
                {details.username ? "Loading email data..." : "Enter username to load email"}
              </div>
            )}
            <label htmlFor="primaryContact">Primary Email</label>
            <input
              type="text"
              id="primaryContact"
              name="primaryContact"
              value={details.primaryContact}
              onChange={(e) => setDetails({ ...details, primaryContact: e.target.value })}
              className="border-gray-600 border rounded-lg p-1"
            />
            {errors.primaryContact && <div className="text-red-500">{errors.primaryContact}</div>}
          </div>

          {/* Security Question Dropdown */}
          <div className="flex flex-col">
            <label htmlFor="securityQuestion">Security Question</label>
            <select
              id="securityQuestion"
              name="securityQuestion"
              value={details.securityQuestion}
              onChange={(e) => setDetails({ ...details, securityQuestion: e.target.value })}
              className="border-gray-600 border rounded-lg p-2"
            >
              {securityQuestions.map((question, index) => (
                <option key={index} value={question}>
                  {question}
                </option>
              ))}
            </select>
            {errors.securityQuestion && <div className="text-red-500">{errors.securityQuestion}</div>}
          </div>

          {/* Security Answer Input */}
          <div className="flex flex-col">
            <label htmlFor="securityAnswer">Security Question Answer</label>
            <input
              type="text"
              id="securityAnswer"
              name="securityAnswer"
              value={details.securityAnswer}
              onChange={(e) => setDetails({ ...details, securityAnswer: e.target.value })}
              className="border-gray-600 border rounded-lg p-1"
              placeholder="Enter your answer"
            />
            {errors.securityAnswer && <div className="text-red-500">{errors.securityAnswer}</div>}
          </div>

          <button className="bg-[#00A9C5] text-white rounded-full py-2 px-8 hover:bg-[#0088a3]" type="submit">
            Update
          </button>
          {message && <div className={message.includes("failed") ? "text-red-500" : "text-green-500"}>{message}</div>}
        </form>

        {/* Privacy Settings Button */}
        <button
          onClick={() => router.push("/privacy-settings")}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-gray-800"
        >
          Go to Privacy Settings
        </button>
      </div>
    </div>
  );
}