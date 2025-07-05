"use client";

import { Provider } from "@/components/ui/provider";
import React from "react";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
} 