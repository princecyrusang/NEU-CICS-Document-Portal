"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuthInstance, useFirestore, useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  undergraduateProgram?: string;
  isBlocked: boolean;
  onboarded: boolean;
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
  const auth = useAuthInstance();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function syncProfile() {
      if (authLoading) return;

      if (user) {
        // Validate email domain
        if (!user.email?.endsWith("@neu.edu.ph")) {
          await signOut(auth);
          router.push("/login?error=invalid_domain");
          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          if (data.isBlocked) {
            await signOut(auth);
            router.push("/login?error=blocked");
            return;
          }
          setProfile(data);
          
          if (!data.onboarded && pathname !== "/onboarding") {
            router.push("/onboarding");
          }
        } else {
          // Create initial profile
          const initialProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            isBlocked: false,
            onboarded: false,
          };
          await setDoc(userDocRef, initialProfile);
          setProfile(initialProfile);
          router.push("/onboarding");
        }
      } else {
        setProfile(null);
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
      setLoading(false);
    }

    syncProfile();
  }, [user, authLoading, db, auth, pathname, router]);

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
