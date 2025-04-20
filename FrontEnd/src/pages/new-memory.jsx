import React, { useState, useEffect, act } from "react";
import { useRouter } from "next/router";
import { UserHeader } from "@/components/user-header";
import { Button } from "@/components/ui/button";


const NewMemory = () => {
 const router = useRouter();


 const [activeTab, setActiveTab] = useState("video");


 return (
   <div className="min-h-screen bg-primary-foreground flex flex-col items-center">
     <UserHeader/>


     <div className="flex flex-col min-h-screen flex-grow justify-center items-center">
     <div className="bg-white p-6 rounded-3xl lg:w-[900px] aspect-video flex flex-col md:flex-row items-center gap-x-6">
       <img
         src={
           activeTab === 'video' ? "/rec_mem.png"
           : activeTab === 'written' ? "/wr_mem.png"
           : "/file_mem.png"
         }
         alt="Grandmother and child"
         className="w-96 h-96 object-contain"
       />
       <div className="text-center flex flex-grow flex-col md:text-left">
         <h2 className="text-4xl font-bold text-gray-800 mb-2">{activeTab === "video" ? "Video Memory" : activeTab === "written" ? "Written Memory" : "File Memory"}</h2>
         {activeTab === "video" && (
           <p className="text-gray-700 mb-4 mt-4 font-medium text-lg">
             Record your stories, wisdom, and who you are. <br />
             Store memories for generations to come. <br />
             Celebrate occasions from beyond.
           </p>
         )}
         {activeTab === "written" && (
           <p className="text-gray-700 mb-4 mt-4 font-medium text-lg">
             Let your thoughts live forever in writing. <br />
             Share stories and wisdom through text. <br />
             Express yourself from beyond.
           </p>
         )}
         {activeTab === "file" && (
           <p className="text-gray-700 mb-4 mt-4 font-medium text-lg">
             Keep your important documents safe. <br />
             Share videos, photos, and PDFs to family and friends.
           </p>
         )}
         <Button className="self-start" onClick={() => {
          if (activeTab === 'video') router.push('/record-memory');
          else if (activeTab === 'written') router.push('/write-memory');
          else router.push('/file-memory');
         }}>
           {activeTab === "video" ? "Record Memory" : activeTab === "written" ? "Write Memory" : "Upload File"}
         </Button>
       </div>
   </div>
   <div className="flex justify-center -mt-4 space-x-4">
       <button
         className={`pb-2 border-b-2 ${
           activeTab === "video"
             ? "bg-white rounded-xl p-5 text-gray-900"
             : "bg-transparent rounded-xl p-5 text-gray-700"
         }`}
         onClick={() => setActiveTab("video")}
       >
         Video Memory
       </button>
       <button
         className={`pb-2 border-b-2 ${
           activeTab === "written"
             ? "bg-white rounded-xl p-5 text-gray-900"
             : "bg-transparent rounded-xl p-5 text-gray-700"
         }`}
         onClick={() => setActiveTab("written")}
       >
         Written Memory
       </button>
       <button
         className={`pb-2 border-b-2 ${
           activeTab === "file"
             ? "bg-white rounded-xl p-5 text-gray-900"
             : "bg-transparent rounded-xl p-5 text-gray-700"
         }`}
         onClick={() => setActiveTab("file")}
       >
         File Memory
       </button>
     </div>
     </div>
   </div>
 );
};


export default NewMemory;
