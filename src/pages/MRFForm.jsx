// ─────────────────────────────────────────────────────────────────
// MRFForm.jsx — QAD-F-7.1.1.2 REV.10
// Summary layout matches official form exactly (table grid)
// PDF preview via embed, image preview inline
// Others (Pls. specify) works in both Reason and Alteration sections
// ─────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { ALTERATIONS_OF_STANDARD } from '../constants'
import MRFDocument from './MRFDocument'

// ── Official reason structure (matches QAD-F-7.1.1.2 REV.10) ──────
const REASON_STRUCTURE = [
  { id: 'engg',        label: "Eng'g Change/s",               indent: 0, hasSpecify: false },
  { id: 'tooling',     label: 'Tooling Transfer',              indent: 0, hasSpecify: false },
  { id: 'correction',  label: 'Correction',                    indent: 0, hasSpecify: false },
  { id: 'quality',     label: 'Quality Enhancement',           indent: 0, hasSpecify: false },
  { id: 'method',      label: 'Method',                        indent: 0, hasSpecify: false },
  { id: 'partprocess', label: 'Change in Part Process',        indent: 1, hasSpecify: false },
  { id: 'changestd',   label: 'Change in Std.',                indent: 1, hasSpecify: false },
  { id: 'stdspec',     label: 'Pls. specify',                  indent: 2, specifyOnly: true, parentId: 'changestd' },
  { id: 'others1',     label: 'Others',                        indent: 1, hasSpecify: false },
  { id: 'others1spec', label: 'Pls. specify',                  indent: 2, specifyOnly: true, parentId: 'others1' },
  { id: 'subcon',      label: "Subcon or Mat'l Source Change", indent: 0, hasSpecify: false },
  { id: 'processplant',label: 'Change in Process Plant',       indent: 0, hasSpecify: false },
  { id: 'others2',     label: 'Others (Pls. specify)',         indent: 0, hasSpecify: true  },
  { id: 'machine',     label: 'Change in Machine',             indent: 0, hasSpecify: false },
  { id: 'material',    label: 'Change in Material',            indent: 0, hasSpecify: false },
  { id: 'manpower',    label: 'Change in Manpower',            indent: 0, hasSpecify: false },
]

// ── Alterations that have a specify field ─────────────────────────
const ALT_HAS_SPECIFY = ['Others (Pls. specify)', 'Packaging Std.']

// ── Tiny checkbox ──────────────────────────────────────────────────
function CB({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: '14px', height: '14px', flexShrink: 0,
      border: `2px solid ${checked ? '#111' : '#666'}`,
      background: checked ? '#111' : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.1s',
    }}>
      {checked && (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}

function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555', marginBottom: '7px' }}>
      {children}{required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
    </label>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: '13px',
  border: '1px solid #E5E5E5', borderRadius: '6px',
  fontFamily: 'Arial, Helvetica, sans-serif', color: '#111',
  background: '#fff', boxSizing: 'border-box', outline: 'none',
}

// ── Signature upload mini-component ───────────────────────────────
function SignatureUpload({ label, value, onChange }) {
  const ref = useRef(null)
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => onChange(e.target.result)
    reader.readAsDataURL(file)
  }
  return (
    <div>
      <FieldLabel>{label} E-Signature</FieldLabel>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={value} alt={label} style={{ height: '52px', maxWidth: '200px', objectFit: 'contain', border: '1px solid #E5E5E5', borderRadius: '4px', background: '#fff', display: 'block' }} />
          <button
            onClick={() => onChange(null)}
            style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
          >×</button>
        </div>
      ) : (
        <>
          <input ref={ref} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          <div
            onClick={() => ref.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
            style={{ border: '1.5px dashed #D1D5DB', borderRadius: '6px', padding: '10px 14px', cursor: 'pointer', background: '#FAFAFA', textAlign: 'center', fontSize: '11px', color: '#888', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#F5C200'; e.currentTarget.style.background = '#FFFBEB' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#FAFAFA' }}
          >
            <span style={{ fontSize: '16px' }}>✍</span>
            <p style={{ margin: '2px 0 0', fontSize: '11px' }}>Upload PNG / JPG</p>
          </div>
        </>
      )}
    </div>
  )
}

function SectionCard({ number, title, children }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '0.5px solid #E5E5E5', background: '#FAFAFA' }}>
        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#F5C200' }}>{number}</span>
        </div>
        <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#111' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// SendRequestPage — select dept + name for Noted By & Conformed By
