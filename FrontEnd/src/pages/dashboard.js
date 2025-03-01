import React, { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Import useRouter for navigation

const Dashboard = () => {
  const router = useRouter(); // Initialize useRouter

  const [username, setUsername] = useState("");
  const [receiverEmails, setReceiverEmails] = useState([]);
  const [giftCount, setGiftCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Retrieve username and receiver emails from sessionStorage.
      const storedUsername = sessionStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
        // Fetch the actual gift count from your backend.
        fetch(`http://localhost:8080/gift-count?username=${storedUsername}`)
          .then((res) => res.json())
          .then((data) => {
            // Assume the response has a "count" property.
            setGiftCount(data.count);
          })
          .catch((error) => {
            console.error("Error fetching gift count:", error);
            setGiftCount(0);
          });
      }
      const storedEmails = sessionStorage.getItem("receiverEmails");
      if (storedEmails) {
        try {
          const parsedEmails = JSON.parse(storedEmails);
          setReceiverEmails(parsedEmails);
        } catch (error) {
          const emails = storedEmails.split(",");
          setReceiverEmails(emails.map((email) => email.trim()));
        }
      }
    }
  }, []);

  const handleNewMemoryClick = () => {
    router.push("/new-memory"); // Navigate to the New Memory page
  };

  const handleUserProfileClick = () => {
    router.push("/personal-details"); // Navigate to the Personal Details page
  };

  return (
    <div className="min-h-screen bg-blue-100">
      {/* Header Section */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
        <img
          src="https://i.postimg.cc/VsRBMLgn/pglogo.png"
          alt="Parting Gifts Logo"
          className="w-36"
        />
        <div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleUserProfileClick}
          >
            User Profile
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-8">
        {/* Welcome Section */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-black">
            Hello {username || "[user]"}!
          </h1>
          <p className="text-red-500">You have n unsent messages</p>
          <p className="mt-2 text-black">
            Total messages created: {giftCount}
          </p>
          <p className="text-black">Pending messages to schedule: n</p>
          <p className="mt-2 text-blue-500 hover:underline cursor-pointer">
            View Calendar
          </p>
          <button
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleNewMemoryClick}
          >
            New Memory
          </button>
        </div>

        {/* Previous Memories Section */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-black">
            Previous Memories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {/* Render your memory thumbnails here */}
          </div>
        </div>

        {/* Receiver Emails Section */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4 text-black">Receiver Emails</h2>
          {receiverEmails.length > 0 ? (
            <ul className="list-disc pl-5">
              {receiverEmails.map((email, index) => (
                <li key={index} className="text-black">
                  {email}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No receiver emails found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
