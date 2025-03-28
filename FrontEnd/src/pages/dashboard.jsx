import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const Dashboard = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [receiverEmails, setReceiverEmails] = useState([]);
  const [giftCount, setGiftCount] = useState(0);
  const [gifts, setGifts] = useState([]); // Always an array
  const [selectedGift, setSelectedGift] = useState(null);
  const [pendingMessages, setPendingMessages] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = sessionStorage.getItem("username");
      console.log("Retrieved username:", storedUsername);
      if (storedUsername) {
        setUsername(storedUsername);

        // Fetch gift count
        fetch(`http://localhost:8080/gift-count?username=${storedUsername}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("Gift count data:", data);
            setGiftCount(data.count || 0);
          })
          .catch((error) => {
            console.error("Error fetching gift count:", error);
            setGiftCount(0);
          });

        // Fetch gifts (ensure data is an array)
        fetch(`http://localhost:8080/gifts?username=${storedUsername}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("Gifts data:", data);
            setGifts(data || []);
          })
          .catch((error) => {
            console.error("Error fetching gifts:", error);
            setGifts([]);
          });

        // Fetch receiver emails with a null check
        fetch(`http://localhost:8080/get-receivers?username=${storedUsername}`)
          .then((res) => res.json())
          .then((data) => {
            if (!data) {
              console.error("No data received from get-receivers");
              setReceiverEmails([]);
              return;
            }
            if (data.error) {
              console.error("Error from get-receivers:", data.error);
              setReceiverEmails([]);
            } else {
              console.log("Receiver emails:", data);
              setReceiverEmails(data || []);
            }
          })
          .catch((error) => {
            console.error("Error fetching receiver emails:", error);
            setReceiverEmails([]);
          });

        // Fetch pending messages count
        fetch(`http://localhost:8080/dashboard/pending-gifts?username=${storedUsername}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("Pending messages data:", data);
            setPendingMessages(data.pending_messages || 0);
          })
          .catch((error) => {
            console.error("Error fetching pending messages:", error);
            setPendingMessages(0);
          });
      }

      // Fallback: retrieve receiverEmails from sessionStorage if available.
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

  const stopPendingGift = async (giftId) => {
    console.log("Received gift ID:", giftId);

    if (!giftId || isNaN(giftId)) {
      alert("Invalid gift ID. Please try again.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/stop-pending-gift?id=${giftId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to stop gift: ${errorText}`);
      }

      alert("Pending gift has been stopped successfully!");

      // Update UI: Remove the canceled gift from the pending list
      setGifts((prevGifts) => prevGifts.filter((gift) => gift.id !== giftId));
    } catch (error) {
      console.error("Error stopping pending gift:", error);
      alert("Error stopping gift. Please try again.");
    }
  };

  // Navigation handlers
  const handleNewMemoryClick = () => {
    router.push("/new-memory");
  };

  const handleUserProfileClick = () => {
    router.push("/personal-details");
  };

  // Helper: Check if a file is an image by extension.
  const isImageFile = (fileName) => {
    return /\.(jpg|jpeg|png|gif)$/i.test(fileName);
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
          <p className="text-red-500">
            You have {pendingMessages !== null ? pendingMessages : "Loading..."} unsent messages
          </p>
          <p className="mt-2 text-black">Total messages created: {giftCount}</p>
          <p className="mt-2 text-black">
            Pending messages to schedule: {pendingMessages !== null ? pendingMessages : "Loading..."}
          </p>
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
          <h2 className="text-lg font-bold mb-4 text-black">Previous Memories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {/* Render your memory thumbnails here */}
          </div>
        </div>

        {/* Pending Gifts Section */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-black">Pending Gifts</h2>
          {pendingMessages === 0 ? (
            <p className="text-gray-500">No pending gifts.</p>
          ) : (
            <ul className="space-y-4">
              {gifts
                .filter((gift) => gift.pending)
                .map((gift) => (
                  <li key={gift.id} className="border p-4 rounded-lg flex flex-col bg-gray-50">
                    <p className="text-lg font-semibold text-black">
                      {gift.file_name || "Message Gift"}
                    </p>
                    <button
                      className="mt-2 px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      onClick={() => {
                        console.log("Stopping gift with ID:", gift.id);
                        stopPendingGift(gift.id);
                      }}
                    >
                      Stop Pending Gift
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Your Gifts Section */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-black">Your Gifts</h2>
          <div className="flex space-x-4 overflow-x-auto">
            {(gifts || []).map((gift) => (
              <div
                key={gift.id}
                className="min-w-[200px] p-4 bg-white rounded-lg shadow-md flex flex-col items-center"
              >
                {gift.file_name && gift.file_name.trim() !== "" ? (
                  <>
                    <p className="text-sm font-bold text-black">
                      File: {gift.file_name}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-black">
                    Message: {gift.custom_message || "No message provided."}
                  </p>
                )}
                <button
                  className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={() => setSelectedGift(gift)}
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Receiver Emails Section */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4 text-black">Receiver Emails</h2>
          {receiverEmails && receiverEmails.length > 0 ? (
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

      {/* Gift Modal */}
      {selectedGift && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Gift Details</h2>
            {selectedGift.file_name && selectedGift.file_name.trim() !== "" ? (
              <>
                <p className="text-sm font-bold text-black">
                  File: {selectedGift.file_name}
                </p>
                {isImageFile(selectedGift.file_name) ? (
                  <img
                    src={`http://localhost:8080/download-gift?id=${selectedGift.id}`}
                    alt={selectedGift.file_name}
                    className="mb-4 max-h-96 object-contain"
                    onError={(e) => {
                      console.error("Image failed to load:", e.target.src);
                      e.target.style.display = "none";
                      const fallback = document.createElement("p");
                      fallback.textContent = "Image failed to load";
                      e.target.parentNode.appendChild(fallback);
                    }}
                  />
                ) : (
                  <a
                    href={`http://localhost:8080/download-gift?id=${selectedGift.id}`}
                    download={selectedGift.file_name}
                    className="text-blue-500 underline mb-4 block"
                  >
                    Download {selectedGift.file_name}
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm font-bold text-black">
                Message: {selectedGift.custom_message || "No message provided."}
              </p>
            )}
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => setSelectedGift(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