// ─────────────────────────────────────────────────────────────────
const DEPARTMENTS = ['Engineering', 'Production']

function SendRequestPage({ data, onBack, onSent }) {
  // Noted By — dynamic, max 3 specific people
  const [notedList, setNotedList] = useState([{ dept: '', name: '' }])
  const addNoted     = () => { if (notedList.length < 3) setNotedList(p => [...p, { dept: '', name: '' }]) }
  const removeNoted  = (i) => setNotedList(p => p.filter((_, idx) => idx !== i))
  const updateNoted  = (i, field, val) => setNotedList(p => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  // Conformed By — dynamic, multiple specific people
  const [conformedList, setConformedList] = useState([{ dept: '', name: '' }])
  const [sending, setSending] = useState(false)
  const [errors,  setErrors]  = useState({})

  const addConformed    = () => setConformedList(p => [...p, { dept: '', name: '' }])
  const removeConformed = (i) => setConformedList(p => p.filter((_, idx) => idx !== i))
  const updateConformed = (i, field, val) => setConformedList(p => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s))

  const inputSt = {
    width: '100%', padding: '10px 14px', fontSize: '13px',
    border: '1px solid #E5E5E5', borderRadius: '6px',
    fontFamily: 'Arial', color: '#111', boxSizing: 'border-box', outline: 'none',
  }
  const Label = ({ children, required }) => (
    <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555', marginBottom: '7px' }}>
      {children}{required && <span style={{ color: '#EF4444' }}> *</span>}
    </label>
  )

  const SignatoryRow = ({ label, dept, name, onDept, onName, errDept, errName, required, onRemove }) => (
    <div style={{ background: '#FAFAFA', border: '0.5px solid #E5E5E5', borderRadius: '8px', padding: '14px 16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#111' }}>
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </p>
        {onRemove && (
          <button onClick={onRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '12px', fontWeight: '700', padding: '0 4px' }}>
            ✕ Remove
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <Label required={required}>Department</Label>
          <select value={dept} onChange={e => onDept(e.target.value)}
            style={{ ...inputSt, border: errDept ? '1px solid #EF4444' : '1px solid #E5E5E5', cursor: 'pointer', background: '#fff' }}>
            <option value="" disabled>Select department...</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {errDept && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errDept}</p>}
        </div>
        <div>
          <Label required={required}>Person's Name</Label>
          <input type="text" placeholder="e.g. John Smith" value={name} onChange={e => onName(e.target.value)}
            style={{ ...inputSt, border: errName ? '1px solid #EF4444' : '1px solid #E5E5E5' }} />
          {errName && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errName}</p>}
        </div>
      </div>
    </div>
  )

  const handleSend = async () => {
    const e = {}
    if (!notedList[0].dept)        e.notedDept0  = 'Please select a department.'
    if (!notedList[0].name.trim()) e.notedName0  = 'Please enter a name.'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setSending(true)
    await new Promise(r => setTimeout(r, 900))
    setSending(false)
    toast.success('MRF Request Sent', {
      description: `${data.partName} (${data.partNumber}) has been sent. To be Noted By: ${notedList[0].name} (${notedList[0].dept}).`,
    })
    onSent()
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '28px 0', fontFamily: 'Arial, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <button onClick={onBack}
          style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          ← Back to Summary
        </button>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>Send Request</h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
          Specify who will sign as <strong>Noted By</strong> and <strong>Conformed By</strong> before sending.
        </p>
      </div>

      {/* MRF info card */}
      <div style={{ background: '#FAFAFA', border: '0.5px solid #E5E5E5', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px', display: 'flex', gap: '24px' }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Part Name</p>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#111' }}>{data.partName}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Part No.</p>
          <p style={{ margin: 0, fontSize: '13px', fontFamily: 'monospace', color: '#111' }}>{data.partNumber}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Prepared By</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#111' }}>{data.preparedBy}</p>
        </div>
      </div>

      {/* ── Noted By — dynamic, max 3 specific people ── */}
      <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ background: '#111', padding: '14px 20px' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#F5C200' }}>Noted By</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Specific people who will note this MRF (max 3)</p>
        </div>
        <div style={{ padding: '20px' }}>
          {notedList.map((s, i) => (
            <SignatoryRow
              key={i}
              label={`Signatory ${i + 1}`}
              dept={s.dept} name={s.name}
              onDept={v => updateNoted(i, 'dept', v)}
              onName={v => updateNoted(i, 'name', v)}
              errDept={i === 0 ? errors.notedDept0 : null}
              errName={i === 0 ? errors.notedName0 : null}
              required={i === 0}
              onRemove={i > 0 ? () => removeNoted(i) : null}
            />
          ))}
          {notedList.length < 3 && (
            <button onClick={addNoted}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px', background: 'transparent', border: '1px dashed #D1D5DB', borderRadius: '6px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'Arial', marginTop: '4px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.color = '#111' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#555' }}>
              + Add Signatory
            </button>
          )}
        </div>
      </div>

      {/* ── Conformed By — dynamic, multiple specific people ── */}
      <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden', marginBottom: '28px' }}>
        <div style={{ background: '#111', padding: '14px 20px' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#F5C200' }}>Conformed By</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Specific people who will conform this MRF</p>
        </div>
        <div style={{ padding: '20px' }}>
          {conformedList.map((s, i) => (
            <SignatoryRow
              key={i}
              label={`Signatory ${i + 1}`}
              dept={s.dept} name={s.name}
              onDept={v => updateConformed(i, 'dept', v)}
              onName={v => updateConformed(i, 'name', v)}
              required={i === 0}
              onRemove={i > 0 ? () => removeConformed(i) : null}
            />
          ))}
          <button onClick={addConformed}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px', background: 'transparent', border: '1px dashed #D1D5DB', borderRadius: '6px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'Arial', marginTop: '4px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.color = '#111' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#555' }}>
            + Add Signatory
          </button>
        </div>
      </div>

      {/* Send / Cancel */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={onBack}
          style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'Arial' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#aaa'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E5E5'}>
          ← Cancel
        </button>
        <button onClick={handleSend} disabled={sending}
          style={{ padding: '10px 28px', background: sending ? '#555' : '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'Arial', minWidth: '160px' }}>
          {sending ? 'Sending...' : '✉ Send Request'}
        </button>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MRF Summary — matches official form layout exactly
// ─────────────────────────────────────────────────────────────────
function MRFSummary({ data, onEdit, onBack }) {
  const printRef  = useRef(null)
  const [downloading,   setDownloading]   = useState(false)
  const [showSendPage,  setShowSendPage]  = useState(false)

  // ── Show Send Request page when Send is clicked ───────────────
  if (showSendPage) {
    return (
      <SendRequestPage
        data={data}
        onBack={() => setShowSendPage(false)}
        onSent={onBack}
      />
    )
  }

  // ── Real PDF download: MRF as page 1, attached PDFs appended ─────
  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { PDFDocument }          = await import('pdf-lib')
      const { default: jsPDF }       = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      // Step 1 — capture ONLY the form table (printRef), not the attachment previews
      // Force capture width to A4 at 96dpi (794px) so aspect ratio fits one page
      const el      = printRef.current
      const A4_PX_W = 794
      const canvas  = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        width: A4_PX_W,
        windowWidth: A4_PX_W,
      })
      const mrfImg = canvas.toDataURL('image/png')

      // Step 2 — fit the form into a single A4 page with margins (guaranteed single page)
      const jspdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW  = jspdf.internal.pageSize.getWidth()   // 210mm
      const pageH  = jspdf.internal.pageSize.getHeight()  // 297mm
      const margin = 6  // mm on each side
      const maxW   = pageW - margin * 2
      const maxH   = pageH - margin * 2

      const ratio  = canvas.width / canvas.height
      let imgW = maxW
      let imgH = imgW / ratio
      if (imgH > maxH) {
        imgH = maxH
        imgW = imgH * ratio
      }

      const x = (pageW - imgW) / 2
      const y = margin
      jspdf.addImage(mrfImg, 'PNG', x, y, imgW, imgH)

      // Step 3 — get jsPDF output as ArrayBuffer
      const mrfBytes = jspdf.output('arraybuffer')

      // Step 4 — merge with attached PDF files using pdf-lib
      const merged = await PDFDocument.load(mrfBytes)

      const pdfAttachments = (data.attachments || []).filter(f => f.name.toLowerCase().endsWith('.pdf'))
      for (const file of pdfAttachments) {
        try {
          const fileBytes   = await file.arrayBuffer()
          const srcDoc      = await PDFDocument.load(fileBytes)
          const pageCount   = srcDoc.getPageCount()
          const copiedPages = await merged.copyPages(srcDoc, Array.from({ length: pageCount }, (_, i) => i))
          copiedPages.forEach(page => merged.addPage(page))
        } catch (pageErr) {
          console.warn(`Could not merge ${file.name}:`, pageErr)
        }
      }

      // Step 5 — embed image attachments as A4 pages
      const imgAttachments = (data.attachments || []).filter(f => {
        const ext = f.name.split('.').pop().toLowerCase()
        return ['jpg','jpeg','png'].includes(ext)
      })
      for (const file of imgAttachments) {
        try {
          const imgBytes    = await file.arrayBuffer()
          const ext         = file.name.split('.').pop().toLowerCase()
          const embedded    = ext === 'png' ? await merged.embedPng(imgBytes) : await merged.embedJpg(imgBytes)
          const page        = merged.addPage()
          const A4W = 595.28, A4H = 841.89, mg = 40
          const maxIW = A4W - mg * 2, maxIH = A4H - mg * 2
          const { width: iw, height: ih } = embedded.scale(1)
          const sc  = Math.min(maxIW / iw, maxIH / ih, 1)
          const dw  = iw * sc, dh = ih * sc
          page.setSize(A4W, A4H)
          page.drawImage(embedded, { x: (A4W - dw) / 2, y: (A4H - dh) / 2, width: dw, height: dh })
        } catch (imgErr) {
          console.warn(`Could not embed image ${file.name}:`, imgErr)
        }
      }

      // Step 6 — save and trigger download
      const finalBytes = await merged.save()
      const blob       = new Blob([finalBytes], { type: 'application/pdf' })
      const url        = URL.createObjectURL(blob)
      const a          = document.createElement('a')
      a.href           = url
      a.download       = `MRF-${data.partNumber || 'form'}-${data.applicationDate || 'draft'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF error:', err)
      alert('Could not generate PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // Attachment previews
  const attachItems = (data.attachments || []).map(f => {
    const ext = f.name.split('.').pop().toLowerCase()
    const isImg = ['jpg','jpeg','png','gif','webp'].includes(ext)
    const isPdf = ext === 'pdf'
    return { file: f, ext, isImg, isPdf, url: (isImg || isPdf) ? URL.createObjectURL(f) : null }
  })

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 0' }}>
      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={onEdit} style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          ← Edit Form
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownload} disabled={downloading}
            style={{ padding: '9px 18px', background: '#F5C200', color: '#111', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'Arial', minWidth: '150px' }}>
            {downloading ? 'Generating PDF...' : '↓ Download PDF'}
          </button>
          {/* Send button → redirects to SendRequestPage */}
          <button
            onClick={() => setShowSendPage(true)}
            style={{ padding: '9px 18px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}>
            ✉ Send Request →
          </button>
        </div>
      </div>

      {/* ── Official Form Document — constrained to A4 width ─────── */}
      <div ref={printRef} style={{ background: '#fff', padding: '12px', border: '1px solid #ccc', width: '794px', boxSizing: 'border-box' }}>
        <MRFDocument
          mrf={{
            applicationDate: data.applicationDate,
            partNumber:      data.partNumber,
            partName:        data.partName,
            targetDate:      data.targetDate,
            preparedBy:      data.preparedBy,
            factoryNo:       data.factoryNo,
            checkedReasons:  data.checkedReasons,
            specifyValues:   data.specifyValues,
            detailedContent: data.detailedContent,
            reasonForChange: data.reasonForChange,
            alterations:     data.alterations,
            altSpecify:      data.altSpecify,
            pkgIp:           data.pkgIp,
            pkgFg:           data.pkgFg,
            preparedBySig:   data.preparedBySig,
            notedBy1Name:    data.notedBy1Name,
            notedBy1Date:    data.notedBy1Date,
            notedBy1Sig:     data.notedBy1Sig,
            notedBy2Name:    data.notedBy2Name,
            notedBy2Date:    data.notedBy2Date,
            notedBy2Sig:     data.notedBy2Sig,
            conformedByName: data.conformedByName,
            conformedByDate: data.conformedByDate,
            conformedBySig:  data.conformedBySig,
          }}
          qa={{}}
          showQA={false}
        />
      </div>

      {/* ── Attachment previews — outside printRef so html2canvas ignores them ── */}
      {attachItems.length > 0 && (
        <div style={{ marginTop: '24px', borderTop: '2px dashed #ccc', paddingTop: '16px' }}>
          {attachItems.map((item, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              {/* Image preview */}
              {item.isImg && item.url && (
                <div style={{ textAlign: 'center', background: '#F9FAFB', border: '1px solid #E5E5E5', borderRadius: '6px', padding: '12px' }}>
                  <img src={item.url} alt={item.file.name} style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }} />
                </div>
              )}
              {/* PDF preview — embed directly, no header card */}
              {item.isPdf && item.url && (
                <div style={{ border: '1px solid #E5E5E5', borderRadius: '6px', overflow: 'hidden' }}>
                  <embed src={item.url} type="application/pdf" width="100%" height="800px" style={{ display: 'block' }} />
                </div>
              )}
              {/* Non-previewable */}
              {!item.isImg && !item.isPdf && (
                <div style={{ padding: '16px', background: '#F9FAFB', border: '1px solid #E5E5E5', borderRadius: '6px', textAlign: 'center', color: '#888', fontSize: '12px' }}>
                  Preview not available for .{item.ext} files — file is attached and will be included when submitted.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Main Form
// ─────────────────────────────────────────────────────────────────
export default function MRFForm({ user, onNavigate, onBack }) {
  const fileInputRef = useRef(null)

  const [applicationDate, setApplicationDate] = useState('')
  const [partNumber,      setPartNumber]       = useState('')
  const [partName,        setPartName]         = useState('')
  const [targetDate,      setTargetDate]       = useState('')
  const [preparedBy,      setPreparedBy]       = useState('')
  const [factoryNo,       setFactoryNo]        = useState('')
  const [checkedReasons,  setCheckedReasons]   = useState({})
  const [specifyValues,   setSpecifyValues]    = useState({})
  const [detailedContent, setDetailedContent]  = useState('')
  const [contentFrom,     setContentFrom]      = useState('')
  const [contentTo,       setContentTo]        = useState('')
  const [attachments,     setAttachments]       = useState([])
  const [isDragging,      setIsDragging]        = useState(false)
  const [reasonForChange, setReasonForChange]  = useState('')
  const [alterations,     setAlterations]      = useState([])
  const [altSpecify,      setAltSpecify]       = useState('')
  const [pkgIp,           setPkgIp]            = useState('')
  const [pkgFg,           setPkgFg]            = useState('')
  const [preparedBySig,    setPreparedBySig]    = useState(null)
  const [notedBy1Name,     setNotedBy1Name]     = useState('')
  const [notedBy1Date,     setNotedBy1Date]     = useState('')
  const [notedBy1Sig,      setNotedBy1Sig]      = useState(null)
  const [notedBy2Name,     setNotedBy2Name]     = useState('')
  const [notedBy2Date,     setNotedBy2Date]     = useState('')
  const [notedBy2Sig,      setNotedBy2Sig]      = useState(null)
  const [conformedByName,  setConformedByName]  = useState('')
  const [conformedByDate,  setConformedByDate]  = useState('')
  const [conformedBySig,   setConformedBySig]   = useState(null)
  const [errors,          setErrors]           = useState({})
  const [showSummary,     setShowSummary]      = useState(false)

  const toggleReason = (id) => {
    setCheckedReasons(prev => ({ ...prev, [id]: !prev[id] }))
    setErrors(p => ({ ...p, reasons: null }))
  }

  const toggleAlt = (val) => {
    setAlterations(prev => prev.includes(val) ? prev.filter(a => a !== val) : [...prev, val])
  }

  const addFiles = (files) => {
    const newFiles = Array.from(files).filter(f => !attachments.some(a => a.name === f.name && a.size === f.size))
    setAttachments(prev => [...prev, ...newFiles])
  }

  const removeFile = (i) => setAttachments(prev => prev.filter((_, idx) => idx !== i))

  const validate = () => {
    const e = {}
    if (!applicationDate)    e.applicationDate = 'Required'
    if (!partNumber.trim())  e.partNumber  = 'Required'
    if (!partName.trim())    e.partName    = 'Required'
    if (!targetDate)         e.targetDate  = 'Required'
    if (!preparedBy.trim())  e.preparedBy  = 'Required'
    if (!factoryNo.trim())   e.factoryNo   = 'Required'
    if (!Object.values(checkedReasons).some(Boolean)) e.reasons = 'Select at least one reason'
    if (!detailedContent.trim()) e.detailedContent = 'Required'
    if (!reasonForChange.trim()) e.reasonForChange = 'Required'
    setErrors(e)
    if (Object.keys(e).length > 0) {
      const firstKey = Object.keys(e)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return Object.keys(e).length === 0
  }

  const ErrMsg = ({ field }) => errors[field]
    ? <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444' }}>{errors[field]}</p>
    : null
  const getBorder = (field) => errors[field] ? '1px solid #EF4444' : '1px solid #E5E5E5'

  if (showSummary) {
    return (
      <MRFSummary
        data={{ applicationDate, partNumber, partName, targetDate, preparedBy, factoryNo, checkedReasons, specifyValues, detailedContent, contentFrom, contentTo, attachments, reasonForChange, alterations, altSpecify, pkgIp, pkgFg, preparedBySig, notedBy1Name, notedBy1Date, notedBy1Sig, notedBy2Name, notedBy2Date, notedBy2Sig, conformedByName, conformedByDate, conformedBySig }}
        onEdit={() => setShowSummary(false)}
        onBack={onBack || (() => onNavigate && onNavigate('dashboard'))}
      />
    )
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '28px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={onBack || (() => onNavigate && onNavigate('dashboard'))} style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          ← Back to Dashboard
        </button>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>Modification Request Form</h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>QAD-F-7.1.1.2 REV.10 · Fill in all required fields then review before submitting to QA</p>
      </div>

      {/* Section 1 — Basic Info */}
      <SectionCard number="1" title="Basic Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { id: 'applicationDate', label: 'Application Date', type: 'date',  value: applicationDate, set: setApplicationDate },
            { id: 'targetDate',      label: 'Target Date',       type: 'date',  value: targetDate,      set: setTargetDate      },
            { id: 'partNumber',      label: 'Part Number',       type: 'text',  value: partNumber,      set: setPartNumber,  ph: 'e.g. BP-2201', mono: true },
            { id: 'partName',        label: 'Part Name',         type: 'text',  value: partName,        set: setPartName,    ph: 'e.g. Brake Pad Assembly' },
            { id: 'preparedBy',      label: 'Prepared By',       type: 'text',  value: preparedBy,      set: setPreparedBy,  ph: 'Full name' },
            { id: 'factoryNo',       label: 'Factory No.',       type: 'text',  value: factoryNo,       set: setFactoryNo,   ph: 'e.g. F-0042' },
          ].map(({ id, label, type, value, set, ph, mono }) => (
            <div key={id} id={`field-${id}`}>
              <FieldLabel required>{label}</FieldLabel>
              <input type={type} placeholder={ph} value={value}
                onChange={e => { set(e.target.value); setErrors(p => ({ ...p, [id]: null })) }}
                style={{ ...inputStyle, border: getBorder(id), fontFamily: mono ? 'monospace' : 'Arial' }}
              />
              <ErrMsg field={id} />
            </div>
          ))}
        </div>

        {/* E-Signatures — Prepared By only. Noted By and Conformed By sign in MRFDetail */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '0.5px solid #E5E5E5' }}>
          <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Your E-Signature</p>
          <div style={{ padding: '14px 16px', background: '#FAFAFA', borderRadius: '8px', border: '0.5px solid #E5E5E5' }}>
            <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '700', color: '#111' }}>Prepared By</p>
            <SignatureUpload label="Prepared By" value={preparedBySig} onChange={setPreparedBySig} />
            <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#aaa' }}>Noted By and Conformed By will sign the document after submission.</p>
          </div>
        </div>
      </SectionCard>

      {/* Section 2 — Reason for Submission */}
      <SectionCard number="2" title="Reason for Submission">
        <div id="field-reasons">
          {errors.reasons && (
            <div style={{ background: '#FEE2E2', borderLeft: '3px solid #EF4444', padding: '8px 12px', borderRadius: '0 4px 4px 0', marginBottom: '12px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#991B1B' }}>{errors.reasons}</p>
            </div>
          )}
          {REASON_STRUCTURE.map(item => {
            if (item.specifyOnly) {
              if (!checkedReasons[item.parentId]) return null
              return (
                <div key={item.id} style={{ paddingLeft: `${item.indent * 24 + 8}px`, marginBottom: '6px', marginTop: '2px' }}>
                  <input type="text" placeholder="Please specify..."
                    value={specifyValues[item.parentId] || ''}
                    onChange={e => setSpecifyValues(prev => ({ ...prev, [item.parentId]: e.target.value }))}
                    style={{ ...inputStyle, fontSize: '12px', padding: '6px 12px', width: '260px', display: 'inline-block' }}
                  />
                </div>
              )
            }
            const checked = !!checkedReasons[item.id]
            return (
              <div key={item.id} style={{ paddingLeft: `${item.indent * 24}px`, marginBottom: '2px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', background: checked ? '#FFFDE7' : 'transparent', userSelect: 'none' }}>
                  <CB checked={checked} onChange={() => toggleReason(item.id)} />
                  <span style={{ fontSize: '13px', color: checked ? '#111' : '#444', fontWeight: checked ? '700' : '400' }}>{item.label}</span>
                </label>
                {item.hasSpecify && !item.specifyOnly && checked && (
                  <div style={{ paddingLeft: '30px', marginTop: '4px', marginBottom: '4px' }}>
                    <input type="text" placeholder="Please specify..."
                      value={specifyValues[item.id] || ''}
                      onChange={e => setSpecifyValues(prev => ({ ...prev, [item.id]: e.target.value }))}
                      style={{ ...inputStyle, fontSize: '12px', padding: '6px 12px', width: '300px', display: 'inline-block' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Section 3 — Content & Attachments */}
      <SectionCard number="3" title="Detailed Content of Change">

        {/* From / To fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <FieldLabel>From</FieldLabel>
            <input type="text" placeholder="e.g. 78mm"
              value={contentFrom} onChange={e => setContentFrom(e.target.value)}
              style={{ ...inputStyle }} />
          </div>
          <div>
            <FieldLabel>To</FieldLabel>
            <input type="text" placeholder="e.g. 70mm"
              value={contentTo} onChange={e => setContentTo(e.target.value)}
              style={{ ...inputStyle }} />
          </div>
        </div>

        <div id="field-detailedContent" style={{ marginBottom: '20px' }}>
          <FieldLabel required>Detailed Content of Change</FieldLabel>
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#888' }}>Describe the exact modification. Include illustration, flow, etc.</p>
          <textarea rows={5} placeholder="Describe the content of change in detail..."
            value={detailedContent}
            onChange={e => { setDetailedContent(e.target.value); setErrors(p => ({ ...p, detailedContent: null })) }}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', border: getBorder('detailedContent') }}
          />
          <ErrMsg field="detailedContent" />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <FieldLabel>Attachment</FieldLabel>
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#888' }}>* Refer to 4M Matrix for required attachments.</p>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false) }}
            onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            style={{ border: `2px dashed ${isDragging ? '#F5C200' : '#D1D5DB'}`, borderRadius: '8px', padding: '24px', textAlign: 'center', background: isDragging ? '#FFFBEB' : '#FAFAFA', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '10px' }}
          >
            <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: isDragging ? '#92400E' : '#111' }}>{isDragging ? 'Release to attach' : 'Drag & drop files here'}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>or <span style={{ color: '#F5C200', fontWeight: '700', textDecoration: 'underline' }}>browse files</span></p>
            <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#bbb' }}>PDF, JPG, PNG, DOC, DOCX, XLS, XLSX</p>
          </div>
          {attachments.length > 0 && (
            <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '8px 14px', background: '#FAFAFA', borderBottom: '0.5px solid #F0F0F0', display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#111' }}>{attachments.length} file{attachments.length > 1 ? 's' : ''} attached</p>
                <button onClick={() => setAttachments([])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#aaa', fontFamily: 'Arial' }}>Clear all</button>
              </div>
              {attachments.map((file, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: i < attachments.length - 1 ? '0.5px solid #F0F0F0' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '30px', height: '30px', borderRadius: '5px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: '700', color: '#1E40AF', flexShrink: 0 }}>
                      {file.name.split('.').pop().toUpperCase().slice(0,3)}
                    </span>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#111' }}>{file.name}</p>
                  </div>
                  <button onClick={() => removeFile(i)} style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'transparent', border: '0.5px solid #E5E5E5', cursor: 'pointer', fontSize: '13px', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#aaa' }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div id="field-reasonForChange">
          <FieldLabel required>Reason for Change</FieldLabel>
          <textarea rows={4} placeholder="State the reason why this change is necessary..."
            value={reasonForChange}
            onChange={e => { setReasonForChange(e.target.value); setErrors(p => ({ ...p, reasonForChange: null })) }}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', border: getBorder('reasonForChange') }}
          />
          <ErrMsg field="reasonForChange" />
        </div>
      </SectionCard>

      {/* Section 4 — Alteration of Standard */}
      <SectionCard number="4" title="Alteration of Standard">
        <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#888' }}>Select all standards that will be altered.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 16px' }}>
          {ALTERATIONS_OF_STANDARD.map(alt => {
            const checked  = alterations.includes(alt)
            const isPkg    = alt === 'Packaging Std.'
            const isOthers = alt === 'Others (Pls. specify)'
            return (
              <div key={alt}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', background: checked ? '#FFFDE7' : 'transparent', userSelect: 'none' }}>
                  <CB checked={checked} onChange={() => toggleAlt(alt)} />
                  <span style={{ fontSize: '12px', color: checked ? '#111' : '#444', fontWeight: checked ? '700' : '400' }}>{alt}</span>
                </label>
                {/* Packaging Std — IP and FG inputs */}
                {isPkg && checked && (
                  <div style={{ paddingLeft: '30px', marginTop: '6px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#555', whiteSpace: 'nowrap' }}>IP:</span>
                      <input type="text" placeholder="___" value={pkgIp} onChange={e => setPkgIp(e.target.value)}
                        style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px', width: '60px', display: 'inline-block', textAlign: 'center' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#555', whiteSpace: 'nowrap' }}>FG:</span>
                      <input type="text" placeholder="___" value={pkgFg} onChange={e => setPkgFg(e.target.value)}
                        style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px', width: '60px', display: 'inline-block', textAlign: 'center' }} />
                    </div>
                  </div>
                )}
                {/* Others — specify text input */}
                {isOthers && checked && (
                  <div style={{ paddingLeft: '30px', marginTop: '4px', marginBottom: '4px' }}>
                    <input type="text" placeholder="Please specify..."
                      value={altSpecify}
                      onChange={e => setAltSpecify(e.target.value)}
                      style={{ ...inputStyle, fontSize: '12px', padding: '6px 12px', width: '260px', display: 'inline-block' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {alterations.length > 0 && (
          <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#555', fontWeight: '600' }}>{alterations.length} alteration{alterations.length > 1 ? 's' : ''} selected</p>
        )}
      </SectionCard>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '0.5px solid #E5E5E5' }}>
        <button onClick={onBack || (() => onNavigate && onNavigate('dashboard'))}
          style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'Arial' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#aaa'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E5E5'}
        >
          ← Cancel
        </button>
        <button onClick={() => { if (validate()) setShowSummary(true) }}
          style={{ padding: '11px 32px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Arial' }}
          onMouseEnter={e => e.currentTarget.style.background = '#222'}
          onMouseLeave={e => e.currentTarget.style.background = '#111'}
        >
          Review & Submit →
        </button>
      </div>
    </div>
  )
}