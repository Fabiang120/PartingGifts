// Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import SimpleGiftBox from "./SimpleGiftBox.jsx";
import { UserHeader } from "@/components/user-header.jsx";
import { Button } from "@/components/ui/button.jsx";
import MessageNotification from "../components/MessageNotification";
import { format, parseISO, addDays } from "date-fns";
import ChatIcon from "./ChatIcon.jsx";

// Calendar Component
const GiftCalendar = ({ username, onClose }) => {
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventsByDate, setEventsByDate] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!username) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/gift-calendar?username=${username}`);

        if (!response.ok) {
          throw new Error('Failed to fetch calendar data');
        }

        const data = await response.json();
        setCalendarData(data);

        // Group events by date for easier display
        const groupedEvents = {};

        data.forEach(event => {
          if (!event.releaseDate) return;

          // Parse the date from the server's format and add 4 hours for EST
          const eventDateUTC = new Date(event.releaseDate);

          // Add 4 hours to adjust from UTC to EST
          const eventDateEST = new Date(eventDateUTC);
          eventDateEST.setHours(eventDateEST.getHours() + 4);

          // Store the adjusted date in the event
          event.adjustedReleaseDate = eventDateEST;

          // Format the date in YYYY-MM-DD format for grouping
          const dateStr = eventDateEST.toISOString().split('T')[0];

          console.log(`Processing event: ${event.title || event.file_name}, Original UTC: ${eventDateUTC.toISOString()}, Adjusted EST: ${eventDateEST.toISOString()}`);

          if (!groupedEvents[dateStr]) {
            groupedEvents[dateStr] = [];
          }
          groupedEvents[dateStr].push(event);
        });

        setEventsByDate(groupedEvents);
        console.log("Grouped events by date:", groupedEvents);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching calendar data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [username]);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Generate the calendar for the current month
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and how many days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<td key={`empty-${i}`} className="p-2 border"></td>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create the date string in the same format as our event keys
      const dateObj = new Date(year, month, day);
      const dateStr = dateObj.toISOString().split('T')[0];

      const hasEvents = eventsByDate[dateStr] && eventsByDate[dateStr].length > 0;

      // Check if this day is today
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;

      days.push(
        <td
          key={day}
          className={`p-2 border ${hasEvents ? 'bg-blue-50 cursor-pointer' : ''} 
                     ${selectedDate === dateStr ? 'bg-blue-200' : ''} 
                     ${isToday ? 'border-2 border-red-400' : ''}`}
                     onClick={() => {
                      setSelectedDate(dateStr); // Always allow selection
                      console.log(`Selected date: ${dateStr}`, eventsByDate[dateStr] || []);
                    }}
                    
        >
          <div className="text-center">
            <span className={`font-medium ${isToday ? 'text-red-600' : ''}`}>{day}</span>
            {hasEvents && (
              <div className="h-2 w-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
            )}
          </div>
        </td>
      );
    }

    // Group days into weeks (rows)
    const rows = [];
    let cells = [];

    days.forEach((day, i) => {
      if (i > 0 && i % 7 === 0) {
        rows.push(<tr key={i}>{cells}</tr>);
        cells = [];
      }
      cells.push(day);
    });

    if (cells.length > 0) {
      // Add empty cells to complete the last week if needed
      while (cells.length < 7) {
        cells.push(<td key={`end-empty-${cells.length}`} className="p-2 border"></td>);
      }
      rows.push(<tr key="last-row">{cells}</tr>);
    }

    return rows;
  };

  // Format a date string for display
  const formatDisplayDate = (dateStr) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const displayDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return format(displayDate, 'MMMM d, yyyy');
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateStr;
    }
  };

  // Format time for display in EST
  const formatTimeEST = (dateTimeStr) => {
    try {
      // Create a new date object from the string and adjust it for EST (+4 hours from UTC)
      const dateTime = new Date(dateTimeStr);
      const estDateTime = new Date(dateTime);
      estDateTime.setHours(estDateTime.getHours() + 4);

      return format(estDateTime, 'h:mm a');
    } catch (err) {
      console.error("Error formatting time:", err, dateTimeStr);
      return "Time not available";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Gift Release Calendar</h2>
          <button
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading calendar data...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <button onClick={prevMonth} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">
                  &lt; Prev
                </button>
                <div className="font-bold text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </div>
                <button onClick={nextMonth} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">
                  Next &gt;
                </button>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2">Sun</th>
                    <th className="p-2">Mon</th>
                    <th className="p-2">Tue</th>
                    <th className="p-2">Wed</th>
                    <th className="p-2">Thu</th>
                    <th className="p-2">Fri</th>
                    <th className="p-2">Sat</th>
                  </tr>
                </thead>
                <tbody>
                  {generateCalendar()}
                </tbody>
              </table>

              <div className="mt-2 text-xs text-gray-500">
                * Blue dots indicate dates with scheduled gifts
              </div>
              <div className="mt-1 text-xs text-gray-500">
                * Today's date is shown with a red border
              </div>
              
            </div>

            <div>
              {selectedDate ? (
                <>
                  <h3 className="font-semibold mb-2">
                    Events on {formatDisplayDate(selectedDate)}
                  </h3>
                  <ul className="space-y-4">
                    {eventsByDate[selectedDate]?.map(event => (
                      <li
                        key={event.id}
                        className={`p-3 rounded-lg border ${event.isPending ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'
                          }`}
                      >
                        <div className="font-medium">{event.title || event.file_name || "Unnamed Gift"}</div>
                        {event.releaseDate && (
                          <div className="text-sm text-gray-600">
                            Release: {formatTimeEST(event.releaseDate)} EST
                          </div>
                        )}
                        {event.message && (
                          <div className="mt-2 text-sm">{event.message}</div>
                        )}
                        {event.receivers && (
                          <div className="mt-1 text-xs text-gray-500">
                            To: {event.receivers}
                          </div>
                        )}
                        <div className="mt-1 text-xs">
                          Status: {event.isPending ? 'Pending' : 'Released'}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="text-center pt-8 text-gray-500">
                  Select a date with events to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [receiverEmails, setReceiverEmails] = useState([]);
  const [giftCount, setGiftCount] = useState(0);
  const [gifts, setGifts] = useState([]); // Always an array
  const [selectedGift, setSelectedGift] = useState(null);
  const [pendingMessages, setPendingMessages] = useState(0);
  const [openingGiftId, setOpeningGiftId] = useState(null); // Track which gift is being opened
  const [showCalendar, setShowCalendar] = useState(false); // Add state for calendar visibility
  const dataFetchedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // Effect to clear localStorage when component mounts (to reset gift states)
  useEffect(() => {
    // Clear the unwrapped gift state on page load
    localStorage.removeItem('unwrappedGifts');

    return () => {
      // Also clear when leaving the page
      localStorage.removeItem('unwrappedGifts');
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (dataFetchedRef.current) return;
      dataFetchedRef.current = true;

      if (typeof window === "undefined") return;

      const storedUsername = sessionStorage.getItem("username");
      console.log("Retrieved username:", storedUsername);

      if (!storedUsername) {
        setIsLoading(false);
        return;
      }
      setUsername(storedUsername);

      try {
        setIsLoading(true);
        // Fetch everything in parallel
        const [
          giftCountResponse,
          giftsResponse,
          receiversResponse,
          pendingResponse,
        ] = await Promise.all([
          fetch(`http://localhost:8080/gift-count?username=${storedUsername}`),
          fetch(`http://localhost:8080/gifts?username=${storedUsername}`),
          fetch(`http://localhost:8080/get-receivers?username=${storedUsername}`),
          fetch(`http://localhost:8080/dashboard/pending-gifts?username=${storedUsername}`),
        ]);

        // Process gift count
        const giftCountData = await giftCountResponse.json();
        console.log("Gift count data:", giftCountData);
        setGiftCount(giftCountData.count || 0);

        // Process gifts - always start with unwrapped: false
        const giftsData = await giftsResponse.json();
        console.log("Gifts data:", giftsData);
        setGifts((giftsData || []).map((g) => ({
          ...g,
          unwrapped: false // Always start as unwrapped: false
        })));

        // Process receiver emails
        const receiversData = await receiversResponse.json();
        if (!receiversData) {
          console.error("No data received from get-receivers");
          setReceiverEmails([]);
        } else if (receiversData.error) {
          console.error("Error from get-receivers:", receiversData.error);
          setReceiverEmails([]);
        } else {
          console.log("Receiver emails:", receiversData);
          setReceiverEmails(receiversData || []);
        }

        // Process pending messages
        const pendingData = await pendingResponse.json();
        console.log("Pending messages data:", pendingData);
        setPendingMessages(pendingData.pending_messages || 0);

        // NEW: Fetch followers and following data
        await fetchFollowers(storedUsername);
        await fetchFollowing(storedUsername);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }

      // Fallback for receiver emails
      const storedEmails = sessionStorage.getItem("receiverEmails");
      if (storedEmails) {
        try {
          const parsedEmails = JSON.parse(storedEmails);
          setReceiverEmails(parsedEmails);
        } catch (error) {
          const emails = storedEmails.split(",");
          setReceiverEmails(emails.map((email) => email.trim()));
        }
      }
    };

    fetchData();
  }, []);

  const fetchFollowers = async (user) => {
    try {
      const response = await fetch(`http://localhost:8080/friends/followers?username=${user}`);
      const data = await response.json();
      setFollowers(Array.isArray(data) ? data : []);
      console.log("Followers loaded:", data);
    } catch (error) {
      console.error('Error fetching followers:', error);
      setFollowers([]);
    }
  };

  const fetchFollowing = async (user) => {
    try {
      const response = await fetch(`http://localhost:8080/friends/following?username=${user}`);
      const data = await response.json();
      setFollowing(Array.isArray(data) ? data : []);
      console.log("Following loaded:", data);
    } catch (error) {
      console.error('Error fetching following:', error);
      setFollowing([]);
    }
  };

  const stopPendingGift = async (giftId) => {
    console.log("Received gift ID:", giftId);
    if (!giftId || isNaN(giftId)) {
      alert("Invalid gift ID. Please try again.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/stop-pending-gift?id=${giftId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to stop gift: ${errorText}`);
      }
      alert("Pending gift has been stopped successfully!");
      setGifts((prevGifts) => prevGifts.filter((gift) => gift.id !== giftId));
    } catch (error) {
      console.error("Error stopping pending gift:", error);
      alert("Error stopping gift. Please try again.");
    }
  };

  // Navigation handlers
  const handleNewMemoryClick = () => router.push("/new-memory");
  const handleUserProfileClick = () => router.push("/personal-details");

  // Helpers
  const isImageFile = (fileName) => /\.(jpg|jpeg|png|gif)$/i.test(fileName);
  const getGiftColor = (id) => {
    const colors = [
      "#ff4970",
      "#4a98ff",
      "#7c59ff",
      "#ff8a2a",
      "#50c878",
      "#d543a9",
    ];
    return colors[id % colors.length];
  };

  const handleOpenGift = (gift) => {
    console.log("handleOpenGift called for gift ID:", gift.id);
    setOpeningGiftId(gift.id);
  };

  // Split gifts into pending and normal
  const pendingGifts = gifts.filter((gift) => gift.pending);
  const normalGifts = gifts.filter((gift) => !gift.pending);

  return (
    <div className="min-h-screen bg-primary-foreground w-full">
      {/* Header */}
      <UserHeader />
      {/* Main Content */}
      <main className="p-8 pt-40 space-y-8 items-center w-full justify-center flex flex-grow">
      <div className="w-[1000px]">
        {isLoading ? (
          <div className="p-6 bg-white rounded-lg shadow-md flex justify-center">
            <p className="text-lg">Loading your gifts...</p>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-xl font-bold text-black">Hello {username || "[user]"}!</h1>
              <p className="text-red-500">You have {pendingMessages} unsent messages</p>
              <p className="mt-2 text-black">Total messages created: {giftCount}</p>
              <p className="mt-2 text-black">Pending messages to schedule: {pendingMessages}</p>
              <p
                className="mt-2 text-primary hover:underline cursor-pointer"
                onClick={() => setShowCalendar(true)} // Updated here to show calendar
              >
                View Calendar
              </p>
              <Button className="mt-3" type="button" onClick={handleNewMemoryClick}>
                New Memory
              </Button>
            </div>
            {/* Previous Memories */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-black">Previous Memories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {/* Memory thumbnails */}
              </div>
            </div>
            {/* Pending Gifts */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-black">Pending Gifts</h2>
              {pendingGifts.length === 0 ? (
                <p className="text-gray-500">No pending gifts.</p>
              ) : (
                <ul className="space-y-4">
                  {pendingGifts.map((gift) => (
                    <li key={gift.id} className="border p-4 rounded-lg flex flex-col bg-gray-50">
                      <p className="text-lg font-semibold text-black">
                        {gift.file_name || "Message Gift"}
                      </p>
                      <button
                        className="mt-2 px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        onClick={() => {
                          console.log("Stopping gift with ID:", gift.id);
                          stopPendingGift(gift.id);
                        }}
                      >
                        Stop Pending Gift
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Your Gifts */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-black">Your Gifts</h2>
              {normalGifts.length === 0 ? (
                <p className="text-gray-500">No gifts found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {normalGifts.map((gift) => (
                    <div key={`gift-wrapper-${gift.id}`} className="p-4 bg-white rounded-lg shadow-md flex flex-col items-center">
                      {/* 3D Gift Box - Using a stable key */}
                      <div className="mb-3 h-64 w-full flex items-center justify-center">
                        <SimpleGiftBox
                          giftId={gift.id}
                          color={getGiftColor(gift.id)}
                          size={230}
                          isOpening={openingGiftId === gift.id}
                          onOpenComplete={() => {
                            console.log("Gift unwrapped:", gift.id);
                            setOpeningGiftId(null);
                            setSelectedGift(gift);
                          }}
                          giftContent={
                            gift.file_name && isImageFile(gift.file_name) ? (
                              <img
                                src={`http://localhost:8080/download-gift?id=${gift.id}`}
                                alt={gift.file_name}
                                className="max-h-48 max-w-48 object-contain animate-pop"
                              />
                            ) : (
                              <div className="p-3 rounded shadow-lg animate-pop max-w-[200px]">
                                {gift.file_name ? (
                                  <p className="text-sm font-bold">{gift.file_name}</p>
                                ) : (
                                  <p className="text-sm font-bold">
                                    {gift.custom_message || "Gift"}
                                  </p>
                                )}
                              </div>
                            )
                          }
                        />
                      </div>
                      <div className="text-center">
                        {gift.file_name && gift.file_name.trim() !== "" ? (
                          <p className="text-sm font-bold text-black">{gift.file_name}</p>
                        ) : (
                          <p className="text-sm font-bold text-black">
                            {gift.custom_message ? "Message Gift" : "No message provided."}
                          </p>
                        )}
                        <button
                          className="mt-3 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transform transition-transform hover:scale-105 shadow-md"
                          onClick={() => handleOpenGift(gift)}
                          disabled={openingGiftId === gift.id}
                        >
                          {openingGiftId === gift.id ? "Unwrapping..." : "Unwrap Gift"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Receiver Emails */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4 text-black">Receiver Emails</h2>
              {receiverEmails && receiverEmails.length > 0 ? (
                <ul className="list-disc pl-5">
                  {receiverEmails.map((email, index) => (
                    <li key={index} className="text-black">{email}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No receiver emails found.</p>
              )}
            </div>
          </>
        )}
        </div>
      </main>
      {selectedGift && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Gift Details</h2>
            {selectedGift.file_name && selectedGift.file_name.trim() !== "" ? (
              <>
                <p className="text-sm font-bold text-black">File: {selectedGift.file_name}</p>
                {isImageFile(selectedGift.file_name) ? (
                  <img
                    src={`http://localhost:8080/download-gift?id=${selectedGift.id}`}
                    alt={selectedGift.file_name}
                    className="mb-4 max-h-96 object-contain"
                    onError={(e) => {
                      console.error("Image failed to load:", e.target.src);
                      e.target.style.display = "none";
                      const fallback = document.createElement("p");
                      fallback.textContent = "Image failed to load";
                      e.target.parentNode.appendChild(fallback);
                    }}
                  />
                ) : (
                  <a
                    href={`http://localhost:8080/download-gift?id=${selectedGift.id}`}
                    download={selectedGift.file_name}
                    className="text-blue-500 underline mb-4 block"
                  >
                    Download {selectedGift.file_name}
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm font-bold text-black">
                Message: {selectedGift.custom_message || "No message provided."}
              </p>
            )}
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => setSelectedGift(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <GiftCalendar
          username={username}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;