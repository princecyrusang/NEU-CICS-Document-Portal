
"use client";

import { useState } from "react";
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
import { Upload, Users, ShieldAlert, Loader2, UserX, UserCheck, ArrowLeft, FilePlus } from "lucide-react";
import Link from "next/link";
import { NEU_PROGRAMS, DOCUMENT_TYPES } from "@/app/lib/programs";

export default function AdminPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Users Collection
  const usersQuery = useMemoFirebase(() => collection(db, "users"), []);
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  // Form State
  const [newDoc, setNewDoc] = useState({
    title: "",
    type: "",
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
    if (!newDoc.file || !newDoc.title || !newDoc.type || !newDoc.program) {
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
        documentType: newDoc.type,
        program: newDoc.program,
        fileUrl,
        uploadDate: new Date().toISOString(),
        downloadCount: 0,
        uploadedBy: profile?.id,
        createdAt: serverTimestamp()
      });

      toast({ title: "Success", description: "Document uploaded successfully!" });
      setNewDoc({ title: "", type: "", program: "", file: null });
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" /> Admin Dashboard
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="upload" className="gap-2">
              <FilePlus className="w-4 h-4" /> Upload PDF
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" /> User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Add New Document</CardTitle>
                <CardDescription>Upload course materials to the CICS repository.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document Title</label>
                    <Input 
                      placeholder="e.g. CS101 Lab Manual - Week 1" 
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Document Type</label>
                      <Select onValueChange={(v) => setNewDoc({...newDoc, type: v})} value={newDoc.type}>
                        <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Academic Program</label>
                      <Select onValueChange={(v) => setNewDoc({...newDoc, program: v})} value={newDoc.program}>
                        <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                        <SelectContent>
                          {NEU_PROGRAMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PDF File</label>
                    <Input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setNewDoc({...newDoc, file: e.target.files?.[0] || null})}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload to Repository
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Active Student Accounts</CardTitle>
                <CardDescription>Manage access for @neu.edu.ph student users.</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
                ) : (
                  <Table>
                    <TableHeader>
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
                          <TableCell className="font-medium">{user.displayName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.program}</TableCell>
                          <TableCell>
                            <Badge variant={user.isBlocked ? "destructive" : "secondary"}>
                              {user.isBlocked ? "Blocked" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {user.role !== 'admin' && (
                              <Button 
                                variant={user.isBlocked ? "outline" : "destructive"} 
                                size="sm"
                                onClick={() => toggleBlockUser(user.id, user.isBlocked)}
                                className="gap-2"
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
