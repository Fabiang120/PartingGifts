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
    const [user, setUser] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const router = useRouter();

    const validate = () => {
        const newErrors = {};

        if (!user.username) newErrors.username = 'Username is required.';
        else if (user.username.length < 4) newErrors.username = 'Minimum 4 characters required.';
        else if (user.username.length > 20) newErrors.username = 'Maximum 20 characters allowed.';
        else if (!/^[a-zA-Z0-9_]+$/.test(user.username)) newErrors.username = 'Only letters, numbers, and underscores allowed.';

        if (!user.password) newErrors.password = 'Password is required.';
        else if (user.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';

        console.log(newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Registering user:', user);
            router.push('/');
        }
    };

    const handleForgotPassword = () => {
        console.log('Redirecting to forgot password...');
    };

    return (
      <div className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-[#FAFAFA]`}>
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-10 text-black border border-gray-300 space-y-2">
            <img src="https://i.postimg.cc/VsRBMLgn/pglogo.png" className="w-40" alt="logo"/>
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
          </form>
        </main>
      </div>
    );
}
