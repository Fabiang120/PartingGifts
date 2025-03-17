// pages/_app.js
import React from "react";
import { AuthProvider } from "./AuthContext"; // adjust the path as needed
import "../styles/globals.css";
import "./swagger-overrides.css";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
