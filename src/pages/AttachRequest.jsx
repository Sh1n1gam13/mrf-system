// ─────────────────────────────────────────────────────────────────
// AttachRequest.jsx
// Reusable file dropzone for Attach Approved / Attach Denied pages
// Props: type = 'approved' | 'denied'
// TODO: Replace mock upload with Firebase Storage once connected
// ─────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react'

// ── Config per type ───────────────────────────────────────────────
const PAGE_CONFIG = {
  approved: {
    title:       'Attach Approved Request',
    subtitle:    'Upload the approved MRF request documents',
    accent:      '#22C55E',
    accentLight: '#DCFCE7',
    accentText:  '#166534',
    badgeBg:     '#DCFCE7',
    badgeColor:  '#166534',
    badgeLabel:  'Approved',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="1" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 12l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="7" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  denied: {
    title:       'Attach Denied Request',
    subtitle:    'Upload the denied MRF request documents',
    accent:      '#EF4444',
    accentLight: '#FEE2E2',
    accentText:  '#991B1B',
    badgeBg:     '#FEE2E2',
    badgeColor:  '#991B1B',
    badgeLabel:  'Denied',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="1" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="8" y1="9" x2="14" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="14" y1="9" x2="8"  y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="7" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
}

// ── Accepted file types ───────────────────────────────────────────
const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
const ACCEPTED_EXTENSIONS = '.pdf, .jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx'
const MAX_FILE_SIZE_MB = 10

// ── File icon by extension ─────────────────────────────────────────
function FileTypeIcon({ name }) {
  const ext = name.split('.').pop().toLowerCase()
  const map = {
    pdf:  { bg: '#FEE2E2', color: '#991B1B', label: 'PDF' },
    doc:  { bg: '#DBEAFE', color: '#1E40AF', label: 'DOC' },
    docx: { bg: '#DBEAFE', color: '#1E40AF', label: 'DOC' },
    xls:  { bg: '#DCFCE7', color: '#166534', label: 'XLS' },
    xlsx: { bg: '#DCFCE7', color: '#166534', label: 'XLS' },
    jpg:  { bg: '#F3E8FF', color: '#6B21A8', label: 'IMG' },
    jpeg: { bg: '#F3E8FF', color: '#6B21A8', label: 'IMG' },
    png:  { bg: '#F3E8FF', color: '#6B21A8', label: 'IMG' },
  }
  const cfg = map[ext] || { bg: '#F3F4F6', color: '#374151', label: ext.toUpperCase().slice(0,3) }
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '8px',
      background: cfg.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontSize: '9px', fontWeight: '700', color: cfg.color, letterSpacing: '0.5px' }}>
        {cfg.label}
      </span>
    </div>
  )
}

