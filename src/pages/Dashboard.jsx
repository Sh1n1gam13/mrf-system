// ─────────────────────────────────────────────────────────────────
// Dashboard.jsx — QA Dashboard
// HS Technologies (Phils.), Inc. — MRF System
//
// Changes (Task 5):
// - Status system updated to new statuses
// - QA-specific status display labels
// - Sidebar: Inbox added, badge renamed to QA Manager
// - Bell notification dropdown (top bar)
// - QA Review Queue → 2-card summary widget
// - All MRF Requests table: Requester + Noted By + Conformed By columns
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { toast }         from 'sonner'
import EvaluationForm    from './EvaluationForm'
import OverallSummary    from './OverallSummary'
import MatrixPage        from './MatrixPage'
import FinalApproved     from './FinalApproved'
import SummaryPage       from './SummaryPage'

// ── Mock data ─────────────────────────────────────────────────────
const MOCK_REQUESTS = [
  { id: '4M-M-7900', partName: 'Brake Pad Assembly',    partNumber: 'BP-2201', customer: 'TNPH',    date: '2026-03-10',
    status: 'pending_noted',
    requester:   { name: 'R. Abanico', dept: 'Production' },
    notedBy:     [{ name: 'J. Smith', dept: 'Engineering' }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production' }] },

  { id: '4M-M-7901', partName: 'Drive Shaft Coupling',  partNumber: 'DS-4402', customer: 'FDTP',    date: '2026-03-11',
    status: 'noted_signed',
    requester:   { name: 'L. Santos', dept: 'Engineering' },
    notedBy:     [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production' }] },

  { id: '4M-M-7902', partName: 'Filter Housing Unit',   partNumber: 'FH-1103', customer: 'GLORY',   date: '2026-03-12',
    status: 'pending_requester_review',
    requester:   { name: 'R. Abanico', dept: 'Production' },
    notedBy:     [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }, { name: 'P. Reyes', dept: 'Production', signed: true }] },

  { id: '4M-M-7903', partName: 'Gear Box Seal',         partNumber: 'GB-3304', customer: 'SHINSEI', date: '2026-03-13',
    status: 'qa_draft',
    requester:   { name: 'C. Reyes', dept: 'Engineering' },
    notedBy:     [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }] },

  { id: '4M-M-7904', partName: 'Coolant Pump Cover',    partNumber: 'CP-5505', customer: 'SUZUCOH', date: '2026-03-14',
    status: 'awaiting_managers_approval',
    requester:   { name: 'L. Santos', dept: 'Engineering' },
    notedBy:     [{ name: 'J. Smith', dept: 'Engineering', signed: true }, { name: 'A. Cruz', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }] },

  { id: '4M-M-7905', partName: 'Valve Spring Retainer', partNumber: 'VS-6606', customer: 'MTMP',    date: '2026-03-15',
    status: 'qa_denied',
    requester:   { name: 'R. Abanico', dept: 'Production' },
    notedBy:     [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }] },

  { id: '4M-M-7906', partName: 'Piston Ring Set',       partNumber: 'PR-7707', customer: 'JCM',     date: '2026-03-16',
    status: 'final_approved',
    requester:   { name: 'C. Reyes', dept: 'Engineering' },
    notedBy:     [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }] },

  { id: '4M-M-7907', partName: 'Camshaft Bearing',      partNumber: 'CB-8808', customer: 'GLORY',   date: '2026-03-16',
    status: 'issuance',
    requester:   { name: 'L. Santos', dept: 'Engineering' },
    notedBy:     [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }] },

  { id: '4M-M-7908', partName: 'Oil Filter Housing',    partNumber: 'OF-9901', customer: 'TNPH',    date: '2026-03-17',
    status: 'qa_review',
    requester:   { name: 'R. Abanico', dept: 'Production' },
    notedBy:     [{ name: 'J. Smith', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'M. Cruz', dept: 'Production', signed: true }] },

  { id: '4M-M-7909', partName: 'Timing Belt Tensioner', partNumber: 'TB-1102', customer: 'FDTP',    date: '2026-03-17',
    status: 'qa_review',
    requester:   { name: 'C. Reyes', dept: 'Engineering' },
    notedBy:     [{ name: 'A. Cruz', dept: 'Engineering', signed: true }],
    conformedBy: [{ name: 'P. Reyes', dept: 'Production', signed: true }] },
]

