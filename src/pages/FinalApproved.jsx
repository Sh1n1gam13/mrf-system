// ─────────────────────────────────────────────────────────────────
// FinalApproved.jsx
// QA Admin — 3-step flow: Distribution Copy → Review + Sign → Send
// President — Name + Date + E-Sig → Send to QA
// ─────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import MRFDocument from './MRFDocument'
import { DISTRIBUTION_COPY } from '../constants'

// ── Mock data ────────────────────────────────────────────────────
const MOCK_DATA = {
  id:              '4M-M-7902',
  partName:        'Filter Housing Unit',
  partNumber:      'FH-1103',
  department:      'Engineering',
  preparedBy:      'Juan Dela Cruz',
  applicationDate: '2026-03-12',
  targetDate:      '2026-03-20',
  factoryNo:       'F-0042',
  detailedContent: 'Replace current filter housing with improved corrosion-resistant material to reduce failure rate in high-humidity environments.',
  reasonForChange: 'Frequent failure due to material degradation observed over the past 6 months of operation.',
  alterations:     ['WPS', 'PIS/PMIIS'],
  checkedReasons:  { engg: true, quality: true },
  specifyValues:   {},
  altSpecify:      '', pkgIp: '', pkgFg: '',
  preparedBySig:   null,
  notedBy1Name: '', notedBy1Date: '', notedBy1Sig: null,
  notedBy2Name: '', notedBy2Date: '', notedBy2Sig: null,
  conformedByName: '', conformedByDate: '', conformedBySig: null,
  // QA Evaluation
  controlNo:        '4M-M-7902',
  dateReceived:     '2026-03-15',
  qaRemarks:        'Material change is justified. Proposed material meets required specifications.',
  evalNeed:         'need',
  recommendation:   'Proceed with material change. Conduct pilot run before full production rollout.',
  approvalCategory: 'internal',
  approvalDecision: 'accept',
  // QA signatories — blank, QA fills these in this page
  qaManagerName:   null, qaManagerDate: null, qaManagerSig: null,
  // Attachments
  mrfAttachments:  [],
}

// ── Helpers ──────────────────────────────────────────────────────
const inputSt = {
  width: '100%', padding: '10px 14px', fontSize: '13px',
  border: '1px solid #E5E5E5', borderRadius: '6px',
  fontFamily: 'Arial', color: '#111', boxSizing: 'border-box', outline: 'none',
}
const LabelSt = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555', marginBottom: '7px' }}>
    {children}{required && <span style={{ color: '#EF4444' }}> *</span>}
  </label>
)

