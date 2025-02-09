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
    const [user, setUser] = useState({ firstName: '', lastName: '', username: '', password: '' });
    const [errors, setErrors] = useState({});
    const router = useRouter();

    const validate = () => {
        const newErrors = {};

        if (!user.username) newErrors.username = 'Username is required.';
        else if (user.username.length < 4) newErrors.username = 'Minimum 4 characters required.';
        else if (user.username.length > 20) newErrors.username = 'Maximum 20 characters allowed.';
        else if (!/^[a-zA-Z0-9_]+$/.test(user.username)) newErrors.username = 'Only letters, numbers, and underscores allowed.';

        if (!user.firstName) newErrors.firstName = 'First name is required.';
        else if (!/^[a-zA-Z]+$/.test(user.firstName)) newErrors.firstName = 'Only letters are allowed.';

        if (!user.lastName) newErrors.lastName = 'Last name is required.';
        else if (!/^[a-zA-Z]+$/.test(user.lastName)) newErrors.lastName = 'Only letters are allowed.';

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
            router.push('/login');
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
            <p className="font-bold text-2xl">Create an account</p>
            <div className="flex flex-row space-x-8">
            <div className="flex flex-col flex-grow">
                <label htmlFor="username">First Name</label>
                <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={user.firstName}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                    className="border-gray-600 border rounded-lg p-1"
                />
                {errors.firstName && <div className="text-red-500">{errors.firstName}</div>}
            </div>
            <div className="flex flex-col flex-grow">
                <label htmlFor="lastName">Last Name</label>
                <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={user.lastName}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                    className="border-gray-600 border rounded-lg p-1"
                />
                {errors.lastName && <div className="text-red-500">{errors.lastName}</div>}
            </div>
            </div>

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
            <button className="underline px-2" type="button" onClick={validate}>
                Already have an account? Login
            </button>
            <button className="bg-[#00A9C5] text-white rounded-full py-1 px-8" type="submit">
                Register
            </button>
          </form>
        </main>
      </div>
    );
}