// ── Mock notifications ────────────────────────────────────────────
const MOCK_NOTIFS = [
  { id: 'n1', type: 'eval',    message: '4M-M-7908 — Oil Filter Housing is awaiting QA Staff evaluation.',      date: '2026-03-17' },
  { id: 'n2', type: 'eval',    message: '4M-M-7909 — Timing Belt Tensioner is awaiting QA Staff evaluation.',   date: '2026-03-17' },
  { id: 'n3', type: 'manager', message: '4M-M-7904 — Coolant Pump Cover is awaiting Manager\'s approval.',      date: '2026-03-16' },
  { id: 'n4', type: 'signed',  message: '4M-M-7906 has been signed by the President — ready for final processing.', date: '2026-03-16' },
]

// ── QA-specific status display labels ─────────────────────────────
// These are what the QA Dashboard shows — simplified view labels
const QA_STATUS_LABEL = {
  pending_noted:              { label: 'Pending — Noting Stage',        bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  noted_signed:               { label: 'Pending — Noting Stage',        bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  pending_conformed:          { label: 'Pending — Conformation Stage',  bg: '#FED7AA', color: '#9A3412', dot: '#F97316' },
  pending_requester_review:   { label: 'Pending — Requester Review',    bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  returned_by_requester:      { label: 'Pending — Requester Review',    bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  conformed_approved:         { label: 'Ready for QA Evaluation',       bg: '#F3E8FF', color: '#6B21A8', dot: '#A855F7' },
  qa_review:                  { label: 'Ready for QA Evaluation',       bg: '#F3E8FF', color: '#6B21A8', dot: '#A855F7' },
  qa_draft:                   { label: 'Ready for Manager\'s Evaluation', bg: '#FEF9C3', color: '#854D0E', dot: '#CA8A04' },
  awaiting_managers_approval: { label: 'Awaiting Manager\'s Approval',  bg: '#E0E7FF', color: '#3730A3', dot: '#6366F1' },
  qa_denied:                  { label: 'Returned by QA',                bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  qa_approved:                { label: 'QA Approved — Awaiting President', bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  final_approved:             { label: 'Final Approved — Ready for Issuance', bg: '#DCFCE7', color: '#14532D', dot: '#16A34A' },
  issuance:                   { label: 'Issued',                        bg: '#E0E7FF', color: '#3730A3', dot: '#6366F1' },
}

// Full status config for filters
const STATUS_FILTER_OPTIONS = {
  pending_noted:              'For Noting',
  noted_signed:               'Noted & Signed',
  pending_conformed:          'For Confirmation',
  pending_requester_review:   'Pending Requester Review',
  returned_by_requester:      'Returned by Requester',
  conformed_approved:         'Conformed & Approved',
  qa_review:                  'QA Review',
  qa_draft:                   'QA Draft',
  awaiting_managers_approval: "Awaiting Manager's Approval",
  qa_denied:                  'Returned by QA',
  qa_approved:                'QA Approved',
  final_approved:             'Final Approved',
  issuance:                   'Issued',
}

// ── Nav items ─────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',         label: 'Dashboard'        },
  { id: 'matrix',            label: 'Matrix'           },
  { id: 'inbox',             label: 'Inbox'            },
  { id: 'pending_requests',  label: 'Pending Request'  },
  { id: 'approved_requests', label: 'Approved Request' },
  { id: 'denied_requests',   label: 'Denied Request'   },
  { id: 'final_approved',    label: 'Final Approved'   },
  { id: 'summary',           label: 'MRF Summary'      },
]

// ── SVG Icons ─────────────────────────────────────────────────────
function IconDashboard({ active }) {
  const c = active ? '#F5C200' : 'rgba(255,255,255,0.4)'
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke={c} strokeWidth="1.2"/><rect x="9" y="1" width="6" height="6" rx="1" stroke={c} strokeWidth="1.2"/><rect x="1" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1.2"/><rect x="9" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1.2"/></svg>
}
function IconMatrix({ active }) {
  const c = active ? '#F5C200' : 'rgba(255,255,255,0.4)'
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1.5" stroke={c} strokeWidth="1.2"/><line x1="1" y1="5.5" x2="15" y2="5.5" stroke={c} strokeWidth="1"/><line x1="1" y1="10.5" x2="15" y2="10.5" stroke={c} strokeWidth="1"/><line x1="5.5" y1="1" x2="5.5" y2="15" stroke={c} strokeWidth="1"/></svg>
}
function IconInbox({ active }) {
  const c = active ? '#F5C200' : 'rgba(255,255,255,0.4)'
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="11" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M1 9h3.5l1.5 2h4l1.5-2H15" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconForm({ active }) {
  const c = active ? '#F5C200' : 'rgba(255,255,255,0.4)'
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke={c} strokeWidth="1.2"/><line x1="5" y1="5" x2="11" y2="5" stroke={c} strokeWidth="1"/><line x1="5" y1="8" x2="11" y2="8" stroke={c} strokeWidth="1"/><line x1="5" y1="11" x2="9" y2="11" stroke={c} strokeWidth="1"/></svg>
}
function IconApproved({ active }) {
  const c = active ? '#F5C200' : 'rgba(255,255,255,0.4)'
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M5 8.5l2 2 4-4" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function IconDenied({ active }) {
  const c = active ? '#F5C200' : 'rgba(255,255,255,0.4)'
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke={c} strokeWidth="1.2"/><line x1="6" y1="6" x2="10" y2="10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><line x1="10" y1="6" x2="6" y2="10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function IconFinal({ active }) {
  const c = active ? '#F5C200' : 'rgba(255,255,255,0.4)'
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M5 9.5l2 2 4-5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><line x1="5" y1="5" x2="11" y2="5" stroke={c} strokeWidth="1"/></svg>
}
function IconSummary({ active }) {
  const c = active ? '#F5C200' : 'rgba(255,255,255,0.4)'
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1.5" stroke={c} strokeWidth="1.2"/><line x1="4" y1="5" x2="12" y2="5" stroke={c} strokeWidth="1"/><line x1="4" y1="8" x2="12" y2="8" stroke={c} strokeWidth="1"/><line x1="4" y1="11" x2="8" y2="11" stroke={c} strokeWidth="1"/></svg>
}

const NAV_ICONS = {
  dashboard:         IconDashboard,
  matrix:            IconMatrix,
  inbox:             IconInbox,
  pending_requests:  IconForm,
  approved_requests: IconApproved,
  denied_requests:   IconDenied,
  final_approved:    IconFinal,
  summary:           IconSummary,
}

// ── Status Badge (QA labels) ───────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = QA_STATUS_LABEL[status] || { label: status, bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px',
      borderRadius: '20px', background: cfg.bg, fontSize: '11px', fontWeight: '600',
      color: cfg.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Noted By / Conformed By display format ─────────────────────────
// 1 person  → "J. Reyes · Engineering"
// 2 persons → "J. Reyes (Engineering) · and 1 other"
// 3+ persons → "J. Reyes (Engineering) · and X others"
function SignatoryDisplay({ signatories }) {
  if (!signatories || signatories.length === 0) return <span style={{ color: '#bbb', fontSize: '12px' }}>—</span>
  const first = signatories[0]
  const rest  = signatories.length - 1
  return (
    <div>
      {signatories.length === 1 ? (
        <div style={{ fontSize: '12px', color: '#111', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {first.signed && <span style={{ color: '#1D9E75', fontSize: '11px', fontWeight: '700' }}>✓</span>}
          {first.name}
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: '#111', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {first.signed && <span style={{ color: '#1D9E75', fontSize: '11px', fontWeight: '700' }}>✓</span>}
          {first.name} ({first.dept})
        </div>
      )}
      {rest > 0 && (
        <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>
          and {rest} other{rest > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

// ── Shared inbox table ────────────────────────────────────────────
function InboxTable({ title, subtitle, accentColor, requests, actionLabel, onAction, emptyMsg }) {
  const thSt = { padding: '10px 14px', fontSize: '10px', fontWeight: '700', color: '#888',
    letterSpacing: '1px', textTransform: 'uppercase', background: '#FAFAFA',
    borderBottom: '0.5px solid #F0F0F0', whiteSpace: 'nowrap' }
  return (
    <div style={{ padding: '32px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>{title}</h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{subtitle} · {requests.length} request{requests.length !== 1 ? 's' : ''}</p>
      </div>
      <div style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E5E5', overflow: 'hidden' }}>
        {requests.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
            <p style={{ fontSize: '24px', margin: '0 0 8px' }}>📭</p>
            {emptyMsg}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['Control No.', 'Part Name', 'Part No.', 'Department', 'Date', 'Status', 'Action'].map(h => (
                  <th key={h} style={thSt}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => (
                <tr key={req.id}
                  style={{ borderBottom: i < requests.length - 1 ? '0.5px solid #F0F0F0' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontWeight: '700', color: '#111' }}>{req.id}</td>
                  <td style={{ padding: '13px 14px', fontWeight: '600', color: '#111' }}>{req.partName}</td>
                  <td style={{ padding: '13px 14px', color: '#888', fontFamily: 'monospace', fontSize: '12px' }}>{req.partNumber}</td>
                  <td style={{ padding: '13px 14px', color: '#555' }}>{req.requester?.dept || '—'}</td>
                  <td style={{ padding: '13px 14px', color: '#888', whiteSpace: 'nowrap' }}>{req.date}</td>
                  <td style={{ padding: '13px 14px' }}><StatusBadge status={req.status} /></td>
                  <td style={{ padding: '13px 14px' }}>
                    <button onClick={() => onAction(req.id)}
                      style={{ padding: '7px 16px', background: accentColor, color: '#fff', border: 'none',
                        borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      {actionLabel}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────
export default function Dashboard({ user, onLogout, onNavigate }) {
  const [activeNav,    setActiveNav]    = useState('dashboard')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [evaluatingId, setEvaluatingId] = useState(null)
  const [summaryId,    setSummaryId]    = useState(null)
  const [summaryEval,  setSummaryEval]  = useState(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [pendingNav,   setPendingNav]   = useState(null)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [dismissedIds, setDismissedIds] = useState([])

  const isOnSubpage = !!(evaluatingId || summaryId)

  const handleNavClick = (id) => {
    if (isOnSubpage) { setPendingNav(id); setConfirmLeave(true) }
    else { setActiveNav(id) }
  }
  const confirmNav = () => {
    setEvaluatingId(null); setSummaryId(null); setSummaryEval(null)
    setActiveNav(pendingNav); setPendingNav(null); setConfirmLeave(false)
  }
  const cancelNav = () => { setPendingNav(null); setConfirmLeave(false) }

  const handleNavigate = (dest, id, evalData) => {
    if (dest === 'evaluate') { setSummaryId(null); setEvaluatingId(id); return }
    if (dest === 'summary')  { setEvaluatingId(null); setSummaryId(id); setSummaryEval(evalData || null); return }
    onNavigate && onNavigate(dest, id)
  }

  // ── Counts ────────────────────────────────────────────────────
  const total              = MOCK_REQUESTS.length
  const qaStaffQueue       = MOCK_REQUESTS.filter(r => ['qa_review','conformed_approved'].includes(r.status)).length
  const managerQueue       = MOCK_REQUESTS.filter(r => r.status === 'awaiting_managers_approval').length
  const qaQueue            = qaStaffQueue  // for badge
  const approved           = MOCK_REQUESTS.filter(r => ['qa_approved','final_approved','issuance'].includes(r.status)).length
  const denied             = MOCK_REQUESTS.filter(r => r.status === 'qa_denied').length
  const pending            = MOCK_REQUESTS.filter(r => r.status === 'qa_draft').length

  // ── Notifications ─────────────────────────────────────────────
  const activeNotifs = MOCK_NOTIFS.filter(n => !dismissedIds.includes(n.id))

  // ── Filtered table ────────────────────────────────────────────
  const filtered = MOCK_REQUESTS.filter(r => {
    const q = searchQuery.toLowerCase()
    const matchSearch = q === '' ||
      r.id.toLowerCase().includes(q) ||
      r.partName.toLowerCase().includes(q) ||
      r.partNumber.toLowerCase().includes(q) ||
      (r.requester?.name || '').toLowerCase().includes(q) ||
      (r.requester?.dept || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const initials = (user?.name || 'QA').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const today    = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', background: '#F5F5F5' }}>

      {/* ── Leave page confirmation ──────────────────────────────── */}
      {confirmLeave && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px 32px', maxWidth: '380px', width: '90%', fontFamily: 'Arial' }}>
            <div style={{ width: '44px', height: '44px', background: '#FEF3C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#111' }}>Leave this page?</h3>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>Unsaved changes will be lost.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={cancelNav}
                style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '13px', color: '#555', cursor: 'pointer', fontWeight: '600' }}>
                Stay on Page
              </button>
              <button onClick={confirmNav}
                style={{ padding: '9px 20px', background: '#EF4444', border: 'none', borderRadius: '6px', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <div style={{ width: '240px', flexShrink: 0, background: '#111', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        <div style={{ height: '4px', background: '#F5C200', flexShrink: 0 }} />

        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/hst-logo.jpg" alt="HS Technologies"
              style={{ width: '44px', height: '44px', objectFit: 'contain', flexShrink: 0 }}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
            <div style={{ display:'none', width:'44px', height:'44px', background:'#F5C200', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontWeight:'700', fontSize:'12px', color:'#111', flexShrink:0 }}>HST</div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', color: '#F5C200', textTransform: 'uppercase', fontWeight: '700' }}>HS Technologies</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>MRF System</p>
            </div>
          </div>
        </div>

        {/* QA  badge */}
        <div style={{ padding: '10px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <span style={{ display: 'inline-block', padding: '3px 10px', background: 'rgba(245,194,0,0.15)',
            border: '0.5px solid rgba(245,194,0,0.3)', borderRadius: '20px', fontSize: '10px',
            color: '#F5C200', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Quality Assurance
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ id, label }) => {
            const isActive = activeNav === id
            const Icon     = NAV_ICONS[id]
            return (
              <button key={id} onClick={() => handleNavClick(id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
                  padding: '10px 20px', background: isActive ? 'rgba(245,194,0,0.12)' : 'transparent',
                  border: 'none', borderLeft: isActive ? '3px solid #F5C200' : '3px solid transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  color: isActive ? '#F5C200' : 'rgba(255,255,255,0.45)' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                <span style={{ flexShrink: 0 }}><Icon active={isActive} /></span>
                <span style={{ fontSize: '12px', fontWeight: isActive ? '700' : '400', lineHeight: '1.3' }}>{label}</span>
                {/* Badges */}
                {id === 'inbox' && qaStaffQueue > 0 && (
                  <span style={{ marginLeft: 'auto', minWidth: '18px', height: '18px', background: '#A855F7', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: '700', padding: '0 5px' }}>
                    {qaStaffQueue}
                  </span>
                )}
                {id === 'pending_requests' && managerQueue > 0 && (
                  <span style={{ marginLeft: 'auto', minWidth: '18px', height: '18px', background: '#6366F1', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: '700', padding: '0 5px' }}>
                    {managerQueue}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User + Sign Out */}
        <div style={{ padding: '16px 20px', borderTop: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5C200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#111', flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'QA Manager'}</p>
              <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>Quality Assurance</p>
            </div>
          </div>
          <button onClick={onLogout}
            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Arial', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '0.5px solid #E5E5E5', padding: '16px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
              Welcome, {user?.name?.split(' ')[0] || 'QA'}
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Quality Assurance · {today}</p>
          </div>

          {/* ── Bell notification dropdown ─────────────────────── */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setNotifOpen(o => !o)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '7px',
                padding: '7px 14px', background: '#111', border: 'none', borderRadius: '8px',
                cursor: 'pointer', color: '#fff', fontSize: '12px', fontWeight: '600', fontFamily: 'Arial' }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#F5C200" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              Notifications
              {activeNotifs.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#EF4444', color: '#fff', fontSize: '10px', fontWeight: '700', minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {activeNotifs.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={() => setNotifOpen(false)} />
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '384px', background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '12px', zIndex: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid #F0F0F0' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>Notifications</span>
                    {activeNotifs.length > 0 && (
                      <button onClick={() => setDismissedIds(MOCK_NOTIFS.map(n => n.id))}
                        style={{ fontSize: '11px', color: '#F5C200', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: '6px', maxHeight: '320px', overflowY: 'auto' }}>
                    {activeNotifs.length === 0 ? (
                      <li style={{ padding: '28px', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '20px' }}>🔔</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#bbb' }}>No new notifications</p>
                      </li>
                    ) : activeNotifs.map(n => {
                      const isEval    = n.type === 'eval'
                      const isManager = n.type === 'manager'
                      const bg    = isEval ? '#F5F3FF' : isManager ? '#EFF6FF' : '#F0FDF4'
                      const iconBg = isEval ? '#A855F7' : isManager ? '#6366F1' : '#1D9E75'
                      const icon  = isEval ? '↗' : isManager ? '✓' : '★'
                      const textColor = isEval ? '#6B21A8' : isManager ? '#3730A3' : '#166534'
                      return (
                        <li key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '8px', background: bg, marginBottom: '4px' }}>
                          <div style={{ marginTop: '2px', width: '26px', height: '26px', borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>{icon}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '12px', color: textColor, lineHeight: '1.5' }}>{n.message}</p>
                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#aaa' }}>{n.date}</p>
                          </div>
                          <button onClick={() => setDismissedIds(prev => [...prev, n.id])}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: textColor, opacity: 0.5, flexShrink: 0, padding: '0 2px', lineHeight: 1 }}>×</button>
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
        <div style={{ padding: '24px 28px', flex: 1 }}>

          {/* ── Subpage routing ──────────────────────────────────── */}
          {evaluatingId ? (
            <EvaluationForm requestId={evaluatingId} user={user} onNavigate={handleNavigate} onBack={() => setEvaluatingId(null)} />
          ) : summaryId ? (
            <OverallSummary requestId={summaryId} evalData={summaryEval} user={user} onNavigate={handleNavigate} onBack={() => setSummaryId(null)} />
          ) : activeNav === 'matrix' ? (
            <MatrixPage />
          ) : activeNav === 'inbox' ? (
            <InboxTable
              title="Inbox"
              subtitle="MRFs awaiting QA Staff evaluation"
              accentColor="#6B21A8"
              actionLabel="Evaluate →"
              requests={MOCK_REQUESTS.filter(r => ['qa_review','conformed_approved'].includes(r.status))}
              onAction={id => handleNavigate('evaluate', id)}
              emptyMsg="No MRFs currently awaiting evaluation."
            />
          ) : activeNav === 'pending_requests' ? (
            <InboxTable
              title="Pending Request"
              subtitle="Awaiting Manager's final approval"
              accentColor="#6366F1"
              actionLabel="Complete →"
              requests={MOCK_REQUESTS.filter(r => r.status === 'awaiting_managers_approval')}
              onAction={id => handleNavigate('evaluate', id)}
              emptyMsg="No pending drafts awaiting manager review."
            />
          ) : activeNav === 'approved_requests' ? (
            <InboxTable
              title="Approved Request"
              subtitle="MRFs approved by QA"
              accentColor="#1D9E75"
              actionLabel="View →"
              requests={MOCK_REQUESTS.filter(r => ['qa_approved','final_approved'].includes(r.status))}
              onAction={id => handleNavigate('view', id)}
              emptyMsg="No approved MRFs yet."
            />
          ) : activeNav === 'denied_requests' ? (
            <InboxTable
              title="Denied Request"
              subtitle="MRFs returned by QA"
              accentColor="#EF4444"
              actionLabel="↩ Return"
              requests={MOCK_REQUESTS.filter(r => r.status === 'qa_denied')}
              onAction={id => toast.success('MRF returned to requester', { description: `Request ${id} has been returned.` })}
              emptyMsg="No denied MRFs at this time."
            />
          ) : activeNav === 'final_approved' ? (
            <InboxTable
              title="Final Approved"
              subtitle="MRFs signed by President — ready for issuance"
              accentColor="#085041"
              actionLabel="View →"
              requests={MOCK_REQUESTS.filter(r => r.status === 'final_approved')}
              onAction={id => handleNavigate('final_approved_view', id)}
              emptyMsg="No final approved MRFs yet."
            />
          ) : activeNav === 'summary' ? (
            <SummaryPage user={user} onBack={() => setActiveNav('dashboard')} />
          ) : (

          /* ── DASHBOARD ──────────────────────────────────────── */
          <>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total',        value: total,        accent: '#111',    textColor: '#111'    },
                { label: 'QA Queue',     value: qaStaffQueue, accent: '#A855F7', textColor: '#6B21A8' },
                { label: 'Awaiting Mgr', value: managerQueue, accent: '#6366F1', textColor: '#3730A3' },
                { label: 'Approved',     value: approved,     accent: '#1D9E75', textColor: '#085041' },
                { label: 'Denied',       value: denied,       accent: '#EF4444', textColor: '#991B1B' },
              ].map(({ label, value, accent, textColor }) => (
                <div key={label} style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderTop: `3px solid ${accent}`, borderRadius: '10px', padding: '16px 18px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '10px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: textColor, fontFamily: 'Georgia, serif' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* ── QA Review Queue — 2-card summary widget ───────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>

              {/* Left card — QA Staff queue (purple) */}
              <div style={{ background: '#fff', border: '0.5px solid #E9D5FF', borderTop: '3px solid #A855F7', borderRadius: '10px', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Awaiting QA Staff Evaluation</p>
                  <p style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: '700', color: '#6B21A8', fontFamily: 'Georgia, serif' }}>{qaStaffQueue}</p>
                  <button
                    onClick={() => handleNavClick('inbox')}
                    style={{ padding: '7px 16px', background: '#6B21A8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#7C3AAD'}
                    onMouseLeave={e => e.currentTarget.style.background = '#6B21A8'}>
                    Go to Inbox →
                  </button>
                </div>
                <div style={{ width: '48px', height: '48px', background: '#F5F3FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="1" y="3" width="20" height="16" rx="2" stroke="#A855F7" strokeWidth="1.5"/><path d="M1 9h5l2 3h6l2-3h5" stroke="#A855F7" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>

              {/* Right card — Manager queue (yellow) */}
              <div style={{ background: '#fff', border: '0.5px solid #FDE68A', borderTop: '3px solid #F5C200', borderRadius: '10px', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Awaiting Manager's Approval</p>
                  <p style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: '700', color: '#92400E', fontFamily: 'Georgia, serif' }}>{managerQueue}</p>
                  <button
                    onClick={() => handleNavClick('pending_requests')}
                    style={{ padding: '7px 16px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#222'}
                    onMouseLeave={e => e.currentTarget.style.background = '#111'}>
                    Go to Pending →
                  </button>
                </div>
                <div style={{ width: '48px', height: '48px', background: '#FFFBEB', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="1" width="18" height="20" rx="2" stroke="#F5C200" strokeWidth="1.5"/><path d="M7 11l3 3 5-6" stroke="#F5C200" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="7" y1="7" x2="15" y2="7" stroke="#F5C200" strokeWidth="1.2"/></svg>
                </div>
              </div>
            </div>

            {/* ── All MRF Requests Table ───────────────────────── */}
            <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden' }}>

              {/* Toolbar */}
              <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111' }}>All MRF Requests</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="text" placeholder="Search ID, part, requester..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ padding: '8px 14px', fontSize: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', outline: 'none', width: '240px', fontFamily: 'Arial', color: '#111', background: '#FAFAFA' }} />
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', outline: 'none', background: '#FAFAFA', fontFamily: 'Arial', color: '#111', cursor: 'pointer' }}>
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_FILTER_OPTIONS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA', borderBottom: '0.5px solid #E5E5E5' }}>
                      {['Control No.', 'Part Details', 'Customer', 'Requester', 'Noter', 'Conformer', 'App. Date', 'Status', 'Action'].map(col => (
                        <th key={col} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>No requests found.</td></tr>
                    ) : filtered.map((req, i) => {
                      const needsEval = ['qa_review','conformed_approved'].includes(req.status)
                      return (
                        <tr key={req.id}
                          style={{ borderBottom: i < filtered.length - 1 ? '0.5px solid #F0F0F0' : 'none', background: needsEval ? '#FAF5FF' : 'transparent', transition: 'background 0.1s' }}
                          onMouseEnter={e => { if (!needsEval) e.currentTarget.style.background = '#FAFAFA' }}
                          onMouseLeave={e => { if (!needsEval) e.currentTarget.style.background = 'transparent' }}>

                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#111', fontWeight: '700' }}>{req.id}</td>

                          <td style={{ padding: '12px 14px' }}>
                            <p style={{ margin: '0 0 2px', fontWeight: '600', color: '#111', fontSize: '13px' }}>{req.partName}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{req.partNumber}</p>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ padding: '2px 8px', background: '#F5F5F5', borderRadius: '4px', fontWeight: '600', color: '#555', fontSize: '11px', fontFamily: 'monospace' }}>
                              {req.customer || '—'}
                            </span>
                          </td>

                          {/* Requester */}
                          <td style={{ padding: '12px 14px' }}>
                            {req.requester ? (
                              <div>
                                <div style={{ fontSize: '12px', color: '#111', fontWeight: '500' }}>{req.requester.name}</div>
                                <div style={{ fontSize: '11px', color: '#888' }}>{req.requester.dept}</div>
                              </div>
                            ) : <span style={{ color: '#bbb' }}>—</span>}
                          </td>

                          {/* Noted By */}
                          <td style={{ padding: '12px 14px' }}>
                            <SignatoryDisplay signatories={req.notedBy} />
                          </td>

                          {/* Conformed By */}
                          <td style={{ padding: '12px 14px' }}>
                            <SignatoryDisplay signatories={req.conformedBy} />
                          </td>

                          <td style={{ padding: '12px 14px', color: '#555', fontSize: '12px', whiteSpace: 'nowrap' }}>{req.date}</td>

                          <td style={{ padding: '12px 14px' }}><StatusBadge status={req.status} /></td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <button onClick={() => handleNavigate('view', req.id)}
                                style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #E5E5E5', borderRadius: '5px', fontSize: '12px', color: '#555', cursor: 'pointer', fontFamily: 'Arial', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#F5C200'; e.currentTarget.style.borderColor = '#111' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#E5E5E5' }}>
                                View
                              </button>
                              {needsEval && (
                                <button onClick={() => handleNavigate('evaluate', req.id)}
                                  style={{ padding: '5px 12px', background: '#6B21A8', border: '1px solid #6B21A8', borderRadius: '5px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontFamily: 'Arial', fontWeight: '700', transition: 'all 0.15s' }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#7C3AAD'}
                                  onMouseLeave={e => e.currentTarget.style.background = '#6B21A8'}>
                                  Evaluate →
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 18px', borderTop: '0.5px solid #F0F0F0', background: '#FAFAFA' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>Showing {filtered.length} of {total} requests</p>
              </div>
            </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}