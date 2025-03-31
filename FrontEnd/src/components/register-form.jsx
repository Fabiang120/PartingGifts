import React, { useState } from "react";
import { useRouter } from "next/router";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import registerUser from "@/logic/register"

export function RegisterForm({
  className,
  ...props
}) {
  // The form still collects firstName and lastName for display;
  // however, only username, password, and email (mapped to myEmail) are sent.
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Validate the form fields.
  const validate = () => {
    const newErrors = {};

    if (!username.value) {
      newErrors.username = 'Username is required.';
    } else if (username.value.length < 4) {
      newErrors.username = 'Minimum 4 characters required.';
    } else if (username.value.length > 20) {
      newErrors.username = 'Maximum 20 characters allowed.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
      newErrors.username = 'Only letters, numbers, and underscores allowed.';
    }

    if (!email.value) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.value)) {
      newErrors.email = 'Invalid email format.';
    }

    if (!firstName.value) {
      newErrors.firstName = 'First name is required.';
    } else if (!/^[a-zA-Z]+$/.test(firstName.value)) {
      newErrors.firstName = 'Only letters are allowed.';
    }

    if (!lastName.value) {
      newErrors.lastName = 'Last name is required.';
    } else if (!/^[a-zA-Z]+$/.test(lastName.value)) {
      newErrors.lastName = 'Only letters are allowed.';
    }

    if (!password.value) {
      newErrors.password = 'Password is required.';
    } else if (password.value.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (validate()) {
      const res = await registerUser(router);
      if (res && res.message) setMessage(res.message);
      else if (res) setErrors(res);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
        <img src="/PG-icon.png" alt="Parting Gifts Logo" className="h-12 object-contain" />
          <CardTitle className="text-xl font-semibold">Create Your Account</CardTitle>
          <CardDescription>
            Welcome to the Parting Gifts community!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
              <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" type="text" placeholder="Chad" required />
                  {errors.firstName && <div className="text-red-500 text-sm">{errors.firstName}</div>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" type="text" placeholder="Chadinson" required />
                  {errors.lastName && <div className="text-red-500 text-sm">{errors.lastName}</div>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" type="text" placeholder="user" required />
                  {errors.username && <div className="text-red-500 text-sm">{errors.username}</div>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="chad@email.com" required />
                  {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                  <div className="flex flex-row items-center gap-x-2">
                  <Input id="password" type={showPassword ? "text" : "password"} required />
                  {showPassword ? (
                        <Eye
                          className="z-10 cursor-pointer text-gray-500"
                          onClick={() => setShowPassword(show => !show)}
                        />
                      ) : (
                        <EyeOff
                          className="z-10 cursor-pointer text-gray-500"
                          onClick={() => setShowPassword(show => !show)}
                        />
                    )}
                  </div>
                  {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                </div>
                {message && <p className="text-sm text-red-600">{message}</p>}
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div
        className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4  ">
        By clicking continue, you agree to our <a href="#" className="hover:text-primary">Terms of Service</a>{" "}
        and <a href="#" className="hover:text-primary">Privacy Policy</a>.
      </div>
    </div>
  );
}
