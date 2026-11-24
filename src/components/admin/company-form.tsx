"use client";

import { useState } from "react";
import { useFormAction } from "@/components/admin/use-form-action";
import { saveCompany } from "@/lib/admin/company-actions";

export type CompanyValues = { id?: string; name: string; segment: string; instagram: string; website: string; logoUrl: string | null; active: boolean };

export function CompanyForm({ values }: { values: CompanyValues }) {
  const [state, onSubmit, pending] = useFormAction(saveCompany, undefined);
  const [preview, setPreview] = useState<string | null>(values.logoUrl);
  const [tooBig, setTooBig] = useState(false);
  return (
    <form onSubmit={onSubmit} className="adm-form">
      {state?.error && <p className="adm-alert" role="alert">{state.error}</p>}
      {state?.ok && <p className="adm-ok" role="status">{state.ok}</p>}
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="adm-row">
        <label className="adm-field"><span>Nome da empresa</span><input name="name" defaultValue={values.name} required maxLength={120} /></label>
        <label className="adm-field"><span>Segmento <small>(opcional)</small></span><input name="segment" defaultValue={values.segment} maxLength={80} /></label>
      </div>
      <div className="adm-row">
        <label className="adm-field"><span>Instagram <small>(opcional)</small></span><input name="instagram" defaultValue={values.instagram} placeholder="@empresa" maxLength={80} /></label>
        <label className="adm-field"><span>Website <small>(opcional)</small></span><input name="website" defaultValue={values.website} placeholder="empresa.com.br" maxLength={200} /></label>
      </div>
      <label className="adm-field"><span>Logo <small>(PNG com fundo transparente ou SVG, até 4 MB)</small></span>
        <input name="logo" type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" onChange={(e) => {
          const f = e.target.files?.[0];
          setTooBig(Boolean(f && f.size > 4 * 1024 * 1024));
          setPreview(f ? URL.createObjectURL(f) : values.logoUrl);
        }} />
        {tooBig && <small style={{ color: "#b42318" }}>Arquivo acima de 4 MB.</small>}
      </label>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview && <img className="adm-thumb adm-thumb--logo" style={{ width: 160, height: 100 }} src={preview} alt="Prévia da logo" />}
      {values.logoUrl && <label className="adm-check"><input type="checkbox" name="removeLogo" />Remover logo atual</label>}
      <label className="adm-check"><input type="checkbox" name="active" defaultChecked={values.active} />Exibir no site</label>
      <div><button className="adm-btn adm-btn--primary" disabled={pending || tooBig}>{pending ? "Salvando…" : values.id ? "Salvar alterações" : "Cadastrar empresa"}</button></div>
    </form>
  );
}
