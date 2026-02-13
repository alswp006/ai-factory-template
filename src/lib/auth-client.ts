"use client";

import { useState, useEffect } from "react";

export type ClientSessionData = {
  status: "authenticated" | "unauthenticated" | "loading";
  data: {
    user: { id: string };
    trained: boolean;
  } | null;
};

/**
 * Client-side session hook for components
 */
export function useClientSession(): ClientSessionData {
  const [session, setSession] = useState<ClientSessionData>({
    status: "loading",
    data: null,
  });

  useEffect(() => {
    async function checkSession() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          setSession({ status: "unauthenticated", data: null });
          return;
        }

        const authData = await authRes.json();
        const userId = authData.user?.id;

        if (!userId) {
          setSession({ status: "unauthenticated", data: null });
          return;
        }

        // Check tone profile status
        const toneRes = await fetch("/api/tone/status");
        let trained = false;
        if (toneRes.ok) {
          const toneData = await toneRes.json();
          trained = !!toneData.trainedAt;
        }

        setSession({
          status: "authenticated",
          data: {
            user: { id: userId.toString() },
            trained,
          },
        });
      } catch {
        setSession({ status: "unauthenticated", data: null });
      }
    }

    checkSession();
  }, []);

  return session;
}

/**
 * Client-side logout function
 */
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
