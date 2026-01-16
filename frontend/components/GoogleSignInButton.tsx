"use client";

import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  text?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  className?: string;
}

export function GoogleSignInButton({
  text = "Continue with Google",
  variant = "outline",
  className = "",
}: GoogleSignInButtonProps) {
  const handleGoogleSignIn = () => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={`w-full ${className}`}
      onClick={handleGoogleSignIn}
    >
      <i className="fa-brands fa-google"></i>
      {text}
    </Button>
  );
}
