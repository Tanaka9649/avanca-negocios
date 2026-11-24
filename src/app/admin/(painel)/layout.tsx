import type { Metadata } from "next";
import Link from "next/link";
import { BrandLockup } from "@/components/brand";
import { AdminNav } from "@/components/admin/admin-nav";
import { logoutAction } from "@/lib/admin/auth-actions";
import { can, requireUser, ROLE_LABELS, type Permission } from "@/lib/auth";
import "../admin.css";

export const metadata: Metadata = { title: { default: "Painel", template: "%s | Painel Avança Negócios" }, robots: { index: false, follow: false } };

const ALL: Permission[] = ["dashboard", "leads", "eventos", "empresas", "conteudo", "usuarios", "configuracoes"];

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const permissions = ALL.filter((p) => can(user, p));
  return (
    <div className="adm">
      <AdminNav
        permissions={permissions}
        brand={<Link href="/admin" aria-label="Painel Avança Negócios"><BrandLockup /></Link>}
        footer={
          <div className="adm-side__foot">
            <strong style={{ color: "#fff" }}>{user.name}</strong>
            <span>{ROLE_LABELS[user.role]}</span>
            <Link href="/admin/conta" style={{ color: "#fff" }}>Minha conta</Link>
            <form action={logoutAction}><button className="adm-btn adm-btn--sm" style={{ marginTop: 8 }}>Sair</button></form>
          </div>
        }
      />
      <main className="adm-main">{children}</main>
    </div>
  );
}
