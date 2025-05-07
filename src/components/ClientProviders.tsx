"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import React from "react";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
