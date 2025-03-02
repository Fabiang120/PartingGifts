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

export default function RegisterPage() {
  // The form still collects firstName and lastName for display;
  // however, only username, password, and email (mapped to myEmail) are sent.
  const [user, setUser] = useState({ firstName: '', lastName: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Validate the form fields.
  const validate = () => {
    const newErrors = {};

    if (!user.username) {
      newErrors.username = 'Username is required.';
    } else if (user.username.length < 4) {
      newErrors.username = 'Minimum 4 characters required.';
    } else if (user.username.length > 20) {
      newErrors.username = 'Maximum 20 characters allowed.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(user.username)) {
      newErrors.username = 'Only letters, numbers, and underscores allowed.';
    }

    if (!user.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = 'Invalid email format.';
    }

    if (!user.firstName) {
      newErrors.firstName = 'First name is required.';
    } else if (!/^[a-zA-Z]+$/.test(user.firstName)) {
      newErrors.firstName = 'Only letters are allowed.';
    }

    if (!user.lastName) {
      newErrors.lastName = 'Last name is required.';
    } else if (!/^[a-zA-Z]+$/.test(user.lastName)) {
      newErrors.lastName = 'Only letters are allowed.';
    }

    if (!user.password) {
      newErrors.password = 'Password is required.';
    } else if (user.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Send a POST request to the backend using the expected keys.
  const registerUser = async () => {
    try {
      // Create a payload matching your backend's expected fields:
      //   - username
      //   - password
      //   - myEmail (mapped from our "email" field)
      const payload = {
        username: user.username,
        password: user.password,
        primary_contact_email: user.email,
      };

      const response = await fetch('http://localhost:8080/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.text();

      if (!response.ok) throw new Error(result);

      // On success, navigate to the home page.
      router.push('/');
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed: users.username')) {
        setErrors({ username: 'Sorry, that username is taken. Please try again.' });
      } else {
        setMessage('Registration failed. Please try again.');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (validate()) {
      registerUser();
    }
  };

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-blue-100`}
    >
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form onSubmit={handleSubmit} className="p-10 text-black bg-white rounded-lg shadow-md space-y-6">
          <div className="text-center mb-6">
            <img
              src="/PG-icon.png"
              alt="Parting Gifts Logo"
              className="mx-auto mb-4 w-24"
              onClick={() => router.push("/")}
            />
            <h1 className="text-xl font-bold text-black">Create an account!</h1>
          </div>

          <div className="flex flex-row space-x-8">
            <div className="flex flex-col flex-grow">
              <label htmlFor="firstName" className="block text-sm font-medium text-black">First Name</label>
              <input
                type="text"
                id="firstName"
                value={user.firstName}
                onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                className="w-full px-3 py-2 mt-1 border rounded-md text-black focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Enter your first name"
                required
              />
              {errors.firstName && <div className="text-red-500 text-sm">{errors.firstName}</div>}
            </div>
            <div className="flex flex-col flex-grow">
              <label htmlFor="lastName" className="block text-sm font-medium text-black">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                className="w-full px-3 py-2 mt-1 border rounded-md text-black focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Enter your last name"
                required
              />
              {errors.lastName && <div className="text-red-500 text-sm">{errors.lastName}</div>}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-black">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="w-full px-3 py-2 mt-1 border rounded-md text-black focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter your username"
              required
            />
            {errors.username && <div className="text-red-500 text-sm">{errors.username}</div>}
          </div>

          <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-black">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full px-3 py-2 mt-1 border rounded-md text-black focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter your email"
              required
            />
            {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
          </div>

          <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-black">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full px-3 py-2 mt-1 border rounded-md text-black focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter your password"
              required
            />
            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
          </div>

          <div className="w-full flex-row flex justify-end">
          <button
            type="submit"
            className="bg-[#00A9C5] text-white rounded-full py-2 px-8 hover:bg-[#0088A3] focus:outline-none"
          >
            Register
          </button>
          </div>
          {message && <div className="text-red-500 text-sm">{message}</div>}
        </form>
      </main>
    </div>
  );
}
