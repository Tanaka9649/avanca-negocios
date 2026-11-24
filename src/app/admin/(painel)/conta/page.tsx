import { ChangePasswordForm } from "@/components/admin/user-forms";
import { logoutAction } from "@/lib/admin/auth-actions";
import { requireUser, ROLE_LABELS } from "@/lib/auth";

export const metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <div className="adm-head">
        <div><h1>Minha conta</h1><p>{user.name} · {user.email} · {ROLE_LABELS[user.role]}</p></div>
        <form action={logoutAction}><button className="adm-btn">Sair do painel</button></form>
      </div>
      <section className="adm-card" style={{ maxWidth: 520 }}><h2>Alterar senha</h2><ChangePasswordForm /></section>
    </>
  );
}
