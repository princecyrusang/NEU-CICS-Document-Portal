
"use client";

import { useState, useMemo, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useCollection, useMemoFirebase } from "@/firebase";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, ShieldAlert, Loader2, UserX, UserCheck, 
  ArrowLeft, FilePlus, LayoutDashboard, BarChart3, TrendingUp,
  FileText, Download, UploadCloud, FileUp, GraduationCap
} from "lucide-react";
import Link from "next/link";
import { ADMIN_PROGRAM_OPTIONS, DOCUMENT_CATEGORIES } from "@/app/lib/programs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data Fetching
  const usersQuery = useMemoFirebase(() => collection(db, "users"), []);
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  const docsQuery = useMemoFirebase(() => collection(db, "documents"), []);
  const { data: documents, isLoading: docsLoading } = useCollection(docsQuery);

  // Stats Calculation
  const stats = useMemo(() => {
    if (!users || !documents) return { totalUsers: 0, totalDocs: 0, blockedUsers: 0, totalDownloads: 0 };
    return {
      totalUsers: users.length,
      totalDocs: documents.length,
      blockedUsers: users.filter(u => u.isBlocked).length,
      totalDownloads: documents.reduce((sum, d) => sum + (d.downloadCount || 0), 0)
    };
  }, [users, documents]);

  const chartData = useMemo(() => {
    if (!documents) return [];
    const typeCounts: Record<string, number> = {};
    documents.forEach(doc => {
      const cat = doc.category || "Other";
      typeCounts[cat] = (typeCounts[cat] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [documents]);

  const [newDoc, setNewDoc] = useState({
    title: "",
    category: DOCUMENT_CATEGORIES[0],
    program: "All CICS",
  });
  const [selectedFile, setSelectedFile] = useState<{ name: string; base64: string } | null>(null);

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive glass-card">
          <CardHeader className="text-center">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Unauthorized Access</CardTitle>
            <CardDescription>Administrative privileges are required for this portal.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/dashboard">
              <Button className="rounded-xl px-8">Return to Portal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 700) { 
        toast({ 
          variant: "destructive", 
          title: "File Limit Exceeded", 
          description: "Max 700KB allowed for Firestore-stored PDFs." 
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedFile({ name: file.name, base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !newDoc.title || !newDoc.category || !newDoc.program) {
      toast({ variant: "destructive", title: "Incomplete", description: "All fields and a PDF file are required." });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "documents"), {
        title: newDoc.title,
        category: newDoc.category,
        program: newDoc.program,
        fileData: selectedFile.base64,
        fileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
        downloadCount: 0,
        uploadedBy: profile?.id,
        createdAt: serverTimestamp()
      });

      toast({ title: "Portal Updated", description: "New document entry successfully published." });
      setNewDoc({ title: "", category: DOCUMENT_CATEGORIES[0], program: "All CICS" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Submission Error", 
        description: error.message || "Failed to add document."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isBlocked: !currentStatus,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Account Status Changed", description: `User restriction is now ${!currentStatus ? 'Active' : 'Disabled'}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <header className="border-b border-border bg-secondary/30 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold font-headline text-foreground">
                Portal Administration
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-7xl">
        <Tabs defaultValue="overview" className="space-y-10">
          <TabsList className="bg-secondary/50 p-1 rounded-2xl border border-border h-14 md:w-[600px] grid grid-cols-3">
            <TabsTrigger value="overview" className="gap-2 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <BarChart3 className="w-4 h-4" /> Statistics
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <FilePlus className="w-4 h-4" /> Add Assets
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 rounded-xl data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Enrolled', value: stats.totalUsers, icon: Users, color: 'text-primary' },
                { label: 'Blocked Access', value: stats.blockedUsers, icon: UserX, color: 'text-destructive' },
                { label: 'Repo Assets', value: stats.totalDocs, icon: FileText, color: 'text-accent' },
                { label: 'Portal Downloads', value: stats.totalDownloads, icon: Download, color: 'text-foreground' }
              ].map((item, i) => (
                <Card key={i} className="glass-card border-none rounded-[1.5rem] card-glow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2 font-medium">
                      <item.icon className={`w-4 h-4 ${item.color}`} /> {item.label}
                    </CardDescription>
                    <CardTitle className="text-4xl font-bold tracking-tight">{item.value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass-card border-none rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-xl font-headline flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-primary" /> Repository Spread
                  </CardTitle>
                  <CardDescription>File distribution by administrative category.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: 'currentColor', opacity: 0.6}} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: 'currentColor', opacity: 0.6}} />
                      <Tooltip 
                        cursor={{fill: 'currentColor', opacity: 0.05}}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.1})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card border-none rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">Recent Portal Activity</CardTitle>
                  <CardDescription>Latest document updates in the portal.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents?.slice(0, 6).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-2 rounded-xl">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">{doc.category}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="rounded-lg border-border">{new Date(doc.uploadDate).toLocaleDateString()}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="max-w-2xl mx-auto glass-card border-none rounded-[2.5rem]">
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl font-headline">Asset Ingestion</CardTitle>
                <CardDescription>Publish new PDF resources (Max 700KB).</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold px-1">Asset Title</label>
                    <Input 
                      placeholder="e.g. 1st Year Enrollment Procedure" 
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                      className="h-14 bg-secondary/50 border-border rounded-2xl focus:ring-primary/20"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold px-1">Classification</label>
                      <Select 
                        onValueChange={(v) => setNewDoc({...newDoc, category: v})} 
                        value={newDoc.category}
                      >
                        <SelectTrigger className="h-14 bg-secondary/50 border-border rounded-2xl focus:ring-primary/20">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border">
                          {DOCUMENT_CATEGORIES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold px-1">Program Target</label>
                      <Select onValueChange={(v) => setNewDoc({...newDoc, program: v})} value={newDoc.program}>
                        <SelectTrigger className="h-14 bg-secondary/50 border-border rounded-2xl focus:ring-primary/20">
                          <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border">
                          {ADMIN_PROGRAM_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold px-1">PDF Payload</label>
                    <div 
                      className="border-2 border-dashed border-border rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 bg-secondary/50 hover:bg-secondary transition-all cursor-pointer group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="w-16 h-16 text-primary/40 group-hover:text-primary transition-colors" />
                      <div className="text-center">
                        <p className="font-bold text-lg">{selectedFile ? selectedFile.name : "Select PDF Document"}</p>
                        <p className="text-xs text-muted-foreground mt-1">Files are stored directly in Firestore</p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <FileUp className="mr-2 h-6 w-6" />}
                    Publish to Portal
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="glass-card border-none rounded-[2.5rem]">
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Student Registry</CardTitle>
                <CardDescription>Manage student access and role verification.</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-24"><Loader2 className="animate-spin w-12 h-12 text-primary opacity-20" /></div>
                ) : (
                  <div className="rounded-[2rem] border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-secondary/50">
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="py-6 font-bold">Student Identity</TableHead>
                          <TableHead className="font-bold">Contact Email</TableHead>
                          <TableHead className="font-bold">Academic Program</TableHead>
                          <TableHead className="font-bold text-center">Security Status</TableHead>
                          <TableHead className="text-right font-bold pr-8">Management</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user) => (
                          <TableRow key={user.id} className="border-border hover:bg-secondary transition-colors">
                            <TableCell className="font-bold py-6 pl-8">{user.displayName}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-border font-medium">
                                {user.program || "Pending Selection"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={user.isBlocked ? "destructive" : "secondary"} className="rounded-lg px-3">
                                {user.isBlocked ? "RESTRICTED" : "ACTIVE"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                              {user.role !== 'admin' && (
                                <Button 
                                  variant={user.isBlocked ? "outline" : "destructive"} 
                                  size="sm"
                                  onClick={() => toggleBlockUser(user.id, user.isBlocked)}
                                  className="gap-2 rounded-xl min-w-[120px] shadow-sm"
                                >
                                  {user.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                  {user.isBlocked ? "Unblock" : "Block"}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
