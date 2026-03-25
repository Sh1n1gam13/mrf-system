// ─────────────────────────────────────────────────────────────────
// UserDashboard.jsx — User-facing dashboard
// HS Technologies (Phils.), Inc. — MRF System
//
// Changes:
// - Status system updated: removed conformed_denied, added new statuses
// - Mock data corrected to match new flow
// - "Noted By" → "Noter/Noters", "Conformed By" → "Conformer/Conformers"
// - Inbox role column labels updated
// - Inbox detail badge: "Awaiting {role}" → "Awaiting noter/s to sign"
// - Table columns: "Noted By" → "Noter", "Conformed By" → "Conformer"
// - Next step labels updated to match new flow
// ─────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import AttachRequest from './AttachRequest'
import MatrixPage    from './MatrixPage'
import MRFForm       from './MRFForm'
import MRFDocument   from './MRFDocument'

// ── Mock data ─────────────────────────────────────────────────────
const MOCK_MY_REQUESTS = [
  { id: '4M-M-7900', partName: 'Brake Pad Assembly',    partNumber: 'BP-2201', date: '2026-03-10', status: 'pending_noted',
    notedBy: [{ name: 'J. Smith', dept: 'Engineering' }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production' }] },
  { id: '4M-M-7901', partName: 'Drive Shaft Coupling',  partNumber: 'DS-4402', date: '2026-03-11', status: 'noted_signed',
    notedBy: [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production' }] },
  { id: '4M-M-7902', partName: 'Filter Housing Unit',   partNumber: 'FH-1103', date: '2026-03-12', status: 'returned_by_requester',
    notedBy: [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }] },
  { id: '4M-M-7903', partName: 'Gear Box Seal',         partNumber: 'GB-3304', date: '2026-03-13', status: 'pending_conformed',
    notedBy: [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production' }, { name: 'P. Reyes', dept: 'Production' }] },
  { id: '4M-M-7904', partName: 'Coolant Pump Cover',    partNumber: 'CP-5505', date: '2026-03-14', status: 'pending_requester_review',
    notedBy: [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }] },
  { id: '4M-M-7905', partName: 'Valve Spring Retainer', partNumber: 'VS-6606', date: '2026-03-15', status: 'qa_denied',
    notedBy: [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }] },
  { id: '4M-M-7906', partName: 'Piston Ring Set',       partNumber: 'PR-7707', date: '2026-03-16', status: 'qa_review',
    notedBy: [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }] },
]

const MOCK_NOTIFICATIONS = [
  { id: 'n1', requestId: '4M-M-7902', type: 'returned',
    message: '4M-M-7902 — Conformers have reattached work. Review and approve or deny.',
    date: '2026-03-14' },
  { id: 'n2', requestId: '4M-M-7904', type: 'approved',
    message: '4M-M-7904 — Conformers have attached work and returned for your review.',
    date: '2026-03-15' },
  { id: 'n3', requestId: '4M-M-7905', type: 'denied',
    message: '4M-M-7905 was returned by QA — review remarks and resubmit.',
    date: '2026-03-16' },
]

// ── Status config ─────────────────────────────────────────────────
const STATUS = {
  draft:                      { label: 'Draft',                   bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },
  pending_noted:              { label: 'For Noting',              bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  noted_signed:               { label: 'Noted & Signed',          bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  pending_conformed:          { label: 'For Confirmation',        bg: '#FED7AA', color: '#9A3412', dot: '#F97316' },
  pending_requester_review:   { label: 'Pending Requester Review', bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  returned_by_requester:      { label: 'Returned by Requester',   bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  conformed_approved:         { label: 'Conformed & Approved',    bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  qa_review:                  { label: 'QA Review',               bg: '#F3E8FF', color: '#6B21A8', dot: '#A855F7' },
  qa_draft:                   { label: 'QA Draft',                bg: '#F3E8FF', color: '#6B21A8', dot: '#A855F7' },
  awaiting_managers_approval: { label: "Awaiting Manager's Approval", bg: '#E0E7FF', color: '#3730A3', dot: '#6366F1' },
  qa_denied:                  { label: 'Returned by QA',          bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  qa_approved:                { label: 'QA Approved',             bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  final_approved:             { label: 'Final Approved',          bg: '#DCFCE7', color: '#14532D', dot: '#16A34A' },
  issuance:                   { label: 'Issued',                  bg: '#E0E7FF', color: '#3730A3', dot: '#6366F1' },
}

const NOTIF_STYLE = {
  returned: { bg: '#FFEDD5', border: '#F97316', color: '#9A3412', icon: '↩' },
  approved: { bg: '#DCFCE7', border: '#22C55E', color: '#166534', icon: '✓' },
  denied:   { bg: '#FEE2E2', border: '#EF4444', color: '#991B1B', icon: '✕' },
}

// ── Mock inbox ────────────────────────────────────────────────────
const MOCK_INBOX = [
  {
    id: '4M-M-7900', partName: 'Brake Pad Assembly', partNumber: 'BP-2201',
    fromDept: 'Production', fromPerson: 'R. Abanico', date: '2026-03-10',
    role: 'noter', assignedTo: 'John Smith', assignedCount: 1,
    status: 'pending_noted',
    applicationDate: '2026-03-10', targetDate: '2026-03-20', preparedBy: 'R. Abanico',
    factoryNo: 'F-0042', checkedReasons: { engg: true }, specifyValues: {},
    detailedContent: 'Replace brake pad with improved heat-resistant material.',
    reasonForChange: 'High failure rate in high-temperature environments.',
    alterations: ['WPS'], altSpecify: '', pkgIp: '', pkgFg: '',
    preparedBySig: null, notedBy1Sig: null, notedBy2Sig: null, conformedBySig: null,
    notedBy1Name: '', notedBy1Date: '', notedBy2Name: '', notedBy2Date: '',
    conformedByName: '', conformedByDate: '', mrfAttachments: [],
  },
  {
    id: '4M-M-7898', partName: 'Valve Housing Cover', partNumber: 'VH-3301',
    fromDept: 'Engineering', fromPerson: 'M. Santos', date: '2026-03-08',
    role: 'conformer', assignedTo: 'Maria Cruz', assignedCount: 2,
    status: 'pending_conformed',
    applicationDate: '2026-03-08', targetDate: '2026-03-25', preparedBy: 'M. Santos',
    factoryNo: 'F-0039', checkedReasons: { correction: true }, specifyValues: {},
    detailedContent: 'Correction on valve housing dimensions per customer spec.',
    reasonForChange: 'Customer reported dimensional non-conformance.',
    alterations: ['SIM'], altSpecify: '', pkgIp: '', pkgFg: '',
    preparedBySig: null, notedBy1Sig: null, notedBy1Name: 'J. Reyes', notedBy1Date: '2026-03-09',
    notedBy2Sig: null, notedBy2Name: '', notedBy2Date: '',
    conformedByName: '', conformedByDate: '', conformedBySig: null, mrfAttachments: [],
  },
]

const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Dashboard'               },
  { id: 'matrix',          label: 'Matrix'                  },
  { id: 'request_form',    label: 'Request Form'            },
  { id: 'inbox',           label: 'Inbox'                   },
  { id: 'attach_approved', label: 'Attach Approved Request' },
  { id: 'attach_denied',   label: 'Attach Denied Request'   },
  { id: 'final_approved',  label: 'Final Approved'          },
]

// ── Icons ─────────────────────────────────────────────────────────
function IcoDashboard() { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg> }
function IcoMatrix()    { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><line x1="1" y1="5.5" x2="15" y2="5.5" stroke="currentColor" strokeWidth="1"/><line x1="1" y1="10.5" x2="15" y2="10.5" stroke="currentColor" strokeWidth="1"/><line x1="5.5" y1="1" x2="5.5" y2="15" stroke="currentColor" strokeWidth="1"/></svg> }
function IcoForm()      { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1"/><line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1"/><line x1="5" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1"/></svg> }
function IcoApproved()  { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IcoDenied()    { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><line x1="6" y1="6" x2="10" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="10" y1="6" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IcoFinal()     { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 9.5l2 2 4-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1"/></svg> }
function IcoUpload()    { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M10 13V7M7 10l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IcoInbox()     { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 9h3.5l1.5 2h4l1.5-2H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }

const NAV_ICONS = {
  dashboard: <IcoDashboard />, matrix: <IcoMatrix />, request_form: <IcoForm />,
  inbox: <IcoInbox />, attach_approved: <IcoApproved />, attach_denied: <IcoDenied />, final_approved: <IcoFinal />,
}

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS[status] || { label: status, bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: cfg.bg, fontSize: '11px', fontWeight: '600', color: cfg.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Sig Upload ────────────────────────────────────────────────────
function SigUpload({ value, onChange }) {
  const ref = useRef(null)
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => onChange(e.target.result)
    reader.readAsDataURL(file)
  }
  return value ? (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img src={value} alt="sig" style={{ height: '72px', maxWidth: '240px', objectFit: 'contain', border: '1px solid #E5E5E5', borderRadius: '4px', display: 'block' }} />
      <button onClick={() => onChange(null)} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
    </div>
  ) : (
    <>
      <input ref={ref} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div onClick={() => ref.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        style={{ border: '1.5px dashed #D1D5DB', borderRadius: '6px', padding: '16px', cursor: 'pointer', background: '#FAFAFA', textAlign: 'center', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#F5C200'; e.currentTarget.style.background = '#FFFBEB' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#FAFAFA' }}>
        <p style={{ margin: 0, fontSize: '20px' }}>✍</p>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888' }}>Upload e-signature (PNG/JPG) or drag & drop</p>
      </div>
    </>
  )
}

// ── InboxView ─────────────────────────────────────────────────────
function InboxView({ items }) {
  const [viewing,    setViewing]    = useState(null)
  const [myName,     setMyName]     = useState('')
  const [mySig,      setMySig]      = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors,     setErrors]     = useState({})
  const docRef = useRef(null)

  const inputSt = { width: '100%', padding: '9px 12px', fontSize: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontFamily: 'Arial', color: '#111', boxSizing: 'border-box', outline: 'none' }
  const Label = ({ children, required }) => (
    <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>
      {children}{required && <span style={{ color: '#EF4444' }}> *</span>}
    </label>
  )

  const resetPanel = () => { setViewing(null); setMyName(''); setMySig(null); setErrors({}) }

  // ── Role label helpers ─────────────────────────────────────────
  // 'noter' / 'conformer', count from item.assignedCount
  const getRoleLabel = (role, count) => {
    if (role === 'noter')    return count > 1 ? 'Noters'    : 'Noter'
    if (role === 'conformer') return count > 1 ? 'Conformers' : 'Conformer'
    return role
  }

  const handleSubmit = async () => {
    const e = {}
    if (!myName.trim()) e.myName = 'Your name is required.'
    if (!mySig)         e.mySig  = 'E-signature is required.'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 900))
    setSubmitting(false)
    const roleLabel = getRoleLabel(viewing.role, viewing.assignedCount)
    toast.success('Signature submitted', {
      description: `${myName} signed as ${roleLabel} — returned to ${viewing.fromPerson} (${viewing.fromDept}).`,
    })
    resetPanel()
  }

  // ── Detail view ──────────────────────────────────────────────
  if (viewing) {
    const roleLabel    = getRoleLabel(viewing.role, viewing.assignedCount)
    const isNoter      = viewing.role === 'noter'
    const awaitingText = isNoter
      ? `Awaiting ${viewing.assignedCount > 1 ? 'noters' : 'noter'} to sign`
      : `Awaiting ${viewing.assignedCount > 1 ? 'conformers' : 'conformer'} to sign`

    const liveMrf = {
      applicationDate: viewing.applicationDate, partNumber: viewing.partNumber,
      partName: viewing.partName, targetDate: viewing.targetDate,
      preparedBy: viewing.preparedBy, factoryNo: viewing.factoryNo,
      checkedReasons: viewing.checkedReasons, specifyValues: viewing.specifyValues,
      detailedContent: viewing.detailedContent, reasonForChange: viewing.reasonForChange,
      alterations: viewing.alterations, altSpecify: viewing.altSpecify,
      pkgIp: viewing.pkgIp, pkgFg: viewing.pkgFg, preparedBySig: viewing.preparedBySig,
      notedBy1Name:  isNoter ? myName : viewing.notedBy1Name,
      notedBy1Sig:   isNoter ? mySig  : viewing.notedBy1Sig,
      notedBy2Name:  viewing.notedBy2Name || '',
      notedBy2Sig:   viewing.notedBy2Sig  || null,
      notedBy3Name:  '', notedBy3Sig: null,
      conformedBySignatories: !isNoter
        ? [{ sig: mySig, name: myName }]
        : (viewing.conformedByName ? [{ sig: viewing.conformedBySig, name: viewing.conformedByName }] : []),
      // No requesterDecision yet — Requester hasn't acted
      requesterDecision: null,
      qaDecision: null,
    }

    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 0', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={resetPanel} style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            ← Back to Inbox
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
                {roleLabel} — {viewing.partName}
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                From <strong>{viewing.fromPerson}</strong> ({viewing.fromDept}) · {viewing.id} · Assigned to: <strong>{viewing.assignedTo}</strong>
              </p>
            </div>
            {/* Badge: "Awaiting noter/s to sign" or "Awaiting conformer/s to sign" */}
            <span style={{ padding: '5px 14px', background: '#FEF3C7', color: '#92400E', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid #FDE68A', whiteSpace: 'nowrap' }}>
              {awaitingText}
            </span>
          </div>
        </div>

        {/* MRF Document */}
        <div ref={docRef} style={{ background: '#fff', padding: '12px', border: '1px solid #ccc', width: '794px', boxSizing: 'border-box', marginBottom: '24px' }}>
          <MRFDocument mrf={liveMrf} qa={{}} showQA={false} showDistribution={false} />
        </div>

        {/* Signing panel */}
        <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ background: '#111', padding: '14px 20px' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#F5C200' }}>
              ✍ {roleLabel} — Sign this MRF
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
              You are signing as: <strong style={{ color: '#fff' }}>{roleLabel}</strong>
              {viewing.assignedTo ? ` · Assigned to: ${viewing.assignedTo}` : ''}
            </p>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '14px' }}>
              <Label required>E-Signature</Label>
              <SigUpload value={mySig} onChange={v => { setMySig(v); setErrors(p => ({ ...p, mySig: null })) }} />
              {errors.mySig && <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.mySig}</p>}
            </div>
            <div style={{ marginBottom: '14px' }}>
              <Label required>Your Name</Label>
              <input type="text" placeholder="e.g. J. Smith" value={myName}
                onChange={e => { setMyName(e.target.value); setErrors(p => ({ ...p, myName: null })) }}
                style={{ ...inputSt, border: errors.myName ? '1px solid #EF4444' : '1px solid #E5E5E5' }} />
              {errors.myName && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.myName}</p>}
            </div>
            {mySig && myName && (
              <div style={{ padding: '10px 14px', background: '#DCFCE7', borderRadius: '6px', fontSize: '12px', color: '#166534', fontWeight: '600', marginBottom: '14px' }}>
                ✓ Your signature is visible on the document above. Scroll up to verify before submitting.
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => docRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={{ padding: '10px 22px', background: 'transparent', border: '1px solid #111', borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: '#111', cursor: 'pointer', fontFamily: 'Arial' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            🔍 Review
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ padding: '10px 28px', background: submitting ? '#555' : '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Arial', minWidth: '160px' }}>
            {submitting ? 'Submitting...' : '✓ Submit Signature'}
          </button>
        </div>
      </div>
    )
  }

  // ── Inbox list ──────────────────────────────────────────────
  const thSt = { padding: '10px 14px', fontSize: '10px', fontWeight: '700', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', background: '#FAFAFA', borderBottom: '0.5px solid #F0F0F0', whiteSpace: 'nowrap' }

  return (
    <div style={{ padding: '32px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>Inbox</h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
          MRFs sent to your department awaiting your signature · {items.length} request{items.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E5E5', overflow: 'hidden' }}>
        {items.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
            <p style={{ fontSize: '24px', margin: '0 0 8px' }}>📭</p>
            No MRFs in your inbox.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['Control No.', 'Part Name', 'Part No.', 'From', 'Assigned To', 'Role', 'Date', 'Action'].map(h => (
                  <th key={h} style={thSt}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const roleLabel = getRoleLabel(item.role, item.assignedCount)
                const isNoter   = item.role === 'noter'
                return (
                  <tr key={item.id}
                    style={{ borderBottom: i < items.length - 1 ? '0.5px solid #F0F0F0' : 'none', background: '#FFFBEB' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF9C3'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FFFBEB'}>
                    <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontWeight: '700', color: '#111' }}>{item.id}</td>
                    <td style={{ padding: '13px 14px', fontWeight: '600', color: '#111' }}>{item.partName}</td>
                    <td style={{ padding: '13px 14px', color: '#888', fontFamily: 'monospace', fontSize: '12px' }}>{item.partNumber}</td>
                    <td style={{ padding: '13px 14px', color: '#555' }}>{item.fromPerson} <span style={{ color: '#aaa', fontSize: '11px' }}>({item.fromDept})</span></td>
                    <td style={{ padding: '13px 14px', color: '#111', fontWeight: '600' }}>{item.assignedTo}</td>
                    <td style={{ padding: '13px 14px' }}>
                      {/* Role badge — "Noter" or "Conformer" */}
                      <span style={{ padding: '3px 10px', background: isNoter ? '#F3E8FF' : '#DBEAFE', color: isNoter ? '#6B21A8' : '#1E40AF', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                        {roleLabel}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px', color: '#888', whiteSpace: 'nowrap' }}>{item.date}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <button onClick={() => { setViewing(item); setMyName(''); setMySig(null); setErrors({}) }}
                        style={{ padding: '7px 16px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        View →
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function UserDashboard({ user, onLogout, onNavigate }) {
  const [activeNav,    setActiveNav]    = useState('dashboard')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dismissedIds, setDismissedIds] = useState([])
  const [notifOpen,    setNotifOpen]    = useState(false)

  const inboxCount = MOCK_INBOX.length
  const total    = MOCK_MY_REQUESTS.length
  const pending  = MOCK_MY_REQUESTS.filter(r => ['pending_noted','pending_conformed','pending_requester_review','qa_review','returned_by_requester'].includes(r.status)).length
  const approved = MOCK_MY_REQUESTS.filter(r => ['qa_approved','final_approved','issuance'].includes(r.status)).length
  const denied   = MOCK_MY_REQUESTS.filter(r => ['qa_denied'].includes(r.status)).length

  const activeNotifs = MOCK_NOTIFICATIONS.filter(n => !dismissedIds.includes(n.id))

  const filtered = MOCK_MY_REQUESTS.filter(r => {
    const q = searchQuery.toLowerCase()
    const matchSearch = q === '' || r.id.toLowerCase().includes(q) || r.partName.toLowerCase().includes(q) || r.partNumber.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const today    = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // ── Next step map (updated for new flow) ───────────────────────
  const nextStepMap = {
    noted_signed:             { text: '→ Forward to Conformer/s', color: '#166534' },
    pending_requester_review: { text: '→ Review Conformers\' Work', color: '#1E40AF' },
    conformed_approved:       { text: '→ Send to QA',             color: '#166534' },
    returned_by_requester:    { text: '↩ Revise & Reattach',      color: '#991B1B' },
    qa_denied:                { text: '→ Edit & Resubmit to QA',  color: '#991B1B' },
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', background: '#F5F5F5' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <div style={{ width: '220px', flexShrink: 0, background: '#111', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        <div style={{ height: '4px', background: '#F5C200', flexShrink: 0 }} />

        <div style={{ padding: '18px 18px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/hst-logo.jpg" alt="HS Technologies" style={{ width: '44px', height: '44px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
            <div style={{ display:'none', width:'44px', height:'44px', background:'#F5C200', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontWeight:'700', fontSize:'12px', color:'#111', flexShrink:0 }}>HST</div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', color: '#F5C200', textTransform: 'uppercase', fontWeight: '700' }}>HS Technologies</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>MRF System</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ id, label }) => {
            const isActive = activeNav === id
            return (
              <button key={id} onClick={() => setActiveNav(id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 18px', background: isActive ? 'rgba(245,194,0,0.12)' : 'transparent', border: 'none', borderLeft: isActive ? '3px solid #F5C200' : '3px solid transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', color: isActive ? '#F5C200' : 'rgba(255,255,255,0.45)' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                <span style={{ flexShrink: 0 }}>{NAV_ICONS[id]}</span>
                <span style={{ fontSize: '12px', fontWeight: isActive ? '700' : '400', lineHeight: '1.3' }}>{label}</span>
                {id === 'inbox' && inboxCount > 0 && (
                  <span style={{ marginLeft: 'auto', minWidth: '18px', height: '18px', background: '#EF4444', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: '700', padding: '0 5px' }}>{inboxCount}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F5C200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#111', flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</p>
              <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{user?.department || '—'}</p>
            </div>
          </div>
          <button onClick={onLogout}
            style={{ width: '100%', padding: '7px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Arial', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '0.5px solid #E5E5E5', padding: '14px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
              Welcome, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{user?.department || 'Department'} · {today}</p>
          </div>

          {/* Bell notification dropdown */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setNotifOpen(o => !o)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', background: '#111', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '12px', fontWeight: '600', fontFamily: 'Arial' }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#F5C200" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              Notifications
              {activeNotifs.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#EF4444', color: '#fff', fontSize: '10px', fontWeight: '700', minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{activeNotifs.length}</span>
              )}
            </button>
            {notifOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={() => setNotifOpen(false)} />
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '360px', background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '12px', zIndex: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '0.5px solid #F0F0F0' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#111' }}>Notifications</span>
                    {activeNotifs.length > 0 && (
                      <button onClick={() => setDismissedIds(MOCK_NOTIFICATIONS.map(n => n.id))} style={{ fontSize: '11px', color: '#F5C200', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>Mark all as read</button>
                    )}
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {activeNotifs.length === 0 ? (
                      <li style={{ padding: '28px', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '20px' }}>🔔</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#bbb' }}>No new notifications</p>
                      </li>
                    ) : activeNotifs.map(n => {
                      const ns = NOTIF_STYLE[n.type] || NOTIF_STYLE.returned
                      return (
                        <li key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '8px', background: ns.bg, marginBottom: '4px' }}>
                          <div style={{ marginTop: '2px', width: '26px', height: '26px', borderRadius: '50%', background: ns.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>{ns.icon}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '12px', color: ns.color, lineHeight: '1.5' }}>{n.message}</p>
                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#aaa' }}>{n.date}</p>
                          </div>
                          <button onClick={() => setDismissedIds(prev => [...prev, n.id])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: ns.color, opacity: 0.5, flexShrink: 0, padding: '0 2px', lineHeight: 1 }}>×</button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Page body */}
        <div style={{ padding: '22px 26px', flex: 1 }}>

          {activeNav === 'request_form' && (
            <MRFForm user={user} onNavigate={(dest) => { if (dest === 'dashboard') setActiveNav('dashboard') }} onBack={() => setActiveNav('dashboard')} />
          )}
          {activeNav === 'inbox' && <InboxView items={MOCK_INBOX} user={user} />}
          {activeNav === 'attach_approved' && <AttachRequest type="approved" user={user} />}
          {activeNav === 'attach_denied'   && <AttachRequest type="denied"   user={user} />}
          {activeNav === 'matrix'          && <MatrixPage />}
          {activeNav === 'final_approved'  && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🔧</div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111' }}>Final Approved</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>This page is coming soon.</p>
            </div>
          )}

          {activeNav === 'dashboard' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '18px' }}>
              {[
                { label: 'Total Requests', value: total,    accent: '#111',    textColor: '#111'    },
                { label: 'In Progress',    value: pending,  accent: '#F5C200', textColor: '#92400E' },
                { label: 'Approved',       value: approved, accent: '#22C55E', textColor: '#166534' },
                { label: 'Denied',         value: denied,   accent: '#EF4444', textColor: '#991B1B' },
              ].map(({ label, value, accent, textColor }) => (
                <div key={label} style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderTop: `3px solid ${accent}`, borderRadius: '8px', padding: '16px 18px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '10px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: textColor, fontFamily: 'Georgia, serif' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '22px' }}>
              <button onClick={() => setActiveNav('matrix')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'Arial' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.background = '#FAFAFA' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.background = '#fff' }}>
                <div style={{ width: '36px', height: '36px', background: '#F5F5F5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#555' }}><IcoMatrix /></div>
                <div><p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#111' }}>Matrix</p><p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Reference guide for documents</p></div>
              </button>
              <button onClick={() => onNavigate('create')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#111', border: '0.5px solid #111', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'Arial' }}
                onMouseEnter={e => e.currentTarget.style.background = '#222'}
                onMouseLeave={e => e.currentTarget.style.background = '#111'}>
                <div style={{ width: '36px', height: '36px', background: '#F5C200', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: '#111' }}><IcoForm /></span></div>
                <div><p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#F5C200' }}>New Request</p><p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Submit a new MRF form</p></div>
              </button>
              <button onClick={() => setActiveNav('attach_approved')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'Arial' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.background = '#FAFAFA' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.background = '#fff' }}>
                <div style={{ width: '36px', height: '36px', background: '#F5F5F5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#555' }}><IcoUpload /></div>
                <div><p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#111' }}>Attach Files</p><p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Upload request documents</p></div>
              </button>
            </div>

            {/* MRF Requests table */}
            <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111' }}>MRF Requests</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" placeholder="Search requests..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ padding: '7px 12px', fontSize: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', outline: 'none', width: '200px', fontFamily: 'Arial', background: '#FAFAFA', color: '#111' }} />
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '7px 12px', fontSize: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', outline: 'none', background: '#FAFAFA', fontFamily: 'Arial', color: '#111', cursor: 'pointer' }}>
                    <option value="all">All Status</option>
                    {Object.entries(STATUS).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA', borderBottom: '0.5px solid #E5E5E5' }}>
                      {/* Column headers: "Noted By" → "Noter", "Conformed By" → "Conformer" */}
                      {['Control No.', 'Part Name', 'Part No.', 'Date Filed', 'Noter', 'Conformer', 'Status', 'Next Step', 'Action'].map(col => (
                        <th key={col} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: '#bbb', fontSize: '13px' }}>No requests found.</td></tr>
                    ) : filtered.map((req, i) => {
                      const isReturned = ['returned_by_requester','qa_denied'].includes(req.status)
                      const nextStep   = nextStepMap[req.status] || null
                      const confActive = ['pending_conformed','pending_requester_review','returned_by_requester','conformed_approved','qa_review','qa_draft','awaiting_managers_approval','qa_denied','qa_approved','final_approved','issuance'].includes(req.status)

                      return (
                        <tr key={req.id}
                          style={{ borderBottom: i < filtered.length - 1 ? '0.5px solid #F0F0F0' : 'none', background: isReturned ? '#FFFBEB' : 'transparent', transition: 'background 0.1s' }}
                          onMouseEnter={e => { if (!isReturned) e.currentTarget.style.background = '#FAFAFA' }}
                          onMouseLeave={e => { if (!isReturned) e.currentTarget.style.background = 'transparent' }}>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#111', fontWeight: '700' }}>{req.id}</td>
                          <td style={{ padding: '12px 16px', color: '#111', fontWeight: '600' }}>{req.partName}</td>
                          <td style={{ padding: '12px 16px', color: '#888', fontSize: '12px' }}>{req.partNumber}</td>
                          <td style={{ padding: '12px 16px', color: '#888', fontSize: '12px', whiteSpace: 'nowrap' }}>{req.date}</td>

                          {/* Noter column */}
                          <td style={{ padding: '12px 16px' }}>
                            {(req.notedBy || []).map((n, idx) => (
                              <div key={idx} style={{ marginBottom: idx < (req.notedBy.length - 1) ? '6px' : 0 }}>
                                <div style={{ fontSize: '12px', color: '#111', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {n.signed && <span style={{ color: '#22C55E', fontSize: '11px', fontWeight: '700' }}>✓</span>}
                                  {n.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#aaa' }}>{n.dept}</div>
                              </div>
                            ))}
                          </td>

                          {/* Conformer column */}
                          <td style={{ padding: '12px 16px' }}>
                            {(req.conformedBy || []).map((n, idx) => (
                              <div key={idx} style={{ marginBottom: idx < (req.conformedBy.length - 1) ? '6px' : 0, opacity: confActive ? 1 : 0.4 }}>
                                <div style={{ fontSize: '12px', color: '#111', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {n.signed && <span style={{ color: '#22C55E', fontSize: '11px', fontWeight: '700' }}>✓</span>}
                                  {n.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#aaa' }}>{n.dept}</div>
                              </div>
                            ))}
                          </td>

                          <td style={{ padding: '12px 16px' }}><StatusBadge status={req.status} /></td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: nextStep ? '600' : '400', color: nextStep ? nextStep.color : '#bbb', whiteSpace: 'nowrap' }}>
                            {nextStep ? nextStep.text : '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => onNavigate && onNavigate('view', req.id)}
                              style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #E5E5E5', borderRadius: '5px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'Arial', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#F5C200'; e.currentTarget.style.borderColor = '#111' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#E5E5E5' }}>
                              View →
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '10px 16px', borderTop: '0.5px solid #F0F0F0', background: '#FAFAFA' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#bbb' }}>Showing {filtered.length} of {total} requests</p>
              </div>
            </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
