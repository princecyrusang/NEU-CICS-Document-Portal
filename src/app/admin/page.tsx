"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { useCollection, useMemoFirebase } from "@/firebase";
import { db, storage } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, Users, ShieldAlert, Loader2, UserX, UserCheck, 
  ArrowLeft, FilePlus, LayoutDashboard, BarChart3, TrendingUp,
  FileText, Download
} from "lucide-react";
import Link from "next/link";
import { NEU_PROGRAMS, DOCUMENT_CATEGORIES } from "@/app/lib/programs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function AdminPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

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
      const cat = doc.category || doc.documentType || "Other";
      typeCounts[cat] = (typeCounts[cat] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [documents]);

  // Form State
  const [newDoc, setNewDoc] = useState({
    title: "",
    category: "",
    program: "",
    file: null as File | null
  });

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only administrators can access this dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/dashboard">
              <Button>Return to Document Gallery</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.file || !newDoc.title || !newDoc.category || !newDoc.program) {
      toast({ variant: "destructive", title: "Error", description: "Please fill all fields." });
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `documents/${Date.now()}_${newDoc.file.name}`);
      const snapshot = await uploadBytes(storageRef, newDoc.file);
      const fileUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "documents"), {
        title: newDoc.title,
        category: newDoc.category,
        program: newDoc.program,
        fileUrl,
        uploadDate: new Date().toISOString(),
        downloadCount: 0,
        uploadedBy: profile?.id,
        createdAt: serverTimestamp()
      });

      toast({ title: "Success", description: "Document uploaded successfully!" });
      setNewDoc({ title: "", category: "", program: "", file: null });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isBlocked: !currentStatus,
        updatedAt: serverTimestamp()
      });
      toast({ title: "User Updated", description: `User has been ${!currentStatus ? 'blocked' : 'unblocked'}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2 font-headline text-primary">
            <LayoutDashboard className="w-6 h-6" /> Admin Management
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <FilePlus className="w-4 h-4" /> Add Document
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Total Students
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">{stats.totalUsers}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-destructive">
                    <UserX className="w-4 h-4" /> Blocked
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">{stats.blockedUsers}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Documents
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">{stats.totalDocs}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-accent-foreground">
                    <Download className="w-4 h-4" /> Total Downloads
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">{stats.totalDownloads}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Repository Distribution
                  </CardTitle>
                  <CardDescription>Number of files per category.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg font-headline">Recent Activity</CardTitle>
                  <CardDescription>Latest uploads and user actions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents?.slice(0, 5).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">{doc.category || doc.documentType}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{new Date(doc.uploadDate).toLocaleDateString()}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="max-w-2xl mx-auto border-none shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Add New Document</CardTitle>
                <CardDescription>Upload course materials and define their access category.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document Title</label>
                    <Input 
                      placeholder="e.g. OJT Completion Form - 2024" 
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                      className="h-12"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Document Category</label>
                      <Select onValueChange={(v) => setNewDoc({...newDoc, category: v})} value={newDoc.category}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select Category" /></SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_CATEGORIES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Academic Program</label>
                      <Select onValueChange={(v) => setNewDoc({...newDoc, program: v})} value={newDoc.program}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select Program" /></SelectTrigger>
                        <SelectContent>
                          {NEU_PROGRAMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PDF File</label>
                    <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center bg-muted/5">
                      <Input 
                        type="file" 
                        accept=".pdf" 
                        onChange={(e) => setNewDoc({...newDoc, file: e.target.files?.[0] || null})}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium">{newDoc.file ? newDoc.file.name : "Click to select or drag and drop PDF"}</p>
                        <p className="text-xs text-muted-foreground">PDF only (max 10MB)</p>
                      </label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={uploading}>
                    {uploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
                    Upload to Repository
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Active Student Accounts</CardTitle>
                <CardDescription>Review enrolled users and manage system access.</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-semibold">{user.displayName}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>{user.program || <span className="italic text-xs">Pending Onboarding</span>}</TableCell>
                            <TableCell>
                              <Badge variant={user.isBlocked ? "destructive" : "secondary"} className="rounded-md">
                                {user.isBlocked ? "Blocked" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {user.role !== 'admin' && (
                                <Button 
                                  variant={user.isBlocked ? "outline" : "destructive"} 
                                  size="sm"
                                  onClick={() => toggleBlockUser(user.id, user.isBlocked)}
                                  className="gap-2 min-w-[100px]"
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
