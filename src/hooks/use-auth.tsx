import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = { id: string; full_name: string; email: string; account_status: "active" | "banned"; created_at: string };
type AuthState = { session: Session | null; profile: Profile | null; isAdmin: boolean; loading: boolean; refresh: () => Promise<void> };

const AuthContext = createContext<AuthState>({ session: null, profile: null, isAdmin: false, loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load(s: Session | null) {
    setSession(s);
    if (!s) { setProfile(null); setIsAdmin(false); setLoading(false); return; }
    const [{ data: p }, { data: admin }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", s.user.id).maybeSingle(),
      supabase.rpc("has_role", { _user_id: s.user.id, _role: "admin" }),
    ]);
    setProfile(p as Profile | null);
    setIsAdmin(!!admin);
    setLoading(false);
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "TOKEN_REFRESHED") { setSession(s); return; }
      setTimeout(() => void load(s), 0);
    });
    supabase.auth.getSession().then(({ data }) => load(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, isAdmin, loading, refresh: async () => load((await supabase.auth.getSession()).data.session) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
