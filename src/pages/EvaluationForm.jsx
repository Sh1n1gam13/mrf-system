// ─────────────────────────────────────────────────────────────────
// EvaluationForm.jsx
// QA Evaluation / Remarks Form — triggered from Admin Dashboard
// Fields based on wireframe #13
// TODO: Wire to Firestore once Firebase is connected
// ─────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { DISTRIBUTION_COPY } from '../constants'

// ── Mock request data — replace with Firestore fetch later ────────
const MOCK_REQUEST = {
  id:          '4M-M-7902',
  partName:    'Filter Housing Unit',
  partNumber:  'FH-1103',
  department:  'Engineering',
  customer:    'GLORY',
  preparedBy:  'Juan Dela Cruz',
  dateApplied: '2026-03-12',
  targetDate:  '2026-03-20',
  reasons:     ["Eng'g Change/s", 'Quality Enhancement'],
  detailedContent: 'Replace current filter housing with improved corrosion-resistant material.',
  reasonForChange: 'Frequent failure due to material degradation in high-humidity environment.',
}

// ── Checkbox component ─────────────────────────────────────────────
function CheckOption({ label, checked, onChange }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      cursor: 'pointer', fontSize: '13px', color: '#111',
      userSelect: 'none',
    }}>
      <div
        onClick={onChange}
        style={{
          width: '18px', height: '18px', border: `2px solid ${checked ? '#111' : '#D1D5DB'}`,
          borderRadius: '3px', background: checked ? '#111' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-5" stroke="#F5C200" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span>{label}</span>
    </label>
  )
}

// ── Section heading ────────────────────────────────────────────────
function SectionHeading({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px',
    }}>
      <div style={{ width: '3px', height: '16px', background: '#F5C200', borderRadius: '2px', flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        {label}
      </p>
    </div>
  )
}

// ── Field label ────────────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: 'block', fontSize: '10px', fontWeight: '700',
      letterSpacing: '1.5px', textTransform: 'uppercase',
      color: '#555', marginBottom: '8px',
    }}>
      {children}
      {required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
    </label>
  )
}

// ── Input style ────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: '13px',
  border: '1px solid #E5E5E5', borderRadius: '6px',
  fontFamily: 'Arial, Helvetica, sans-serif', color: '#111',
  background: '#FAFAFA', boxSizing: 'border-box', outline: 'none',
}