// ── Format file size ──────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Main Component ────────────────────────────────────────────────
export default function AttachRequest({ type = 'approved', user }) {
  const cfg = PAGE_CONFIG[type]

  const [files,       setFiles]       = useState([])   // { file, id, status, progress, error }
  const [isDragging,  setIsDragging]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [remarks,     setRemarks]     = useState('')
  const inputRef = useRef(null)

  // ── Add files ─────────────────────────────────────────────────
  const addFiles = useCallback((newFiles) => {
    const validated = Array.from(newFiles).map(file => {
      const tooLarge   = file.size > MAX_FILE_SIZE_MB * 1024 * 1024
      const badType    = !ACCEPTED_TYPES.includes(file.type)
      const duplicate  = files.some(f => f.file.name === file.name && f.file.size === file.size)
      let error = null
      if (duplicate)  error = 'Duplicate file'
      else if (badType)    error = 'File type not supported'
      else if (tooLarge)   error = `Exceeds ${MAX_FILE_SIZE_MB}MB limit`
      return {
        file,
        id:       `${file.name}-${Date.now()}-${Math.random()}`,
        status:   error ? 'error' : 'ready',
        progress: 0,
        error,
      }
    })
    setFiles(prev => [...prev, ...validated])
  }, [files])

  // ── Drag events ───────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true)  }
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const onDrop      = (e) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  // ── Remove file ───────────────────────────────────────────────
  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id))

  // ── Mock upload (replace with Firebase Storage later) ─────────
  const handleSubmit = async () => {
    const readyFiles = files.filter(f => f.status === 'ready')
    if (readyFiles.length === 0) return alert('Please attach at least one file.')

    // Simulate upload progress per file
    for (const item of readyFiles) {
      setFiles(prev => prev.map(f =>
        f.id === item.id ? { ...f, status: 'uploading', progress: 0 } : f
      ))
      // Simulate progress ticks — replace with Firebase Storage uploadBytesResumable()
      await new Promise(resolve => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 30
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
            setFiles(prev => prev.map(f =>
              f.id === item.id ? { ...f, status: 'done', progress: 100 } : f
            ))
            resolve()
          } else {
            setFiles(prev => prev.map(f =>
              f.id === item.id ? { ...f, progress: Math.round(progress) } : f
            ))
          }
        }, 120)
      })
    }
    setSubmitted(true)
  }

  const validFiles   = files.filter(f => f.status !== 'error')
  const errorFiles   = files.filter(f => f.status === 'error')
  const doneCount    = files.filter(f => f.status === 'done').length
  const allDone      = validFiles.length > 0 && validFiles.every(f => f.status === 'done')

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '28px 0' }}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: cfg.accentLight, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: cfg.accentText, flexShrink: 0,
        }}>
          {cfg.icon}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
            {cfg.title}
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{cfg.subtitle}</p>
        </div>
        <span style={{
          marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px',
          background: cfg.badgeBg, color: cfg.badgeColor,
          fontSize: '11px', fontWeight: '700',
        }}>
          {cfg.badgeLabel}
        </span>
      </div>

      {/* ── Success state ────────────────────────────────────────── */}
      {submitted && allDone ? (
        <div style={{
          background: '#DCFCE7', border: '1px solid #22C55E',
          borderRadius: '12px', padding: '40px', textAlign: 'center',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#22C55E', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700', color: '#166534' }}>
            Files Uploaded Successfully
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#166534', opacity: 0.8 }}>
            {doneCount} file{doneCount > 1 ? 's' : ''} uploaded successfully.
          </p>
          <button
            onClick={() => { setFiles([]); setSubmitted(false); setRemarks('') }}
            style={{
              padding: '9px 22px', background: '#111', color: '#F5C200',
              border: 'none', borderRadius: '6px', fontSize: '12px',
              fontWeight: '700', letterSpacing: '1px', cursor: 'pointer',
              fontFamily: 'Arial, Helvetica, sans-serif',
            }}
          >
            Attach Another
          </button>
        </div>
      ) : (
        <>
          {/* ── Remarks only ───────────────────────────────────── */}
          <div style={{
            background: '#fff', border: '0.5px solid #E5E5E5',
            borderRadius: '10px', padding: '18px 20px', marginBottom: '16px',
          }}>
            <label style={{
              display: 'block', fontSize: '10px', fontWeight: '700',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: '#555', marginBottom: '8px',
            }}>
              Remarks <span style={{ color: '#aaa', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Add a note about this attachment..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '13px',
                border: '1px solid #E5E5E5', borderRadius: '6px',
                fontFamily: 'Arial, Helvetica, sans-serif', color: '#111',
                background: '#FAFAFA', boxSizing: 'border-box', outline: 'none',
              }}
            />
          </div>

          {/* ── Dropzone ─────────────────────────────────────────── */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? cfg.accent : '#D1D5DB'}`,
              borderRadius: '12px',
              padding: '44px 28px',
              textAlign: 'center',
              background: isDragging ? cfg.accentLight : '#FAFAFA',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '16px',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              style={{ display: 'none' }}
              onChange={e => addFiles(e.target.files)}
            />

            {/* Upload icon */}
            <div style={{
              width: '52px', height: '52px', borderRadius: '12px',
              background: isDragging ? cfg.accent : '#F0F0F0',
              margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V8M9 11l3-3 3 3" stroke={isDragging ? '#fff' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke={isDragging ? '#fff' : '#888'} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '700', color: isDragging ? cfg.accentText : '#111' }}>
              {isDragging ? 'Release to upload' : 'Drag & drop files here'}
            </p>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#888' }}>
              or <span style={{ color: cfg.accent, fontWeight: '700', textDecoration: 'underline' }}>browse files</span> from your computer
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#bbb' }}>
              Accepted: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX · Max {MAX_FILE_SIZE_MB}MB per file · Multiple files allowed
            </p>
          </div>

          {/* ── File list ─────────────────────────────────────────── */}
          {files.length > 0 && (
            <div style={{
              background: '#fff', border: '0.5px solid #E5E5E5',
              borderRadius: '10px', overflow: 'hidden', marginBottom: '16px',
            }}>
              {/* List header */}
              <div style={{
                padding: '12px 16px', borderBottom: '0.5px solid #F0F0F0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#FAFAFA',
              }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#111' }}>
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                  {errorFiles.length > 0 && (
                    <span style={{ color: '#EF4444', fontWeight: '400', marginLeft: '8px' }}>
                      ({errorFiles.length} error{errorFiles.length > 1 ? 's' : ''})
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setFiles([])}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '11px', color: '#aaa',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                  }}
                >
                  Clear all
                </button>
              </div>

              {/* File rows */}
              {files.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px',
                    borderBottom: i < files.length - 1 ? '0.5px solid #F0F0F0' : 'none',
                    background: item.status === 'error' ? '#FFFBEB' : 'transparent',
                  }}
                >
                  <FileTypeIcon name={item.file.name} />

                  {/* File info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: '0 0 2px', fontSize: '13px', fontWeight: '600',
                      color: item.status === 'error' ? '#92400E' : '#111',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {item.file.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
                      {formatSize(item.file.size)}
                      {item.error && (
                        <span style={{ color: '#EF4444', marginLeft: '8px' }}>· {item.error}</span>
                      )}
                    </p>

                    {/* Progress bar */}
                    {(item.status === 'uploading' || item.status === 'done') && (
                      <div style={{ marginTop: '6px' }}>
                        <div style={{
                          height: '4px', background: '#F0F0F0', borderRadius: '2px', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${item.progress}%`,
                            background: item.status === 'done' ? '#22C55E' : cfg.accent,
                            borderRadius: '2px',
                            transition: 'width 0.2s',
                          }} />
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#888' }}>
                          {item.status === 'done' ? 'Uploaded' : `${item.progress}%`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div style={{ flexShrink: 0 }}>
                    {item.status === 'ready' && (
                      <span style={{
                        padding: '3px 8px', background: '#F0F0F0', borderRadius: '20px',
                        fontSize: '10px', color: '#666', fontWeight: '600',
                      }}>Ready</span>
                    )}
                    {item.status === 'uploading' && (
                      <span style={{
                        padding: '3px 8px', background: '#FEF3C7', borderRadius: '20px',
                        fontSize: '10px', color: '#92400E', fontWeight: '600',
                      }}>Uploading</span>
                    )}
                    {item.status === 'done' && (
                      <span style={{
                        padding: '3px 8px', background: '#DCFCE7', borderRadius: '20px',
                        fontSize: '10px', color: '#166534', fontWeight: '600',
                      }}>Done</span>
                    )}
                    {item.status === 'error' && (
                      <span style={{
                        padding: '3px 8px', background: '#FEE2E2', borderRadius: '20px',
                        fontSize: '10px', color: '#991B1B', fontWeight: '600',
                      }}>Error</span>
                    )}
                  </div>

                  {/* Remove button */}
                  {item.status !== 'uploading' && (
                    <button
                      onClick={() => removeFile(item.id)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'transparent', border: '0.5px solid #E5E5E5',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#aaa', fontSize: '14px',
                        flexShrink: 0, lineHeight: 1,
                        fontFamily: 'Arial, Helvetica, sans-serif',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#EF4444' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#E5E5E5' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Submit button ─────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => setFiles([])}
              style={{
                padding: '10px 20px', background: 'transparent',
                border: '1px solid #E5E5E5', borderRadius: '6px',
                fontSize: '12px', color: '#555', cursor: 'pointer',
                fontFamily: 'Arial, Helvetica, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#aaa'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E5E5'}
            >
              Clear All
            </button>
            <button
              onClick={handleSubmit}
              disabled={validFiles.length === 0}
              style={{
                padding: '10px 24px',
                background: validFiles.length === 0 ? '#ccc' : '#111',
                color: validFiles.length === 0 ? '#fff' : '#F5C200',
                border: 'none', borderRadius: '6px', fontSize: '12px',
                fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase',
                cursor: validFiles.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'Arial, Helvetica, sans-serif', transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (validFiles.length > 0) e.currentTarget.style.background = '#222' }}
              onMouseLeave={e => { if (validFiles.length > 0) e.currentTarget.style.background = '#111' }}
            >
              Upload {validFiles.length > 0 ? `(${validFiles.length} file${validFiles.length > 1 ? 's' : ''})` : ''}
            </button>
          </div>
        </>
      )}
    </div>
  )
}   