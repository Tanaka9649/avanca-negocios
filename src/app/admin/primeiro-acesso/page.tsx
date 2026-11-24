import { count } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLockup } from "@/components/brand";
import { SetupForm } from "@/components/admin/auth-forms";
import { requireDb } from "@/db";
import { businessUsers } from "@/db/schema";
import "../admin.css";

export const metadata: Metadata = { title: "Primeiro acesso", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const [{ total }] = await requireDb().select({ total: count() }).from(businessUsers);
  const open = total === 0 && Boolean(process.env.ADMIN_SETUP_TOKEN);
  return (
    <main className="adm-auth">
      <div className="adm-auth__card">
        <BrandLockup priority />
        <h1>Primeiro acesso</h1>
        {open ? (
          <>
            <p className="adm-muted">Crie o usuário administrador. A senha é definida por você e não fica visível para mais ninguém.</p>
            <SetupForm />
          </>
        ) : (
          <p className="adm-muted">O primeiro acesso já foi concluído. <Link href="/admin/login">Entrar no painel</Link>.</p>
        )}
      </div>
    </main>
  );
}
