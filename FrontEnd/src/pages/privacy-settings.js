import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function PrivacySettings() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [accessRequests, setAccessRequests] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      console.log("Mocking API response...");
      setIsPrivate(false);
      setAccessRequests(["user1@example.com", "user2@example.com"]);
      setApprovedUsers(["friend@example.com"]);
      setLoading(false);
    }, 1000);
  }, []);

  const togglePrivacy = () => {
    setIsPrivate(!isPrivate);
    console.log("Mock: Privacy setting changed to", !isPrivate);
  };

  const handleRequest = (username, isApproved) => {
    setAccessRequests(accessRequests.filter((user) => user !== username));
    if (isApproved) setApprovedUsers([...approvedUsers, username]);
    console.log(`Mock: ${username} ${isApproved ? "approved" : "denied"}`);
  };

  if (loading) return <p className="text-center mt-10 text-black">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-3xl font-bold mb-6">Privacy Settings</h1>

      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md w-96 border border-gray-300">
        <span className="text-lg font-medium">Make Profile Private</span>
        <button
          className={`px-4 py-2 rounded ${isPrivate ? "bg-red-500" : "bg-green-500"} text-white font-medium`}
          onClick={togglePrivacy}
        >
          {isPrivate ? "Private" : "Public"}
        </button>
      </div>

      {isPrivate && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md w-96 border border-gray-300">
          <h2 className="text-xl font-semibold mb-2">Pending Access Requests</h2>
          {accessRequests.length === 0 ? (
            <p className="text-gray-600">No access requests.</p>
          ) : (
            accessRequests.map((username, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-100 p-2 mb-2 rounded">
                <span>{username}</span>
                <div>
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                    onClick={() => handleRequest(username, true)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleRequest(username, false)}
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isPrivate && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md w-96 border border-gray-300">
          <h2 className="text-xl font-semibold mb-2">Approved Users</h2>
          {approvedUsers.length === 0 ? (
            <p className="text-gray-600">No approved users yet.</p>
          ) : (
            approvedUsers.map((username, index) => (
              <p key={index} className="bg-green-100 p-2 mb-1 rounded text-black">{username}</p>
            ))
          )}
        </div>
      )}

      <button
        onClick={() => router.push("/personal-details")}
        className="mt-6 bg-gray-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800"
      >
        Back to Personal Details
      </button>
    </div>
  );
}
