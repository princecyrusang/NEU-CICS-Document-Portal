
"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, LogIn, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState, Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "invalid_domain") {
      setErrorMsg("Access restricted to @neu.edu.ph email accounts only.");
      setIsLoggingIn(false);
    } else if (error === "blocked") {
      setErrorMsg("Your access has been restricted by an administrator.");
      setIsLoggingIn(false);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // Non-blocking redirect: The AuthContext will handle the heavy lifting,
      // but we proactively push to the dashboard to avoid any "freeze".
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMsg("Failed to sign in. Please try again.");
      }
    } finally {
      // Ensure the button state returns to normal regardless of the outcome.
      // If sign-in was successful, the redirect will happen shortly.
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md glass-card border-none rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        <CardHeader className="text-center space-y-6 pt-12">
          <div className="mx-auto w-32 h-32 bg-secondary/50 flex items-center justify-center rounded-[3rem] shadow-inner border border-border">
            <GraduationCap size={80} className="text-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-extrabold tracking-tight text-foreground font-headline">
              NEU CICS Portal
            </CardTitle>
            <CardDescription className="text-lg font-medium text-muted-foreground">
              Sign in to your student workspace
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pb-12 px-8">
          {errorMsg && (
            <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
              <AlertTitle className="font-bold uppercase tracking-wider text-xs">Login Restricted</AlertTitle>
              <AlertDescription className="text-sm">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleGoogleLogin} 
            disabled={isLoggingIn}
            className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-primary/20"
          >
            {isLoggingIn ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <LogIn className="w-6 h-6" />
                Continue with NEU Email
              </>
            )}
          </Button>

          <div className="space-y-4">
            <p className="text-xs text-center text-muted-foreground/60 leading-relaxed max-w-xs mx-auto">
              By logging in, you agree to the university digital code of conduct and student handbook.
            </p>
            <div className="h-px bg-white/5 w-full" />
            <p className="text-[10px] text-center text-muted-foreground/40 uppercase tracking-widest font-bold">
              Secure Auth Environment
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