// ── Signature Upload ──────────────────────────────────────────────
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
      <img src={value} alt="sig" style={{ height: '72px', maxWidth: '240px', objectFit: 'contain', display: 'block', border: '1px solid #E5E5E5', borderRadius: '4px' }} />
      <button onClick={() => onChange(null)} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
    </div>
  ) : (
    <>
      <input ref={ref} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div
        onClick={() => ref.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        style={{ border: '1.5px dashed #D1D5DB', borderRadius: '6px', padding: '20px', cursor: 'pointer', background: '#FAFAFA', textAlign: 'center', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#F5C200'; e.currentTarget.style.background = '#FFFBEB' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#FAFAFA' }}
      >
        <p style={{ margin: 0, fontSize: '22px' }}>✍</p>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888' }}>Upload e-signature (PNG/JPG) or drag & drop</p>
      </div>
    </>
  )
}

// ── Step indicator ───────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Distribution Copy', 'Review & Sign', 'Send']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '28px' }}>
      {steps.map((label, i) => {
        const num  = i + 1
        const done = step > num
        const active = step === num
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: done ? '#22C55E' : active ? '#111' : '#E5E5E5',
                color: done ? '#fff' : active ? '#F5C200' : '#aaa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700',
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: '12px', fontWeight: active ? '700' : '400', color: active ? '#111' : done ? '#22C55E' : '#aaa', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: '1px', background: done ? '#22C55E' : '#E5E5E5', margin: '0 12px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function FinalApproved({ requestId, user, onNavigate, onBack }) {
  const data        = MOCK_DATA
  const printRef    = useRef(null)
  const isQA        = user?.role === 'qa'
  const isPresident = user?.role === 'president'

  // QA 3-step state
  const [step,         setStep]        = useState(isQA ? 1 : 2)  // QA starts at step 1; president goes straight to sign
  const [distCopy,     setDistCopy]    = useState(data.distributionCopy || [])

  // QA Prepared By fields
  const [qaName,       setQaName]      = useState('')
  const [qaDate,       setQaDate]      = useState('')
  const [qaSig,        setQaSig]       = useState(null)

  // President fields
  const [presidentSig,  setPresidentSig]  = useState(null)
  const [presidentName, setPresidentName] = useState('')
  const [presidentDate, setPresidentDate] = useState('')

  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [errors,      setErrors]      = useState({})

  const toggleDist = (dept) =>
    setDistCopy(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept])

  // ── Download PDF ─────────────────────────────────────────────
  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { PDFDocument }          = await import('pdf-lib')
      const { default: jsPDF }       = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')
      const el     = printRef.current
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', width: 794, windowWidth: 794 })
      const img    = canvas.toDataURL('image/png')
      const jspdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pw = jspdf.internal.pageSize.getWidth(), ph = jspdf.internal.pageSize.getHeight()
      const mg = 6, maxW = pw - mg*2, maxH = ph - mg*2
      const ratio = canvas.width / canvas.height
      let iw = maxW, ih = iw / ratio
      if (ih > maxH) { ih = maxH; iw = ih * ratio }
      jspdf.addImage(img, 'PNG', (pw-iw)/2, mg, iw, ih)
      const merged = await PDFDocument.load(jspdf.output('arraybuffer'))
      const blob   = new Blob([await merged.save()], { type: 'application/pdf' })
      const url    = URL.createObjectURL(blob)
      const a      = document.createElement('a')
      a.href = url; a.download = `FINAL-MRF-${data.id}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error(err); alert('Could not generate PDF.') }
    finally { setDownloading(false) }
  }

  // ── Send ─────────────────────────────────────────────────────
  const handleSend = async () => {
    if (isPresident && !presidentSig) { setErrors({ sig: 'Please upload your e-signature.' }); return }
    if (isQA && !qaName)              { setErrors({ qaName: 'Please enter your name.' }); return }
    setSending(true)
    await new Promise(r => setTimeout(r, 1400))
    setSending(false); setSent(true)
    toast.success(isQA ? 'Copies sent to selected departments' : 'Document sent to QA Manager', {
      description: `${data.partName} (${data.id}) has been finalized.`,
    })
    setTimeout(() => setSent(false), 3000)
  }

  // ── Page header (shared) ─────────────────────────────────────
  const Header = () => (
    <div style={{ marginBottom: '24px' }}>
      <button onClick={onBack || (() => onNavigate?.('dashboard'))}
        style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        ← Back to Dashboard
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>Final Approved</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
            Control No. <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#111' }}>{data.id}</span>
            &nbsp;·&nbsp; {data.partName}
          </p>
        </div>
        <span style={{ padding: '5px 14px', background: '#DCFCE7', color: '#166534', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid #BBF7D0' }}>
          ✓ QA Approved
        </span>
      </div>
    </div>
  )

  // ── MRF Document block (shared) ──────────────────────────────
  const DocumentBlock = () => (
    <div ref={printRef} style={{ background: '#fff', padding: '12px', border: '1px solid #ccc', width: '794px', boxSizing: 'border-box' }}>
      <MRFDocument
        mrf={{
          applicationDate: data.applicationDate, partNumber: data.partNumber,
          partName: data.partName, targetDate: data.targetDate,
          preparedBy: data.preparedBy, factoryNo: data.factoryNo,
          checkedReasons: data.checkedReasons, specifyValues: data.specifyValues,
          detailedContent: data.detailedContent, reasonForChange: data.reasonForChange,
          alterations: data.alterations || [], altSpecify: data.altSpecify || '',
          pkgIp: data.pkgIp || '', pkgFg: data.pkgFg || '',
          preparedBySig: data.preparedBySig,
          notedBy1Name: data.notedBy1Name, notedBy1Date: data.notedBy1Date, notedBy1Sig: data.notedBy1Sig,
          notedBy2Name: data.notedBy2Name, notedBy2Date: data.notedBy2Date, notedBy2Sig: data.notedBy2Sig,
          conformedByName: data.conformedByName, conformedByDate: data.conformedByDate, conformedBySig: data.conformedBySig,
          conformedDecision: 'approved',  // FinalApproved = always conformed approved
          qaDecision: data.approvalDecision === 'accept' ? 'approved' : data.approvalDecision === 'reject' ? 'denied' : null,
        }}
        qa={{
          qaRemarks: data.qaRemarks, dateReceived: data.dateReceived,
          controlNo: data.controlNo, evalNeed: data.evalNeed,
          recommendation: data.recommendation, approvalCategory: data.approvalCategory,
          approvalDecision: data.approvalDecision,
          distributionCopy: isQA ? distCopy : (data.distributionCopy || []),
          preparedByName: isQA ? qaName : null,
          preparedByDate: isQA ? qaDate : null,
          preparedBySig:  isQA ? qaSig  : null,
          qaManagerName: isPresident ? null : (data.qaManagerName || null),
          qaManagerDate: isPresident ? null : (data.qaManagerDate || null),
          qaManagerSig:  isPresident ? null : (data.qaManagerSig  || null),
        }}
        presidentSig={presidentSig}
        presidentName={presidentName}
        presidentDate={presidentDate}
        showQA={true}
        showDistribution={isQA}
        user={user}
      />
    </div>
  )

  // ════════════════════════════════════════════════════════════════
  // PRESIDENT VIEW — unchanged: name + date + sig → Send to QA
  // ════════════════════════════════════════════════════════════════
  if (isPresident) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 0' }}>
        <Header />
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button onClick={handleDownload} disabled={downloading}
            style={{ padding: '9px 18px', background: '#F5C200', color: '#111', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'Arial', minWidth: '150px' }}>
            {downloading ? 'Generating...' : '↓ Download PDF'}
          </button>
          <button onClick={handleSend} disabled={sending}
            style={{ padding: '9px 18px', background: sent ? '#22C55E' : sending ? '#555' : '#111', color: sent ? '#fff' : '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'Arial', minWidth: '140px', transition: 'all 0.2s' }}>
            {sent ? '✓ Sent!' : sending ? 'Sending...' : '✉ Send to QA'}
          </button>
        </div>
        <DocumentBlock />
        {/* President signature panel */}
        <div style={{ marginTop: '24px', background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ background: '#111', padding: '14px 20px' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#F5C200' }}>✍ Your E-Signature</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Your signature appears in the Approved By section above</p>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <LabelSt required>Your Name</LabelSt>
                <input type="text" placeholder="e.g. T. Suzuki" value={presidentName}
                  onChange={e => setPresidentName(e.target.value)} style={inputSt} />
              </div>
              <div>
                <LabelSt>Date</LabelSt>
                <input type="date" value={presidentDate}
                  onChange={e => setPresidentDate(e.target.value)} style={inputSt} />
              </div>
            </div>
            <LabelSt required>E-Signature</LabelSt>
            <SigUpload value={presidentSig} onChange={v => { setPresidentSig(v); setErrors({}) }} />
            {errors.sig && <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.sig}</p>}
            {presidentSig && presidentName && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#DCFCE7', borderRadius: '6px', fontSize: '12px', color: '#166534', fontWeight: '600' }}>
                ✓ Your signature is visible in the Approved By section above.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // QA ADMIN VIEW — 3-step flow
  // ════════════════════════════════════════════════════════════════

  // ── STEP 1: Distribution Copy selection ─────────────────────
  if (step === 1) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 0' }}>
        <Header />
        <StepBar step={1} />

        <div style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E5E5', overflow: 'hidden' }}>
          <div style={{ background: '#111', padding: '16px 22px' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#F5C200' }}>Select Distribution Copy</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              Choose which departments will receive a copy of this approved MRF
            </p>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
              {DISTRIBUTION_COPY.map(dept => {
                const checked = distCopy.includes(dept)
                return (
                  <label key={dept} onClick={() => toggleDist(dept)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                    background: checked ? '#DCFCE7' : '#FAFAFA',
                    border: `1px solid ${checked ? '#22C55E' : '#E5E5E5'}`,
                    transition: 'all 0.15s', userSelect: 'none',
                  }}>
                    <div style={{
                      width: '18px', height: '18px', flexShrink: 0, borderRadius: '4px',
                      border: `2px solid ${checked ? '#22C55E' : '#D1D5DB'}`,
                      background: checked ? '#22C55E' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                    }}>
                      {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: checked ? '700' : '400', color: checked ? '#166534' : '#555' }}>{dept}</span>
                  </label>
                )
              })}
            </div>
            {distCopy.length > 0 && (
              <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#166534', fontWeight: '600' }}>
                ✓ {distCopy.length} department{distCopy.length > 1 ? 's' : ''} selected: {distCopy.join(', ')}
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                disabled={distCopy.length === 0}
                onClick={() => setStep(2)}
                style={{ padding: '10px 28px', background: distCopy.length ? '#111' : '#E5E5E5', color: distCopy.length ? '#F5C200' : '#aaa', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: distCopy.length ? 'pointer' : 'not-allowed', fontFamily: 'Arial' }}>
                Next — Review Document →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── STEP 2: Review document + QA Prepared By inputs ─────────
  if (step === 2) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 0' }}>
        <Header />
        <StepBar step={2} />

        {/* Back to step 1 */}
        <button onClick={() => setStep(1)}
          style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          ← Back to Distribution Copy
        </button>

        {/* Download button */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button onClick={handleDownload} disabled={downloading}
            style={{ padding: '9px 18px', background: '#F5C200', color: '#111', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'Arial', minWidth: '150px' }}>
            {downloading ? 'Generating...' : '↓ Download PDF'}
          </button>
        </div>

        {/* MRF Document */}
        <DocumentBlock />

        {/* QA Prepared By section */}
        <div style={{ marginTop: '24px', background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ background: '#111', padding: '14px 20px' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#F5C200' }}>✍ QA Department — Prepared By</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              Fill in your name, date and e-signature — appears in the Prepared By section of the document above
            </p>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <LabelSt required>Name</LabelSt>
                <input type="text" placeholder="e.g. M. Santos" value={qaName}
                  onChange={e => { setQaName(e.target.value); setErrors({}) }} style={inputSt} />
                {errors.qaName && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors.qaName}</p>}
              </div>
              <div>
                <LabelSt>Date</LabelSt>
                <input type="date" value={qaDate}
                  onChange={e => setQaDate(e.target.value)} style={inputSt} />
              </div>
            </div>
            <LabelSt required>E-Signature</LabelSt>
            <SigUpload value={qaSig} onChange={v => { setQaSig(v); setErrors({}) }} />
            {qaSig && qaName && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#DCFCE7', borderRadius: '6px', fontSize: '12px', color: '#166534', fontWeight: '600' }}>
                ✓ Your name and signature are visible in the Prepared By section above.
              </div>
            )}
          </div>
        </div>

        {/* Proceed to Send */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={() => setStep(3)}
            style={{ padding: '10px 28px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}>
            Next — Send Copies →
          </button>
        </div>
      </div>
    )
  }

  // ── STEP 3: Confirm and Send ─────────────────────────────────
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 0' }}>
      <Header />
      <StepBar step={3} />

      <button onClick={() => setStep(2)}
        style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        ← Back to Review
      </button>

      {/* Summary of what will be sent */}
      <div style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E5E5', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ background: '#FAFAFA', padding: '14px 20px', borderBottom: '0.5px solid #E5E5E5' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#111' }}>Ready to Send</p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>Review before sending — this cannot be undone</p>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>MRF</p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#111' }}>{data.id} — {data.partName}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Prepared By (QA)</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#111' }}>{qaName || <span style={{ color: '#aaa' }}>Not filled</span>}</p>
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Distribution Copy — {distCopy.length} department{distCopy.length > 1 ? 's' : ''}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {distCopy.map(d => (
                <span key={d} style={{ padding: '4px 10px', background: '#DCFCE7', color: '#166534', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Send button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSend} disabled={sending}
          style={{
            padding: '12px 32px',
            background: sent ? '#22C55E' : sending ? '#555' : '#111',
            color: sent ? '#fff' : '#F5C200',
            border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '700',
            cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'Arial',
            minWidth: '200px', transition: 'all 0.2s',
          }}>
          {sent ? '✓ Copies Sent!' : sending ? 'Sending...' : `✉ Send to ${distCopy.length} Department${distCopy.length > 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}