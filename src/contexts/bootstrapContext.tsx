import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../lib/storage";

type BootstrapStatus = "loading" | "authenticated" | "unauthenticated";

interface BootstrapContextValue {
  status: BootstrapStatus;
  setStatus: (status: BootstrapStatus) => void;
}

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

export function BootstrapProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BootstrapStatus>("loading");

  useEffect(() => {
    async function bootstrap() {
      try {
        const accessToken = storage.get<string>(storage.KEYS.ACCESS_TOKEN);
        const refreshToken = storage.get<string>(storage.KEYS.REFRESH_TOKEN);

        if (!accessToken && !refreshToken) {
          // No tokens at all → definitely unauthenticated
          setStatus("unauthenticated");
          return;
        }

        if (accessToken) {
          // TODO: optionally call a /me or /verify endpoint here
          // to confirm the token is still valid on the server
          console.log("Access token found, marking authenticated", { accessToken });
          setStatus("authenticated");
          return;
        }

        if (refreshToken) {
          // Access token missing but refresh exists → try to refresh
          // TODO: call your refresh token API here
          // const newToken = await authApi.refresh(refreshToken);
          // storage.set(storage.KEYS.ACCESS_TOKEN, newToken);
          // setStatus("authenticated");

          // For now, mark unauthenticated until you wire refresh
          console.warn("Refresh token found but refresh logic not implemented. Marking unauthenticated.", { refreshToken });
          setStatus("unauthenticated");
        }
      } catch {
        storage.remove(storage.KEYS.ACCESS_TOKEN);
        storage.remove(storage.KEYS.REFRESH_TOKEN);
        setStatus("unauthenticated");
      }
    }

    bootstrap();
  }, []);

  return (
    <BootstrapContext.Provider value={{ status, setStatus }}>
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrap() {
  const ctx = useContext(BootstrapContext);
  if (!ctx) throw new Error("useBootstrap must be used inside BootstrapProvider");
  return ctx;
}