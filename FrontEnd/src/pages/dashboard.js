import React from "react";
import { useRouter } from "next/router"; // Import useRouter for navigation

const Dashboard = () => {
  const memoryThumbnails = ["hp1.jpg", "hp2.jpg", "hp3.jpg", "hp4.png", "hp5.jpg"];
  const router = useRouter(); // Initialize useRouter

  const handleNewMemoryClick = () => {
    router.push("/new-memory"); // Navigate to the New Memory page
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
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            User Profile
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-8">
        {/* Welcome Section */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-black">Hello [user]!</h1>
          <p className="text-red-500">You have n unsent messages</p>
          <p className="mt-2 text-black">Total messages created: n</p>
          <p className="text-black">Pending messages to schedule: n</p>
          <p className="mt-2 text-blue-500 hover:underline cursor-pointer">
            View Calendar
          </p>
          <button
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleNewMemoryClick} // Add onClick handler for navigation
          >
            New Memory
          </button>
        </div>

        {/* Previous Memories Section */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-black">Previous Memories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {memoryThumbnails.map((image, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg shadow-md flex flex-col items-center text-center"
              >
                <img
                  src={`/${image}`}
                  alt={`Memory Thumbnail ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <p className="text-sm font-bold text-black">Memory name</p>
                <p className="text-sm text-black">Date: </p>
                <p className="text-sm text-black">For: </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
