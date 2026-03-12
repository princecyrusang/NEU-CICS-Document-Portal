"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Download, Filter, LogOut, LayoutDashboard, Loader2, Info, FileDown, ShieldX } from "lucide-react";
import { DOCUMENT_CATEGORIES } from "@/app/lib/programs";
import Link from "next/link";

export default function DocumentGalleryPage() {
  const { profile, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const docsQuery = useMemoFirebase(() => collection(db, "documents"), []);
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

  const handleDownload = (docId: string, base64Data: string, fileName: string) => {
    try {
      // 1. Increment count in background
      const docRef = doc(db, "documents", docId);
      updateDoc(docRef, {
        downloadCount: increment(1)
      });

      // 2. Convert Base64 back to Blob and trigger download
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
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error handling document download:", error);
    }
  };

  if (profile?.isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive shadow-2xl">
          <CardHeader className="text-center">
            <ShieldX className="w-20 h-20 text-destructive mx-auto mb-6" />
            <CardTitle className="text-2xl font-bold">Access Restricted</CardTitle>
            <CardDescription className="text-lg">
              Your access has been restricted by the Admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-center text-muted-foreground">
              Please contact the department administration for more information regarding your account status.
            </p>
            <Button variant="outline" onClick={logout} className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold text-primary font-headline">CICS Document Repo</h1>
          </div>
          <div className="flex items-center gap-4">
            {profile?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Admin
                </Button>
              </Link>
            )}
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="w-full md:w-1/2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents by title..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select onValueChange={setCategoryFilter} defaultValue="all">
              <SelectTrigger className="w-full md:w-[250px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {DOCUMENT_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading Firestore repository...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <Card key={doc.id} className="border-none shadow-md hover:shadow-lg transition-all group overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{doc.category}</Badge>
                      {doc.program === 'All CICS' && (
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex gap-1 items-center">
                          <Info className="w-3 h-3" /> All Programs
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Download className="w-3 h-3" /> {doc.downloadCount || 0}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-headline line-clamp-1 group-hover:text-primary transition-colors">
                    {doc.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    {doc.program}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-muted-foreground">
                      Added: {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "Unknown"}
                    </span>
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleDownload(doc.id, doc.fileData, doc.fileName)}
                      className="gap-2 shadow-sm"
                    >
                      <FileDown className="w-4 h-4" /> Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredDocs.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold">No documents found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
