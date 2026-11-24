"use client";

import { useState } from "react";
import { useFormAction } from "@/components/admin/use-form-action";
import { saveEvent } from "@/lib/admin/event-actions";
import { EVENT_STATUS_LABELS } from "@/lib/admin/labels";

export type EventFormValues = {
  id?: string; name: string; description: string; startsAt: string; endsAt: string; locationName: string; address: string;
  city: string; status: string; imageUrl: string | null; imageAlt: string;
};

export function EventForm({ values }: { values: EventFormValues }) {
  const [state, onSubmit, pending] = useFormAction(saveEvent, undefined);
  const [preview, setPreview] = useState<string | null>(values.imageUrl);
  const [tooBig, setTooBig] = useState(false);
  return (
    <form onSubmit={onSubmit} className="adm-form">
      {state?.error && <p className="adm-alert" role="alert">{state.error}</p>}
      {state?.ok && <p className="adm-ok" role="status">{state.ok}</p>}
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <label className="adm-field"><span>Nome do evento</span><input name="name" defaultValue={values.name} required maxLength={140} /></label>
      <label className="adm-field"><span>Descrição <small>(aparece no site)</small></span><textarea name="description" defaultValue={values.description} maxLength={1200} /></label>
      <div className="adm-row">
        <label className="adm-field"><span>Início</span><input name="startsAt" type="datetime-local" defaultValue={values.startsAt} required /></label>
        <label className="adm-field"><span>Término <small>(opcional)</small></span><input name="endsAt" type="datetime-local" defaultValue={values.endsAt} /></label>
        <label className="adm-field"><span>Status</span>
          <select name="status" defaultValue={values.status}>{Object.entries(EVENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
      </div>
      <div className="adm-row">
        <label className="adm-field"><span>Local</span><input name="locationName" defaultValue={values.locationName} placeholder="Ex.: Auditório da ACIF" maxLength={140} /></label>
        <label className="adm-field"><span>Endereço <small>(opcional)</small></span><input name="address" defaultValue={values.address} maxLength={200} /></label>
        <label className="adm-field"><span>Cidade</span><input name="city" defaultValue={values.city} required maxLength={80} /></label>
      </div>
      <div className="adm-row">
        <label className="adm-field"><span>Imagem de divulgação <small>(JPG, PNG ou WebP, até 4 MB)</small></span>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" onChange={(e) => {
            const f = e.target.files?.[0];
            setTooBig(Boolean(f && f.size > 4 * 1024 * 1024));
            setPreview(f ? URL.createObjectURL(f) : values.imageUrl);
          }} />
          {tooBig && <small style={{ color: "#b42318" }}>Arquivo acima de 4 MB. Reduza a imagem antes de enviar.</small>}
        </label>
        <label className="adm-field"><span>Descrição da imagem <small>(acessibilidade)</small></span><input name="imageAlt" defaultValue={values.imageAlt} maxLength={200} /></label>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview && <img className="adm-preview" src={preview} alt="Prévia da imagem de divulgação" />}
      {values.imageUrl && <label className="adm-check"><input type="checkbox" name="removeImage" />Remover imagem atual</label>}
      <div><button className="adm-btn adm-btn--primary" disabled={pending || tooBig}>{pending ? "Salvando…" : values.id ? "Salvar alterações" : "Cadastrar evento"}</button></div>
    </form>
  );
}
