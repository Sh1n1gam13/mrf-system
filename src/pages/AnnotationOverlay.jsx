// ─────────────────────────────────────────────────────────────────
// AnnotationOverlay.jsx
// Full-screen overlay for Requester to annotate Conformers' attached
// files when denying work in the pending_requester_review state.
//
// Supports:
//   PDF   → PDF.js renders each page as background; Fabric.js overlay
//   Image → rendered as Fabric background image; annotate on top
//   DOC/XLS → text-based reason only (no canvas)
//
// Install first:
//   npm install pdfjs-dist@3.11.174 fabric@5
//
// Props:
//   file      — File object | URL string | null (null = mock mode)
//   fileName  — string
//   fileType  — 'pdf' | 'image' | 'doc' | 'xls'
//   onConfirm — (annotations: Array, reason: string) => void
//   onCancel  — () => void
//
// Annotation object shape:
//   { id, type: 'highlight'|'pin', page, x, y, w?, h?, number? }
//   Stored in Firestore (not burned into file) — TODO: Firebase
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { fabric }    from 'fabric'

// ── PDF.js worker ─────────────────────────────────────────────────
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

// ── Canvas dimensions ─────────────────────────────────────────────
const CANVAS_W = 760
const CANVAS_H = 520

// ── File type helpers ─────────────────────────────────────────────
const getFileCategory = (fileType) => {
  if (fileType === 'pdf')                      return 'pdf'
  if (fileType === 'image')                    return 'image'
  if (fileType === 'doc' || fileType === 'xls') return 'text'
  return 'unknown'
}

