import React, { useState, useEffect, act } from "react";
import { useRouter } from "next/router";
import { UserHeader } from "../components/user-header";


const FileMemory = () => {
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
   const storedUsername = sessionStorage.getItem("username");


   if (!storedUsername) {
     alert("Username is not defined. Please log in again.");
     return;
   }


   const formData = new FormData();
   formData.append("username", storedUsername);
   formData.append("file", selectedFile);
   formData.append("emailMessage", customMessage);


   console.log("Sending username:", storedUsername);
   console.log("File name:", selectedFile.name);
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
   <div className="min-h-screen bg-primary-foreground flex flex-col items-center">
     <UserHeader/>


     <div className="flex flex-col min-h-screen flex-grow justify-center items-center">
     <div className="bg-white p-6 rounded-3xl lg:w-[900px] aspect-video flex flex-col items-center justify-center gap-x-6">
       <h1 className="text-xl font-bold text-black">Create a new memory!</h1>
       <p className="text-sm text-gray-600 mb-8">
         Upload a memory that will last forever.
       </p>


       <div className="px-6 w-full">
       <div
           className="flex flex-col items-center border-2 border-dashed border-gray-400 rounded-lg w-full p-6 bg-gray-50 cursor-pointer"
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
     </div>
   </div>
 );
};


export default FileMemory;
