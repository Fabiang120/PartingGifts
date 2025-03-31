import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { UserHeader } from "@/components/user-header";

const NewMemory = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = sessionStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  const handleFileChange = (file) => {
    if (file) {
      setSelectedFile(file);
      setMessage(`File selected: ${file.name}`);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      handleFileChange(event.dataTransfer.files[0]);
    }
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
    formData.append("emailMessage", customMessage);
    // Removed scheduledTime field so it's only set later in memory-uploaded.

    try {
      const response = await fetch("http://localhost:8080/upload-gift", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const responseData = await response.json();
      setMessage(responseData.message);

      sessionStorage.setItem("currentGiftId", responseData.giftId);

      router.push("/memory-uploaded");
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.message || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center">
      <UserHeader/>

      <main className="flex flex-col items-center w-full p-8 pt-20">
        <div className="w-full max-w-3xl flex flex-col items-center p-8 bg-white rounded-lg shadow-md mt-8">
        <h1 className="text-xl font-bold text-black">Create a new memory!</h1>
        <p className="text-sm text-gray-600 mb-8">
          Record or upload a memory that will last forever.
        </p>

        <div className="w-full px-6 flex flex-row space-x-4 items-center">
          <div
            className="flex flex-col items-center border-2 border-red-600 rounded-lg p-2 w-full bg-gray-50 cursor-pointer"
            onClick={() => router.push('/write-memory')}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/128/1170/1170221.png"
              alt="Write Icon"
              className="w-8"
            />
            <label
              htmlFor="record"
              className="text-red-800 text-center underline cursor-pointer"
            >
              Write a Message
            </label>
          </div>

          <p className="text-black">Or</p>

          <div
            className="flex flex-col items-center border-2 border-green-600 rounded-lg p-2 w-full bg-gray-50 cursor-pointer"
            onClick={() => router.push('/record-memory')}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/128/711/711245.png"
              alt="Record Icon"
              className="w-8"
            />
            <label
              htmlFor="record"
              className="text-green-800 text-center underline cursor-pointer"
            >
              Record a Video
            </label>
          </div>

          <p className="text-black">Or</p>

          <div
            className="flex flex-col items-center border-2 border-dashed border-gray-400 rounded-lg p-6 w-full bg-gray-50 cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="text-blue-500 underline cursor-pointer text-center"
            >
              Upload a File
            </label>
          </div>
        </div>

        <div className="mt-4 w-full px-6">
          <label htmlFor="emailMessage" className="text-sm text-gray-700">
            Custom Email Message (optional)
          </label>
          <textarea
            id="emailMessage"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows="3"
            className="w-full text-black p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter a custom message for the email (optional)"
          />
        </div>

        {message && (
          <p className="mt-4 text-sm text-green-600">{message}</p>
        )}
        <button
          onClick={handleUpload}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Upload Memory
        </button>
        </div>
      </main>
    </div>
  );
};

export default NewMemory;
