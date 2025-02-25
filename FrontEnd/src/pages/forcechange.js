import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./AuthContext";

const ForceChange = () => {
    const { user, setUser } = useAuth();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user.username,
                    newPassword: newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.text();
                setError(data || "Failed to change password.");
                return;
            }

            setMessage("Password changed successfully. Please log in again.");
            // Clear the user's authentication and redirect to login.
            setUser(null);
            router.push("/login");
        } catch (err) {
            console.error("Error changing password:", err);
            setError("Something went wrong. Please try again later.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-xl font-bold text-black mb-6">Change Your Password</h1>
                <form onSubmit={handleChangePassword}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-black">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter your new password"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-black">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Confirm your new password"
                            required
                        />
                    </div>
                    {error && (
                        <p className="mb-4 text-sm text-red-600">{error}</p>
                    )}
                    {message && (
                        <p className="mb-4 text-sm text-green-600">{message}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForceChange;
