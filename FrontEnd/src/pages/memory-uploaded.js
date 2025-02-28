import React, { useState } from "react";

const MemoryUploaded = () => {
  const [progress, setProgress] = useState(100); // Simulate progress completion
  const [receiverInfo, setReceiverInfo] = useState({
    name: "",
    email: "",
    phone: "",
    comments: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReceiverInfo({ ...receiverInfo, [name]: value });
  };

  const handleSave = async () => {
    // Replace this giftId with a real value if available.
    const giftId = 1;

    // Construct payload based on backend expectations.
    const payload = {
      giftId: giftId,
      receivers: receiverInfo.email, // For multiple receivers, use a comma-separated string.
      customMessage: receiverInfo.comments,
    };

    try {
      const response = await fetch("http://localhost:8080/setup-receivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Memory saved and email sent successfully!");
      } else {
        const errorText = await response.text();
        alert("Memory saved but failed to send email: " + errorText);
      }
    } catch (error) {
      console.error("Error saving memory:", error);
      alert("Error occurred while saving memory: " + error.message);
    }
  };

  const handleDelete = () => {
    console.log("Memory deleted.");
    alert("Memory deleted.");
  };

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center">
      {/* Header Section */}
      <header className="flex items-center justify-between w-full px-8 py-4 bg-white shadow-md">
        <img
          src="https://i.postimg.cc/VsRBMLgn/pglogo.png"
          alt="Parting Gifts Logo"
          className="w-36"
        />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full max-w-5xl p-8 bg-white rounded-lg shadow-md mt-8 space-y-8">
        {/* Progress Bar Section */}
        <div className="w-full">
          <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
            <p>Memory uploaded</p>
            <p>{progress}%</p>
          </div>
          <div className="w-full h-4 bg-gray-300 rounded-full">
            <div
              className="h-4 bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Receiver Information Form */}
        <div className="w-full bg-blue-50 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4 text-gray-700">
            Receiver Information
          </h2>
          <div className="space-y-4">
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
          </div>
        </div>

        {/* Save and Delete Buttons */}
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
