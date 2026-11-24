"use client";

import { useState } from "react";
import { useFormAction } from "@/components/admin/use-form-action";
import { saveContact, saveFernanda } from "@/lib/admin/content-actions";
import type { ContactSettings, FernandaContent } from "@/lib/site-content";

function Feedback({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (state?.error) return <p className="adm-alert" role="alert">{state.error}</p>;
  if (state?.ok) return <p className="adm-ok" role="status">{state.ok}</p>;
  return null;
}

export function FernandaForm({ value }: { value: FernandaContent }) {
  const [state, onSubmit, pending] = useFormAction(saveFernanda, undefined);
  const [preview, setPreview] = useState(value.photoUrl);
  const roles = [...value.roles, ...Array(Math.max(0, 6 - value.roles.length)).fill({ title: "", org: "" })].slice(0, 6);
  return (
    <form onSubmit={onSubmit} className="adm-form">
      <Feedback state={state} />
      <section className="adm-card">
        <h2>Fotografia</h2>
        <div className="adm-actions" style={{ alignItems: "flex-start", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" style={{ width: 120, height: 170, objectFit: "cover", objectPosition: "top", borderRadius: 10, background: "#eceef6" }} />
          <div className="adm-form" style={{ flex: 1, minWidth: 240 }}>
            <label className="adm-field"><span>Nova foto <small>(recorte com fundo transparente funciona melhor; até 4 MB)</small></span>
              <input name="photo" type="file" accept="image/png,image/webp,image/jpeg" onChange={(e) => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : value.photoUrl); }} />
            </label>
            <label className="adm-field"><span>Descrição da foto <small>(acessibilidade)</small></span><input name="photoAlt" defaultValue={value.photoAlt} maxLength={200} /></label>
            {value.photoUrl !== "/pessoas/fernanda.webp" && <label className="adm-check"><input type="checkbox" name="resetPhoto" />Voltar para a foto original</label>}
          </div>
        </div>
      </section>
      <section className="adm-card">
        <h2>Cargos e posicionamentos</h2>
        <div className="adm-form">
          {roles.map((r, i) => (
            <div className="adm-row" key={i}>
              <label className="adm-field"><span>Cargo {i + 1}</span><input name={`role${i}`} defaultValue={r.title} maxLength={80} /></label>
              <label className="adm-field"><span>Empresa <small>(opcional)</small></span><input name={`org${i}`} defaultValue={r.org} maxLength={80} /></label>
            </div>
          ))}
        </div>
      </section>
      <section className="adm-card">
        <h2>Página de eventos</h2>
        <div className="adm-form">
          <label className="adm-field"><span>Título</span><input name="eventosHeadline" defaultValue={value.eventosHeadline} maxLength={160} required /></label>
          <label className="adm-field"><span>Texto <small>(separe parágrafos com uma linha em branco)</small></span><textarea name="eventosParagraphs" rows={7} defaultValue={value.eventosParagraphs.join("\n\n")} /></label>
        </div>
      </section>
      <section className="adm-card">
        <h2>Página de compra e venda de empresas</h2>
        <div className="adm-form">
          <label className="adm-field"><span>Título</span><input name="empresasHeadline" defaultValue={value.empresasHeadline} maxLength={160} required /></label>
          <label className="adm-field"><span>Texto <small>(separe parágrafos com uma linha em branco)</small></span><textarea name="empresasParagraphs" rows={7} defaultValue={value.empresasParagraphs.join("\n\n")} /></label>
        </div>
      </section>
      <div><button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Publicando…" : "Salvar e publicar"}</button></div>
    </form>
  );
}

export function ContactForm({ value }: { value: ContactSettings }) {
  const [state, onSubmit, pending] = useFormAction(saveContact, undefined);
  const local = value.whatsapp.replace(/^55/, "");
  return (
    <form onSubmit={onSubmit} className="adm-form">
      <Feedback state={state} />
      <label className="adm-field"><span>WhatsApp oficial <small>(DDD + número; vale para todos os botões do site)</small></span><input name="whatsapp" defaultValue={local} inputMode="tel" required /></label>
      <label className="adm-field"><span>E-mail de contato <small>(opcional)</small></span><input name="email" type="email" defaultValue={value.email} /></label>
      <div className="adm-row">
        <label className="adm-field"><span>Instagram <small>(opcional)</small></span><input name="instagram" defaultValue={value.instagram} placeholder="https://instagram.com/…" /></label>
        <label className="adm-field"><span>Facebook <small>(opcional)</small></span><input name="facebook" defaultValue={value.facebook} /></label>
        <label className="adm-field"><span>LinkedIn <small>(opcional)</small></span><input name="linkedin" defaultValue={value.linkedin} /></label>
      </div>
      <div><button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Salvando…" : "Salvar configurações"}</button></div>
    </form>
  );
}
