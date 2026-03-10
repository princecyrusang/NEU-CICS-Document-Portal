"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { suggestProgramResources, ProgramResourceSuggesterOutput } from "@/ai/flows/program-resource-suggester";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Building, LogOut, Sparkles, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { profile, logout } = useAuth();
  const [resources, setResources] = useState<ProgramResourceSuggesterOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      if (profile?.program) {
        setLoading(true);
        try {
          const result = await suggestProgramResources({ 
            undergraduateProgram: profile.program 
          });
          setResources(result);
        } catch (error) {
          console.error("Failed to suggest resources", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchResources();
  }, [profile?.program]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold text-primary font-headline">NEU Student Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold">{profile?.displayName}</span>
              <span className="text-xs text-muted-foreground">{profile?.program}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-primary">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground font-headline">Dashboard</h2>
            <p className="text-muted-foreground">Resources tailored for {profile?.program} students.</p>
          </div>
          <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full text-primary border border-accent/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Suggestions Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResourceCard 
            title="Recommended Courses" 
            description="Electives and specializations to boost your career."
            icon={<BookOpen className="w-6 h-6 text-primary" />}
            items={resources?.courses}
            loading={loading}
          />

          <ResourceCard 
            title="Student Clubs" 
            description="Connect with like-minded peers in your field."
            icon={<Users className="w-6 h-6 text-primary" />}
            items={resources?.clubs}
            loading={loading}
          />

          <ResourceCard 
            title="Campus Support" 
            description="Facilities and services available for your program."
            icon={<Building className="w-6 h-6 text-primary" />}
            items={resources?.campusResources}
            loading={loading}
          />
        </div>

        {/* User Card */}
        <section className="mt-12">
          <Card className="border-none shadow-md overflow-hidden bg-primary text-primary-foreground">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <UserCircle className="w-16 h-16" />
              </div>
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-2xl font-bold">{profile?.displayName}</h3>
                <p className="opacity-90">{profile?.email}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none px-4 py-1">
                    Verified {profile?.role}
                  </Badge>
                  {profile?.program && (
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none px-4 py-1">
                      {profile.program}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="ml-auto flex gap-4">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function ResourceCard({ title, description, icon, items, loading }: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  items?: string[]; 
  loading: boolean;
}) {
  return (
    <Card className="border-none shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <CardTitle className="text-xl font-headline">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <ul className="space-y-3">
            {items?.map((item, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 text-sm font-medium transition-colors hover:bg-secondary/50">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
