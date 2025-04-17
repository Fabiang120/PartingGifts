// ChatIcon.jsx - With additional debugging
import React, { useState, useEffect, useRef } from "react";

const ChatIcon = ({ username }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [recipient, setRecipient] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatMenuRef = useRef(null);

    console.log("ChatIcon rendering with username:", username);

    useEffect(() => {
        // Click outside to close
        function handleClickOutside(event) {
            if (chatMenuRef.current && !chatMenuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load data when chat is opened
    useEffect(() => {
        if (isOpen && username) {
            setLoading(true);
            setError(null);
            console.log("Chat menu opened, fetching data for user:", username);

            Promise.all([
                fetchMessages(),
                fetchEligibleUsers()
            ])
                .catch(err => {
                    console.error("Error in chat data fetching:", err);
                    setError("Failed to load chat data");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, username]);

    const fetchMessages = async () => {
        try {
            console.log(`Fetching messages for ${username}...`);
            const url = `http://localhost:8080/get-messages?username=${encodeURIComponent(username)}`;
            console.log("Request URL:", url);

            const response = await fetch(url);
            console.log("Message response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch messages: ${response.status}, ${errorText}`);
            }

            const data = await response.json();
            console.log("Messages loaded:", data);
            setMessages(data || []);
            return data;
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessages([]);
            return [];
        }
    };

    const fetchEligibleUsers = async () => {
        try {
            console.log(`Fetching eligible messaging users for ${username}...`);
            const url = `http://localhost:8080/users/eligible-messaging?username=${encodeURIComponent(username)}`;
            console.log("Request URL:", url);

            const response = await fetch(url);
            console.log("Eligible users response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch eligible users: ${response.status}, ${errorText}`);
            }

            const data = await response.json();
            console.log("Eligible users loaded:", data);
            setUsers(data || []);
            return data;
        } catch (error) {
            console.error("Error fetching eligible messaging users:", error);
            setUsers([]);
            return [];
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !recipient.trim()) {
            console.log("Cannot send: empty message or recipient");
            return;
        }

        try {
            console.log(`Sending message from ${username} to ${recipient}: ${newMessage}`);
            const response = await fetch("http://localhost:8080/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender: username,
                    receiver: recipient,
                    content: newMessage,
                }),
            });

            const responseText = await response.text();
            console.log("Response:", response.status, responseText);

            if (response.ok) {
                console.log("Message sent successfully");
                setNewMessage("");
                await fetchMessages(); // Refresh messages
            } else {
                let errorMessage = "Failed to send message";
                try {
                    // Try to parse as JSON if possible
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // If not JSON, use text as is
                    if (responseText) errorMessage = responseText;
                }
                console.error("Server rejected message:", errorMessage);
                alert(errorMessage);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Network error.");
        }
    };

    return (
        <div className="relative">
            <button
                className="text-gray-700 hover:bg-gray-200 p-2 rounded-full flex items-center justify-center"
                onClick={() => {
                    console.log("Chat icon clicked, current state:", !isOpen);
                    setIsOpen(!isOpen);
                }}
                title="Messages"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>

            {isOpen && (
                <div
                    ref={chatMenuRef}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                >
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <h3 className="font-medium">Messages for {username}</h3>
                    </div>

                    {/* Message list */}
                    <div className="max-h-60 overflow-y-auto p-2">
                        {loading ? (
                            <div className="text-center py-4 text-gray-500">
                                Loading messages...
                            </div>
                        ) : error ? (
                            <div className="text-center py-4 text-red-500">
                                {error}
                            </div>
                        ) : messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`p-2 mb-2 rounded ${msg.type === "sent"
                                            ? "bg-blue-100 ml-8"
                                            : "bg-gray-100 mr-8"
                                        }`}
                                >
                                    <div className="font-semibold text-sm">
                                        {msg.type === "sent" ? `To: ${msg.from}` : `From: ${msg.from}`}
                                    </div>
                                    <div className="text-sm">{msg.content}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 p-4">No messages</div>
                        )}
                    </div>

                    {/* Compose new message */}
                    <div className="border-t p-3">
                        <div className="mb-2">
                            {loading ? (
                                <div className="text-center text-gray-500 p-2 mb-2 bg-gray-100 rounded">
                                    Loading contacts...
                                </div>
                            ) : users.length > 0 ? (
                                <select
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className="w-full p-2 border rounded mb-2 text-sm"
                                >
                                    <option value="">Select recipient...</option>
                                    {users.map((user) => (
                                        <option key={user.username} value={user.username}>
                                            {user.username}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="text-center text-gray-500 p-2 mb-2 bg-gray-100 rounded">
                                    You can only message users who follow you and you follow them
                                </div>
                            )}

                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Write a message..."
                                className="w-full p-2 border rounded text-sm resize-none"
                                rows="2"
                                disabled={users.length === 0 || loading}
                            ></textarea>
                        </div>

                        <button
                            onClick={handleSendMessage}
                            className={`w-full py-2 ${users.length > 0 && !loading
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : "bg-gray-300 cursor-not-allowed"
                                } text-white rounded text-sm`}
                            disabled={users.length === 0 || loading}
                        >
                            {loading ? "Loading..." : "Send Message"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatIcon;