import React, { useState } from "react";
import { useRouter } from "next/router"; // Import useRouter for navigation

const NewMemory = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const router = useRouter(); // Initialize useRouter

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setMessage(`File selected: ${file.name}`);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
    setMessage(`File selected: ${file.name}`);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Simulate a backend upload (replace with API call)
      console.log("Uploading file:", selectedFile);
      alert(`Uploaded file: ${selectedFile.name}`);
      setSelectedFile(null);
      setMessage("");
      router.push("/memory-uploaded"); // Navigate to Memory Uploaded page
    } else {
      alert("No file selected for upload.");
    }
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
      <main className="flex flex-col items-center w-full max-w-5xl p-8 bg-white rounded-lg shadow-md mt-8">
        <h1 className="text-xl font-bold text-black">Create a new memory!</h1>
        <p className="text-sm text-gray-600 mb-8">
          Record or upload a memory that will last forever
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center w-full space-y-6 md:space-y-0 md:space-x-8">
          {/* Drag-and-Drop Upload Section */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex flex-col items-center border-2 border-dashed border-gray-400 rounded-lg p-6 w-full md:w-1/2 bg-gray-50 cursor-pointer"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/61/61112.png"
              alt="Upload Icon"
              className="w-8 mb-4"
            />
            <p className="text-gray-600 text-sm mb-2">Drag a file or upload</p>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="text-blue-500 underline cursor-pointer"
            >
              Select a file
            </label>
          </div>

          {/* Divider with "or" */}
          <div className="flex flex-col items-center">
            <p className="text-gray-500 text-sm mb-2">or</p>
            <hr className="border-gray-400 w-12" />
          </div>

          {/* Create Now Section */}
          <div className="flex flex-col items-center space-y-4">
            <button className="flex flex-col items-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3845/3845853.png"
                alt="Microphone Icon"
                className="w-8"
              />
              <p className="text-sm text-gray-600 mt-2">Record</p>
            </button>
            <button className="flex flex-col items-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2920/2920676.png"
                alt="Camera Icon"
                className="w-8"
              />
              <p className="text-sm text-gray-600 mt-2">Photo</p>
            </button>
            <button className="flex flex-col items-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/992/992651.png"
                alt="Notes Icon"
                className="w-8"
              />
              <p className="text-sm text-gray-600 mt-2">Write</p>
            </button>
          </div>
        </div>

        {/* Feedback and Upload Button */}
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
