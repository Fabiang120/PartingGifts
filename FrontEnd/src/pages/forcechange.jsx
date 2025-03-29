import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const ForceChange = () => {
    const [username, setUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        letter: false,
        number: false,
        special: false
    });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();
    const { resetSuccess } = router.query; // Get the resetSuccess query parameter

    // Retrieve the username from sessionStorage on mount.
    // In ForceChange.js, replace the useEffect that checks resetSuccess with this:
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUsername = sessionStorage.getItem("username");
            const fromSecurityVerification = sessionStorage.getItem("fromSecurityVerification");

            if (storedUsername) {
                console.log("Retrieved username from sessionStorage:", storedUsername);
                setUsername(storedUsername);

                // Show success message if coming from security question verification
                if (fromSecurityVerification === "true") {
                    setMessage("Security question verified successfully. Please set a new password.");
                    // Clear the flag after using it
                    sessionStorage.removeItem("fromSecurityVerification");
                }
            } else {
                console.log("No username found in sessionStorage");
                // Redirect to login if no username is found
                router.push("/login");
            }
        }
    }, [router]);

    // Check password requirements as user types
    useEffect(() => {
        setPasswordRequirements({
            length: newPassword.length >= 8,
            letter: /[a-zA-Z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
            special: /[^a-zA-Z0-9]/.test(newPassword)
        });
    }, [newPassword]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        // Check if all password requirements are met
        const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
        if (!allRequirementsMet) {
            setError("Please ensure your password meets all the requirements.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username,
                    newPassword: newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.text();
                setError(data || "Failed to change password.");
                return;
            }

            setMessage("Password changed successfully. Please log in again.");
            // Remove username from sessionStorage and redirect to login.
            setTimeout(() => {
                sessionStorage.removeItem("username");
                router.push("/login?passwordChanged=true");
            }, 1500);
        } catch (err) {
            console.error("Error changing password:", err);
            setError("Something went wrong. Please try again later.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <div className="text-center mb-6">
                    <img
                        src="https://i.postimg.cc/VsRBMLgn/pglogo.png"
                        alt="Parting Gifts Logo"
                        className="mx-auto mb-4 w-24"
                    />
                    <h1 className="text-xl font-bold text-black">Change Your Password</h1>
                </div>
                {message && <p className="mb-4 text-sm text-center text-green-600">{message}</p>}
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

                        {/* Password requirements */}
                        <div className="mt-2 text-sm">
                            <p className="font-semibold mb-1">Password must have:</p>
                            <ul>
                                <li className={passwordRequirements.length ? "text-green-500" : "text-red-500"}>
                                    ✓ At least 8 characters
                                </li>
                                <li className={passwordRequirements.letter ? "text-green-500" : "text-red-500"}>
                                    ✓ At least one letter
                                </li>
                                <li className={passwordRequirements.number ? "text-green-500" : "text-red-500"}>
                                    ✓ At least one number
                                </li>
                                <li className={passwordRequirements.special ? "text-green-500" : "text-red-500"}>
                                    ✓ At least one special character
                                </li>
                            </ul>
                        </div>
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
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                        )}
                    </div>
                    {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
                    <button
                        type="submit"
                        disabled={!username}
                        className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring focus:ring-blue-300 
                            ${username ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
                    >
                        Change Password
                    </button>
                </form>
                <div className="text-center mt-4">
                    <a
                        onClick={() => router.push("/login")}
                        className="text-sm text-blue-500 hover:underline cursor-pointer"
                    >
                        Back to Log in
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ForceChange;