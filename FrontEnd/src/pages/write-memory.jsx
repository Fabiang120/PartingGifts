import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { EditorProvider, useCurrentEditor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import FontSize from "tiptap-extension-font-size";
import Color from "@tiptap/extension-color";
import Underline from '@tiptap/extension-underline';
import Highlight from "@tiptap/extension-highlight";
import jsPDF from "jspdf";
import htmlToPdfMake from "html-to-pdfmake";
import { Document, Page, Text, View, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import RichTextEditor from "@/components/TiptapEditor";
import { UserHeader } from "@/components/user-header";

const ExportedPDF = ({ content }) => (
    <Document>
      <Page size="A4">
        <View style={{ padding: 20 }}>
          <Text>{content}</Text>
        </View>
      </Page>
    </Document>
  );
  

const WriteMemory = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUsername(sessionStorage.getItem("username") || "");
    }
  }, []);

  const handleUpload = async () => {
    if (!username) {
      alert("Username is not defined. Please log in again.");
      return;
    }

    const textContent = editor.getText(); 
    const pdfBlob = await pdf(<ExportedPDF content={textContent} />).toBlob();


    // Create FormData for Upload
    const formData = new FormData();
    formData.append("username", username);
    formData.append("file", pdfBlob, `${title || "Memory"}.pdf`);

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
         <div className="bg-white p-6 rounded-3xl flex flex-col items-center justify-center gap-x-6">
         <p className="mb-5 text-2xl font-bold">Write Memory</p>
         <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Memory Title"
          className="w-full text-lg font-semibold border-b-2 border-gray-300 p-2 focus:outline-none focus:border-blue-500 mb-5"
        />
         <RichTextEditor content={message} onChange={setMessage} />
         <div className="mt-6 flex justify-between w-full">
          <button
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={handleUpload}
          >
            Save Memory
          </button>
          <button
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </button>
        </div>
         </div>
         
         </div>
         

        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

    </div>
  );
};

export default WriteMemory;
