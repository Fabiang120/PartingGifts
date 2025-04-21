import React, { useState } from "react";
import { useRouter } from "next/router";

import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import handleLogin from "../logic/login"

export function LoginForm({
  className,
  ...props
}) {
  const router = useRouter();

  const attemptLogin = async (e) => {
    setErrMsg("");
    const res = await handleLogin(e, router);
    if (res) setErrMsg(res);
  }

  const [showPassword, setShowPassword] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
        <img src="/PG-icon.png" alt="Parting Gifts Logo" className="h-12 object-contain" />
          <CardTitle className="text-xl font-semibold">Welcome back!</CardTitle>
          <CardDescription>
            Login with your username and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={attemptLogin}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" type="text" placeholder="user" required />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a href="/forgot-password" className="ml-auto text-sm text-gray-600 underline-offset-4 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
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
                </div>
                {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Sign up
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
