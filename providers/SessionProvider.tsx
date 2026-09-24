import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Linking } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type SessionContextValue = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

function getAuthParams(url: string) {
  const queryPart = url.split('?')[1] ?? '';
  const query = queryPart.split('#')[0] ?? '';
  const hash = url.split('#')[1] ?? '';

  return new URLSearchParams(
    [query, hash].filter(Boolean).join('&')
  );
}

async function applyAuthRedirect(url: string | null) {
  if (!url) return;
  const params = getAuthParams(url);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const code = params.get("code");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error)
      console.warn("No se pudo restaurar la sesión del enlace.", error);
    return;
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error)
      console.warn(
        "No se pudo intercambiar el código de autenticación.",
        error,
      );
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    Linking.getInitialURL()
      .then(applyAuthRedirect)
      .catch(() => {});
    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      applyAuthRedirect(url).catch(() => {});
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) =>
      setSession(nextSession),
    );

    return () => {
      linkingSubscription.remove();
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value)
    throw new Error("useSession debe utilizarse dentro de SessionProvider.");
  return value;
}