// ── Signature Upload component ─────────────────────────────────────
function SignatureUpload({ label, file, onFile }) {
  const inputRef = useRef(null)
  const preview  = file ? URL.createObjectURL(file) : null

  return (
    <div>
      <FieldLabel>E-Signature</FieldLabel>
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]) }}
      />
      {preview ? (
        <div style={{
          border: '1px solid #E5E5E5', borderRadius: '6px',
          padding: '10px 12px', background: '#FAFAFA',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
        }}>
          <img
            src={preview}
            alt="e-signature"
            style={{ height: '36px', maxWidth: '160px', objectFit: 'contain' }}
          />
          <button
            onClick={() => onFile(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', color: '#aaa', padding: '0 4px', flexShrink: 0,
              fontFamily: 'Arial, Helvetica, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
          >×</button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            width: '100%', padding: '10px 14px',
            background: '#FAFAFA', border: '1.5px dashed #D1D5DB',
            borderRadius: '6px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontSize: '12px', color: '#888', fontFamily: 'Arial, Helvetica, sans-serif',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.color = '#111' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#888' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 10V4M4 7l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Upload Signature
        </button>
      )}
      <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#bbb' }}>PNG or JPG · transparent background preferred</p>
    </div>
  )
}
export default function EvaluationForm({ requestId, user, onNavigate, onBack }) {
  const req = MOCK_REQUEST // replace with Firestore fetch by requestId

  // ── Form state ───────────────────────────────────────────────────
  const [qaRemarks,        setQaRemarks]        = useState('')
  const [dateReceived,     setDateReceived]      = useState('')
  const [controlNo,        setControlNo]         = useState('')
  const [evalNeed,         setEvalNeed]          = useState(null)   // 'need' | 'no_need' | null
  const [recommendation,   setRecommendation]    = useState('')
  const [approvalCategory, setApprovalCategory]  = useState(null)   // 'internal' | 'external' | null
  const [approvalDecision, setApprovalDecision]  = useState(null)   // 'accept' | 'reject' | null
  const [preparedByName,   setPreparedByName]    = useState(user?.name || '')
  const [preparedByDate,   setPreparedByDate]    = useState('')
  const [approvedByName,   setApprovedByName]    = useState('')
  const [approvedByDate,   setApprovedByDate]    = useState('')
  const [distributionCopy, setDistributionCopy]  = useState([])
  const [preparedBySig,         setPreparedBySig]         = useState(null)  // File object
  const [preparedBySigPreview,  setPreparedBySigPreview]  = useState(null)  // base64
  const [approvedBySig,         setApprovedBySig]         = useState(null)  // File object
  const [approvedBySigPreview,  setApprovedBySigPreview]  = useState(null)  // base64
  const [submitted,        setSubmitted]         = useState(false)
  const [savedDraft,       setSavedDraft]        = useState(false)
  const [errors,           setErrors]            = useState({})

  // ── Save as Draft (staff fills their part only) ───────────────────
  const handleSaveDraft = () => {
    const e = {}
    if (!dateReceived)          e.dateReceived      = 'Date received is required.'
    if (!controlNo.trim())      e.controlNo         = 'Control No. is required.'
    if (!evalNeed)              e.evalNeed          = 'Please select an evaluation.'
    if (!approvalCategory)      e.approvalCategory  = 'Please select Internal or External.'
    if (!preparedByName.trim()) e.preparedByName    = 'Your name is required.'
    if (!preparedByDate)        e.preparedByDate    = 'Date is required.'
    setErrors(e)
    if (Object.keys(e).length > 0) {
      // Scroll to the first missing field
      const firstError = Object.keys(e)[0]
      const el = document.getElementById(`field-${firstError}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    // TODO: Save to Firestore with status: 'qa_draft'
    setSavedDraft(true)
    toast('Draft saved — Pending QA Manager review', {
      description: `Control No. ${controlNo} saved as draft. QA Manager will complete the evaluation.`,
    })
    setTimeout(() => setSavedDraft(false), 3000)
  }

  // ── Submit (QA Manager completes) ────────────────────────────────
  const handleSubmit = () => {
    const e = {}
    if (!approvalDecision)      e.approvalDecision = 'Please select Accept or Reject.'
    if (!recommendation.trim()) e.recommendation   = 'Recommendation is required.'
    if (!approvedByName.trim()) e.approvedByName   = 'Approved by name is required.'
    if (!approvedByDate)        e.approvedByDate   = 'Approved by date is required.'
    if (distributionCopy.length === 0) e.distributionCopy = 'Please select at least one department.'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    // TODO: Save to Firestore with status based on approvalDecision
    setSubmitted(true)
    if (approvalDecision === 'accept') {
      toast.success('MRF Approved by QA', {
        description: `Control No. ${controlNo} accepted. Moving to Final Approved.`,
      })
    } else {
      toast.error('MRF Denied by QA', {
        description: `Control No. ${controlNo} denied and returned to the Requester.`,
      })
    }
  }

  // ── Convert file to base64 for passing to OverallSummary ─────────
  const fileToBase64 = (file, setter) => {
    if (!file) { setter(null); return }
    const reader = new FileReader()
    reader.onload = e => setter(e.target.result)
    reader.readAsDataURL(file)
  }

  const handlePreparedBySig = (file) => {
    setPreparedBySig(file)
    fileToBase64(file, setPreparedBySigPreview)
  }

  const handleApprovedBySig = (file) => {
    setApprovedBySig(file)
    fileToBase64(file, setApprovedBySigPreview)
  }
  const handleSendCopy = () => {
    // TODO: Trigger e-signature workflow
    alert('Send Copy for e-signature — wired after Firebase is connected.')
  }

  // ── Generate Summary ──────────────────────────────────────────────
  const handleGenerateSummary = () => {
    // Read the sig from the file input state (base64 from FilePreview component)
    // TODO: replace with Firestore write once connected
    onNavigate && onNavigate('summary', requestId, {
      controlNo, dateReceived, qaRemarks, evalNeed, recommendation,
      approvalCategory, approvalDecision, distributionCopy,
      preparedByName, preparedByDate,
      preparedBySig: preparedBySigPreview,   // base64 preview
      qaManagerName:   approvedByName,
      qaManagerDate:   approvedByDate,
      qaManagerSig:    approvedBySigPreview, // base64 preview
    })
  }

  // ── Success screen ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 0', textAlign: 'center' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%', background: '#111',
          margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M5 13l5 5L21 7" stroke="#F5C200" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
          Evaluation Submitted
        </h2>
        <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#888' }}>
          Control No. <strong style={{ color: '#111', fontFamily: 'monospace' }}>{controlNo}</strong> · {approvalDecision === 'accept' ? 'Accepted' : 'Rejected'}
        </p>
        <p style={{ margin: '0 0 32px', fontSize: '13px', color: '#888' }}>
          Category: {approvalCategory === 'internal' ? 'Internal' : 'External'}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleSendCopy}
            style={{
              padding: '10px 22px', background: '#111', color: '#F5C200',
              border: 'none', borderRadius: '6px', fontSize: '12px',
              fontWeight: '700', letterSpacing: '1px', cursor: 'pointer',
              fontFamily: 'Arial, Helvetica, sans-serif',
            }}
          >
            Send Copy for E-Signature
          </button>
          <button
            onClick={handleGenerateSummary}
            style={{
              padding: '10px 22px', background: '#F5C200', color: '#111',
              border: 'none', borderRadius: '6px', fontSize: '12px',
              fontWeight: '700', letterSpacing: '1px', cursor: 'pointer',
              fontFamily: 'Arial, Helvetica, sans-serif',
            }}
          >
            Generate Summary →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '28px 0' }}>

      {/* ── Back button ──────────────────────────────────────────── */}
      <button
        onClick={onBack || (() => onNavigate && onNavigate('dashboard'))}
        style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
      >
        ← Back to Dashboard
      </button>

      {/* ── Page header ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
            Evaluation / Remarks
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
            QA Assessment Form · {req.partName} · <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#555' }}>{req.id}</span>
          </p>
        </div>
        <span style={{
          padding: '4px 12px', background: '#F3E8FF', color: '#6B21A8',
          borderRadius: '20px', fontSize: '11px', fontWeight: '700',
        }}>QA Review</span>
      </div>

      {/* ── Request summary card ─────────────────────────────────── */}
      <div style={{
        background: '#FAFAFA', border: '0.5px solid #E5E5E5',
        borderLeft: '3px solid #111', borderRadius: '0 8px 8px 0',
        padding: '14px 18px', marginBottom: '24px',
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px',
      }}>
        {[
          { label: 'Part Name',         value: req.partName     },
          { label: 'Part No.',          value: req.partNumber   },
          { label: 'Customer/Supplier', value: req.customer     },
          { label: 'Department',        value: req.department   },
          { label: 'Date Applied',      value: req.dateApplied  },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#111' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Form body ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Section 1: QA Assessment ─────────────────────────── */}
        <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', padding: '22px 24px' }}>
          <SectionHeading label="QA Assessment" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Date Received */}
            <div id="field-dateReceived">
              <FieldLabel required>Date Received</FieldLabel>
              <input
                type="date"
                value={dateReceived}
                onChange={e => { setDateReceived(e.target.value); setErrors(p => ({ ...p, dateReceived: null })) }}
                style={{ ...inputStyle, border: errors.dateReceived ? '1px solid #EF4444' : '1px solid #E5E5E5' }}
              />
              {errors.dateReceived && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.dateReceived}</p>}
            </div>

            {/* Control No. */}
            <div id="field-controlNo">
              <FieldLabel required>Control No.</FieldLabel>
              <input
                type="text"
                placeholder="e.g. 4M-M-0003"
                value={controlNo}
                onChange={e => { setControlNo(e.target.value); setErrors(p => ({ ...p, controlNo: null })) }}
                style={{ ...inputStyle, fontFamily: 'monospace', border: errors.controlNo ? '1px solid #EF4444' : '1px solid #E5E5E5' }}
              />
              {errors.controlNo && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.controlNo}</p>}
            </div>
          </div>

          {/* QA Remarks */}
          <div style={{ marginBottom: '16px' }}>
            <FieldLabel>QA Remarks</FieldLabel>
            <textarea
              rows={4}
              placeholder="Enter QA remarks and observations..."
              value={qaRemarks}
              onChange={e => setQaRemarks(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', border: '1px solid #E5E5E5' }}
            />
          </div>

          {/* Process/Part Evaluation */}
          <div id="field-evalNeed" style={{ marginBottom: '16px' }}>
            <FieldLabel required>Process / Part Evaluation</FieldLabel>
            <div style={{ display: 'flex', gap: '28px', marginTop: '4px' }}>
              <CheckOption
                label="Need"
                checked={evalNeed === 'need'}
                onChange={() => { setEvalNeed(evalNeed === 'need' ? null : 'need'); setErrors(p => ({ ...p, evalNeed: null })) }}
              />
              <CheckOption
                label="No Need"
                checked={evalNeed === 'no_need'}
                onChange={() => { setEvalNeed(evalNeed === 'no_need' ? null : 'no_need'); setErrors(p => ({ ...p, evalNeed: null })) }}
              />
            </div>
            {errors.evalNeed && <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.evalNeed}</p>}
          </div>

          {/* Recommendation */}
          <div>
            <FieldLabel>Recommendation</FieldLabel>
            <textarea
              rows={3}
              placeholder="Enter recommendation..."
              value={recommendation}
              onChange={e => setRecommendation(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', border: '1px solid #E5E5E5' }}
            />
          </div>
        </div>

        {/* ── QA Manager section divider ────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E5E5' }} />
          <span style={{ padding: '4px 14px', background: '#111', color: '#F5C200', borderRadius: '12px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
            QA Manager — Complete Below
          </span>
          <div style={{ flex: 1, height: '1px', background: '#E5E5E5' }} />
        </div>

        {/* ── Section 2: Approval Category ─────────────────────── */}
        <div id="field-approvalCategory" style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', padding: '22px 24px' }}>
          <SectionHeading label="Approval Category" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Internal / External */}
            <div>
              <FieldLabel required>Category</FieldLabel>
              <div style={{ display: 'flex', gap: '28px', marginTop: '4px' }}>
                <CheckOption
                  label="Internal"
                  checked={approvalCategory === 'internal'}
                  onChange={() => { setApprovalCategory(approvalCategory === 'internal' ? null : 'internal'); setErrors(p => ({ ...p, approvalCategory: null })) }}
                />
                <CheckOption
                  label="External"
                  checked={approvalCategory === 'external'}
                  onChange={() => { setApprovalCategory(approvalCategory === 'external' ? null : 'external'); setErrors(p => ({ ...p, approvalCategory: null })) }}
                />
              </div>
              {errors.approvalCategory && <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.approvalCategory}</p>}
            </div>

            {/* Accept / Reject */}
            <div>
              <FieldLabel required>Decision</FieldLabel>
              <div style={{ display: 'flex', gap: '28px', marginTop: '4px' }}>
                <CheckOption
                  label="Accept"
                  checked={approvalDecision === 'accept'}
                  onChange={() => { setApprovalDecision(approvalDecision === 'accept' ? null : 'accept'); setErrors(p => ({ ...p, approvalDecision: null })) }}
                />
                <CheckOption
                  label="Reject"
                  checked={approvalDecision === 'reject'}
                  onChange={() => { setApprovalDecision(approvalDecision === 'reject' ? null : 'reject'); setErrors(p => ({ ...p, approvalDecision: null })) }}
                />
              </div>
              {errors.approvalDecision && <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.approvalDecision}</p>}
            </div>
          </div>
        </div>

        {/* ── Section 3: Distribution Copy ─────────────────────── */}
        <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', padding: '22px 24px' }}>
          <SectionHeading label="Distribution Copy" />
          <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#888' }}>
            Select the departments that will receive a copy of this request.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {DISTRIBUTION_COPY.map(dept => {
              const isChecked = distributionCopy.includes(dept)
              return (
                <label key={dept} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', fontSize: '12px', color: '#111',
                  padding: '8px 10px',
                  background: isChecked ? '#F0FDF4' : '#FAFAFA',
                  border: `1px solid ${isChecked ? '#22C55E' : '#E5E5E5'}`,
                  borderRadius: '6px', transition: 'all 0.15s', userSelect: 'none',
                }}>
                  <div
                    onClick={() => setDistributionCopy(prev =>
                      prev.includes(dept)
                        ? prev.filter(d => d !== dept)
                        : [...prev, dept]
                    )}
                    style={{
                      width: '16px', height: '16px', flexShrink: 0,
                      border: `2px solid ${isChecked ? '#22C55E' : '#D1D5DB'}`,
                      borderRadius: '3px',
                      background: isChecked ? '#22C55E' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {isChecked && (
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1.5 4.5l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontWeight: isChecked ? '700' : '400', color: isChecked ? '#166534' : '#555', fontSize: '11px' }}>
                    {dept}
                  </span>
                </label>
              )
            })}
          </div>
          {distributionCopy.length > 0 && (
            <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#166534', fontWeight: '600' }}>
              {distributionCopy.length} department{distributionCopy.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* ── Section 4: Signatories ────────────────────────────── */}
        <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', padding: '22px 24px' }}>
          <SectionHeading label="Signatories" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Prepared By */}
            <div id="field-preparedByName">
              <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '700', color: '#111' }}>Prepared By</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <FieldLabel required>Name</FieldLabel>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={preparedByName}
                    onChange={e => { setPreparedByName(e.target.value); setErrors(p => ({ ...p, preparedByName: null })) }}
                    style={{ ...inputStyle, border: errors.preparedByName ? '1px solid #EF4444' : '1px solid #E5E5E5' }}
                  />
                  {errors.preparedByName && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.preparedByName}</p>}
                </div>
                <div>
                  <FieldLabel required>Date</FieldLabel>
                  <input
                    type="date"
                    value={preparedByDate}
                    onChange={e => { setPreparedByDate(e.target.value); setErrors(p => ({ ...p, preparedByDate: null })) }}
                    style={{ ...inputStyle, border: errors.preparedByDate ? '1px solid #EF4444' : '1px solid #E5E5E5' }}
                  />
                  {errors.preparedByDate && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.preparedByDate}</p>}
                </div>
                <SignatureUpload
                  label="preparedBy"
                  file={preparedBySig}
                  onFile={handlePreparedBySig}
                />
              </div>
            </div>

            {/* Approved By */}
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '700', color: '#111' }}>Approved By</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <FieldLabel required>Name</FieldLabel>
                  <input
                    type="text"
                    placeholder="Approver's full name"
                    value={approvedByName}
                    onChange={e => { setApprovedByName(e.target.value); setErrors(p => ({ ...p, approvedByName: null })) }}
                    style={{ ...inputStyle, border: errors.approvedByName ? '1px solid #EF4444' : '1px solid #E5E5E5' }}
                  />
                  {errors.approvedByName && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.approvedByName}</p>}
                </div>
                <div>
                  <FieldLabel required>Date</FieldLabel>
                  <input
                    type="date"
                    value={approvedByDate}
                    onChange={e => { setApprovedByDate(e.target.value); setErrors(p => ({ ...p, approvedByDate: null })) }}
                    style={{ ...inputStyle, border: errors.approvedByDate ? '1px solid #EF4444' : '1px solid #E5E5E5' }}
                  />
                  {errors.approvedByDate && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.approvedByDate}</p>}
                </div>
                <SignatureUpload
                  label="approvedBy"
                  file={approvedBySig}
                  onFile={handleApprovedBySig}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons ────────────────────────────────────── */}
        <div style={{ padding: '16px 0', borderTop: '0.5px solid #E5E5E5' }}>

          {/* Staff section — Save as Draft */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '700', color: '#92400E' }}>QA Staff — Save your part</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#92400E' }}>Saves Date Received, Control No., Evaluation, Category, Prepared By. QA Manager will complete the rest.</p>
            </div>
            <button
              onClick={handleSaveDraft}
              style={{ padding: '9px 20px', background: '#F5C200', color: '#111', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial', flexShrink: 0, marginLeft: '16px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#E6B800'}
              onMouseLeave={e => e.currentTarget.style.background = '#F5C200'}
            >
              {savedDraft ? '✓ Saved!' : '💾 Save as Draft'}
            </button>
          </div>

          {/* Manager section — Submit */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={onBack || (() => onNavigate && onNavigate('dashboard'))}
              style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'Arial' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#aaa'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E5E5'}
            >
              ← Cancel
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleGenerateSummary}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #111', borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: '#111', cursor: 'pointer', fontFamily: 'Arial' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Preview Summary →
              </button>
              <button
                onClick={handleSubmit}
                style={{ padding: '10px 28px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Arial' }}
                onMouseEnter={e => e.currentTarget.style.background = '#222'}
                onMouseLeave={e => e.currentTarget.style.background = '#111'}
              >
                Submit Evaluation →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}