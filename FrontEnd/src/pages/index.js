import React from "react";
import Image from 'next/image'; 
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
      {/* Logo */}
      <h1 className="text-4xl font-bold text-blue-600 flex items-center gap-2">
        <img src="/PG-icon.png" alt="Parting Gifts Logo" className="h-12" />
        Parting <span className="text-blue-400">Gifts</span>
      </h1>

      {/* Content Container */}
      <div className="mt-8 flex items-center max-w-4xl mx-auto space-x-4">
        {/* Left Section - Text */}
        <div className="bg-blue-100 p-6 rounded-lg w-1/2">
          <p className="text-lg text-gray-700">
            Parting Gifts is a heartfelt platform designed to preserve and share love, wisdom, and memories.
            Our mission is to help individuals leave meaningful video messages for their loved ones,
            creating a lasting connection that transcends time and space.
            <br />
            <br />
            More than just a website, it ensures your voice and emotions are always remembered.
          </p>
        </div>

        {/* Right Section - Image */}
        <div className="w-1/2 flex justify-center">
          <Image src="/indeximg1.jpg" alt="Friends smiling" width={450} height={300} className="rounded-lg shadow-lg" />
        </div>
      </div>

      {/* Login Button */}
      <div className="mt-6">
        <Link href="/login">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-600">
            Log in
          </button>
        </Link>
      </div>
    </div>
  );
}
