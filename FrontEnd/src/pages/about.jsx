import Head from "next/head";
import React
 from "react";
export default function About() {
    return (
        <>
            <Head>
                <title>About Us - Parting Gifts App</title>
                <meta
                    name="description"
                    content="Learn more about our Parting Gifts app and our mission to help you share meaningful gifts and messages."
                />
            </Head>
            <div className="min-h-screen bg-background text-foreground p-6">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold">About Parting Gifts</h1>
                    <p className="mt-2 text-lg text-muted">
                        A unique way to share your final tokens of affection.
                    </p>
                </header>
                <main className="max-w-4xl mx-auto bg-card p-6 rounded-lg shadow-lg">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
                        <p>
                            At Parting Gifts, we believe every farewell is an opportunity to celebrate a life well-lived. Our platform makes it simple and secure to share personal messages, cherished memories, and special gifts with your loved ones when the time comes.
                        </p>
                    </section>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-2">How It Works</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                <strong>Create an account:</strong> Securely register and set up your personal details.
                            </li>
                            <li>
                                <strong>Upload your gifts:</strong> Share photos, videos, or custom messages with just a few clicks.
                            </li>
                            <li>
                                <strong>Schedule your send:</strong> Control when your final messages and gifts are delivered.
                            </li>
                            <li>
                                <strong>Stay in control:</strong> Easily adjust privacy settings and manage your gift recipients.
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-2">Secure and Private</h2>
                        <p>
                            Security is our top priority. With robust encryption and secure data handling, your messages and gifts remain private until they’re ready to be shared with those who matter most.
                        </p>
                    </section>
                </main>
                <footer className="text-center mt-8 text-sm text-muted">
                    <p>&copy; {new Date().getFullYear()} Parting Gifts. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}
