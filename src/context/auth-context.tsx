
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
    let isMounted = true;

    async function syncProfile() {
      if (authLoading) return;

      if (user) {
        if (!user.email?.endsWith("@neu.edu.ph")) {
          await signOut(auth);
          if (isMounted) {
            router.push("/login?error=invalid_domain");
            setLoading(false);
          }
          return;
        }

        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!isMounted) return;

          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            
            // Sprint 1: Forced Onboarding Guard
            // Ensure students are redirected to setup if profile is incomplete
            if (!data.program && pathname !== "/onboarding" && pathname !== "/login") {
              router.push("/onboarding");
            } else if (data.program && pathname === "/onboarding") {
              router.push("/dashboard");
            }
          } else {
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
            if (isMounted) {
              setProfile(initialProfile);
              router.push("/onboarding");
            }
          }
        } catch (error) {
          console.error("AuthContext sync error:", error);
        }
      } else {
        if (isMounted) {
          setProfile(null);
          const isPublicRoute = pathname === "/login" || pathname === "/";
          if (!isPublicRoute) {
            router.push("/login");
          }
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    }

    syncProfile();

    return () => {
      isMounted = false;
    };
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
