// ChatIcon.jsx
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";

const ChatIcon = ({ username }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [recipient, setRecipient] = useState("");
    const [users, setUsers] = useState([]);
    const chatMenuRef = useRef(null);

    useEffect(() => {
        // Get messages when chat is opened
        if (isOpen && username) {
            fetchMessages();
            fetchUsers();
        }

        // Click outside to close
        function handleClickOutside(event) {
            if (chatMenuRef.current && !chatMenuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, username]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:8080/get-messages?username=${username}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessages([]);
        }
    };

    const fetchUsers = async () => {
        // For demo purposes, just use dummy data
        // In a real app, you would fetch this from an API
        setUsers(["user1", "user2", "user3"]);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !recipient.trim()) return;

        try {
            const response = await fetch("http://localhost:8080/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender: username,
                    receiver: recipient,
                    content: newMessage,
                }),
            });

            if (response.ok) {
                setNewMessage("");
                fetchMessages(); // Refresh messages
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="relative">
            <button
                className="text-gray-700 hover:bg-gray-200 p-2 rounded-full flex items-center justify-center"
                onClick={() => setIsOpen(!isOpen)}
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
                        <h3 className="font-medium">Messages</h3>
                    </div>

                    {/* Message list */}
                    <div className="max-h-60 overflow-y-auto p-2">
                        {messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <div key={index} className="p-2 mb-2 bg-gray-100 rounded">
                                    <div className="font-semibold text-sm">{msg.from}</div>
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
                            <select
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="w-full p-2 border rounded mb-2 text-sm"
                            >
                                <option value="">Select recipient...</option>
                                {users.map((user) => (
                                    <option key={user} value={user}>
                                        {user}
                                    </option>
                                ))}
                            </select>

                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Write a message..."
                                className="w-full p-2 border rounded text-sm resize-none"
                                rows="2"
                            ></textarea>
                        </div>

                        <button
                            onClick={handleSendMessage}
                            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                            Send Message
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatIcon;