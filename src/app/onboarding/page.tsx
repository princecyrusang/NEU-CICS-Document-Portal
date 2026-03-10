"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import { NEU_PROGRAMS } from "@/app/lib/programs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const { user, profile } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  if (profile?.program) {
    router.push("/dashboard");
    return null;
  }

  const handleSave = async () => {
    if (!user || !selectedProgram) return;

    setLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      // Updating ONLY the program as permitted by rules
      await updateDoc(userDocRef, {
        program: selectedProgram,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Welcome aboard!",
        description: "Your profile has been successfully updated.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Update failed", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg shadow-xl border-none">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-accent/20 flex items-center justify-center rounded-2xl">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-primary font-headline">
              Welcome, {profile?.displayName?.split(" ")[0]}!
            </CardTitle>
            <CardDescription className="text-lg">
              To personalize your experience, please tell us which program you are currently enrolled in.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Undergraduate Program
            </label>
            <Select onValueChange={setSelectedProgram} value={selectedProgram}>
              <SelectTrigger className="h-12 text-lg border-2 border-primary/20 focus:border-primary">
                <SelectValue placeholder="Select your program" />
              </SelectTrigger>
              <SelectContent>
                {NEU_PROGRAMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!selectedProgram || loading}
            className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Complete Setup"}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            You can change this later in your profile settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
