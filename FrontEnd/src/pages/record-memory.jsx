import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { UserHeader } from "../components/user-header";

const RecordMemory = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  useEffect(() => {
    if (isClient) {
        startVideoStream();
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isClient]);

  const startRecording = async () => {
    if (!streamRef.current) {
      alert("Camera not accessible. Please reload the page.");
      return;
    }
    
    setVideoBlob(null);
    mediaRecorderRef.current = new MediaRecorder(streamRef.current);

    let chunks = [];
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      setVideoBlob(blob);
      chunks = [];
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!videoBlob) {
      alert("No recorded video available!");
      return;
    }

    let currentUsername = username;
    console.log("Initial username state:", currentUsername); // Debugging line

    if (!currentUsername) {
      const storedUsername = sessionStorage.getItem("username");
      console.log("Stored username in sessionStorage:", storedUsername); // Debugging line

      if (storedUsername) {
        currentUsername = storedUsername;
        setUsername(storedUsername); // Update the state with the retrieved username
      }
    }

    console.log("Final username used for upload:", currentUsername); // Debugging line

    if (!currentUsername) {
      alert("Username is required. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("username", currentUsername);
    formData.append("file", videoBlob, "memory.mp4");

    try {
      const response = await fetch(`http://localhost:8080/upload-gift?username=${currentUsername}`, {
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

  if (!isClient) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-primary-foreground flex flex-col items-center">
      <UserHeader />

      <div className="w-full flex flex-grow justify-center items-center mt-4">
        <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-strong p-4 flex flex-col items-center">
          <video
            ref={videoRef}
            className="w-full max-w-full rounded-3xl mb-4"
            autoPlay
            playsInline
          />
          {videoBlob && (
            <div className="absolute w-full max-w-full mb-4 px-4">
            <video
              className="w-full max-w-full rounded-3xl"
              controls
              src={URL.createObjectURL(videoBlob)}
            ></video>
            </div>
          )}

          <div className="flex flex-row space-x-2 items-center justify-center">
            {videoBlob ? (
              <>
                <div
                  className="w-20 h-20 p-5 bg-green-500 text-white rounded-full hover:bg-green-600 cursor-pointer"
                  onClick={handleUpload}
                >
                  <Image src="/checkmark.png" width={40} height={40} />
                </div>
                <div
                  className="w-20 h-20 p-5 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
                  onClick={() => setVideoBlob(null)}
                >
                  <Image src="/redo.png" width={40} height={40} />
                </div>
              </>
            ) : (
              <div
                className="w-20 h-20 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
                onClick={recording ? stopRecording : startRecording}
              >
                {recording ? (
                  <div className="bg-white w-8 h-8 m-6"></div>
                ) : (
                  <div className="bg-white w-10 h-10 m-5 rounded-full"></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
};

export default RecordMemory;
