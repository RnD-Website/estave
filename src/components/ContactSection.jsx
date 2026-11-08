import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BRAND, PROPERTIES } from '../data/content'
import { useStore } from '../state/store'
import { Reveal, FadeUp, RollText, EASE } from './common'

/*
  The form validates in the browser and opens the visitor's email app with the
  enquiry pre-written to ESTAVÉ (a real, working hand-off — no fake "sent" state).
  To post to a CRM instead, set VITE_FORM_ENDPOINT (e.g. a Formspree URL); see README.
*/
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

const empty = { name: '', email: '', phone: '', property: '', date: '', type: 'In-person viewing', message: '' }

export default function ContactSection() {
  const inquiry = useStore((s) => s.inquiry)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (inquiry) setForm((f) => ({ ...f, property: inquiry }))
  }, [inquiry])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const today = new Date().toISOString().slice(0, 10)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.'
    if (!form.property) e.property = 'Choose a property, or “Not sure yet”.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return setStatus('')
    const subject = `Viewing request — ${form.property}`
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone && `Phone: ${form.phone}`,
      `Property: ${form.property}`,
      `Request: ${form.type}`,
      form.date && `Preferred date: ${form.date}`,
      '',
      form.message,
    ].filter((x) => x !== false && x !== undefined).join('\n')

    if (ENDPOINT) {
      setStatus('Sending…')
      try {
        const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...form, subject }) })
        if (!r.ok) throw new Error()
        setStatus('Thank you — a member of our team will reply within one working day.')
        setForm(empty)
      } catch {
        setStatus(`We couldn’t send that. Please email ${BRAND.email}.`)
      }
      return
    }
    window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setStatus('Your email app has opened with the request written out — just press send.')
  }

  const Field = ({ k, label, children, full }) => (
    <div className={`field${full ? ' field--full' : ''}${errors[k] ? ' has-error' : ''}`}>
      <label htmlFor={`f-${k}`}>{label}</label>
      {children}
      {errors[k] && <span className="field__err" id={`e-${k}`}>{errors[k]}</span>}
    </div>
  )
  const aria = (k) => ({ id: `f-${k}`, 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `e-${k}` : undefined })

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="contact__head">
        <p className="section-head__label muted" style={{ marginBottom: 14 }}>Contact</p>
        <Reveal as="h2" lines={['Arrange a', 'private viewing.']} className="display" />
        <FadeUp as="p" className="muted" delay={0.2}>
          In person or by video, any day but Sunday. We reply within one working day.
        </FadeUp>
        <span id="contact-title" className="sr-only">Contact ESTAVÉ</span>
      </div>

      <div className="contact__grid">
        <form className="form" onSubmit={submit} noValidate>
          {Field({ k: 'name', label: 'Your name', children: <input {...aria('name')} value={form.name} onChange={set('name')} autoComplete="name" /> })}
          {Field({ k: 'email', label: 'Email', children: <input {...aria('email')} type="email" value={form.email} onChange={set('email')} autoComplete="email" /> })}
          {Field({ k: 'phone', label: 'Phone (optional)', children: <input {...aria('phone')} type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" /> })}
          {Field({
            k: 'property',
            label: 'Property',
            children: (
              <select {...aria('property')} value={form.property} onChange={set('property')}>
                <option value="">Select…</option>
                {[...new Set(PROPERTIES.map((p) => p.name))].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
                <option value="Not sure yet">Not sure yet</option>
              </select>
            ),
          })}
          {Field({
            k: 'type',
            label: 'Viewing',
            children: (
              <select {...aria('type')} value={form.type} onChange={set('type')}>
                <option>In-person viewing</option>
                <option>Video viewing</option>
                <option>Call with an advisor</option>
              </select>
            ),
          })}
          {Field({ k: 'date', label: 'Preferred date', children: <input {...aria('date')} type="date" min={today} value={form.date} onChange={set('date')} /> })}
          {Field({ k: 'message', label: 'Anything we should know', full: true, children: <textarea {...aria('message')} rows={3} value={form.message} onChange={set('message')} /> })}
          <div className="form__foot">
            <button type="submit" className="btn" style={{ height: 40, padding: '0 22px' }}>
              <RollText>Request a viewing</RollText>
            </button>
            <AnimatePresence mode="wait">
              {status && (
                <motion.p key={status} className="form__status" role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                  {status}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </form>

        <aside className="contact__aside">
          <div>
            <p className="small muted">Viewings</p>
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            <br />
            <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a>
          </div>
          <div>
            <p className="small muted">Office</p>
            {BRAND.address.slice(1).map((l) => <p key={l}>{l}</p>)}
            <p className="muted">{BRAND.hours}, 10:00 – 19:00</p>
          </div>
          <div>
            <p className="small muted">Follow</p>
            <p style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {BRAND.socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>)}
            </p>
          </div>
        </aside>
      </div>

      <footer className="footer">
        <p className="footer__mark" aria-hidden="true">ESTAVÉ</p>
        <span>© {new Date().getFullYear()} ESTAVÉ Real Estate</span>
        <span className="muted">{BRAND.tagline}</span>
        <span className="muted small">Photography: Unsplash contributors</span>
      </footer>
    </section>
  )
}
