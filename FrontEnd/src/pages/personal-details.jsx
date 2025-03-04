import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function PersonalDetails() {
  const [details, setDetails] = useState({
    username: "",
    primaryContact: "",
    secondaryContacts: [""],
  });
  const [userEmailDetails, setUserEmailDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const router = useRouter(); // ✅ Router for navigation

  // Retrieve the username from sessionStorage on mount.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = sessionStorage.getItem("username");
      if (storedUsername) {
        console.log("Retrieved username from sessionStorage:", storedUsername);
        setDetails((prev) => ({ ...prev, username: storedUsername }));
      } else {
        console.log("No username in sessionStorage");
      }
    }
  }, []);

  // Fetch user details once the username is set.
  useEffect(() => {
    async function fetchEmailDetails() {
      if (!details.username) {
        console.log("No username set yet for fetching details.");
        return;
      }
      console.log("Fetching details for username:", details.username);
      try {
        const response = await fetch(`http://localhost:8080/update-emails?username=${details.username}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched user details:", data);
          setUserEmailDetails(data);
          if (data.primary_contact_email) {
            setDetails((prev) => ({ ...prev, primaryContact: data.primary_contact_email }));
          }
          if (data.secondary_contact_emails) {
            const contacts = data.secondary_contact_emails.split(",");
            setDetails((prev) => ({
              ...prev,
              secondaryContacts: contacts,
            }));
          }
        } else {
          console.error("Failed to fetch user details, status:", response.status);
        }
      } catch (err) {
        console.error("Error fetching email details:", err);
      }
    }
    fetchEmailDetails();
  }, [details.username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    updatePersonalDetails();
  };

  const updatePersonalDetails = async () => {
    try {
      console.log("Submitted details:", details);
      const payload = {
        username: details.username,
        primaryContactEmail: details.primaryContact,
        contactEmail: details.secondaryContacts.join(","),
      };

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
      setMessage(textResponse);
    } catch (err) {
      console.error("Update error:", err);
      setMessage("Update failed. Please try again.");
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-blue-100">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-10 text-black shadow-sm space-y-2 w-[500px]">
          <img src="https://i.postimg.cc/VsRBMLgn/pglogo.png" className="w-40" alt="logo" />
          <p className="font-bold text-2xl">Personal Details</p>

          {userEmailDetails && userEmailDetails.username ? (
            <div className="bg-gray-100 p-2 mb-2">Current Username: {userEmailDetails.username}</div>
          ) : (
            <div className="bg-red-100 p-2 mb-2">Username not found in fetched data.</div>
          )}

          <div className="flex flex-col">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={details.username}
              onChange={(e) => setDetails({ ...details, username: e.target.value })}
              className="border-gray-600 border rounded-lg p-1"
            />
            {errors.username && <div className="text-red-500">{errors.username}</div>}
          </div>

          <div className="flex flex-col">
            {userEmailDetails && userEmailDetails.primary_contact_email ? (
              <div className="bg-gray-100 p-2 mb-2">Current Primary Email: {userEmailDetails.primary_contact_email}</div>
            ) : (
              <div className="bg-red-100 p-2 mb-2">No primary email found.</div>
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

          <button className="bg-[#00A9C5] text-white rounded-full py-1 px-8" type="submit">
            Update
          </button>
          {message && <div className="text-red-500">{message}</div>}
        </form>

        {/* ✅ Privacy Settings Button */}
        <button
          onClick={() => router.push("/privacy-settings")}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-gray-800"
        >
          Go to Privacy Settings
        </button>
      </main>
    </div>
  );
}
