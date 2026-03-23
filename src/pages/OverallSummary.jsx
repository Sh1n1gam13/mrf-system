// ─────────────────────────────────────────────────────────────────
// OverallSummary.jsx
// Overall Summary — QA side Generate Summary view
// Uses MRFDocument for official form layout
// TODO: Wire real data from Firestore once Firebase is connected
// ─────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import MRFDocument from './MRFDocument'

// ── Mock combined data (replace with Firestore fetch later) ───────
const MOCK_SUMMARY = {
  request: {
    id:              '4M-M-7902',
    partName:        'Filter Housing Unit',
    partNumber:      'FH-1103',
    department:      'Engineering',
    preparedBy:      'Juan Dela Cruz',
    applicationDate: '2026-03-12',
    targetDate:      '2026-03-20',
    factoryNo:       'F-0042',
    checkedReasons:  { engg: true, quality: true },
    specifyValues:   {},
    detailedContent: 'Replace current filter housing with improved corrosion-resistant material to reduce failure rate in high-humidity environments.',
    reasonForChange: 'Frequent failure due to material degradation observed over the past 6 months of operation.',
    alterations:     ['WPS', 'PIS/PMIIS'],
    altSpecify:      '',
    pkgIp:           '',
    pkgFg:           '',
    preparedBySig:   null,
    notedBy1Name:    '',
    notedBy1Date:    '',
    notedBy1Sig:     null,
    notedBy2Name:    '',
    notedBy2Date:    '',
    notedBy2Sig:     null,
    conformedByName: '',
    conformedByDate: '',
    conformedBySig:  null,
  },
  evaluation: {
    controlNo:        '4M-M-7902',
    dateReceived:     '2026-03-15',
    qaRemarks:        'Material change is justified. Proposed material meets required specifications for humidity resistance.',
    evalNeed:         'need',
    recommendation:   'Proceed with material change. Conduct pilot run before full production rollout.',
    approvalCategory: 'internal',
    approvalDecision: 'accept',
    distributionCopy: ['QA', 'ENGINEERING/MOLD', 'PRODUCTION', 'QC'],
    preparedByName:   'Maria Santos',
    preparedByDate:   '2026-03-15',
    preparedBySig:    null,
    qaManagerName:    null,
    qaManagerDate:    null,
    qaManagerSig:     null,
  },
}

export default function OverallSummary({ requestId, evalData, user, onNavigate, onBack }) {
  const data     = MOCK_SUMMARY
  const { request: req } = data
  // Use live evalData from EvaluationForm if provided, fall back to mock
  const eva = evalData ? { ...data.evaluation, ...evalData } : data.evaluation
  const printRef = useRef(null)
  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState(false)
  const [downloading, setDownloading] = useState(false)

  // ── Download PDF via jsPDF + html2canvas ──────────────────────
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
      const blob = new Blob([await PDFDocument.load(jspdf.output('arraybuffer')).then(d => d.save())], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `MRF-Summary-${req.id}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF error:', err)
      alert('Could not generate PDF. Please try again.')
    } finally { setDownloading(false) }
  }

  const handleSendCopy = async () => {
    setSending(true)
    // TODO: Implement email distribution once Firebase connected
    await new Promise(r => setTimeout(r, 1400))
    setSending(false); setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  const handleEdit = () => {
    onNavigate && onNavigate('evaluate', requestId)
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 0' }}>

      {/* ── Action bar ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          onClick={onBack || (() => onNavigate && onNavigate('dashboard'))}
          style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Review / Edit */}
          <button onClick={handleEdit}
            style={{ padding: '9px 18px', background: 'transparent', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'Arial', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#aaa'; e.currentTarget.style.color = '#111' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#555' }}
          >
            ✎ Review / Edit
          </button>
          {/* Download PDF */}
          <button onClick={handleDownload} disabled={downloading}
            style={{ padding: '9px 18px', background: '#F5C200', color: '#111', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'Arial', minWidth: '150px' }}
          >
            {downloading ? 'Generating...' : '↓ Download PDF'}
          </button>
          {/* Send Copy */}
          <button onClick={handleSendCopy} disabled={sending}
            style={{ padding: '9px 18px', background: sent ? '#22C55E' : sending ? '#333' : '#111', color: sent ? '#fff' : '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'Arial', transition: 'all 0.2s', minWidth: '130px' }}
          >
            {sent ? '✓ Sent!' : sending ? 'Sending...' : '✉ Send Copy'}
          </button>
        </div>
      </div>

      {/* ── Official Form Document ───────────────────────────────── */}
      <div ref={printRef} style={{ background: '#fff', padding: '12px', border: '1px solid #ccc', width: '794px', boxSizing: 'border-box' }}>
        <MRFDocument
          mrf={{
            applicationDate: req.applicationDate,
            partNumber:      req.partNumber,
            partName:        req.partName,
            targetDate:      req.targetDate,
            preparedBy:      req.preparedBy,
            factoryNo:       req.factoryNo,
            checkedReasons:  req.checkedReasons,
            specifyValues:   req.specifyValues,
            detailedContent: req.detailedContent,
            reasonForChange: req.reasonForChange,
            alterations:     req.alterations,
            altSpecify:      req.altSpecify,
            pkgIp:           req.pkgIp,
            pkgFg:           req.pkgFg,
            preparedBySig:   req.preparedBySig,
            notedBy1Name:    req.notedBy1Name,
            notedBy1Date:    req.notedBy1Date,
            notedBy1Sig:     req.notedBy1Sig,
            notedBy2Name:    req.notedBy2Name,
            notedBy2Date:    req.notedBy2Date,
            notedBy2Sig:     req.notedBy2Sig,
            conformedByName: req.conformedByName,
            conformedByDate: req.conformedByDate,
            conformedBySig:  req.conformedBySig,
            conformedDecision: 'approved',
            qaDecision: eva.approvalDecision === 'accept' ? 'approved' : eva.approvalDecision === 'reject' ? 'denied' : null,
          }}
          qa={{
            qaRemarks:        eva.qaRemarks,
            dateReceived:     eva.dateReceived,
            controlNo:        eva.controlNo,
            evalNeed:         eva.evalNeed,
            recommendation:   eva.recommendation,
            approvalCategory: eva.approvalCategory,
            approvalDecision: eva.approvalDecision,
            distributionCopy: eva.distributionCopy,
            preparedByName:   eva.preparedByName,
            preparedByDate:   eva.preparedByDate,
            preparedBySig:    eva.preparedBySig,
            qaManagerName:    eva.qaManagerName,
            qaManagerDate:    eva.qaManagerDate,
            qaManagerSig:     eva.qaManagerSig,
          }}
          showQA={true}
          showDistribution={true}
          user={user}
        />
      </div>
    </div>
  )
}