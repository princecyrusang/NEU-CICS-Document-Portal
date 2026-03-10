
"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, FileText, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const { user, profile, loading } = useAuth();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-campus');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary font-headline">NEU CICS Repo</span>
          </div>
          <div>
            {user ? (
              <Link href="/dashboard">
                <Button variant="default">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="default">Student Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground font-headline leading-tight">
                CICS Document <span className="text-primary">Repository</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                The central hub for New Era University's College of Informatics and Computing Studies. 
                Access syllabi, lab manuals, and theses in one secure location.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="h-14 px-8 text-lg gap-2">
                      Access Dashboard <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button size="lg" className="h-14 px-8 text-lg gap-2">
                      Login with NEU Email <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex-1 w-full max-w-xl">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <Image 
                  src={heroImage?.imageUrl || "https://picsum.photos/seed/neu/800/450"} 
                  alt="NEU Campus"
                  fill
                  className="object-cover"
                  data-ai-hint="university campus"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl -z-10" />
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">Centralized Access</h3>
                <p className="text-muted-foreground">All academic documents for Computer Science, IT, and IS programs in one place.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">Secure & Exclusive</h3>
                <p className="text-muted-foreground">Restricted to authorized @neu.edu.ph accounts ensuring academic integrity.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">Real-time Updates</h3>
                <p className="text-muted-foreground">Admins upload new materials daily, instantly appearing in your gallery.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-white">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} New Era University - College of Informatics and Computing Studies</p>
          <p className="text-sm mt-2">Dedicated to academic excellence and digital innovation.</p>
        </div>
      </footer>
    </div>
  );
}
