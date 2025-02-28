import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PersonalDetails() {
  const [details, setDetails] = useState({
    username: '',
    primaryContact: '',
    secondaryContacts: ['']
  });
  const [userEmailDetails, setUserEmailDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Retrieve the username from sessionStorage on mount.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = sessionStorage.getItem("username");
      if (storedUsername) {
        console.log("Retrieved username from sessionStorage:", storedUsername);
        setDetails(prev => ({ ...prev, username: storedUsername }));
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
          // Prepopulate the form fields if data exists.
          if (data.primary_contact_email) {
            setDetails(prev => ({ ...prev, primaryContact: data.primary_contact_email }));
          } else {
            console.log("No primary_contact_email found for user.");
          }
          if (data.secondary_contact_emails) {
            const contacts = data.secondary_contact_emails.split(',');
            setDetails(prev => ({
              ...prev,
              secondaryContacts: contacts
            }));
          } else {
            console.log("No secondary_contact_emails found for user.");
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

  // Simple validation (expand as needed)
  const validate = () => {
    const newErrors = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContactChange = (index, newValue) => {
    const updatedContacts = [...details.secondaryContacts];
    updatedContacts[index] = newValue;
    setDetails({ ...details, secondaryContacts: updatedContacts });
  };

  const addNewContact = () => {
    setDetails({ ...details, secondaryContacts: [...details.secondaryContacts, ""] });
  };

  const removeContact = (index) => {
    if (details.secondaryContacts.length === 1) return;
    const updatedContacts = details.secondaryContacts.filter((_, i) => i !== index);
    setDetails({ ...details, secondaryContacts: updatedContacts });
  };

  const updatePersonalDetails = async () => {
    try {
      console.log("Submitted details:", details);
      const payload = {
        username: details.username,
        primaryContactEmail: details.primaryContact,
        contactEmail: details.secondaryContacts.join(',')
      };

      const response = await fetch('http://localhost:8080/update-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (validate()) {
      updatePersonalDetails();
    }
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-blue-100`}>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-10 text-black shadow-sm space-y-2 w-[500px]">
          <img src="https://i.postimg.cc/VsRBMLgn/pglogo.png" className="w-40" alt="logo" />
          <p className="font-bold text-2xl">Personal Details</p>

          {userEmailDetails && userEmailDetails.username ? (
            <div className="bg-gray-100 p-2 mb-2">
              Current Username: {userEmailDetails.username}
            </div>
          ) : (
            <div className="bg-red-100 p-2 mb-2">
              Username not found in fetched data.
            </div>
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
              <div className="bg-gray-100 p-2 mb-2">
                Current Primary Email: {userEmailDetails.primary_contact_email}
              </div>
            ) : (
              <div className="bg-red-100 p-2 mb-2">
                No primary email found.
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

          <div className="flex flex-col">
            {userEmailDetails && userEmailDetails.secondary_contact_emails ? (
              <div className="bg-gray-100 p-2 mb-2">
                Current Secondary Emails: {userEmailDetails.secondary_contact_emails}
              </div>
            ) : (
              <div className="bg-red-100 p-2 mb-2">
                No secondary emails found.
              </div>
            )}
            <div className="space-x-2">
              <label htmlFor="secondaryContacts">Secondary Contact Emails</label>
              <button
                onClick={addNewContact}
                type="button"
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                +
              </button>
            </div>
            {details.secondaryContacts.map((contact, index) => (
              <div key={index} className="mb-2 flex items-center">
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => handleContactChange(index, e.target.value)}
                  className="border-gray-600 border rounded-lg p-1 flex-1 mr-2"
                />
                {details.secondaryContacts.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    -
                  </button>
                ) : (
                  <div className="bg-gray-500 text-white px-2 py-1 rounded">-</div>
                )}
              </div>
            ))}
            {errors.secondaryContacts && <div className="text-red-500">{errors.secondaryContacts}</div>}
          </div>

          <button className="bg-[#00A9C5] text-white rounded-full py-1 px-8" type="submit">
            Update
          </button>
          {message && <div className="text-red-500">{message}</div>}
        </form>
      </main>
    </div>
  );
}
