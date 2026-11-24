"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { readAttribution, track } from "@/components/analytics";
import { WhatsappLink } from "@/components/whatsapp-link";
import { INVESTMENT_RANGES, OPERATING_TIMES, REVENUE_RANGES } from "@/lib/lead-options";

type Kind = "venda_empresa" | "compra_empresa";
type Errors = Record<string, string>;
type Values = Record<string, string>;

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

/** Campos de cada etapa. Erros vindos do servidor levam o usuário de volta à etapa certa. */
const STEP1 = ["name", "whatsapp", "city", "state", "segment"];

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validateStep1(v: Values, kind: Kind): Errors {
  const e: Errors = {};
  if ((v.name ?? "").trim().length < 3) e.name = "Informe seu nome completo.";
  const digits = (v.whatsapp ?? "").replace(/\D/g, "");
  if (digits.length < 10) e.whatsapp = "Informe o WhatsApp com DDD.";
  if ((v.city ?? "").trim().length < 2) e.city = "Informe a cidade.";
  if ((v.segment ?? "").trim().length < 2) e.segment = kind === "venda_empresa" ? "Informe o segmento da empresa." : "Informe o segmento de interesse.";
  return e;
}

export function LeadForms() {
  const [kind, setKind] = useState<Kind>("venda_empresa");
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<Values>({ state: "MG" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Kind | null>(null);
  const startedAt = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLParagraphElement>(null);

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

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = k === "whatsapp" ? maskPhone(e.target.value) : e.target.value;
    setValues((v) => ({ ...v, [k]: value }));
    if (errors[k]) setErrors((prev) => { const rest = { ...prev }; delete rest[k]; return rest; });
  };
  const val = (k: string) => values[k] ?? "";
  const err = (k: string) => errors[k];
  const aria = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-error` } : {});

  const focusFirstError = () => requestAnimationFrame(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  });

  // Trocar o interesse mantém os dados comuns (nome, WhatsApp, cidade, estado, segmento, e-mail, mensagem).
  const chooseKind = (k: Kind) => { setKind(k); setErrors({}); setAlert(null); };

  function next(e: React.FormEvent) {
    e.preventDefault();
    const e1 = validateStep1(values, kind);
    setErrors(e1);
    if (Object.keys(e1).length) { focusFirstError(); return; }
    setStep(2);
    track("lead_step", { step: 2, lead_type: kind });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    const g = (k: string) => (values[k] ?? "").trim() || undefined;
    const payload = {
      kind,
      name: g("name"), whatsapp: values.whatsapp ?? "", email: g("email"), city: g("city"), state: g("state"),
      message: g("message"), consent, website: String(new FormData(e.currentTarget as HTMLFormElement).get("website") ?? ""),
      startedAt: startedAt.current, tracking: readAttribution(), segment: g("segment"),
      ...(kind === "venda_empresa"
        ? { operatingTime: g("operatingTime"), revenueRange: g("revenueRange"), priceExpectation: g("priceExpectation") }
        : { region: g("region"), investmentRange: g("investmentRange"), goal: g("goal") }),
    };

    setSending(true); setAlert(null); setErrors({});
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        setDone(kind);
        track("generate_lead", { lead_type: kind });
        return;
      }
      const fe: Errors = data.fieldErrors ?? {};
      setErrors(fe);
      setAlert(data.error ?? "Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.");
      if (Object.keys(fe).some((k) => STEP1.includes(k))) setStep(1);
      focusFirstError();
    } catch {
      setAlert("Sem conexão no momento. Seus dados continuam no formulário; tente enviar novamente.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="lf lf--done" role="status">
        <span className="lf__check" aria-hidden="true"><Check size={26} strokeWidth={2} /></span>
        <h3 className="h3">Recebemos suas informações.</h3>
        <p className="body">Nossa equipe vai entrar em contato pelo WhatsApp informado. Se preferir adiantar a conversa, chame agora.</p>
        <div className="actions" style={{ marginTop: 24 }}>
          <WhatsappLink context={done === "venda_empresa" ? "venda" : "compra"} className="btn btn--whatsapp">Continuar pelo WhatsApp</WhatsappLink>
        </div>
      </div>
    );
  }

  const sell = kind === "venda_empresa";

  return (
    <form ref={formRef} className="lf" onSubmit={step === 1 ? next : submit} noValidate data-step={step}>
      <div className="lf__progress" aria-hidden="true"><span style={{ transform: `scaleX(${step / 2})` }} /></div>
      <p className="lf__step" ref={headingRef} tabIndex={-1}>
        Etapa {step} de 2 <span>· {step === 1 ? "Informações iniciais" : "Detalhes do seu interesse"}</span>
      </p>

      {alert && <p className="form__alert" role="alert">{alert}</p>}
      <div className="hp" aria-hidden="true"><label>Não preencha<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

      {step === 1 ? (
        <div className="lf__fields" key="s1">
          <fieldset className="lf__kind">
            <legend>Você quer</legend>
            <label className="lf__opt"><input type="radio" name="kind" checked={sell} onChange={() => chooseKind("venda_empresa")} /><span>Vender minha empresa</span></label>
            <label className="lf__opt"><input type="radio" name="kind" checked={!sell} onChange={() => chooseKind("compra_empresa")} /><span>Comprar uma empresa</span></label>
          </fieldset>

          <div className="field" data-invalid={err("name") ? "true" : undefined}>
            <label htmlFor="lf-name">Nome completo</label>
            <input id="lf-name" autoComplete="name" value={val("name")} onChange={set("name")} {...aria("name")} />
            {err("name") && <span className="field__error" id="name-error">{err("name")}</span>}
          </div>
          <div className="field" data-invalid={err("whatsapp") ? "true" : undefined}>
            <label htmlFor="lf-whatsapp">WhatsApp</label>
            <input id="lf-whatsapp" inputMode="tel" autoComplete="tel-national" placeholder="(34) 00000-0000" value={val("whatsapp")} onChange={set("whatsapp")} {...aria("whatsapp")} />
            {err("whatsapp") && <span className="field__error" id="whatsapp-error">{err("whatsapp")}</span>}
          </div>
          <div className="lf__row lf__row--city">
            <div className="field" data-invalid={err("city") ? "true" : undefined}>
              <label htmlFor="lf-city">Cidade</label>
              <input id="lf-city" autoComplete="address-level2" value={val("city")} onChange={set("city")} {...aria("city")} />
              {err("city") && <span className="field__error" id="city-error">{err("city")}</span>}
            </div>
            <div className="field" data-invalid={err("state") ? "true" : undefined}>
              <label htmlFor="lf-state">Estado</label>
              <select id="lf-state" autoComplete="address-level1" value={val("state")} onChange={set("state")} {...aria("state")}>{UFS.map((u) => <option key={u}>{u}</option>)}</select>
              {err("state") && <span className="field__error" id="state-error">{err("state")}</span>}
            </div>
          </div>
          <div className="field" data-invalid={err("segment") ? "true" : undefined}>
            <label htmlFor="lf-segment">{sell ? "Segmento da empresa" : "Segmento de interesse"}</label>
            <input id="lf-segment" placeholder={sell ? "Ex.: varejo de materiais de construção" : "Ex.: serviços, indústria, agro"} value={val("segment")} onChange={set("segment")} {...aria("segment")} />
            {err("segment") && <span className="field__error" id="segment-error">{err("segment")}</span>}
          </div>
          <div className="lf__actions">
            <button type="submit" className="btn btn--ink">Continuar</button>
            <span className="lf__hint">Leva menos de um minuto. Nenhum documento é pedido.</span>
          </div>
        </div>
      ) : (
        <div className="lf__fields" key="s2">
          <p className="lf__summary">
            {sell ? "Vender" : "Comprar"} · {val("segment")} · {val("city")}/{val("state")}
            <button type="button" className="lf__edit" onClick={() => setStep(1)}><ArrowLeft size={15} aria-hidden="true" />Alterar</button>
          </p>

          <div className="field" data-invalid={err("email") ? "true" : undefined}>
            <label htmlFor="lf-email">E-mail</label>
            <input id="lf-email" type="email" autoComplete="email" value={val("email")} onChange={set("email")} {...aria("email")} />
            {err("email") && <span className="field__error" id="email-error">{err("email")}</span>}
          </div>

          {sell ? (
            <>
              <div className="field" data-invalid={err("operatingTime") ? "true" : undefined}>
                <label htmlFor="lf-operatingTime">Tempo de operação</label>
                <select id="lf-operatingTime" value={val("operatingTime")} onChange={set("operatingTime")} {...aria("operatingTime")}><option value="" disabled>Selecione</option>{OPERATING_TIMES.map((o) => <option key={o}>{o}</option>)}</select>
                {err("operatingTime") && <span className="field__error" id="operatingTime-error">{err("operatingTime")}</span>}
              </div>
              <div className="lf__row">
                <div className="field">
                  <label htmlFor="lf-revenueRange">Faixa de faturamento anual <small>(opcional)</small></label>
                  <select id="lf-revenueRange" value={val("revenueRange")} onChange={set("revenueRange")}><option value="">Selecione</option>{REVENUE_RANGES.map((o) => <option key={o}>{o}</option>)}</select>
                </div>
                <div className="field">
                  <label htmlFor="lf-priceExpectation">Expectativa de valor <small>(opcional)</small></label>
                  <input id="lf-priceExpectation" placeholder="Ex.: a definir" value={val("priceExpectation")} onChange={set("priceExpectation")} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="lf__row">
                <div className="field" data-invalid={err("region") ? "true" : undefined}>
                  <label htmlFor="lf-region">Região de interesse</label>
                  <input id="lf-region" placeholder="Ex.: Triângulo Mineiro" value={val("region")} onChange={set("region")} {...aria("region")} />
                  {err("region") && <span className="field__error" id="region-error">{err("region")}</span>}
                </div>
                <div className="field">
                  <label htmlFor="lf-investmentRange">Faixa de investimento <small>(opcional)</small></label>
                  <select id="lf-investmentRange" value={val("investmentRange")} onChange={set("investmentRange")}><option value="">Selecione</option>{INVESTMENT_RANGES.map((o) => <option key={o}>{o}</option>)}</select>
                </div>
              </div>
              <div className="field" data-invalid={err("goal") ? "true" : undefined}>
                <label htmlFor="lf-goal">Objetivo da aquisição</label>
                <input id="lf-goal" placeholder="Ex.: expandir para um novo mercado" value={val("goal")} onChange={set("goal")} {...aria("goal")} />
                {err("goal") && <span className="field__error" id="goal-error">{err("goal")}</span>}
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="lf-message">Algo mais que devemos saber <small>(opcional)</small></label>
            <textarea id="lf-message" maxLength={1500} value={val("message")} onChange={set("message")} />
          </div>

          <div className="field" data-invalid={err("consent") ? "true" : undefined}>
            <label className="consent">
              <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (errors.consent) setErrors((prev) => { const r = { ...prev }; delete r.consent; return r; }); }} {...aria("consent")} />
              <span>Concordo com o uso destas informações para contato e atendimento, conforme a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</span>
            </label>
            {err("consent") && <span className="field__error" id="consent-error">{err("consent")}</span>}
          </div>

          <div className="lf__actions">
            <button type="button" className="btn btn--outline" onClick={() => setStep(1)}>Voltar</button>
            <button type="submit" className="btn btn--ink" disabled={sending} aria-busy={sending}>
              {sending ? <><span className="lf__spinner" aria-hidden="true" />Enviando</> : "Enviar informações"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
