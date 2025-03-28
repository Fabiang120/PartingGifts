import React, { useState } from "react";
import { useRouter } from "next/router";

const MemoryUploaded = () => {
  const [receiverInfo, setReceiverInfo] = useState({
    name: "",
    email: "",
    phone: "",
    comments: "",
  });
  const [scheduledTime, setScheduledTime] = useState("");
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReceiverInfo({ ...receiverInfo, [name]: value });
  };

  const handleSave = async () => {
    // Get the username and current gift ID from sessionStorage
    const username = sessionStorage.getItem("username");
    const giftId = sessionStorage.getItem("currentGiftId");

    if (!username || !giftId) {
      alert("Session data missing. Please start over.");
      return;
    }

    // Build payload for the inactivity check
    const inactivityPayload = {
      username,
      customMessage: receiverInfo.comments,
    };

    // Build payload for receivers setup (including scheduledTime)
    const setupPayload = {
      giftId: parseInt(giftId, 10),
      receivers: receiverInfo.email, // assuming one or comma‐separated emails
      customMessage: receiverInfo.comments,
      scheduledTime, // if empty, your backend should handle sending immediately
    };

    try {
      // First, call the inactivity check handler
      if (!scheduledTime) {
        const inactivityResponse = await fetch("http://localhost:8080/schedule-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inactivityPayload),
        });

        if (!inactivityResponse.ok) {
          const errText = await inactivityResponse.text();
          throw new Error(`Inactivity check failed: ${errText}`);
        }
        console.log("Inactivity check scheduled successfully.");
      }
      // Then, call the setup receivers handler
      const setupResponse = await fetch("http://localhost:8080/setup-receivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setupPayload),
      });

      if (!setupResponse.ok) {
        const errText = await setupResponse.text();
        throw new Error(`Setup receivers failed: ${errText}`);
      }

      alert("Receivers set up successfully. Gift scheduled.");
      // Clear the gift ID from sessionStorage after a successful setup.
      sessionStorage.removeItem("currentGiftId");
      router.push("/dashboard");
    } catch (error) {
      console.error("Setup error:", error);
      alert("Error: " + error.message);
    }
  };

  const handleDelete = () => {
    alert("Memory deleted.");
  };

  return (
    <div className="min-h-screen text-black bg-blue-100 flex flex-col items-center">
      {/* Header Section */}
      <header className="flex items-center justify-between w-full px-8 py-4 bg-white shadow-md">
        <img
          src="https://i.postimg.cc/VsRBMLgn/pglogo.png"
          alt="Parting Gifts Logo"
          className="w-36"
          onClick={() => router.push("/dashboard")}
        />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full max-w-5xl p-8 bg-white rounded-lg shadow-md mt-8 space-y-8">
        <h2 className="text-lg font-bold mb-4 text-gray-700">Receiver Information</h2>
        <div className="space-y-4 w-full">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={receiverInfo.name}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={receiverInfo.email}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={receiverInfo.phone}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="comments" className="text-sm font-medium text-gray-700">
              Any Comments
            </label>
            <textarea
              id="comments"
              name="comments"
              value={receiverInfo.comments}
              onChange={handleInputChange}
              rows="4"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {/* Optional Scheduled Time input */}
          <div className="flex flex-col">
            <label htmlFor="scheduleTime" className="text-sm font-medium text-gray-700">
              Scheduled Time (Optional)
            </label>
            <input
              type="datetime-local"
              id="scheduleTime"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
          >
            Delete Memory
          </button>
        </div>
      </main>
    </div>
  );
};

export default MemoryUploaded;
