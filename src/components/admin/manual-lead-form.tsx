"use client";

import { useFormAction } from "@/components/admin/use-form-action";
import { createManualLead } from "@/lib/admin/lead-actions";
import { CATEGORY_LABELS, LEAD_CATEGORIES } from "@/lib/admin/labels";

export function ManualLeadForm() {
  const [state, onSubmit, pending] = useFormAction(createManualLead, undefined);
  return (
    <form onSubmit={onSubmit} className="adm-form">
      {state?.error && <p className="adm-alert" role="alert">{state.error}</p>}
      <div className="adm-row">
        <label className="adm-field"><span>Categoria</span>
          <select name="category" defaultValue="networking">{LEAD_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}</select>
        </label>
        <label className="adm-field"><span>Nome</span><input name="name" required maxLength={120} /></label>
      </div>
      <div className="adm-row">
        <label className="adm-field"><span>WhatsApp</span><input name="whatsapp" inputMode="tel" placeholder="(34) 00000-0000" required /></label>
        <label className="adm-field"><span>E-mail <small>(opcional)</small></span><input name="email" type="email" /></label>
      </div>
      <div className="adm-row">
        <label className="adm-field"><span>Cidade <small>(opcional)</small></span><input name="city" maxLength={80} /></label>
        <label className="adm-field"><span>UF <small>(opcional)</small></span><input name="state" maxLength={2} defaultValue="MG" /></label>
      </div>
      <label className="adm-field"><span>Observações <small>(opcional)</small></span><textarea name="message" maxLength={4000} /></label>
      <div><button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? "Salvando…" : "Cadastrar lead"}</button></div>
    </form>
  );
}
