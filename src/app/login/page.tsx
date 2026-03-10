"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, LogIn } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "invalid_domain") {
      setErrorMsg("Access restricted to @neu.edu.ph email accounts only.");
    } else if (error === "blocked") {
      setErrorMsg("Your account has been blocked by an administrator.");
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-primary font-headline">
              NEU Student Hub
            </CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your student dashboard.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleGoogleLogin} 
            className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            Continue with Google
          </Button>

          <p className="text-sm text-center text-muted-foreground px-6">
            By logging in, you agree to follow the NEU Code of Conduct and Student Handbook.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}