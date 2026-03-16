
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
        // Immediate Domain Validation
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
          
          // Sprint 3: Silent Fail wrapper for getDoc
          const userDoc = await getDoc(userDocRef);
          
          if (!isMounted) return;

          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            
            // Redirection Logic
            if (data.isBlocked) {
              if (pathname !== "/dashboard" && pathname !== "/login") {
                router.push("/dashboard");
              }
            } else if (!data.program && pathname !== "/onboarding" && pathname !== "/login") {
              router.push("/onboarding");
            } else if (data.program && (pathname === "/onboarding" || pathname === "/login")) {
              router.push("/dashboard");
            }
          } else {
            // New User Creation
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
        } catch (error: any) {
          if (!isMounted) return;

          // Silent Fail Strategy: Fallback to a restricted profile to avoid "Freezing"
          if (error.code === 'permission-denied' || error.message?.toLowerCase().includes('permission')) {
            setProfile({
              id: user.uid,
              email: user.email!,
              displayName: user.displayName || "Restricted User",
              role: 'student',
              isBlocked: true,
              createdAt: null,
              updatedAt: null,
            });
          } else {
            console.warn("AuthContext profile sync warning:", error.message);
            // Fallback: If we have a user but sync failed, assume standard access to prevent hang
            if (pathname === "/login") {
              router.push("/dashboard");
            }
          }
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

  // Combine loading states for the provider
  const isInitialLoading = authLoading || (user && loading);

  return (
    <AuthContext.Provider value={{ user, profile, loading: isInitialLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
