import React, { useState } from "react";
import { useRouter } from "next/router";
import { LoginForm } from "../components/login-form";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-foreground">
      <LoginForm/>
    </div>
  );
};

export default LoginPage;
