import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-foreground">
      <RegisterForm/>
    </div>
  );
}