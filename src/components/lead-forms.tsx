"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { readAttribution, track } from "@/components/analytics";
import { WhatsappLink } from "@/components/whatsapp-link";
import { INVESTMENT_RANGES, OPERATING_TIMES, REVENUE_RANGES } from "@/lib/lead-input";

type Kind = "venda_empresa" | "compra_empresa";
type Errors = Record<string, string>;

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function Field({ name, label, optional, error, children }: { name: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="field" data-invalid={error ? "true" : undefined}>
      <label htmlFor={name}>{label}{optional && <small> (opcional)</small>}</label>
      {children}
      {error && <span className="field__error" id={`${name}-error`}>{error}</span>}
    </div>
  );
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function LeadForms() {
  const [kind, setKind] = useState<Kind>("venda_empresa");
  const [errors, setErrors] = useState<Errors>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Kind | null>(null);
  const [phone, setPhone] = useState("");
  const startedAt = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    const fromHash = () => {
      if (window.location.hash === "#comprar") setKind("compra_empresa");
      if (window.location.hash === "#vender") setKind("venda_empresa");
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const select = (k: Kind) => { setKind(k); setErrors({}); setAlert(null); setDone(null); };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim() || undefined;
    const payload = {
      kind,
      name: get("name"), whatsapp: phone, email: get("email"), city: get("city"), state: get("state"),
      message: get("message"), consent: fd.get("consent") === "on", website: String(fd.get("website") ?? ""),
      startedAt: startedAt.current, tracking: readAttribution(),
      ...(kind === "venda_empresa"
        ? { segment: get("segment"), operatingTime: get("operatingTime"), revenueRange: get("revenueRange"), priceExpectation: get("priceExpectation") }
        : { segment: get("segment"), region: get("region"), investmentRange: get("investmentRange"), goal: get("goal") }),
    };

    setSending(true); setAlert(null); setErrors({});
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        setDone(kind);
        track("generate_lead", { lead_type: kind === "venda_empresa" ? "venda_empresa" : "compra_empresa" });
        return;
      }
      setErrors(data.fieldErrors ?? {});
      setAlert(data.error ?? "Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.");
      const first = formRef.current?.querySelector<HTMLElement>("[data-invalid='true'] input, [data-invalid='true'] select, [data-invalid='true'] textarea");
      first?.focus();
    } catch {
      setAlert("Sem conexão no momento. Seus dados continuam no formulário; tente enviar novamente.");
    } finally {
      setSending(false);
    }
  }

  const err = (k: string) => errors[k];
  const aria = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-error` } : {});

  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Tipo de interesse">
        <button type="button" role="tab" className="tab" id="tab-vender" aria-controls="lead-panel" aria-selected={kind === "venda_empresa"} onClick={() => select("venda_empresa")}>Quero vender minha empresa</button>
        <button type="button" role="tab" className="tab" id="tab-comprar" aria-controls="lead-panel" aria-selected={kind === "compra_empresa"} onClick={() => select("compra_empresa")}>Quero comprar uma empresa</button>
      </div>

      <div id="lead-panel" role="tabpanel" aria-labelledby={kind === "venda_empresa" ? "tab-vender" : "tab-comprar"}>
        {done ? (
          <div className="success" role="status">
            <CheckCircle2 size={32} color="#e39282" aria-hidden="true" />
            <h3 className="h3">Recebemos suas informações.</h3>
            <p className="body">Nossa equipe vai entrar em contato pelo WhatsApp informado. Se preferir adiantar a conversa, chame agora.</p>
            <div className="actions" style={{ marginTop: 24 }}>
              <WhatsappLink context={done === "venda_empresa" ? "venda" : "compra"} className="btn btn--whatsapp">Continuar pelo WhatsApp</WhatsappLink>
            </div>
          </div>
        ) : (
          <form ref={formRef} key={kind} className="form" onSubmit={onSubmit} noValidate>
            {alert && <p className="form__alert" role="alert">{alert}</p>}
            <div className="hp" aria-hidden="true"><label>Não preencha<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

            <Field name="name" label="Nome completo" error={err("name")}><input id="name" name="name" autoComplete="name" required {...aria("name")} /></Field>
            <div className="form__row">
              <Field name="whatsapp" label="WhatsApp" error={err("whatsapp")}>
                <input id="whatsapp" name="whatsapp" inputMode="tel" autoComplete="tel-national" placeholder="(34) 00000-0000" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} required {...aria("whatsapp")} />
              </Field>
              <Field name="email" label="E-mail" error={err("email")}><input id="email" name="email" type="email" autoComplete="email" required {...aria("email")} /></Field>
            </div>
            <div className="form__row form__row--city">
              <Field name="city" label="Cidade" error={err("city")}><input id="city" name="city" autoComplete="address-level2" required {...aria("city")} /></Field>
              <Field name="state" label="Estado" error={err("state")}>
                <select id="state" name="state" defaultValue="MG" autoComplete="address-level1" {...aria("state")}>{UFS.map((u) => <option key={u}>{u}</option>)}</select>
              </Field>
            </div>

            {kind === "venda_empresa" ? (
              <>
                <div className="form__row">
                  <Field name="segment" label="Segmento da empresa" error={err("segment")}><input id="segment" name="segment" placeholder="Ex.: varejo de materiais de construção" required {...aria("segment")} /></Field>
                  <Field name="operatingTime" label="Tempo de operação" error={err("operatingTime")}>
                    <select id="operatingTime" name="operatingTime" defaultValue="" required {...aria("operatingTime")}><option value="" disabled>Selecione</option>{OPERATING_TIMES.map((o) => <option key={o}>{o}</option>)}</select>
                  </Field>
                </div>
                <div className="form__row">
                  <Field name="revenueRange" label="Faixa de faturamento anual" optional>
                    <select id="revenueRange" name="revenueRange" defaultValue=""><option value="">Selecione</option>{REVENUE_RANGES.map((o) => <option key={o}>{o}</option>)}</select>
                  </Field>
                  <Field name="priceExpectation" label="Expectativa de valor de venda" optional><input id="priceExpectation" name="priceExpectation" placeholder="Ex.: a definir" /></Field>
                </div>
              </>
            ) : (
              <>
                <div className="form__row">
                  <Field name="segment" label="Segmento de interesse" error={err("segment")}><input id="segment" name="segment" placeholder="Ex.: serviços, indústria, agro" required {...aria("segment")} /></Field>
                  <Field name="region" label="Região de interesse" error={err("region")}><input id="region" name="region" placeholder="Ex.: Triângulo Mineiro" required {...aria("region")} /></Field>
                </div>
                <div className="form__row">
                  <Field name="investmentRange" label="Faixa de investimento" optional>
                    <select id="investmentRange" name="investmentRange" defaultValue=""><option value="">Selecione</option>{INVESTMENT_RANGES.map((o) => <option key={o}>{o}</option>)}</select>
                  </Field>
                  <Field name="goal" label="Objetivo da aquisição" error={err("goal")}><input id="goal" name="goal" placeholder="Ex.: expandir para um novo mercado" required {...aria("goal")} /></Field>
                </div>
              </>
            )}

            <Field name="message" label="Informações complementares" optional><textarea id="message" name="message" maxLength={1500} /></Field>

            <div className="field" data-invalid={err("consent") ? "true" : undefined}>
              <label className="consent">
                <input type="checkbox" name="consent" required {...aria("consent")} />
                <span>Concordo com o uso destas informações para contato e atendimento, conforme a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</span>
              </label>
              {err("consent") && <span className="field__error" id="consent-error">{err("consent")}</span>}
            </div>

            <div><button type="submit" className="btn btn--dark" disabled={sending}>{sending ? "Enviando…" : "Enviar informações"}</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
