import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const CARD_OPTIONS = [
  { value: 'VISA_CLASSIC', label: 'Visa Classic', price: '15 000 GNF', desc: 'Pour les achats quotidiens' },
  { value: 'VISA_GOLD', label: 'Visa Gold', price: '25 000 GNF', desc: 'Avantages et plafonds élevés' },
  { value: 'VISA_BUSINESS', label: 'Visa Business', price: '35 000 GNF', desc: 'Pour les professionnels' },
]

const STEPS = ['Informations', 'Carte', 'Documents', 'Confirmation']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < current ? 'bg-green-500 text-white' :
              i === current ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
              'bg-gray-200 text-gray-500'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 hidden sm:block ${i === current ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 max-w-12 ${i < current ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function FormApp() {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState({})

  // Lire le convId depuis l'URL pour pré-remplissage
  const convId = new URLSearchParams(window.location.search).get('conv')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    cardType: 'VISA_CLASSIC',
    convId: convId || '',
  })
  const [files, setFiles] = useState([])

  // Pré-remplir depuis le bot WhatsApp
  useEffect(() => {
    if (!convId) return
    axios.get(`${API}/form/prefill?conv=${convId}`)
      .then(res => {
        const data = res.data
        setForm(f => ({ ...f, ...data }))
      })
      .catch(() => {})
  }, [convId])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validateStep0() {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis'
    if (!form.lastName.trim()) errs.lastName = 'Nom requis'
    if (!form.phone.trim()) errs.phone = 'Téléphone requis'
    else if (!/^\+?[\d\s\-]{8,15}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Numéro invalide'
    if (!form.address.trim()) errs.address = 'Adresse requise'
    return errs
  }

  function validateStep1() {
    const errs = {}
    if (!form.cardType) errs.cardType = 'Veuillez choisir un type de carte'
    return errs
  }

  function next() {
    let errs = {}
    if (step === 0) errs = validateStep0()
    if (step === 1) errs = validateStep1()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setStep(s => s + 1)
  }

  function back() { setStep(s => s - 1) }

  function onFileChange(e) {
    const selected = Array.from(e.target.files)
    const MAX = 5
    if (selected.length + files.length > MAX) {
      alert(`Maximum ${MAX} fichiers`)
      return
    }
    setFiles(f => [...f, ...selected])
  }

  function removeFile(i) {
    setFiles(f => f.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      files.forEach(file => fd.append('documents', file))

      await axios.post(`${API}/form/submit`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDone(true)
    } catch (err) {
      alert(err.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dossier créé !</h1>
        <p className="text-gray-600 mb-6">
          Votre demande de carte Visa a bien été enregistrée. Notre équipe vous contactera dans les <strong>48h ouvrables</strong>.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          Vous pouvez fermer cette page. Nous vous contacterons sur WhatsApp.
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">U</div>
          <h1 className="text-xl font-bold text-gray-900">Demande de Carte Visa</h1>
          <p className="text-gray-500 text-sm">Remplissez le formulaire pour finaliser votre commande</p>
        </div>

        <StepIndicator current={step} />

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

          {/* Step 0 - Informations personnelles */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 text-lg">Vos informations</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Prénom *</label>
                  <input className="input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="ex: Mamadou" />
                  {errors.firstName && <p className="error">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="label">Nom *</label>
                  <input className="input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="ex: Diallo" />
                  {errors.lastName && <p className="error">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="label">Téléphone associé à la carte *</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+224 621 000 000" />
                {errors.phone && <p className="error">{errors.phone}</p>}
              </div>
              <div>
                <label className="label">Email <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="votre@email.com" />
              </div>
              <div>
                <label className="label">Adresse complète *</label>
                <textarea className="input resize-none" rows={2} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Quartier, commune, ville" />
                {errors.address && <p className="error">{errors.address}</p>}
              </div>
            </div>
          )}

          {/* Step 1 - Type de carte */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 text-lg">Choisir votre carte</h2>
              <div className="space-y-3">
                {CARD_OPTIONS.map(card => (
                  <button
                    key={card.value}
                    onClick={() => set('cardType', card.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      form.cardType === card.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">💳 {card.label}</p>
                        <p className="text-sm text-gray-500">{card.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-700">{card.price}</p>
                        {form.cardType === card.value && <span className="text-green-500 text-sm">✓ Sélectionné</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.cardType && <p className="error">{errors.cardType}</p>}
            </div>
          )}

          {/* Step 2 - Documents */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 text-lg">Pièces justificatives</h2>
              <p className="text-sm text-gray-500">Joignez une photo de votre pièce d'identité (recto et verso). Formats acceptés : JPG, PNG, PDF. Max 10MB par fichier.</p>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                <span className="text-3xl mb-1">📎</span>
                <span className="text-sm font-medium text-gray-600">Cliquer pour ajouter des fichiers</span>
                <span className="text-xs text-gray-400">ou glisser-déposer</span>
                <input type="file" multiple accept="image/*,.pdf" className="hidden" onChange={onFileChange} />
              </label>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{f.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                        <span className="text-sm text-gray-700 truncate">{f.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 ml-2 shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400">
                💡 Vous pouvez aussi envoyer vos photos directement sur WhatsApp si vous préférez.
              </p>
            </div>
          )}

          {/* Step 3 - Récapitulatif */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 text-lg">Récapitulatif</h2>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Nom complet</span><span className="font-medium">{form.lastName} {form.firstName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Téléphone carte</span><span className="font-medium">{form.phone}</span></div>
                {form.email && <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{form.email}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Adresse</span><span className="font-medium text-right max-w-xs">{form.address}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type de carte</span><span className="font-medium text-blue-700">{CARD_OPTIONS.find(c => c.value === form.cardType)?.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Documents</span><span className="font-medium">{files.length} fichier{files.length !== 1 ? 's' : ''}</span></div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
                ⚠️ Vérifiez vos informations avant de soumettre. Votre dossier sera créé immédiatement.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={back} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                ← Retour
              </button>
            )}
            {step < 3 ? (
              <button onClick={next} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Suivant →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi en cours...</>
                ) : '✅ Soumettre ma demande'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Vos données sont sécurisées · UBA © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
