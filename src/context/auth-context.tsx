"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  program?: string;
  role: 'student' | 'admin';
  isBlocked: boolean;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function syncProfile() {
      // 1. Wait for Auth state to initialize
      if (authLoading) return;

      if (user) {
        // 2. Domain Restriction Logic
        if (!user.email?.endsWith("@neu.edu.ph")) {
          await signOut(auth);
          router.push("/login?error=invalid_domain");
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          
          // Administrative block check
          if (data.isBlocked) {
            await signOut(auth);
            router.push("/login?error=blocked");
            setLoading(false);
            return;
          }
          
          setProfile(data);
          
          // 3. Onboarding Check: If 'program' is missing, redirect to onboarding
          if (!data.program && pathname !== "/onboarding") {
            router.push("/onboarding");
          } else if (data.program && (pathname === "/onboarding" || pathname === "/login")) {
            router.push("/dashboard");
          }
        } else {
          // 4. Create initial profile for new @neu.edu.ph user with 'role: student'
          const initialProfile: UserProfile = {
            id: user.uid,
            email: user.email!,
            displayName: user.displayName || "New Student",
            role: 'student',
            isBlocked: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userDocRef, initialProfile);
          setProfile(initialProfile);
          router.push("/onboarding");
        }
      } else {
        setProfile(null);
        const isPublicRoute = pathname === "/login" || pathname === "/";
        if (!isPublicRoute) {
          router.push("/login");
        }
      }
      setLoading(false);
    }

    syncProfile();
  }, [user, authLoading, pathname, router]);

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const isInitialLoading = authLoading || (user && loading);

  return (
    <AuthContext.Provider value={{ user, profile, loading: isInitialLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
