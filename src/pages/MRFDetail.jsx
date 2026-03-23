// ─────────────────────────────────────────────────────────────────
// MRFDetail.jsx
// Status-driven MRF view/action page
// Handles all flows: Noted By, Conformed By, Preparer actions, QA
//
// STATUS FLOW:
// draft → pending_noted → pending_forward → pending_conformed
//   → pending_approval → qa_review → approved → encoding → issuance
//   [conformed denies] → conformed_denied → pending_conformed (loop)
//   [QA denies]        → qa_denied → draft (preparer edits & resubmits)
//
// TODO: Replace MOCK_MRF with Firestore fetch by mrfId
// ─────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import MRFDocument from './MRFDocument'
import MRFForm     from './MRFForm'

// ── Mock MRF data map — keyed by ID to match dashboard rows ──────
// TODO: Replace with Firestore fetch by mrfId once Firebase connected
const BASE_MRF = {
  department:      'Engineering',
  preparedBy:      'Juan Dela Cruz',
  applicationDate: '2026-03-10',
  targetDate:      '2026-03-20',
  factoryNo:       'F-0042',
  checkedReasons:  { engg: true, quality: true },
  specifyValues:   {},
  detailedContent: 'Replace current filter housing with improved corrosion-resistant material.',
  reasonForChange: 'Frequent failure due to material degradation.',
  alterations:     ['WPS', 'PIS/PMIIS'],
  altSpecify:      '', pkgIp: '', pkgFg: '',
  preparedBySig:   null,
  notedBy1Name: '', notedBy1Date: '', notedBy1Sig: null,
  notedBy2Name: '', notedBy2Date: '', notedBy2Sig: null,
  conformedByName: '', conformedByDate: '', conformedBySig: null,
  qaRemarks: '', dateReceived: '', controlNo: '', evalNeed: '',
  recommendation: '', approvalCategory: '', approvalDecision: '',
  distributionCopy: [], deniedReason: '',
}

const MOCK_MRF_MAP = {
  '4M-M-7900': { ...BASE_MRF, id: '4M-M-7900', partName: 'Brake Pad Assembly',    partNumber: 'BP-2201', status: 'pending_noted',
    assignedNoters:    [{ name: 'J. Smith', dept: 'Engineering' }, { name: 'R. Cruz', dept: 'Engineering' }],
    assignedConformers:[{ name: 'M. Cruz', dept: 'Production' }] },
  '4M-M-7901': { ...BASE_MRF, id: '4M-M-7901', partName: 'Drive Shaft Coupling',  partNumber: 'DS-4402', status: 'noted_signed',
    assignedNoters:    [{ name: 'J. Santos', dept: 'Engineering', sig: null }],
    assignedConformers:[{ name: 'M. Cruz', dept: 'Production' }],
    notedBy1Name: 'J. Santos' },
  '4M-M-7902': { ...BASE_MRF, id: '4M-M-7902', partName: 'Filter Housing Unit',   partNumber: 'FH-1103', status: 'conformed_denied',
    assignedNoters:    [{ name: 'J. Santos', dept: 'Engineering', sig: null }],
    assignedConformers:[{ name: 'M. Cruz', dept: 'Production', sig: null }],
    notedBy1Name: 'J. Santos',
    conformedByName: 'M. Cruz', conformedDecision: 'denied',
    deniedReason: 'Incomplete documentation. Please attach the required inspection report before re-submitting.' },
  '4M-M-7903': { ...BASE_MRF, id: '4M-M-7903', partName: 'Gear Box Seal',         partNumber: 'GB-3304', status: 'pending_conformed',
    assignedNoters:    [{ name: 'J. Santos', dept: 'Engineering', sig: null }],
    assignedConformers:[{ name: 'M. Cruz', dept: 'Production' }, { name: 'P. Reyes', dept: 'Production' }],
    notedBy1Name: 'J. Santos' },
  '4M-M-7904': { ...BASE_MRF, id: '4M-M-7904', partName: 'Coolant Pump Cover',    partNumber: 'CP-5505', status: 'pending_approval',
    assignedNoters:    [{ name: 'J. Santos', dept: 'Engineering', sig: null }],
    assignedConformers:[{ name: 'M. Cruz', dept: 'Production', sig: null }],
    notedBy1Name: 'J. Santos', conformedByName: 'M. Cruz', conformedDecision: 'approved' },
  '4M-M-7905': { ...BASE_MRF, id: '4M-M-7905', partName: 'Valve Spring Retainer', partNumber: 'VS-6606', status: 'qa_denied',
    assignedNoters:    [{ name: 'J. Santos', dept: 'Engineering', sig: null }],
    assignedConformers:[{ name: 'M. Cruz', dept: 'Production', sig: null }],
    notedBy1Name: 'J. Santos', conformedByName: 'M. Cruz', conformedDecision: 'approved',
    qaRemarks: 'Insufficient justification for material change. Please provide test data supporting the proposed modification.' },
  '4M-M-7906': { ...BASE_MRF, id: '4M-M-7906', partName: 'Piston Ring Set',       partNumber: 'PR-7707', status: 'qa_review',
    assignedNoters:    [{ name: 'J. Santos', dept: 'Engineering', sig: null }],
    assignedConformers:[{ name: 'M. Cruz', dept: 'Production', sig: null }],
    notedBy1Name: 'J. Santos', conformedByName: 'M. Cruz', conformedDecision: 'approved' },
}
const FALLBACK_MRF = { ...BASE_MRF, id: 'UNKNOWN', partName: 'Unknown', partNumber: '—', status: 'draft' }

// ── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:             { label: 'Draft',              bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },
  pending_noted:     { label: 'For Noting',         bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  noted_signed:    { label: 'Noted & Signed',     bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  pending_conformed: { label: 'For Confirmation',   bg: '#FED7AA', color: '#9A3412', dot: '#F97316' },
  conformed_denied:  { label: 'Returned by Conformer', bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  pending_approval:  { label: 'For Your Approval',  bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  qa_review:         { label: 'QA Review',          bg: '#F3E8FF', color: '#6B21A8', dot: '#A855F7' },
  qa_denied:         { label: 'Returned by QA',     bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  approved:          { label: 'Approved',            bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  encoding:          { label: 'Encoding',            bg: '#E0E7FF', color: '#3730A3', dot: '#6366F1' },
  issuance:          { label: 'Issued',              bg: '#DCFCE7', color: '#14532D', dot: '#16A34A' },
}

// ── E-signature upload ────────────────────────────────────────────
function SigUpload({ value, onChange }) {
  const ref = useRef(null)
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => onChange(e.target.result)
    reader.readAsDataURL(file)
  }
  const inputStyle = { width: '100%', padding: '9px 12px', fontSize: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontFamily: 'Arial', color: '#111', boxSizing: 'border-box', outline: 'none', background: '#fff' }

  return value ? (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img src={value} alt="sig" style={{ height: '64px', maxWidth: '220px', objectFit: 'contain', border: '1px solid #E5E5E5', borderRadius: '4px', display: 'block' }} />
      <button onClick={() => onChange(null)} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
    </div>
  ) : (
    <>
      <input ref={ref} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div onClick={() => ref.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        style={{ border: '1.5px dashed #D1D5DB', borderRadius: '6px', padding: '14px', cursor: 'pointer', background: '#FAFAFA', textAlign: 'center', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#F5C200'; e.currentTarget.style.background = '#FFFBEB' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#FAFAFA' }}
      >
        <p style={{ margin: 0, fontSize: '18px' }}>✍</p>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888' }}>Upload e-signature (PNG/JPG)</p>
      </div>
    </>
  )
}

// ── Action Panel ──────────────────────────────────────────────────
function ActionPanel({ title, subtitle, accent = '#111', children }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden', marginTop: '24px' }}>
      <div style={{ background: accent, padding: '14px 20px' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#F5C200' }}>{title}</p>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{subtitle}</p>}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function FieldLabel({ children }) {
  return <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555', marginBottom: '7px' }}>{children}</label>
}

// ── Main Component ────────────────────────────────────────────────
export default function MRFDetail({ mrfId, user, onNavigate, onBack }) {
  const initialMrf   = MOCK_MRF_MAP[mrfId] || FALLBACK_MRF
  const [mrf,        setMrf]        = useState(initialMrf)
  const [editing,    setEditing]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [denied,     setDenied]     = useState(false)
  const [deniedText, setDeniedText] = useState('')
  const printRef = useRef(null)

  // ── Progressive Noted By signatories ─────────────────────────
  // Each slot: { name, sig, submitted, dirty }
  // submitted = has been submitted at least once
  // dirty = edited after submission (triggers Re-submit)
  const initNoterSlots = () => {
    const assigned = initialMrf.assignedNoters || [{ name: '', dept: '' }]
    return assigned.map((a, i) => ({
      name: a.name || '',
      sig:  null,
      submitted: false,
      dirty: false,
      assignedName: a.name || '',
      dept: a.dept || '',
      visible: i === 0, // only first slot visible initially
    }))
  }
  const [noterSlots, setNoterSlots] = useState(initNoterSlots)
  const updateNoterSlot = (i, field, val) => setNoterSlots(p => p.map((s, idx) =>
    idx === i ? { ...s, [field]: val, dirty: s.submitted ? true : s.dirty } : s
  ))
  const submitNoterSlot = (i) => {
    setNoterSlots(p => {
      const updated = p.map((s, idx) => idx === i ? { ...s, submitted: true, dirty: false } : s)
      // Reveal next slot if exists
      if (i + 1 < updated.length) updated[i + 1] = { ...updated[i + 1], visible: true }
      return updated
    })
  }
  const allNotersDone = noterSlots.every(s => s.submitted)

  // ── Progressive Conformed By signatories ─────────────────────
  const initConfSlots = () => {
    const assigned = initialMrf.assignedConformers || [{ name: '', dept: '' }]
    return assigned.map((a, i) => ({
      name: a.name || '',
      sig:  null,
      submitted: false,
      dirty: false,
      assignedName: a.name || '',
      dept: a.dept || '',
      visible: i === 0,
    }))
  }
  const [confSlots, setConfSlots] = useState(initConfSlots)
  const updateConfSlot = (i, field, val) => setConfSlots(p => p.map((s, idx) =>
    idx === i ? { ...s, [field]: val, dirty: s.submitted ? true : s.dirty } : s
  ))
  const submitConfSlot = (i, decision, denyReason) => {
    setConfSlots(p => {
      const updated = p.map((s, idx) => idx === i ? { ...s, submitted: true, dirty: false, decision, denyReason } : s)
      if (i + 1 < updated.length && decision !== 'denied') updated[i + 1] = { ...updated[i + 1], visible: true }
      return updated
    })
  }
  const allConfDone = confSlots.every(s => s.submitted)
  const anyConfDenied = confSlots.some(s => s.submitted && s.decision === 'denied')

  // Legacy aliases for MRFDocument props
  const confName = confSlots[0]?.name || ''
  const confSig  = confSlots[0]?.sig  || null

  const role   = user?.role || 'engineering'
  const status = mrf.status
  const s      = STATUS_CONFIG[status] || STATUS_CONFIG.draft

  const inputStyle = { width: '100%', padding: '9px 12px', fontSize: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', fontFamily: 'Arial', color: '#111', boxSizing: 'border-box', outline: 'none' }

  // ── Simulate status update (replace with Firestore write) ────
  const updateStatus = (newStatus, extraFields = {}, toastMsg = null) => {
    setSaving(true)
    setTimeout(() => {
      setMrf(prev => ({ ...prev, status: newStatus, ...extraFields }))
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      if (toastMsg) toastMsg()
    }, 800)
  }

  // ── If editing (qa_denied → resubmit), show MRFForm ──────────
  if (editing) {
    return (
      <div style={{ padding: '0 28px', overflowY: 'auto', height: '100vh', background: '#F5F5F5' }}>
        <MRFForm
          user={user}
          initialData={mrf}
          onNavigate={onNavigate}
          onBack={() => setEditing(false)}
          onResubmit={(newData) => {
            updateStatus('pending_noted', newData)
            setEditing(false)
          }}
          isResubmit
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 0' }}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack || (() => onNavigate?.('dashboard'))}
          style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          ← Back to Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>MRF Request</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              Control No. <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#111' }}>{mrf.id}</span>
              &nbsp;·&nbsp; {mrf.partName}
            </p>
          </div>
          {/* Status badge */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: s.bg, color: s.color, borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.dot }} />
            {s.label}
          </span>
        </div>
      </div>

      {/* ── Saved confirmation ───────────────────────────────────── */}
      {saved && (
        <div style={{ padding: '12px 16px', background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#166534', fontWeight: '600' }}>
          ✓ Action completed successfully. Status updated.
        </div>
      )}

      {/* ── MRF Document ────────────────────────────────────────── */}
      <div ref={printRef} style={{ background: '#fff', padding: '12px', border: '1px solid #ccc', width: '794px', boxSizing: 'border-box' }}>
        <MRFDocument
          mrf={{
            applicationDate: mrf.applicationDate,
            partNumber:      mrf.partNumber,
            partName:        mrf.partName,
            targetDate:      mrf.targetDate,
            preparedBy:      mrf.preparedBy,
            factoryNo:       mrf.factoryNo,
            checkedReasons:  mrf.checkedReasons,
            specifyValues:   mrf.specifyValues,
            detailedContent: mrf.detailedContent,
            reasonForChange: mrf.reasonForChange,
            alterations:     mrf.alterations,
            altSpecify:      mrf.altSpecify,
            pkgIp:           mrf.pkgIp,
            pkgFg:           mrf.pkgFg,
            preparedBySig:   mrf.preparedBySig,
            notedBy1Name:    noterSlots[0]?.name || mrf.notedBy1Name,
            notedBy1Sig:     noterSlots[0]?.sig  || mrf.notedBy1Sig,
            notedBy2Name:    noterSlots[1]?.name || mrf.notedBy2Name || '',
            notedBy2Sig:     noterSlots[1]?.sig  || mrf.notedBy2Sig  || null,
            notedBy3Name:    noterSlots[2]?.name || mrf.notedBy3Name || '',
            notedBy3Sig:     noterSlots[2]?.sig  || mrf.notedBy3Sig  || null,
            conformedByName: confSlots[0]?.name || mrf.conformedByName,
            conformedBySig:  confSlots[0]?.sig  || mrf.conformedBySig,
            conformedBySignatories: confSlots.filter(s => s.name || s.sig).map(s => ({ name: s.name, sig: s.sig })),
            conformedDecision: mrf.status === 'conformed_denied' ? 'denied'
              : ['pending_approval','qa_review','qa_denied','approved','encoding','issuance'].includes(mrf.status) ? 'approved'
              : null,
            qaDecision: mrf.status === 'qa_denied' ? 'denied'
              : ['approved','encoding','issuance'].includes(mrf.status) ? 'approved'
              : null,
          }}
          qa={{
            qaRemarks:        mrf.qaRemarks,
            dateReceived:     mrf.dateReceived,
            controlNo:        mrf.controlNo,
            evalNeed:         mrf.evalNeed,
            recommendation:   mrf.recommendation,
            approvalCategory: mrf.approvalCategory,
            approvalDecision: mrf.approvalDecision,
            distributionCopy: mrf.distributionCopy,
          }}
          showQA={['qa_review','qa_denied','approved','encoding','issuance'].includes(status)}
          showDistribution={role !== 'president'}
          user={user}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════
          ACTION PANELS — shown based on role + status
      ════════════════════════════════════════════════════════════ */}

      {/* ── [NOTED BY] Sign the MRF ──────────────────────────────
          Shown when: status = pending_noted, any dept user       */}
      {/* ── [NOTED BY] Progressive signing panel ──────────────── */}
      {status === 'pending_noted' && role !== 'qa' && role !== 'president' && (
        <ActionPanel title="✍ Noted By — Sign this MRF" subtitle={`${noterSlots.length} signator${noterSlots.length > 1 ? 'ies' : 'y'} assigned. Each signs individually.`}>
          {noterSlots.filter(s => s.visible).map((s, i) => {
            const isGrayed = s.submitted && !s.dirty
            return (
              <div key={i} style={{ background: isGrayed ? '#F9FAFB' : '#fff', border: `0.5px solid ${isGrayed ? '#E5E5E5' : '#D1D5DB'}`, borderRadius: '8px', padding: '16px', marginBottom: '12px', opacity: isGrayed ? 0.7 : 1, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#111' }}>
                    Signatory {i + 1}
                    {isGrayed && <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: '400', color: '#22C55E' }}>✓ Signed</span>}
                  </p>
                  <span style={{ fontSize: '11px', color: '#888' }}>{s.dept}</span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <FieldLabel>E-Signature <span style={{ color: '#EF4444' }}>*</span></FieldLabel>
                  <SigUpload value={s.sig} onChange={v => updateNoterSlot(i, 'sig', v)} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <FieldLabel>Name</FieldLabel>
                  <input type="text" value={s.name}
                    onChange={e => updateNoterSlot(i, 'name', e.target.value)}
                    style={{ ...inputStyle, background: '#F9FAFB', color: '#555' }} />
                  <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#aaa' }}>Pre-filled by Prepared By. Edit only if incorrect.</p>
                </div>
                <button
                  disabled={!s.sig || saving}
                  onClick={() => {
                    submitNoterSlot(i)
                    const isLast = i === noterSlots.length - 1
                    if (isLast) {
                      updateStatus('noted_signed', {
                        notedBy1Name: noterSlots[0]?.name || '', notedBy1Sig: noterSlots[0]?.sig || null,
                        notedBy2Name: noterSlots[1]?.name || '', notedBy2Sig: noterSlots[1]?.sig || null,
                        notedBy3Name: noterSlots[2]?.name || '', notedBy3Sig: noterSlots[2]?.sig || null,
                      }, () => toast.success('All signatures submitted', {
                        description: `All Noted By signatories have signed. ${mrf.preparedBy} has been notified.`,
                      }))
                    } else {
                      toast.success(`Signatory ${i + 1} signed`, {
                        description: `Next: ${noterSlots[i + 1]?.assignedName || 'Signatory ' + (i + 2)} has been notified.`,
                      })
                    }
                  }}
                  style={{ padding: '8px 20px', background: !s.sig ? '#E5E5E5' : (s.dirty ? '#F5C200' : '#111'), color: !s.sig ? '#aaa' : (s.dirty ? '#111' : '#F5C200'), border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: !s.sig ? 'not-allowed' : 'pointer', fontFamily: 'Arial' }}>
                  {saving ? 'Saving...' : s.dirty ? '↻ Re-submit' : '✓ Submit Signature'}
                </button>
              </div>
            )
          })}
        </ActionPanel>
      )}

      {/* ── [PREPARER] Forward to Conformed By ───────────────────── */}
      {status === 'noted_signed' && role !== 'qa' && role !== 'president' && (
        <ActionPanel title="📤 Forward to Conformed By" subtitle="Noted By has signed. Click below to forward this MRF to the Conformed By signatory.">
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#555' }}>
            The MRF has been noted. As the preparer, you need to forward it to <strong>Conformed By</strong> for confirmation.
          </p>
          <button disabled={saving}
            onClick={() => updateStatus('pending_conformed', {}, () =>
              toast.success('MRF forwarded to Conformed By', {
                description: `The MRF is now awaiting confirmation from the Conformed By signatory.`,
              })
            )}
            style={{ padding: '10px 24px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}>
            {saving ? 'Forwarding...' : '→ Forward to Conformed By'}
          </button>
        </ActionPanel>
      )}

      {status === 'pending_conformed' && role !== 'qa' && role !== 'president' && (
        <ActionPanel title="✍ Conformed By — Confirm this MRF" subtitle={`${confSlots.length} signator${confSlots.length > 1 ? 'ies' : 'y'} assigned. Each signs individually.`}>
          {confSlots.filter(s => s.visible).map((s, i) => {
            const isGrayed = s.submitted && !s.dirty
            const denyOpen = s.denyOpen || false
            const denyText = s.denyText || ''
            const setDenyOpenLocal = (v) => setConfSlots(p => p.map((x, idx) => idx === i ? { ...x, denyOpen: v } : x))
            const setDenyTextLocal = (v) => setConfSlots(p => p.map((x, idx) => idx === i ? { ...x, denyText: v } : x))
            return (
              <div key={i} style={{ background: isGrayed ? '#F9FAFB' : '#fff', border: `0.5px solid ${isGrayed ? '#E5E5E5' : '#D1D5DB'}`, borderRadius: '8px', padding: '16px', marginBottom: '12px', opacity: isGrayed ? 0.7 : 1, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#111' }}>
                    Signatory {i + 1}
                    {isGrayed && <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: '400', color: s.decision === 'denied' ? '#EF4444' : '#22C55E' }}>
                      {s.decision === 'denied' ? '✕ Denied' : '✓ Approved'}
                    </span>}
                  </p>
                  <span style={{ fontSize: '11px', color: '#888' }}>{s.dept}</span>
                </div>

                {!denyOpen && (
                  <>
                    <div style={{ marginBottom: '10px' }}>
                      <FieldLabel>E-Signature <span style={{ color: '#EF4444' }}>*</span></FieldLabel>
                      <SigUpload value={s.sig} onChange={v => updateConfSlot(i, 'sig', v)} />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <FieldLabel>Name</FieldLabel>
                      <input type="text" value={s.name}
                        onChange={e => updateConfSlot(i, 'name', e.target.value)}
                        style={{ ...inputStyle, background: '#F9FAFB', color: '#555' }} />
                      <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#aaa' }}>Pre-filled by Prepared By. Edit only if incorrect.</p>
                    </div>
                  </>
                )}

                {denyOpen && (
                  <div style={{ marginBottom: '12px' }}>
                    <FieldLabel>Reason for Denial <span style={{ color: '#EF4444' }}>*</span></FieldLabel>
                    <textarea value={denyText} onChange={e => setDenyTextLocal(e.target.value)}
                      placeholder="Please explain why this MRF is being denied..."
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: '1.5' }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {!denyOpen ? (
                    <>
                      <button disabled={!s.sig || saving}
                        onClick={() => {
                          submitConfSlot(i, 'approved', '')
                          const isLast = i === confSlots.length - 1
                          if (isLast) {
                            updateStatus('conformed_approved', {
                              conformedByName: confSlots[0]?.name,
                              conformedBySig:  confSlots[0]?.sig,
                              conformedBySignatories: confSlots.map(x => ({ name: x.name, sig: x.sig })),
                            }, () => toast.success('MRF approved by Conformed By', {
                              description: `All conformers approved. ${mrf.preparedBy} has been notified to send to QA.`,
                            }))
                          } else {
                            toast.success(`Signatory ${i + 1} approved`, {
                              description: `Next: ${confSlots[i + 1]?.assignedName || 'Signatory ' + (i + 2)} has been notified.`,
                            })
                          }
                        }}
                        style={{ padding: '8px 20px', background: !s.sig ? '#E5E5E5' : (s.dirty ? '#F5C200' : '#111'), color: !s.sig ? '#aaa' : (s.dirty ? '#111' : '#F5C200'), border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: !s.sig ? 'not-allowed' : 'pointer', fontFamily: 'Arial' }}>
                        {saving ? 'Saving...' : s.dirty ? '↻ Re-submit' : '✓ Approve'}
                      </button>
                      <button onClick={() => setDenyOpenLocal(true)}
                        style={{ padding: '8px 20px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}>
                        ✕ Deny
                      </button>
                    </>
                  ) : (
                    <>
                      <button disabled={!denyText || saving}
                        onClick={() => {
                          submitConfSlot(i, 'denied', denyText)
                          updateStatus('conformed_denied', {
                            conformedByName: s.name || s.assignedName,
                            deniedReason: denyText,
                          }, () => toast.error('MRF denied', {
                            description: `${mrf.preparedBy} has been notified. MRF returned for revision.`,
                          }))
                        }}
                        style={{ padding: '8px 20px', background: !denyText ? '#E5E5E5' : '#EF4444', color: !denyText ? '#aaa' : '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: !denyText ? 'not-allowed' : 'pointer', fontFamily: 'Arial' }}>
                        {saving ? 'Saving...' : '✕ Confirm Denial'}
                      </button>
                      <button onClick={() => setDenyOpenLocal(false)}
                        style={{ padding: '8px 20px', background: 'transparent', color: '#888', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Arial' }}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </ActionPanel>
      )}

      {/* ── [PREPARER] Conformed By Denied — Review & Edit ──────────
          Prepared By sees denial reason + Review & Edit button
          No re-confirm panel — must edit MRF first then resubmit  */}
      {status === 'conformed_denied' && role !== 'qa' && role !== 'president' && (
        <ActionPanel title="⚠ MRF Denied by Conformed By" accent="#9A3412" subtitle="The Conformed By signatory has denied this MRF. Review the reason below, edit the MRF, then resubmit.">
          {mrf.deniedReason && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#991B1B' }}>REASON FOR DENIAL</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#991B1B' }}>{mrf.deniedReason}</p>
            </div>
          )}
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#555' }}>
            Review the denial reason above, make the necessary changes to your MRF, then resubmit to the same Conformed By person/s.
          </p>
          <button disabled={saving}
            onClick={() => {
              // TODO: Navigate to MRFForm edit mode with current MRF data pre-filled
              toast('Redirecting to edit form...', { description: 'Your MRF data will be pre-filled for editing.' })
            }}
            style={{ padding: '10px 24px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}>
            ✏ Review & Edit MRF
          </button>
        </ActionPanel>
      )}

      {/* ── [PREPARER] Conformed By Approved — Send to QA ───────── */}
      {status === 'pending_approval' && role !== 'qa' && role !== 'president' && (
        <ActionPanel title="✅ Conformed By Approved — Send to QA" subtitle="Conformed By has confirmed this MRF. Click below to send it to QA for review.">
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#555' }}>
            Conformed by: <strong>{mrf.conformedByName}</strong>{mrf.conformedByDate ? ` on ${mrf.conformedByDate}` : ''}
          </p>
          <button disabled={saving}
            onClick={() => updateStatus('qa_review', {}, () =>
              toast.success('MRF sent to QA', {
                description: `${mrf.partName} (${mrf.partNumber}) has been submitted for QA review.`,
              })
            )}
            style={{ padding: '10px 24px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}>
            {saving ? 'Submitting...' : '✓ Send to QA'}
          </button>
        </ActionPanel>
      )}

      {/* ── [PREPARER] QA Denied — Edit and Resubmit ─────────────
          qa_denied → Preparer edits MRF from scratch             */}
      {status === 'qa_denied' && role !== 'qa' && role !== 'president' && (
        <ActionPanel title="⚠ MRF Returned by QA" accent="#991B1B" subtitle="QA has reviewed and returned this MRF. Please review their remarks and edit the MRF before resubmitting.">
          {mrf.qaRemarks && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#991B1B' }}>QA REMARKS</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#991B1B' }}>{mrf.qaRemarks}</p>
            </div>
          )}
          <button onClick={() => setEditing(true)}
            style={{ padding: '10px 24px', background: '#F5C200', color: '#111', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}>
            ✎ Edit & Resubmit MRF
          </button>
        </ActionPanel>
      )}

      {/* ── [QA] In Review ────────────────────────────────────────
          Read-only notice, QA uses Evaluate button from dashboard */}
      {status === 'qa_review' && role === 'qa' && (
        <ActionPanel title="📋 MRF is Under QA Review" subtitle="Use the Evaluate button from the dashboard to fill in the QA evaluation for this MRF.">
          <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
            This MRF is pending your evaluation. Go back to the dashboard and click <strong>Evaluate →</strong> on this request to fill in QA remarks, process evaluation, and recommendation.
          </p>
        </ActionPanel>
      )}

      {/* ── [ALL] Read-only statuses ──────────────────────────────
          approved / encoding / issuance — just show the document  */}
      {['approved', 'encoding', 'issuance'].includes(status) && (
        <div style={{ marginTop: '20px', padding: '14px 18px', background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#166534' }}>
              {status === 'approved' ? 'This MRF has been approved by QA.' : status === 'encoding' ? 'Being encoded on the summary.' : 'MRF has been issued.'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#166534' }}>No further action required from you.</p>
          </div>
        </div>
      )}

    </div>
  )
}