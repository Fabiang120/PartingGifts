import React, { useEffect, useState } from "react";

export default function MessageNotification({ username }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchNotificationData = async () => {
      try {
        const [notifRes, msgRes] = await Promise.all([
          fetch(`http://localhost:8080/notifications?username=${encodeURIComponent(username)}`),
          fetch(`http://localhost:8080/get-messages?username=${encodeURIComponent(username)}`)
        ]);

        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setUnreadCount(notifData.unreadMessages || 0);
        }

        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setMessages(msgData || []);
        }
      } catch (err) {
        console.error("Notification fetch error:", err);
      }
    };

    fetchNotificationData();
    const interval = setInterval(fetchNotificationData, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [username]);

  return (
    <div className="relative inline-block text-left z-50">
      <button
        className="text-2xl relative hover:scale-105 transition-transform"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Notifications"
      >
        <span role="img" aria-label="bell">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="px-4 py-2 text-sm text-gray-500">No messages</p>
            ) : (
              messages.slice(0, 5).map((msg, idx) => (
                <div key={idx} className="px-4 py-2 border-b">
                  <p className="text-sm font-semibold text-black">{msg.from}</p>
                  <p className="text-sm text-gray-700">{msg.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