// ── Main Component ────────────────────────────────────────────────
export default function AnnotationOverlay({
  file,
  fileName  = 'Attachment',
  fileType  = 'pdf',
  onConfirm,
  onCancel,
}) {
  const category = getFileCategory(fileType)
  const isMock   = !file

  // ── UI phase ──────────────────────────────────────────────────
  // 'annotating' → user draws on canvas
  // 'done'       → canvas locked, reason textarea shown
  const [phase,       setPhase]       = useState('annotating')
  const [tool,        setTool]        = useState('highlight') // 'highlight' | 'pin'
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [annCount,    setAnnCount]    = useState(0)
  const [reason,      setReason]      = useState('')
  const [loadError,   setLoadError]   = useState(null)
  const [loading,     setLoading]     = useState(false)

  // ── Refs (stable across renders — used inside Fabric events) ──
  const fabricCanRef   = useRef(null)   // <canvas> element Fabric mounts to
  const fabricRef      = useRef(null)   // fabric.Canvas instance
  const pdfDocRef      = useRef(null)   // pdfjs document
  const toolRef        = useRef('highlight')
  const phaseRef       = useRef('annotating')
  const pageRef        = useRef(1)
  const isDrawingRef   = useRef(false)
  const startPtRef     = useRef(null)
  const activeRectRef  = useRef(null)
  const pinCountRef    = useRef(0)
  const allAnnotsRef   = useRef([])

  // Keep refs in sync with state
  useEffect(() => { toolRef.current  = tool  }, [tool])
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { pageRef.current  = currentPage }, [currentPage])

  // ── Init or reinit Fabric canvas ──────────────────────────────
  // bgDataUrl: optional PNG data URL to set as read-only background
  const initFabric = (w, h, bgDataUrl = null) => {
    if (fabricRef.current) {
      fabricRef.current.dispose()
      fabricRef.current = null
    }
    if (!fabricCanRef.current) return

    const fc = new fabric.Canvas(fabricCanRef.current, {
      width:    w,
      height:   h,
      selection: false,
      backgroundColor: null,
    })
    fabricRef.current = fc

    const afterBg = () => {
      setLoading(false)
      bindEvents(fc)
    }

    if (bgDataUrl) {
      // Set PDF page / image as locked background
      fabric.Image.fromURL(bgDataUrl, (img) => {
        img.set({ selectable: false, evented: false })
        fc.setBackgroundImage(img, () => {
          fc.renderAll()
          afterBg()
        }, { scaleX: 1, scaleY: 1 })
      })
    } else {
      afterBg()
    }
  }

  // ── Bind Fabric mouse events ──────────────────────────────────
  const bindEvents = (fc) => {
    fc.off('mouse:down')
    fc.off('mouse:move')
    fc.off('mouse:up')

    fc.on('mouse:down', (opt) => {
      if (phaseRef.current !== 'annotating') return
      const p = fc.getPointer(opt.e)

      // ── Highlight mode: start drawing rect ──────────────────
      if (toolRef.current === 'highlight') {
        isDrawingRef.current = true
        startPtRef.current   = { x: p.x, y: p.y }
        const rect = new fabric.Rect({
          left: p.x, top: p.y, width: 1, height: 1,
          fill:        'rgba(226,75,74,0.12)',
          stroke:      '#E24B4A',
          strokeWidth: 2,
          selectable:  false,
          evented:     false,
        })
        fc.add(rect)
        activeRectRef.current = rect

      // ── Pin mode: place numbered marker ─────────────────────
      } else if (toolRef.current === 'pin') {
        pinCountRef.current++
        const n      = pinCountRef.current
        const circle = new fabric.Circle({
          radius: 12,
          fill:        '#E24B4A',
          stroke:      '#fff',
          strokeWidth: 1.5,
          originX:     'center',
          originY:     'center',
        })
        const label = new fabric.Text(String(n), {
          fontSize:   11,
          fill:       '#fff',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          originX:    'center',
          originY:    'center',
          top:        1,
        })
        const grp = new fabric.Group([circle, label], {
          left:        p.x - 12,
          top:         p.y - 12,
          selectable:  true,
          hasControls: false,
          hasBorders:  false,
        })
        fc.add(grp)
        fc.renderAll()

        allAnnotsRef.current = [
          ...allAnnotsRef.current,
          {
            id:     `pin-${n}-p${pageRef.current}`,
            type:   'pin',
            page:   pageRef.current,
            number: n,
            x:      Math.round(p.x),
            y:      Math.round(p.y),
          },
        ]
        setAnnCount(allAnnotsRef.current.length)
      }
    })

    // ── Stretch highlight rect as mouse moves ──────────────────
    fc.on('mouse:move', (opt) => {
      if (!isDrawingRef.current || !activeRectRef.current) return
      const p = fc.getPointer(opt.e)
      const s = startPtRef.current
      const w = p.x - s.x
      const h = p.y - s.y
      activeRectRef.current.set({
        width:  Math.abs(w),
        height: Math.abs(h),
        left:   w >= 0 ? s.x : p.x,
        top:    h >= 0 ? s.y : p.y,
      })
      fc.renderAll()
    })

    // ── Finalise highlight rect on mouse up ────────────────────
    fc.on('mouse:up', () => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      const rect = activeRectRef.current
      activeRectRef.current = null
      if (!rect) return

      // Discard tiny accidental clicks
      if ((rect.width || 0) < 5 || (rect.height || 0) < 5) {
        fc.remove(rect)
        fc.renderAll()
        return
      }
      rect.set({ selectable: true, evented: true })
      fc.renderAll()

      allAnnotsRef.current = [
        ...allAnnotsRef.current,
        {
          id:   `hl-${Date.now()}-p${pageRef.current}`,
          type: 'highlight',
          page: pageRef.current,
          x:    Math.round(rect.left),
          y:    Math.round(rect.top),
          w:    Math.round(rect.width),
          h:    Math.round(rect.height),
        },
      ]
      setAnnCount(allAnnotsRef.current.length)
    })
  }

  // ── Render a PDF page → extract as data URL → init Fabric ─────
  const renderPDFPage = async (n, doc) => {
    setLoading(true)
    try {
      const page     = await doc.getPage(n)
      const baseVP   = page.getViewport({ scale: 1 })
      const scale    = Math.min(CANVAS_W / baseVP.width, CANVAS_H / baseVP.height)
      const viewport = page.getViewport({ scale })

      // Render to offscreen canvas
      const offscreen = document.createElement('canvas')
      offscreen.width  = Math.round(viewport.width)
      offscreen.height = Math.round(viewport.height)
      await page.render({ canvasContext: offscreen.getContext('2d'), viewport }).promise

      initFabric(offscreen.width, offscreen.height, offscreen.toDataURL())
    } catch (err) {
      setLoadError('Could not render page: ' + err.message)
      setLoading(false)
    }
  }

  // ── Load PDF document ─────────────────────────────────────────
  useEffect(() => {
    if (category !== 'pdf') return
    if (isMock) {
      // No real file — show blank annotatable canvas
      initFabric(CANVAS_W, CANVAS_H)
      return
    }
    const load = async () => {
      setLoading(true)
      try {
        let src
        if (typeof file === 'string') {
          src = file
        } else if (file instanceof File) {
          const buf = await file.arrayBuffer()
          src = { data: buf }
        }
        const doc = await pdfjsLib.getDocument(src).promise
        pdfDocRef.current = doc
        setTotalPages(doc.numPages)
        await renderPDFPage(1, doc)
      } catch (err) {
        setLoadError('Could not load PDF: ' + err.message)
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Load image ────────────────────────────────────────────────
  useEffect(() => {
    if (category !== 'image') return
    setLoading(true)
    const src = typeof file === 'string'
      ? file
      : file instanceof File
      ? URL.createObjectURL(file)
      : null

    if (!src) {
      initFabric(CANVAS_W, CANVAS_H)
      return
    }

    const img = new Image()
    img.onload = () => {
      const scale   = Math.min(CANVAS_W / img.width, CANVAS_H / img.height, 1)
      const w = Math.round(img.width  * scale)
      const h = Math.round(img.height * scale)

      const offscreen = document.createElement('canvas')
      offscreen.width  = w
      offscreen.height = h
      offscreen.getContext('2d').drawImage(img, 0, 0, w, h)
      initFabric(w, h, offscreen.toDataURL())
    }
    img.onerror = () => {
      setLoadError('Could not load image.')
      setLoading(false)
    }
    img.src = src
  }, [])

  // ── Text-only files: just show canvas placeholder + reason ────
  useEffect(() => {
    if (category !== 'text' && category !== 'unknown') return
    setPhase('done')   // skip annotation phase, go straight to reason
  }, [])

  // ── Cleanup ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose()
        fabricRef.current = null
      }
    }
  }, [])

  // ── Page navigation (PDF) ─────────────────────────────────────
  const goToPage = async (n) => {
    if (n < 1 || n > totalPages || !pdfDocRef.current) return
    setCurrentPage(n)
    await renderPDFPage(n, pdfDocRef.current)
  }

  // ── Clear all annotations ─────────────────────────────────────
  const handleClearAll = () => {
    if (!fabricRef.current) return
    // Remove annotation objects but keep background image
    const bg = fabricRef.current.backgroundImage
    fabricRef.current.clear()
    if (bg) {
      fabricRef.current.setBackgroundImage(bg, fabricRef.current.renderAll.bind(fabricRef.current))
    } else {
      fabricRef.current.renderAll()
    }
    allAnnotsRef.current = []
    pinCountRef.current  = 0
    setAnnCount(0)
  }

  // ── Done annotating → lock canvas, show reason ────────────────
  const handleDone = () => {
    if (fabricRef.current) {
      fabricRef.current.getObjects().forEach(obj =>
        obj.set({ selectable: false, evented: false, hoverCursor: 'default' })
      )
      fabricRef.current.discardActiveObject()
      fabricRef.current.renderAll()
    }
    setPhase('done')
  }

  // ── Confirm denial ────────────────────────────────────────────
  const handleConfirm = () => {
    if (!reason.trim()) return
    onConfirm(allAnnotsRef.current, reason.trim())
  }

  // ── Derived ───────────────────────────────────────────────────
  const ext         = (fileName || '').split('.').pop().toLowerCase()
  const isTextFile  = category === 'text' || category === 'unknown'
  const showCanvas  = !isTextFile
  const pagesOnAnnot = allAnnotsRef.current.length > 0
    ? [...new Set(allAnnotsRef.current.map(a => a.page))].length
    : 0

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: '13px',
    border: '1px solid #E5E5E5', borderRadius: '6px',
    fontFamily: 'Arial', color: '#111', background: '#FAFAFA',
    boxSizing: 'border-box', outline: 'none', resize: 'vertical',
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.72)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Arial, Helvetica, sans-serif',
    }}>
      <div style={{
        width: 'min(860px, 96vw)',
        maxHeight: '94vh',
        background: '#fff',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '11px 16px',
          borderBottom: '0.5px solid #E5E5E5',
          flexShrink: 0, flexWrap: 'wrap',
        }}>

          {/* File badge + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, flexShrink: 1 }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0,
              background: ext === 'pdf' ? '#FEE2E2' : ['jpg','jpeg','png'].includes(ext) ? '#F3E8FF' : '#FEF3C7',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: '700',
                color: ext === 'pdf' ? '#991B1B' : ['jpg','jpeg','png'].includes(ext) ? '#6B21A8' : '#92400E' }}>
                {ext.toUpperCase().slice(0, 3)}
              </span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#111',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName}
            </span>
            {isMock && !isTextFile && (
              <span style={{ fontSize: '10px', color: '#bbb', flexShrink: 0, whiteSpace: 'nowrap' }}>
                (mock — no real file)
              </span>
            )}
          </div>

          {/* PDF page nav */}
          {category === 'pdf' && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                style={{ padding: '4px 9px', border: '0.5px solid #E5E5E5', borderRadius: '5px',
                  background: '#fff', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12px', color: '#555', opacity: currentPage <= 1 ? 0.4 : 1 }}>‹</button>
              <span style={{ fontSize: '12px', color: '#555', padding: '0 4px', whiteSpace: 'nowrap' }}>
                {currentPage} / {totalPages}
              </span>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
                style={{ padding: '4px 9px', border: '0.5px solid #E5E5E5', borderRadius: '5px',
                  background: '#fff', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '12px', color: '#555', opacity: currentPage >= totalPages ? 0.4 : 1 }}>›</button>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Annotation toolbar — annotating phase + canvas files only */}
          {phase === 'annotating' && !isTextFile && (
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              {[
                { id: 'highlight', label: 'Highlight' },
                { id: 'pin',       label: 'Pin'       },
              ].map(t => (
                <button key={t.id} onClick={() => setTool(t.id)}
                  style={{ padding: '5px 11px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
                    fontWeight: tool === t.id ? '700' : '400',
                    background: tool === t.id ? '#111' : '#fff',
                    border: `0.5px solid ${tool === t.id ? '#111' : '#E5E5E5'}`,
                    color: tool === t.id ? '#F5C200' : '#555' }}>
                  {t.label}
                </button>
              ))}
              <button onClick={handleClearAll}
                style={{ padding: '5px 11px', border: '0.5px solid #E5E5E5',
                  borderRadius: '6px', fontSize: '11px', background: '#fff',
                  color: '#888', cursor: 'pointer' }}>
                Clear all
              </button>
            </div>
          )}

          {/* Done annotating button */}
          {phase === 'annotating' && !isTextFile && (
            <button onClick={handleDone}
              style={{ padding: '7px 14px', background: '#111', color: '#F5C200',
                border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
              Done annotating →
            </button>
          )}

          {/* Close */}
          <button onClick={onCancel}
            style={{ width: '28px', height: '28px', border: '0.5px solid #E5E5E5',
              borderRadius: '6px', background: '#fff', cursor: 'pointer',
              fontSize: '16px', color: '#888', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}>
            ×
          </button>
        </div>

        {/* ── Canvas area ────────────────────────────────────── */}
        {showCanvas && (
          <div style={{ flex: 1, overflow: 'auto', background: '#E8E8E8',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '20px', minHeight: '200px', position: 'relative' }}>

            {/* Loading overlay */}
            {loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <span style={{ fontSize: '13px', color: '#888' }}>Loading...</span>
              </div>
            )}

            {/* Error */}
            {loadError && (
              <div style={{ padding: '20px', background: '#FEE2E2', borderRadius: '8px',
                fontSize: '13px', color: '#991B1B', textAlign: 'center' }}>
                {loadError}
              </div>
            )}

            {/* Mock placeholder (no real file) */}
            {!loadError && isMock && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ textAlign: 'center', opacity: 0.25 }}>
                  <svg width="240" height="180" viewBox="0 0 240 180">
                    {[16, 32, 48, 64, 80, 96, 112, 128, 144, 160].map((y, i) => (
                      <rect key={y} x="20" y={y} width={i % 3 === 0 ? 200 : i % 3 === 1 ? 140 : 170}
                        height="8" rx="4" fill="#555" />
                    ))}
                  </svg>
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#555' }}>
                    File preview not available in mock
                  </p>
                </div>
              </div>
            )}

            {/* Fabric.js canvas — single canvas for everything */}
            <canvas ref={fabricCanRef}
              style={{
                display: 'block',
                borderRadius: '4px',
                border: '1px solid #ccc',
                cursor: phase === 'annotating'
                  ? (tool === 'highlight' ? 'crosshair' : 'cell')
                  : 'default',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </div>
        )}

        {/* Text-only mode (DOC/XLS) */}
        {isTextFile && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px', background: '#FAFAFA' }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FEF3C7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="1" width="18" height="22" rx="2" stroke="#92400E" strokeWidth="1.5"/>
                  <line x1="7" y1="7"  x2="17" y2="7"  stroke="#92400E" strokeWidth="1.2"/>
                  <line x1="7" y1="11" x2="17" y2="11" stroke="#92400E" strokeWidth="1.2"/>
                  <line x1="7" y1="15" x2="13" y2="15" stroke="#92400E" strokeWidth="1.2"/>
                </svg>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '700', color: '#111' }}>
                {fileName}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#888', lineHeight: '1.7' }}>
                Annotation is not supported for DOC or XLS files.
                Provide a text reason below — Conformers will receive your written feedback.
              </p>
            </div>
          </div>
        )}

        {/* ── Hint bar (annotating phase only) ──────────────── */}
        {phase === 'annotating' && !isTextFile && (
          <div style={{ padding: '8px 16px', background: '#FFFBEB',
            borderTop: '0.5px solid #FDE68A', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: '#92400E' }}>
              {tool === 'highlight'
                ? 'Highlight: click and drag to mark an area that needs correction'
                : 'Pin: click anywhere to place a numbered marker'}
              {annCount > 0 && (
                <span style={{ marginLeft: '10px', fontWeight: '600' }}>
                  · {annCount} annotation{annCount !== 1 ? 's' : ''} added
                </span>
              )}
            </span>
            {annCount > 0 && (
              <span style={{ fontSize: '11px', color: '#92400E', fontWeight: '600', flexShrink: 0 }}>
                Click "Done annotating →" when finished
              </span>
            )}
          </div>
        )}

        {/* ── Reason + confirm (done phase) ─────────────────── */}
        {phase === 'done' && (
          <div style={{ borderTop: '0.5px solid #E5E5E5', padding: '16px 20px',
            background: '#fff', flexShrink: 0 }}>

            {/* Annotation summary */}
            {annCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', background: '#FFF5F5', border: '0.5px solid #F09595',
                borderRadius: '6px', marginBottom: '12px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="10" height="10" rx="1" stroke="#E24B4A" strokeWidth="1.2"/>
                  <path d="M3 5l2 2 4-4" fill="none" stroke="#E24B4A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: '12px', color: '#A32D2D' }}>
                  {annCount} annotation{annCount !== 1 ? 's' : ''} added
                  {pagesOnAnnot > 1 ? ` across ${pagesOnAnnot} pages` : ''}
                  {' '} — Conformers will see these in read-only mode.
                </span>
              </div>
            )}

            <label style={{ display: 'block', fontSize: '10px', fontWeight: '700',
              letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555', marginBottom: '8px' }}>
              Reason for Denial <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Explain what needs to be corrected or revised by the Conformers..."
              rows={4}
              style={{ ...inputStyle, minHeight: '80px', lineHeight: '1.6' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button onClick={onCancel}
                style={{ padding: '9px 20px', background: 'transparent',
                  border: '0.5px solid #E5E5E5', borderRadius: '6px',
                  fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'Arial' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#aaa'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E5E5'}>
                Cancel
              </button>
              {/* Back to annotating — only for canvas files */}
              {!isTextFile && annCount === 0 && (
                <button onClick={() => setPhase('annotating')}
                  style={{ padding: '9px 20px', background: 'transparent',
                    border: '0.5px solid #111', borderRadius: '6px',
                    fontSize: '12px', color: '#111', cursor: 'pointer', fontFamily: 'Arial' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  ← Back to annotate
                </button>
              )}
              <button onClick={handleConfirm} disabled={!reason.trim()}
                style={{ padding: '9px 24px',
                  background: reason.trim() ? '#EF4444' : '#E5E5E5',
                  color: reason.trim() ? '#fff' : '#aaa',
                  border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                  cursor: reason.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Arial' }}
                onMouseEnter={e => { if (reason.trim()) e.currentTarget.style.background = '#DC2626' }}
                onMouseLeave={e => { if (reason.trim()) e.currentTarget.style.background = '#EF4444' }}>
                ✕ Confirm Denial
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}