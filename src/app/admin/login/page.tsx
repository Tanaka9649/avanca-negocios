import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLockup } from "@/components/brand";
import { LoginForm } from "@/components/admin/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import "../admin.css";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  return (
    <main className="adm-auth">
      <div className="adm-auth__card">
        <BrandLockup priority />
        <h1>Painel Avança Negócios</h1>
        <p className="adm-muted">Eventos, networking e compra e venda de empresas. O painel da Avança Imóveis continua separado.</p>
        <LoginForm />
      </div>
    </main>
  );
}
