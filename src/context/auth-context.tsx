
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
          
          // Sprint 3: Silent Fail wrapper for getDoc
          const userDoc = await getDoc(userDocRef);
          
          if (!isMounted) return;

          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            
            // Sprint 3 & Sprint 1: Redirection Logic
            if (data.isBlocked) {
              // Stay on Dashboard if blocked
              if (pathname !== "/dashboard" && pathname !== "/login") {
                router.push("/dashboard");
              }
            } else if (!data.program && pathname !== "/onboarding" && pathname !== "/login") {
              // Sprint 1: Forced Setup if program is missing
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
        } catch (error: any) {
          if (!isMounted) return;

          // Silent Fail for Blocked Users: Catch permission-denied
          if (error.code === 'permission-denied' || error.message?.toLowerCase().includes('permission')) {
            const blockedProfile: UserProfile = {
              id: user.uid,
              email: user.email!,
              displayName: user.displayName || "Restricted User",
              role: 'student',
              isBlocked: true,
              createdAt: null,
              updatedAt: null,
            };
            setProfile(blockedProfile);
            
            // Ensure they stay on Dashboard to see the restriction banner
            if (pathname !== "/dashboard" && pathname !== "/login") {
              router.push("/dashboard");
            }
          } else {
            console.error("AuthContext sync error:", error);
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

  const isInitialLoading = authLoading || (user && loading);

  return (
    <AuthContext.Provider value={{ user, profile, loading: isInitialLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
