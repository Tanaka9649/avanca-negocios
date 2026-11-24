import { asc } from "drizzle-orm";
import { CreateUserForm, ResetPasswordForm } from "@/components/admin/user-forms";
import { requireDb } from "@/db";
import { businessUsers } from "@/db/schema";
import { fmtDateTime } from "@/lib/admin/labels";
import { updateUser } from "@/lib/admin/user-actions";
import { requireUser, ROLE_LABELS } from "@/lib/auth";

export const metadata = { title: "Usuários" };

export default async function UsersPage() {
  const me = await requireUser("usuarios");
  const users = await requireDb().select({ id: businessUsers.id, name: businessUsers.name, email: businessUsers.email, role: businessUsers.role, status: businessUsers.status, lastLoginAt: businessUsers.lastLoginAt })
    .from(businessUsers).orderBy(asc(businessUsers.name));
  return (
    <>
      <div className="adm-head"><div><h1>Usuários</h1><p>Acesso ao painel da Avança Negócios. Estes usuários não têm acesso à plataforma da Avança Imóveis.</p></div></div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil e situação</th><th>Último acesso</th><th>Senha</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong>{u.id === me.id && <span className="adm-muted"> (você)</span>}</td>
                <td>{u.email}</td>
                <td>
                  {u.id === me.id ? <span>{ROLE_LABELS[u.role]}</span> : (
                    <form action={updateUser} className="adm-actions" key={`${u.role}-${u.status}`}>
                      <input type="hidden" name="id" value={u.id} />
                      <select className="adm-input" name="role" defaultValue={u.role} aria-label={`Perfil de ${u.name}`} style={{ width: "auto" }}>
                        {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <select className="adm-input" name="status" defaultValue={u.status} aria-label={`Situação de ${u.name}`} style={{ width: "auto" }}>
                        <option value="ativo">Ativo</option><option value="suspenso">Suspenso</option>
                      </select>
                      <button className="adm-btn adm-btn--sm">Salvar</button>
                    </form>
                  )}
                </td>
                <td>{fmtDateTime(u.lastLoginAt)}</td>
                <td>{u.id === me.id ? <a href="/admin/conta">Minha conta</a> : <ResetPasswordForm userId={u.id} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="adm-card" style={{ marginTop: 24, maxWidth: 900 }}>
        <h2>Novo usuário</h2>
        <CreateUserForm />
      </section>
    </>
  );
}
