import { useEffect, useState } from "react";

import { storage } from "@/lib/storage";

import { User } from "@/types/auth";

export interface SessionUser extends User {
  userId?: string;
}

export function getSession() {
  const token = storage.get<string>(
    storage.KEYS.ACCESS_TOKEN
  );

  const user =
    storage.get<SessionUser>(
      storage.KEYS.USER
    );

  if (!token || !user) {
    return null;
  }

  return {
    token,
    ...user,
  };
}

export function useSession() {
  const [session, setSession] = useState(
    getSession()
  );

  useEffect(() => {
    setSession(getSession());
  }, []);

  return session;
}