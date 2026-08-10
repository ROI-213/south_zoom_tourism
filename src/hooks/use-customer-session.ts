import { useCallback, useEffect, useState } from "react";
import {
  getSession,
  onAuthStateChange,
  signOut as signOutSession,
  type CustomerSession,
} from "@/content/customer-auth";

/**
 * Reads the customer session on the client only. Rendering starts in a
 * "loading" state so server HTML and first client paint match (no layout shift,
 * no hydration mismatch).
 */
export function useCustomerSession() {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => setSession(getSession());
    sync();
    setLoading(false);
    const unsubscribe = onAuthStateChange(sync);
    window.addEventListener("storage", sync);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", sync);
    };
  }, []);

  const signOut = useCallback(() => {
    signOutSession();
    setSession(null);
  }, []);

  return { session, loading, signOut, refresh: () => setSession(getSession()) };
}
