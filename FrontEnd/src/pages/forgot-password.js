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
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const validate = () => {
        if (!email) setMessage('A valid email address is required.');

        return !!email;
    };

    const sendEmail = async () => {
        try {
            const response = await fetch('http://localhost:8080/reset-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email }),
            });

            const result = await response.text();

            if (!response.ok) throw new Error(result);

            console.log(result);
            router.push('/');
        } catch (err) {
            console.log('Reset password error:', err);
            setMessage(err.message);
        }
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        if (validate()) sendEmail();
    };

    const handleForgotPassword = () => {
        console.log('Redirecting to forgot password...');
    };

    return (
      <div className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-[#FAFAFA]`}>
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-10 text-black border border-gray-300 space-y-2">
            <img src="https://i.postimg.cc/VsRBMLgn/pglogo.png" className="w-40" alt="logo"/>
            <p className="font-bold text-2xl">Reset my Password</p>

            <div className="flex flex-col">
                <label htmlFor="username">Email Address</label>
                <input
                    type="text"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-600 border rounded-lg p-1"
                />
            </div>
            
            <button className="bg-[#00A9C5] text-white rounded-full py-1 px-8" type="submit">
                Submit
            </button>
            {message && <div className="text-red-500">{message}</div>}
          </form>
        </main>
      </div>
    );
}
