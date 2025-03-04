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
  const editor = useEditor({
    extensions: [
        StarterKit,
        TextStyle,
        FontSize,
        Color,
        Underline
    ],
    content: '<p>Start typing here...</p>',
});

useEffect(() => {
  if (typeof window !== "undefined") {
    setUsername(sessionStorage.getItem("username") || "");
  }
}, []);

const applyStyle = (style) => {
    if (!editor) return;
    editor.chain().focus()[style]().run();
};

const changeColor = (event) => {
    if (!editor) return;
    editor.chain().focus().setColor(event.target.value).run();
};

const changeSize = (size) => {
    if (!editor) return;
    editor.chain().focus().setFontSize('textStyle', { fontSize: size }).run();
};

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
    <div className="min-h-screen flex flex-col items-center text-black bg-blue-100 p-8">
      <h1 className="text-xl font-bold text-black mb-4">Write a Memory</h1>

      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Memory Title"
          className="w-full text-lg font-semibold border-b-2 border-gray-300 p-2 focus:outline-none focus:border-blue-500"
        />

        {/* Rich Text Editor */}
        <div className="mt-4">
          { editor &&
            <div className="toolbar mb-2 space-x-3">
          <button
          className={`p-2 rounded-md ${editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-white border"}`}
        onClick={() => applyStyle('toggleBold')}>Bold</button>
                <button className={`p-2 rounded-md ${editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-white border"}`} onClick={() => applyStyle('toggleItalic')}>Italic</button>
                <button className={`p-2 rounded-md ${editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-white border"}`} onClick={() => applyStyle('toggleUnderline')}>Underline</button>
                <input type="color" onChange={changeColor} />
                <select onChange={(e) => changeSize(e.target.value)}>
                    <option value="12px">12px</option>
                    <option value="16px">16px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                </select>
            </div>
          }
          <div className="border border-gray-300 rounded-lg shadow-md p-4 bg-white min-h-[200px]">
                <EditorContent editor={editor} className="prose max-w-full focus:outline-none" />
            </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between">
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

        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default WriteMemory;
