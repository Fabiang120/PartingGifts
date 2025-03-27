import React, { useEffect, useRef, useState } from "react";
import Image from 'next/image'; 
import Link from 'next/link';

const menuItems = [
  {
    title: "Home",
    route: "/",
  },
  {
    title: "About Us",
    route: "/about"
  },
  {
    title: "Test Drop",
    children: [
      {
        title: "Item 1",
        route: "/item1",
      },
      {
        title: "Item 2",
        route: "/item2",
      },
      {
        title: "Item 3",
        route: "/item3",
      },
    ],
  },
];

function Dropdown({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  return (
    <div>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1 text-black hover:text-blue-500 font-medium transition-colors"
      >
        {item.title}
      </button>
    </div>
  );
}

function Header() {
  return (
    <nav className="w-full shadow-md px-10 py-2 items-center flex flex-row justify-between">
      <div className="flex flex-row gap-x-8">
      <Link href="/">
      <img src="/PG-icon.png" alt="Parting Gifts Logo" className="h-12" />
      </Link>
      <div className="flex flex-row items-center text-white gap-x-8">
        {menuItems.map((item) => {
          return item.hasOwnProperty("children") ? (
            <Dropdown item={item} />
          ) : (
            <Link className="text-black hover:text-blue-500" href={item?.route || ""}>
              {item.title}
            </Link>
          );
        })}
      </div>
      </div>
      <div className="items-center">
        <Link href="/login" className="text-slate-700 px-4 py-1 rounded-2xl font-medium hover:text-blue-500">
            Login
        </Link>
        <Link href="/register" className="bg-green-500 text-white py-1 px-4 rounded-md font-medium hover:bg-green-600">
            Sign Up
        </Link>
      </div>
    </nav>
  );
}



export default function Home() {
  return (
    <body className="bg-white">
    <Header/>
    <div className="p-5">
      <div className="flex flex-row items-center">
        <div>
        <span className="text-transparent font-bold text-4xl bg-clip-text bg-gradient-to-br to-[#FED9B7] from-[#F6A4A2]">
          Memories that Live On
        </span>
        <p className="text-lg text-gray-700 pt-5">
          Parting Gifts is a heartfelt platform designed to preserve and share love, wisdom, and memories.
          Our mission is to help individuals leave meaningful video messages for their loved ones,
          creating a lasting connection that transcends time and space.
          <br />
          <br />
          More than just a website, it ensures your voice and emotions are always remembered.
        </p>
        </div>
        <div className="lg:w-[2000px] md:w-[900px] sm:w-[600px]">
          <Image src="/indeximg1.jpg" alt="Friends smiling" width={2000} height={1000} className="rounded-lg shadow-lg" />
        </div>
      </div>
    </div>
    </body>
  )
}

// export default function Home() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
//       {/* Logo */}
//       <h1 className="text-4xl font-bold text-blue-600 flex items-center gap-2">
//         <img src="/PG-icon.png" alt="Parting Gifts Logo" className="h-12" />
//         Parting <span className="text-blue-400">Gifts</span>
//       </h1>

//       {/* Content Container */}
//       <div className="mt-8 flex items-center max-w-4xl mx-auto space-x-4">
//         {/* Left Section - Text */}
//         <div className="bg-blue-100 p-6 rounded-lg w-1/2">
//           <p className="text-lg text-gray-700">
//             Parting Gifts is a heartfelt platform designed to preserve and share love, wisdom, and memories.
//             Our mission is to help individuals leave meaningful video messages for their loved ones,
//             creating a lasting connection that transcends time and space.
//             <br />
//             <br />
//             More than just a website, it ensures your voice and emotions are always remembered.
//           </p>
//         </div>

//         {/* Right Section - Image */}
//         <div className="w-1/2 flex justify-center">
//           <Image src="/indeximg1.jpg" alt="Friends smiling" width={450} height={300} className="rounded-lg shadow-lg" />
//         </div>
//       </div>

//       {/* Login Button */}
//       <div className="mt-6">
//         <Link href="/login">
//           <button className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-600">
//             Log in
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// }
