
"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Search, Download, Filter, LogOut, LayoutDashboard, Loader2, FileDown, GraduationCap, Lock, AlertTriangle } from "lucide-react";
import { DOCUMENT_CATEGORIES } from "@/app/lib/programs";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DocumentGalleryPage() {
  const { profile, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const docsQuery = useMemoFirebase(() => {
    if (!profile) return null;
    return collection(db, "documents");
  }, [profile]);

  const { data: documents, isLoading } = useCollection(docsQuery);

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    return documents.filter(doc => {
      const docCat = doc.category || "Other";
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || docCat === categoryFilter;
      
      const isVisibleForUser = profile?.role === 'admin' || 
                               doc.program === 'All CICS' || 
                               doc.program === profile?.program;

      return matchesSearch && matchesCategory && isVisibleForUser;
    });
  }, [documents, searchTerm, categoryFilter, profile]);

  const handleDownload = async (docId: string, base64Data: string, fileName: string, docTitle: string) => {
    if (profile?.isBlocked) return;

    try {
      // Standardized Log Entry
      addDoc(collection(db, "logs"), {
        userEmail: profile?.email,
        fileName: docTitle,
        action: "download",
        timestamp: serverTimestamp()
      });

      const docRef = doc(db, "documents", docId);
      updateDoc(docRef, {
        downloadCount: increment(1)
      });

      const byteString = atob(base64Data.split(',')[1]);
      const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground font-headline">NEU CICS Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden lg:flex flex-col items-end border-r pr-4 border-border">
              <span className="text-sm font-semibold">{profile?.displayName}</span>
              <span className="text-xs text-muted-foreground">{profile?.program || "Pending Setup"}</span>
            </div>
            <div className="flex items-center gap-2">
              {profile?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="hidden md:flex gap-2 rounded-xl border-border">
                    <LayoutDashboard className="w-4 h-4" /> Admin Portal
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 rounded-xl px-4"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-7xl">
        {profile?.isBlocked && (
          <Alert variant="destructive" className="mb-10 rounded-3xl border-2 bg-destructive/10 border-destructive animate-pulse py-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <AlertTitle className="text-xl font-bold mb-1">Account Restricted</AlertTitle>
                <AlertDescription className="text-lg opacity-90">
                  ⚠️ Your account is currently restricted. Please contact the CICS office.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="w-full md:w-1/2 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search repository..." 
              className="pl-12 h-14 bg-secondary/50 border-border rounded-2xl focus:ring-primary/20" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select onValueChange={setCategoryFilter} defaultValue="all">
              <SelectTrigger className="w-full md:w-[280px] h-14 bg-secondary/50 border-border rounded-2xl">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-card">
                <SelectItem value="all">All Classifications</SelectItem>
                {DOCUMENT_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-primary animate-spin opacity-20" />
              <GraduationCap className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-muted-foreground font-medium">Syncing Portal Repository...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDocs.map((doc) => (
              <Card key={doc.id} className="border-border glass-card card-glow rounded-3xl group transition-all overflow-hidden relative">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="rounded-lg bg-primary/10 text-primary border-none">{doc.category}</Badge>
                  </div>
                  <CardTitle className="text-xl font-headline line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {doc.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground/60 border-t border-border pt-4">
                      <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {doc.program === "All CICS" ? "All Programs" : doc.program}</span>
                      <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {doc.downloadCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-end h-10">
                      {!profile?.isBlocked ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleDownload(doc.id, doc.fileData, doc.fileName, doc.title)}
                          className="gap-2 rounded-xl px-4 h-10 shadow-lg shadow-primary/10"
                        >
                          <FileDown className="w-4 h-4" /> Download PDF
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-destructive border-destructive/20 gap-2 px-3 py-2 bg-destructive/5 cursor-not-allowed">
                          <Lock className="w-3 h-3" /> Restricted
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredDocs.length === 0 && (
          <div className="text-center py-24 glass-card rounded-[2rem] border-dashed border-2 border-border">
            <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold font-headline mb-2">No documents found</h3>
            <p className="text-muted-foreground">Adjust your filters or search keywords.</p>
          </div>
        )}
      </main>
    </div>
  );
}
