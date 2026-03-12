
"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, FileText, ShieldCheck, ArrowRight, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground font-headline">NEU CICS Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard">
                <Button variant="default" className="rounded-xl shadow-lg shadow-primary/20">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="default" className="rounded-xl shadow-lg shadow-primary/20">Student Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <Zap className="w-4 h-4" /> Official Document Portal
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-headline leading-tight">
                NEU CICS <span className="text-primary italic">Portal</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Empowering our Computing students with instant access to academic forms, OJT requirements, and essential resources. Securely managed for the College of Informatics and Computing Studies.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="h-14 px-8 text-lg gap-2 rounded-2xl shadow-xl shadow-primary/20">
                      Enter Dashboard <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button size="lg" className="h-14 px-8 text-lg gap-2 rounded-2xl shadow-xl shadow-primary/20">
                      Login with NEU Email <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex-1 w-full flex justify-center items-center">
              <div className="relative p-12 lg:p-20 bg-secondary/30 rounded-[3rem] border-4 border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] group transition-all duration-500 hover:border-primary/20">
                <GraduationCap 
                  size={120} 
                  className="text-foreground transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute -inset-4 bg-primary/5 rounded-[4rem] blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card border-none card-glow">
              <CardContent className="pt-8 text-center space-y-4">
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">CICS Repositories</h3>
                <p className="text-muted-foreground leading-relaxed">Centralized digital access to syllabi, manuals, and official forms for CS, IT, and IS programs.</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-none card-glow">
              <CardContent className="pt-8 text-center space-y-4">
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">Zero-Trust Access</h3>
                <p className="text-muted-foreground leading-relaxed">Identity-verified access via official NEU credentials ensures only authorized students browse documents.</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-none card-glow">
              <CardContent className="pt-8 text-center space-y-4">
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">Instant Deployment</h3>
                <p className="text-muted-foreground leading-relaxed">Admins upload once, students access instantly. No more waiting for manual distributions.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 bg-background">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg font-headline">NEU CICS Portal</span>
          </div>
          <p className="text-muted-foreground">© {new Date().getFullYear()} New Era University - College of Informatics and Computing Studies</p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground/60">
            <span>Academic Integrity</span>
            <span>Digital Innovation</span>
            <span>Excellence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
