
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
      setErrorMsg("Your access has been restricted by an administrator.");
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md glass-card border-none rounded-[2.5rem] shadow-2xl overflow-hidden">
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
            className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-primary/20"
          >
            <LogIn className="w-6 h-6" />
            Continue with NEU Email
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
