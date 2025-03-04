import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const router = useRouter();

  const validate = () => {
    const newErrors = {};

    if (!user.username) newErrors.username = 'Username is required.';
    if (!user.password) newErrors.password = 'Password is required.';

    console.log(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginUser = async () => {
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      const result = await response.text();

      if (!response.ok) throw new Error(result);

      console.log(result);
      router.push('/');
    } catch (err) {
      console.log('Login error:', err);
      setMessage(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (validate()) loginUser();
  };

  const handleForgotPassword = () => {
    console.log('Redirecting to forgot password...');
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-[#FAFAFA]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-10 text-black border border-gray-300 space-y-2">
          <img src="https://i.postimg.cc/VsRBMLgn/pglogo.png" className="w-40" alt="logo" />
          <p className="font-bold text-2xl">Login</p>

          <div className="flex flex-col">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="border-gray-600 border rounded-lg p-1"
            />
            {errors.username && <div className="text-red-500">{errors.username}</div>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="border-gray-600 border rounded-lg p-1"
            />
            {errors.password && <div className="text-red-500">{errors.password}</div>}
          </div>

          <button className="underline px-2" type="button" onClick={handleForgotPassword}>
            Forgot my password?
          </button>
          <button className="underline px-2" type="button" onClick={() => router.push('/register')}>
            New user? Register an account
          </button>
          <button className="bg-[#00A9C5] text-white rounded-full py-1 px-8" type="submit">
            Register
          </button>
          {message && <div className="text-red-500">{message}</div>}
        </form>
      </main>
    </div>
  );
}
