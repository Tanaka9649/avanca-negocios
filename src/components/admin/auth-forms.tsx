"use client";

import { useFormAction } from "@/components/admin/use-form-action";
import { loginAction, setupAction } from "@/lib/admin/auth-actions";

export function LoginForm() {
  const [state, onSubmit, pending] = useFormAction(loginAction, undefined);
  return (
    <form onSubmit={onSubmit} className="adm-form">
      {state?.error && <p className="adm-alert" role="alert">{state.error}</p>}
      <label className="adm-field"><span>E-mail</span><input name="email" type="email" autoComplete="username" required /></label>
      <label className="adm-field"><span>Senha</span><input name="password" type="password" autoComplete="current-password" required /></label>
      <button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}

export function SetupForm() {
  const [state, onSubmit, pending] = useFormAction(setupAction, undefined);
  return (
    <form onSubmit={onSubmit} className="adm-form">
      {state?.error && <p className="adm-alert" role="alert">{state.error}</p>}
      <label className="adm-field"><span>Código de primeiro acesso</span><input name="token" autoComplete="off" required /></label>
      <label className="adm-field"><span>Seu nome</span><input name="name" autoComplete="name" required /></label>
      <label className="adm-field"><span>E-mail</span><input name="email" type="email" autoComplete="username" required /></label>
      <label className="adm-field"><span>Senha</span><input name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
      <label className="adm-field"><span>Confirme a senha</span><input name="confirm" type="password" autoComplete="new-password" minLength={10} required /></label>
      <button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Criando…" : "Criar administrador"}</button>
    </form>
  );
}
