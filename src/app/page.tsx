"use client";

import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Initializing NEU Student Hub...</p>
        </div>
      </div>
    );
  }

  // AuthContext handles redirects based on state
  return null;
}