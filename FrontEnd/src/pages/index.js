import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import { useRouter } from "next/router";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
    const router = useRouter();

    return (
      <div className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-[#FAFAFA]`}>
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-black">
          <p>Default Screen</p>
          <button className="w-full bg-blue-100 rounded-full" onClick={() => router.push('/register')}>Register</button>
        </main>
      </div>
    );
}
