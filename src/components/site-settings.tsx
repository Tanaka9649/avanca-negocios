"use client";

import { createContext, useContext } from "react";
import { WHATSAPP_NUMBER } from "@/lib/site";

type Settings = { whatsapp: string };
const Ctx = createContext<Settings>({ whatsapp: WHATSAPP_NUMBER });

export function SiteSettingsProvider({ value, children }: { value: Settings; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSiteSettings = () => useContext(Ctx);
