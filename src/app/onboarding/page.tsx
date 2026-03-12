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
import { GraduationCap, ChevronRight, Loader2, Sparkles } from "lucide-react";
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
      await updateDoc(userDocRef, {
        program: selectedProgram,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Profile Configured",
        description: "Welcome to the CICS digital portal!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-lg glass-card border-none rounded-[2.5rem] shadow-2xl overflow-hidden">
        <CardHeader className="text-center space-y-6 pt-12">
          <div className="mx-auto w-20 h-20 bg-primary/10 flex items-center justify-center rounded-[2rem] shadow-inner shadow-primary/20">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-extrabold tracking-tight text-foreground font-headline">
              Finalize Setup
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Help us personalize your <span className="text-primary italic">CICS Portal</span> experience.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-10 pb-12 px-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1 text-sm font-bold text-muted-foreground uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-primary" /> Your Degree Program
            </div>
            <Select onValueChange={setSelectedProgram} value={selectedProgram}>
              <SelectTrigger className="h-16 text-lg bg-white/5 border-white/5 rounded-2xl focus:ring-primary/20 transition-all">
                <SelectValue placeholder="Select your enrolled program" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-white/10 bg-card">
                {NEU_PROGRAMS.map((p) => (
                  <SelectItem key={p} value={p} className="h-12 rounded-xl">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!selectedProgram || loading}
            className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-2 rounded-2xl shadow-xl shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Complete Personalization"}
            {!loading && <ChevronRight className="w-6 h-6" />}
          </Button>

          <p className="text-sm text-center text-muted-foreground/60 leading-relaxed italic px-4">
            This information ensures you see the forms most relevant to your specific academic journey.
          </p>
        </CardContent>
      </Card>
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}