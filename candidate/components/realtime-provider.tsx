"use client";

import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/auth";

const SocketListener = dynamic(() => import("./SocketListener"), {
  ssr: false,
});

export function RealtimeProvider() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  return <SocketListener />;
}
