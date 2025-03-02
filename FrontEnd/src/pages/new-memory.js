import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const NewMemory = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  // Retrieve the username from sessionStorage on mount.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = sessionStorage.getItem("username");
      if (storedUsername) {
        console.log("Retrieved username from sessionStorage:", storedUsername);
        setUsername(storedUsername);
      } else {
        console.log("No username in sessionStorage");
      }
    }
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setMessage(`File selected: ${file.name}`);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("No file selected for upload.");
      return;
    }
    if (!username) {
      alert("Username is not defined. Please log in again.");
      return;
    }
    const formData = new FormData();
    formData.append("username", username);
    formData.append("file", selectedFile);
    // Append the custom message for the email.
    formData.append("emailMessage", customMessage);

    try {
      const response = await fetch("http://localhost:8080/upload-gift", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const textResponse = await response.text();
      setMessage(textResponse);
      router.push("/memory-uploaded");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center">
      {/* Header Section */}
      <header className="flex items-center justify-between w-full px-8 py-4 bg-white shadow-md">
        <img
          src="https://i.postimg.cc/VsRBMLgn/pglogo.png"
          alt="Parting Gifts Logo"
          className="w-36"
        />
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full max-w-5xl p-8 bg-white rounded-lg shadow-md mt-8">
        <h1 className="text-xl font-bold text-black">Create a new memory!</h1>
        <p className="text-sm text-gray-600 mb-8">
          Record or upload a memory that will last forever.
        </p>

        {/* File Upload Section */}
        <div
          className="flex flex-col items-center border-2 border-dashed border-gray-400 rounded-lg p-6 w-full md:w-1/2 bg-gray-50 cursor-pointer"
        >
          <input type="file" onChange={handleFileChange} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="text-blue-500 underline cursor-pointer">
            Select a file
          </label>
        </div>

        {/* Custom Message Input */}
        <div className="mt-4 w-full md:w-1/2">
          <label htmlFor="emailMessage" className="text-sm text-gray-700">
            Custom Email Message (optional)
          </label>
          <textarea
            id="emailMessage"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter a custom message for the email (optional)"
          />
        </div>

        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        <button
          onClick={handleUpload}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Upload Memory
        </button>
      </main>
    </div>
  );
};

export default NewMemory;
