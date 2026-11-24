"use client";

import { Building2, CalendarDays, FileText, LayoutDashboard, Menu, Settings, ShoppingBag, Store, Users, UserCog, Inbox, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Permission } from "@/lib/auth";

type Item = { href: string; label: string; icon: React.ComponentType<{ size?: number }>; perm: Permission; exact?: boolean };

const GROUPS: { title?: string; items: Item[] }[] = [
  { items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard", exact: true }] },
  { title: "Atendimento", items: [
    { href: "/admin/leads", label: "Leads", icon: Inbox, perm: "leads", exact: true },
    { href: "/admin/leads?categoria=compra_empresa", label: "Compra de empresas", icon: ShoppingBag, perm: "leads" },
    { href: "/admin/leads?categoria=venda_empresa", label: "Venda de empresas", icon: Store, perm: "leads" },
  ] },
  { title: "Networking", items: [
    { href: "/admin/eventos", label: "Eventos", icon: CalendarDays, perm: "eventos" },
    { href: "/admin/empresas", label: "Empresas participantes", icon: Building2, perm: "empresas" },
  ] },
  { title: "Site", items: [
    { href: "/admin/conteudo", label: "Conteúdo institucional", icon: FileText, perm: "conteudo" },
    { href: "/admin/usuarios", label: "Usuários", icon: Users, perm: "usuarios" },
    { href: "/admin/configuracoes", label: "Configurações", icon: Settings, perm: "configuracoes" },
  ] },
];

export function AdminNav({ permissions, brand, footer }: { permissions: Permission[]; brand: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const category = useSearchParams().get("categoria");

  const isCurrent = (item: Item) => {
    const [path, query] = item.href.split("?");
    if (query) return pathname === path && `categoria=${category}` === query;
    if (item.exact) return pathname === path && !(path === "/admin/leads" && category);
    return pathname.startsWith(path);
  };

  return (
    <aside className="adm-side" data-open={open}>
      {brand}
      <button type="button" className="adm-btn adm-btn--sm adm-side__menu" aria-expanded={open} aria-controls="adm-nav" onClick={() => setOpen(!open)}>
        {open ? <X size={18} /> : <Menu size={18} />}<span>Menu</span>
      </button>
      <nav id="adm-nav" className="adm-nav" aria-label="Painel" onClick={() => setOpen(false)}>
        {GROUPS.map((g, i) => {
          const items = g.items.filter((it) => permissions.includes(it.perm));
          if (!items.length) return null;
          return (
            <div key={i} style={{ display: "grid", gap: 2 }}>
              {g.title && <span className="adm-nav__group">{g.title}</span>}
              {items.map((it) => (
                <Link key={it.href} href={it.href} aria-current={isCurrent(it) ? "page" : undefined}><it.icon size={18} />{it.label}</Link>
              ))}
            </div>
          );
        })}
        <div style={{ display: "grid", gap: 2 }} className="adm-nav__mobile-account">
          <span className="adm-nav__group">Conta</span>
          <Link href="/admin/conta" aria-current={pathname === "/admin/conta" ? "page" : undefined}><UserCog size={18} />Minha conta</Link>
        </div>
      </nav>
      {footer}
    </aside>
  );
}
