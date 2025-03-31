// Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import SimpleGiftBox from "./SimpleGiftBox.jsx";
import { UserHeader } from "@/components/user-header.jsx";
import { Button } from "@/components/ui/button.jsx";
import MessageNotification from "../components/MessageNotification"; // ✅ Adjust path if needed



const Dashboard = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [receiverEmails, setReceiverEmails] = useState([]);
  const [giftCount, setGiftCount] = useState(0);
  const [gifts, setGifts] = useState([]); // Always an array
  const [selectedGift, setSelectedGift] = useState(null);
  const [pendingMessages, setPendingMessages] = useState(0);
  const [openingGiftId, setOpeningGiftId] = useState(null); // Track which gift is being opened
  const dataFetchedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to clear localStorage when component mounts (to reset gift states)
  useEffect(() => {
    // Clear the unwrapped gift state on page load
    localStorage.removeItem('unwrappedGifts');

    return () => {
      // Also clear when leaving the page
      localStorage.removeItem('unwrappedGifts');
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (dataFetchedRef.current) return;
      dataFetchedRef.current = true;

      if (typeof window === "undefined") return;

      const storedUsername = sessionStorage.getItem("username");
      console.log("Retrieved username:", storedUsername);

      if (!storedUsername) {
        setIsLoading(false);
        return;
      }
      setUsername(storedUsername);

      try {
        setIsLoading(true);
        // Fetch everything in parallel
        const [
          giftCountResponse,
          giftsResponse,
          receiversResponse,
          pendingResponse,
        ] = await Promise.all([
          fetch(`http://localhost:8080/gift-count?username=${storedUsername}`),
          fetch(`http://localhost:8080/gifts?username=${storedUsername}`),
          fetch(`http://localhost:8080/get-receivers?username=${storedUsername}`),
          fetch(`http://localhost:8080/dashboard/pending-gifts?username=${storedUsername}`),
        ]);

        // Process gift count
        const giftCountData = await giftCountResponse.json();
        console.log("Gift count data:", giftCountData);
        setGiftCount(giftCountData.count || 0);

        // Process gifts - always start with unwrapped: false
        const giftsData = await giftsResponse.json();
        console.log("Gifts data:", giftsData);
        setGifts((giftsData || []).map((g) => ({
          ...g,
          unwrapped: false // Always start as unwrapped: false
        })));

        // Process receiver emails
        const receiversData = await receiversResponse.json();
        if (!receiversData) {
          console.error("No data received from get-receivers");
          setReceiverEmails([]);
        } else if (receiversData.error) {
          console.error("Error from get-receivers:", receiversData.error);
          setReceiverEmails([]);
        } else {
          console.log("Receiver emails:", receiversData);
          setReceiverEmails(receiversData || []);
        }

        // Process pending messages
        const pendingData = await pendingResponse.json();
        console.log("Pending messages data:", pendingData);
        setPendingMessages(pendingData.pending_messages || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }

      // Fallback for receiver emails
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
    };

    fetchData();
  }, []);

  const stopPendingGift = async (giftId) => {
    console.log("Received gift ID:", giftId);
    if (!giftId || isNaN(giftId)) {
      alert("Invalid gift ID. Please try again.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/stop-pending-gift?id=${giftId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to stop gift: ${errorText}`);
      }
      alert("Pending gift has been stopped successfully!");
      setGifts((prevGifts) => prevGifts.filter((gift) => gift.id !== giftId));
    } catch (error) {
      console.error("Error stopping pending gift:", error);
      alert("Error stopping gift. Please try again.");
    }
  };

  // Navigation handlers
  const handleNewMemoryClick = () => router.push("/new-memory");
  const handleUserProfileClick = () => router.push("/personal-details");

  // Helpers
  const isImageFile = (fileName) => /\.(jpg|jpeg|png|gif)$/i.test(fileName);
  const getGiftColor = (id) => {
    const colors = [
      "#ff4970",
      "#4a98ff",
      "#7c59ff",
      "#ff8a2a",
      "#50c878",
      "#d543a9",
    ];
    return colors[id % colors.length];
  };

  const handleOpenGift = (gift) => {
    console.log("handleOpenGift called for gift ID:", gift.id);
    setOpeningGiftId(gift.id);
  };

  // Split gifts into pending and normal
  const pendingGifts = gifts.filter((gift) => gift.pending);
  const normalGifts = gifts.filter((gift) => !gift.pending);

  return (
    <div className="min-h-screen bg-primary-foreground">
      {/* Header */}
      <UserHeader/>

      {/* Notifications */}
      <div className="flex justify-end pr-8 mt-2">
        <MessageNotification username={username} />
      </div>
      {/* Main Content */}
      <main className="p-8 pt-20 space-y-8">
        {isLoading ? (
          <div className="p-6 bg-white rounded-lg shadow-md flex justify-center">
            <p className="text-lg">Loading your gifts...</p>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-xl font-bold text-black">Hello {username || "[user]"}!</h1>
              <p className="text-red-500">You have {pendingMessages} unsent messages</p>
              <p className="mt-2 text-black">Total messages created: {giftCount}</p>
              <p className="mt-2 text-black">Pending messages to schedule: {pendingMessages}</p>
              <p className="mt-2 text-primary hover:underline cursor-pointer">View Calendar</p>
              <Button className="mt-3" type="button" onClick={handleNewMemoryClick}>
                New Memory
              </Button>
            </div>
            {/* Previous Memories */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-black">Previous Memories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {/* Memory thumbnails */}
              </div>
            </div>
            {/* Pending Gifts */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-black">Pending Gifts</h2>
              {pendingGifts.length === 0 ? (
                <p className="text-gray-500">No pending gifts.</p>
              ) : (
                <ul className="space-y-4">
                  {pendingGifts.map((gift) => (
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
            {/* Your Gifts */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-black">Your Gifts</h2>
              {normalGifts.length === 0 ? (
                <p className="text-gray-500">No gifts found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {normalGifts.map((gift) => (
                    <div key={`gift-wrapper-${gift.id}`} className="p-4 bg-white rounded-lg shadow-md flex flex-col items-center">
                      {/* 3D Gift Box - Using a stable key */}
                      <div className="mb-3 h-64 w-full flex items-center justify-center">
                        <SimpleGiftBox
                          giftId={gift.id}
                          color={getGiftColor(gift.id)}
                          size={230}
                          isOpening={openingGiftId === gift.id}
                          onOpenComplete={() => {
                            console.log("Gift unwrapped:", gift.id);
                            setOpeningGiftId(null);
                            setSelectedGift(gift);
                          }}
                          giftContent={
                            gift.file_name && isImageFile(gift.file_name) ? (
                              <img
                                src={`http://localhost:8080/download-gift?id=${gift.id}`}
                                alt={gift.file_name}
                                className="max-h-48 max-w-48 object-contain animate-pop"
                              />
                            ) : (
                              <div className="p-3 rounded shadow-lg animate-pop max-w-[200px]">
                                {gift.file_name ? (
                                  <p className="text-sm font-bold">{gift.file_name}</p>
                                ) : (
                                  <p className="text-sm font-bold">
                                    {gift.custom_message || "Gift"}
                                  </p>
                                )}
                              </div>
                            )
                          }
                        />
                      </div>
                      <div className="text-center">
                        {gift.file_name && gift.file_name.trim() !== "" ? (
                          <p className="text-sm font-bold text-black">{gift.file_name}</p>
                        ) : (
                          <p className="text-sm font-bold text-black">
                            {gift.custom_message ? "Message Gift" : "No message provided."}
                          </p>
                        )}
                        <button
                          className="mt-3 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transform transition-transform hover:scale-105 shadow-md"
                          onClick={() => handleOpenGift(gift)}
                          disabled={openingGiftId === gift.id}
                        >
                          {openingGiftId === gift.id ? "Unwrapping..." : "Unwrap Gift"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Receiver Emails */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4 text-black">Receiver Emails</h2>
              {receiverEmails && receiverEmails.length > 0 ? (
                <ul className="list-disc pl-5">
                  {receiverEmails.map((email, index) => (
                    <li key={index} className="text-black">{email}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No receiver emails found.</p>
              )}
            </div>
          </>
        )}
      </main>
      {selectedGift && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Gift Details</h2>
            {selectedGift.file_name && selectedGift.file_name.trim() !== "" ? (
              <>
                <p className="text-sm font-bold text-black">File: {selectedGift.file_name}</p>
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