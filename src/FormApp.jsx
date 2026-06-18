import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const CARD_OPTIONS = [
  {
    value: "VISA_CLASSIC",
    label: "Visa Classic",
    price: "15 000 GNF",
    desc: "Pour les achats quotidiens",
    icon: "💳",
    colorClass: "classic",
  },
  {
    value: "VISA_GOLD",
    label: "Visa Gold",
    price: "25 000 GNF",
    desc: "Avantages et plafonds élevés",
    icon: "💎",
    colorClass: "gold",
  },
  {
    value: "VISA_BUSINESS",
    label: "Visa Business",
    price: "35 000 GNF",
    desc: "Pour les professionnels",
    icon: "🏢",
    colorClass: "biz",
  },
];

const STEPS = ["Informations", "Carte", "Documents", "Confirmation"];

// ─── Stepper ───────────────────────────────────────────────────────────────
function Stepper({ current }) {
  return (
    <div className="uba-stepper">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <div className="step-item">
              <div
                className={`step-circle ${done ? "done" : active ? "active" : ""}`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={`step-label ${active ? "active" : ""}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${i < current ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────────────────────
function Field({ id, label, optional, error, children }) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>
        {label}
        {optional ? (
          <span className="field-opt"> (optionnel)</span>
        ) : (
          <span className="field-req"> *</span>
        )}
      </label>
      {children}
      {error && <p className="err-msg">{error}</p>}
    </div>
  );
}

// ─── Step 0 — Informations ─────────────────────────────────────────────────
function StepInfos({ form, errors, onChange }) {
  return (
    <div className="glass-card anim-up">
      <p className="section-title">Vos informations personnelles</p>

      <div className="field-row two">
        <Field id="firstName" label="Prénom" error={errors.firstName}>
          <input
            id="firstName"
            className={`uba-input ${errors.firstName ? "err" : ""}`}
            value={form.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            placeholder="ex: Mamadou"
          />
        </Field>
        <Field id="lastName" label="Nom" error={errors.lastName}>
          <input
            id="lastName"
            className={`uba-input ${errors.lastName ? "err" : ""}`}
            value={form.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            placeholder="ex: Diallo"
          />
        </Field>
      </div>

      <div className="field-row">
        <Field
          id="phone"
          label="Téléphone associé à la carte"
          error={errors.phone}
        >
          <input
            id="phone"
            className={`uba-input ${errors.phone ? "err" : ""}`}
            type="tel"
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+224 621 000 000"
          />
        </Field>
      </div>

      <div className="field-row">
        <Field id="email" label="Email" optional error={errors.email}>
          <input
            id="email"
            className="uba-input"
            type="email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="votre@email.com"
          />
        </Field>
      </div>

      <div className="field-row">
        <Field id="address" label="Adresse complète" error={errors.address}>
          <textarea
            id="address"
            className={`uba-textarea ${errors.address ? "err" : ""}`}
            rows={2}
            value={form.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Quartier, commune, ville"
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Step 1 — Carte ────────────────────────────────────────────────────────
function StepCard({ form, onChange }) {
  return (
    <div className="glass-card anim-up">
      <p className="section-title">Choisir votre carte</p>
      <div className="card-options">
        {CARD_OPTIONS.map((card) => {
          const selected = form.cardType === card.value;
          return (
            <button
              key={card.value}
              className={`card-opt ${selected ? "selected" : ""}`}
              onClick={() => onChange("cardType", card.value)}
              type="button"
            >
              <div className={`card-icon-wrap ${card.colorClass}`}>
                <span className="card-icon">{card.icon}</span>
              </div>
              <div className="card-info">
                <p className="card-name">{card.label}</p>
                <p className="card-desc">{card.desc}</p>
              </div>
              <div className="card-right">
                <span className="card-price">{card.price}</span>
                <div className={`card-check ${selected ? "checked" : ""}`}>
                  {selected && <span className="check-mark">✓</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2 — Documents ────────────────────────────────────────────────────
function StepDocs({ files, onAdd, onRemove }) {
  const handleChange = useCallback(
    (e) => {
      const selected = Array.from(e.target.files);
      if (selected.length + files.length > 5) {
        alert("Maximum 5 fichiers");
        return;
      }
      onAdd(selected);
      e.target.value = "";
    },
    [files, onAdd],
  );

  return (
    <div className="glass-card anim-up">
      <p className="section-title">Pièces justificatives</p>
      <p className="section-hint">
        Photo de votre pièce d'identité recto et verso. Formats acceptés : JPG,
        PNG, PDF. Max 10 Mo par fichier.
      </p>

      <label className="drop-zone">
        <span className="drop-icon">📎</span>
        <p className="drop-txt">Cliquer pour ajouter des fichiers</p>
        <p className="drop-hint">ou glisser-déposer ici</p>
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          style={{ display: "none" }}
          onChange={handleChange}
        />
      </label>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div key={i} className="file-item">
              <span className="file-type-icon">
                {f.type.startsWith("image/") ? "🖼️" : "📄"}
              </span>
              <span className="file-item-name">{f.name}</span>
              <span className="file-item-size">
                {(f.size / 1024).toFixed(0)} Ko
              </span>
              <button
                className="file-remove"
                onClick={() => onRemove(i)}
                aria-label="Supprimer ce fichier"
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="docs-hint">
        💡 Vous pouvez aussi envoyer vos photos directement sur WhatsApp si vous
        préférez.
      </p>
    </div>
  );
}

// ─── Step 3 — Récapitulatif ────────────────────────────────────────────────
function StepRecap({ form, files }) {
  const card = CARD_OPTIONS.find((c) => c.value === form.cardType);
  const rows = [
    { key: "Nom complet", val: `${form.lastName} ${form.firstName}` },
    { key: "Téléphone carte", val: form.phone },
    form.email && { key: "Email", val: form.email },
    { key: "Adresse", val: form.address },
    { key: "Type de carte", val: card?.label, blue: true },
    {
      key: "Documents joints",
      val: `${files.length} fichier${files.length !== 1 ? "s" : ""}`,
    },
  ].filter(Boolean);

  return (
    <div className="glass-card anim-up">
      <p className="section-title">Récapitulatif de votre demande</p>
      <div className="recap-rows">
        {rows.map((row) => (
          <div key={row.key} className="recap-row">
            <span className="recap-key">{row.key}</span>
            <span className={`recap-val ${row.blue ? "blue" : ""}`}>
              {row.val}
            </span>
          </div>
        ))}
      </div>
      <div className="notice">
        <span className="notice-icon">⚠️</span>
        <p className="notice-txt">
          Vérifiez vos informations avant de soumettre. Votre dossier sera créé
          immédiatement.
        </p>
      </div>
    </div>
  );
}

// ─── Done ──────────────────────────────────────────────────────────────────
function Done() {
  return (
    <div className="done-wrap">
      <div className="done-icon">✅</div>
      <h2 className="done-title">Dossier créé avec succès !</h2>
      <p className="done-sub">
        Votre demande de carte Visa a bien été enregistrée. Notre équipe vous
        contactera dans les <strong>48h ouvrables</strong>.
      </p>
      <div className="done-badge">
        Vous pouvez fermer cette page. Nous vous recontacterons sur WhatsApp.
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function FormApp() {
  const convId = new URLSearchParams(window.location.search).get("conv") || "";

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    cardType: "VISA_CLASSIC",
    convId,
  });

  // Pré-remplissage depuis le bot
  useEffect(() => {
    if (!convId) return;
    axios
      .get(`${API}/form/prefill?conv=${convId}`)
      .then((res) => setForm((f) => ({ ...f, ...res.data })))
      .catch(() => {});
  }, [convId]);

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e = {};
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = "Prénom requis";
      if (!form.lastName.trim()) e.lastName = "Nom requis";
      if (!form.phone.trim()) e.phone = "Téléphone requis";
      else if (!/^\+?[\d\s\-]{8,15}$/.test(form.phone.replace(/\s/g, "")))
        e.phone = "Numéro invalide";
      if (!form.address.trim()) e.address = "Adresse requise";
    }
    return e;
  }

  function next() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  function back() {
    setErrors({});
    setStep((s) => s - 1);
  }

  function addFiles(selected) {
    setFiles((f) => [...f, ...selected]);
  }

  function removeFile(i) {
    setFiles((f) => f.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      files.forEach((file) => fd.append("documents", file));
      await axios.post(`${API}/form/submit`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDone(true);
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="uba-root">
        <style>{CSS}</style>
        <Done />
      </div>
    );
  }

  return (
    <div className="uba-root">
      <style>{CSS}</style>

      <div className="uba-header">
        <div className="uba-logo">U</div>
        <h1 className="uba-title">Demande de carte Visa</h1>
        <p className="uba-sub">Complétez votre dossier en quelques étapes</p>
      </div>

      <Stepper current={step} />

      {step === 0 && (
        <StepInfos form={form} errors={errors} onChange={onChange} />
      )}
      {step === 1 && <StepCard form={form} onChange={onChange} />}
      {step === 2 && (
        <StepDocs files={files} onAdd={addFiles} onRemove={removeFile} />
      )}
      {step === 3 && <StepRecap form={form} files={files} />}

      <div className="nav-row">
        {step > 0 && (
          <button className="btn-back" onClick={back} type="button">
            ← Retour
          </button>
        )}
        {step < 3 ? (
          <button className="btn-next" onClick={next} type="button">
            Suivant →
          </button>
        ) : (
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={submitting}
            type="button"
          >
            {submitting ? (
              <>
                <span className="spin" /> Envoi en cours...
              </>
            ) : (
              "✅ Soumettre ma demande"
            )}
          </button>
        )}
      </div>

      <p className="uba-footer">
        Vos données sont sécurisées · UBA © {new Date().getFullYear()}
      </p>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const CSS = `
  .uba-root {
    min-height: 100vh;
    background: #EFF6FF;
    padding: 2rem 1rem;
    font-family: system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .uba-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .uba-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 1.5rem;
  }

  .uba-logo {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: #2563EB;
    color: #fff;
    font-size: 22px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(37,99,235,0.3);
    box-shadow: 0 4px 16px rgba(37,99,235,0.2);
  }

  .uba-title {
    font-size: 20px;
    font-weight: 700;
    color: #1E3A8A;
    text-align: center;
  }

  .uba-sub {
    font-size: 14px;
    color: #64748B;
    text-align: center;
  }

  /* Stepper */
  .uba-stepper {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    width: 100%;
    max-width: 480px;
  }

  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .step-circle {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    border: 2px solid #CBD5E1;
    color: #94A3B8;
    background: #fff;
    transition: all 0.3s ease;
  }

  .step-circle.done {
    background: #2563EB;
    border-color: #2563EB;
    color: #fff;
  }

  .step-circle.active {
    background: #fff;
    border-color: #2563EB;
    color: #2563EB;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.12);
  }

  .step-label {
    font-size: 11px;
    color: #94A3B8;
    white-space: nowrap;
  }

  .step-label.active {
    color: #2563EB;
    font-weight: 600;
  }

  .step-line {
    height: 2px;
    flex: 1;
    max-width: 48px;
    background: #CBD5E1;
    margin-bottom: 18px;
    transition: background 0.3s;
  }

  .step-line.done { background: #2563EB; }

  /* Glass card */
  .glass-card {
    width: 100%;
    max-width: 480px;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(37,99,235,0.15);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 0;
    box-shadow: 0 4px 24px rgba(37,99,235,0.08);
  }

  .anim-up {
    animation: fadeUp 0.3s ease forwards;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #1E40AF;
    margin-bottom: 1rem;
  }

  .section-hint {
    font-size: 13px;
    color: #64748B;
    margin-bottom: 12px;
  }

  /* Fields */
  .field-row {
    display: grid;
    gap: 12px;
    margin-bottom: 12px;
  }

  .field-row.two { grid-template-columns: 1fr 1fr; }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    letter-spacing: 0.3px;
  }

  .field-req { color: #2563EB; }
  .field-opt { color: #94A3B8; font-weight: 400; }

  .uba-input, .uba-textarea {
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid #CBD5E1;
    background: rgba(255,255,255,0.7);
    color: #1E293B;
    font-size: 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }

  .uba-input:focus, .uba-textarea:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    background: #fff;
  }

  .uba-input.err, .uba-textarea.err { border-color: #E24B4A; }
  .uba-textarea { resize: none; }
  .err-msg { font-size: 11px; color: #A32D2D; }

  /* Card options */
  .card-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card-opt {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1.5px solid #E2E8F0;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255,255,255,0.7);
    text-align: left;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .card-opt::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 0;
    background: #2563EB;
    transition: height 0.2s;
  }

  .card-opt.selected::after { height: 3px; }

  .card-opt:hover {
    border-color: #93C5FD;
    background: rgba(219,234,254,0.3);
  }

  .card-opt.selected {
    border-color: #2563EB;
    background: rgba(219,234,254,0.35);
  }

  .card-icon-wrap {
    width: 46px;
    height: 46px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card-icon-wrap.classic { background: #DBEAFE; }
  .card-icon-wrap.gold    { background: #FEF3C7; }
  .card-icon-wrap.biz     { background: #DCFCE7; }
  .card-icon { font-size: 22px; }

  .card-info { flex: 1; min-width: 0; }
  .card-name { font-size: 14px; font-weight: 600; color: #1E293B; }
  .card-desc { font-size: 12px; color: #64748B; margin-top: 2px; }

  .card-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }

  .card-price { font-size: 13px; font-weight: 600; color: #2563EB; }

  .card-check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #CBD5E1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .card-check.checked {
    background: #2563EB;
    border-color: #2563EB;
  }

  .check-mark { font-size: 11px; color: #fff; font-weight: 700; }

  /* Upload */
  .drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 1.75rem 1rem;
    border: 2px dashed rgba(37,99,235,0.25);
    border-radius: 12px;
    cursor: pointer;
    background: rgba(219,234,254,0.15);
    transition: all 0.2s;
  }

  .drop-zone:hover {
    border-color: #2563EB;
    background: rgba(219,234,254,0.3);
  }

  .drop-icon { font-size: 28px; }
  .drop-txt  { font-size: 14px; color: #475569; font-weight: 500; }
  .drop-hint { font-size: 12px; color: #94A3B8; }

  .file-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 10px;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(219,234,254,0.3);
    border: 1px solid rgba(37,99,235,0.15);
  }

  .file-type-icon { font-size: 16px; flex-shrink: 0; }

  .file-item-name {
    flex: 1;
    font-size: 13px;
    color: #1E293B;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-item-size { font-size: 11px; color: #94A3B8; flex-shrink: 0; }

  .file-remove {
    background: none;
    border: none;
    color: #94A3B8;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 0 4px;
    border-radius: 4px;
    transition: color 0.2s;
  }

  .file-remove:hover { color: #E24B4A; }
  .docs-hint { font-size: 12px; color: #94A3B8; margin-top: 12px; }

  /* Recap */
  .recap-rows { display: flex; flex-direction: column; }

  .recap-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid rgba(37,99,235,0.08);
  }

  .recap-row:last-child { border-bottom: none; }
  .recap-key { font-size: 13px; color: #64748B; }

  .recap-val {
    font-size: 13px;
    font-weight: 600;
    color: #1E293B;
    text-align: right;
    max-width: 55%;
  }

  .recap-val.blue { color: #2563EB; }

  .notice {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(254,243,199,0.5);
    border: 1px solid rgba(234,179,8,0.2);
    margin-top: 14px;
  }

  .notice-icon { font-size: 15px; flex-shrink: 0; }
  .notice-txt  { font-size: 12px; color: #64748B; }

  /* Navigation */
  .nav-row {
    display: flex;
    gap: 10px;
    margin-top: 1.25rem;
    width: 100%;
    max-width: 480px;
  }

  .btn-back {
    flex: 1;
    padding: 11px;
    border-radius: 8px;
    border: 1px solid #CBD5E1;
    background: rgba(255,255,255,0.7);
    color: #475569;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
  }

  .btn-back:hover { background: #F1F5F9; }

  .btn-next {
    flex: 2;
    padding: 11px;
    border-radius: 8px;
    border: none;
    background: #2563EB;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    font-family: inherit;
    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  }

  .btn-next:hover  { background: #1E40AF; }
  .btn-next:active { transform: scale(0.98); }

  .btn-submit {
    flex: 2;
    padding: 11px;
    border-radius: 8px;
    border: none;
    background: #16A34A;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(22,163,74,0.25);
  }

  .btn-submit:hover    { background: #166534; }
  .btn-submit:active   { transform: scale(0.98); }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Spinner */
  .spin {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Done */
  .done-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 3rem 1rem;
    text-align: center;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
  }

  .done-icon {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: #DCFCE7;
    border: 2px solid rgba(22,163,74,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }

  .done-title {
    font-size: 22px;
    font-weight: 700;
    color: #1E3A8A;
  }

  .done-sub {
    font-size: 14px;
    color: #64748B;
    line-height: 1.6;
  }

  .done-badge {
    background: rgba(219,234,254,0.5);
    border: 1px solid rgba(37,99,235,0.15);
    border-radius: 10px;
    padding: 12px 18px;
    font-size: 13px;
    color: #1E40AF;
    max-width: 340px;
  }

  /* Footer */
  .uba-footer {
    margin-top: 1.25rem;
    font-size: 12px;
    color: #94A3B8;
    text-align: center;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .field-row.two { grid-template-columns: 1fr; }
    .step-label { display: none; }
    .step-line { max-width: 28px; }
  }
`;
