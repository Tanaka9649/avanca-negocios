"use client";

import { useFormAction } from "@/components/admin/use-form-action";
import { changeOwnPassword, createUser, resetUserPassword } from "@/lib/admin/user-actions";

type S = { error?: string; ok?: string } | undefined;
const Feedback = ({ state }: { state: S }) => state?.error ? <p className="adm-alert" role="alert">{state.error}</p> : state?.ok ? <p className="adm-ok" role="status">{state.ok}</p> : null;

export function CreateUserForm() {
  const [state, onSubmit, pending] = useFormAction(createUser, undefined);
  return (
    <form onSubmit={onSubmit} className="adm-form">
      <Feedback state={state} />
      <div className="adm-row">
        <label className="adm-field"><span>Nome</span><input name="name" required maxLength={120} /></label>
        <label className="adm-field"><span>E-mail</span><input name="email" type="email" required autoComplete="off" /></label>
      </div>
      <div className="adm-row">
        <label className="adm-field"><span>Perfil</span>
          <select name="role" defaultValue="atendimento">
            <option value="admin">Administrador: acesso total, inclusive usuários</option>
            <option value="gestor">Gestor: tudo, exceto usuários</option>
            <option value="atendimento">Atendimento: dashboard e leads</option>
            <option value="editor">Editor de conteúdo: eventos, empresas e conteúdo</option>
          </select>
        </label>
        <label className="adm-field"><span>Senha inicial <small>(mín. 10 caracteres)</small></span><input name="password" type="password" minLength={10} required autoComplete="new-password" /></label>
      </div>
      <div><button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Criando…" : "Criar usuário"}</button></div>
    </form>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, onSubmit, pending] = useFormAction(resetUserPassword, undefined);
  return (
    <form onSubmit={onSubmit} className="adm-form" style={{ gap: 8 }}>
      <Feedback state={state} />
      <input type="hidden" name="id" value={userId} />
      <div className="adm-actions">
        <input className="adm-input" name="password" type="password" minLength={10} required placeholder="Nova senha" autoComplete="new-password" aria-label="Nova senha" style={{ width: 200 }} />
        <button className="adm-btn adm-btn--sm" disabled={pending}>Redefinir</button>
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, onSubmit, pending] = useFormAction(changeOwnPassword, undefined);
  return (
    <form onSubmit={onSubmit} className="adm-form">
      <Feedback state={state} />
      <label className="adm-field"><span>Senha atual</span><input name="current" type="password" required autoComplete="current-password" /></label>
      <label className="adm-field"><span>Nova senha <small>(mín. 10 caracteres)</small></span><input name="next" type="password" minLength={10} required autoComplete="new-password" /></label>
      <label className="adm-field"><span>Confirme a nova senha</span><input name="confirm" type="password" minLength={10} required autoComplete="new-password" /></label>
      <div><button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Salvando…" : "Alterar senha"}</button></div>
    </form>
  );
}
