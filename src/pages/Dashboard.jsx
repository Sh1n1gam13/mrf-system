// ─────────────────────────────────────────────────────────────────
// Dashboard.jsx
// MRF Request Management System — HS Technologies (Phils.), Inc.
// Main dashboard shell — UI only, logic to be wired after docs received
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { toast } from 'sonner'
import EvaluationForm from './EvaluationForm'
import OverallSummary from './OverallSummary'
import MatrixPage     from './MatrixPage'
import FinalApproved  from './FinalApproved'
import SummaryPage    from './SummaryPage'                

// ── Placeholder MRF data (replace with Firestore later) ──────────
const MOCK_REQUESTS = [
  { id: '4M-M-7900', partName: 'Brake Pad Assembly',    partNumber: 'BP-2201', department: 'Engineering', customer: 'TNPH',    date: '2026-03-10', status: 'pending_noted'     },
  { id: '4M-M-7901', partName: 'Drive Shaft Coupling',  partNumber: 'DS-4402', department: 'Production',  customer: 'FDTP',    date: '2026-03-11', status: 'pending_forward'   },
  { id: '4M-M-7902', partName: 'Filter Housing Unit',   partNumber: 'FH-1103', department: 'Engineering', customer: 'GLORY',   date: '2026-03-12', status: 'qa_review'         },
  { id: '4M-M-7903', partName: 'Gear Box Seal',         partNumber: 'GB-3304', department: 'Production',  customer: 'SHINSEI', date: '2026-03-13', status: 'qa_draft'          },
  { id: '4M-M-7904', partName: 'Coolant Pump Cover',    partNumber: 'CP-5505', department: 'Engineering', customer: 'SUZUCOH', date: '2026-03-14', status: 'qa_approved'       },
  { id: '4M-M-7905', partName: 'Valve Spring Retainer', partNumber: 'VS-6606', department: 'Production',  customer: 'MTMP',    date: '2026-03-15', status: 'qa_denied'         },
  { id: '4M-M-7906', partName: 'Piston Ring Set',       partNumber: 'PR-7707', department: 'Engineering', customer: 'JCM',     date: '2026-03-16', status: 'final_approved'    },
  { id: '4M-M-7907', partName: 'Camshaft Bearing',      partNumber: 'CB-8808', department: 'Production',  customer: 'GLORY',   date: '2026-03-16', status: 'issuance'          },
]

// ── Status config ─────────────────────────────────────────────────
const STATUS = {
  draft:             { label: 'Draft',                 bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },
  pending_noted:     { label: 'For Noting',            bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  pending_forward:   { label: 'Ready to Forward',      bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  pending_conformed: { label: 'For Confirmation',      bg: '#FED7AA', color: '#9A3412', dot: '#F97316' },
  conformed_denied:  { label: 'Returned by Conformer', bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  pending_approval:  { label: 'For Your Approval',     bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  qa_review:         { label: 'For Evaluation',        bg: '#F3E8FF', color: '#6B21A8', dot: '#A855F7' },
  qa_draft:          { label: 'Pending',               bg: '#FEF9C3', color: '#854D0E', dot: '#CA8A04' },
  qa_approved:       { label: 'QA Approved',           bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  qa_denied:         { label: 'Denied',                bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  final_approved:    { label: 'Final Approved',        bg: '#DCFCE7', color: '#14532D', dot: '#16A34A' },
  issuance:          { label: 'Issued',                bg: '#E0E7FF', color: '#3730A3', dot: '#6366F1' },
}

// ── Nav items ─────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',         label: 'Dashboard',          icon: IconDashboard  },
  { id: 'matrix',            label: 'Matrix',             icon: IconMatrix     },
  { id: 'pending_requests',  label: 'Pending Request',    icon: IconForm       },
  { id: 'approved_requests', label: 'Approved Request',   icon: IconApproved   },
  { id: 'denied_requests',   label: 'Denied Request',     icon: IconDenied     },
  { id: 'final_approved',    label: 'Final Approved',     icon: IconFinal      },
  { id: 'summary',           label: 'MRF Summary',        icon: IconDashboard  },
]

// ── SVG Icons ─────────────────────────────────────────────────────
function IconDashboard({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.2"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.2"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.2"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.2"/>
    </svg>
  )
}
function IconMatrix({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <line x1="1" y1="5.5"  x2="15" y2="5.5"  stroke={color} strokeWidth="1"/>
      <line x1="1" y1="10.5" x2="15" y2="10.5" stroke={color} strokeWidth="1"/>
      <line x1="5.5" y1="1"  x2="5.5" y2="15"  stroke={color} strokeWidth="1"/>
    </svg>
  )
}
function IconForm({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <line x1="5" y1="5"  x2="11" y2="5"  stroke={color} strokeWidth="1"/>
      <line x1="5" y1="8"  x2="11" y2="8"  stroke={color} strokeWidth="1"/>
      <line x1="5" y1="11" x2="9"  y2="11" stroke={color} strokeWidth="1"/>
    </svg>
  )
}
function IconApproved({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <path d="M5 8.5l2 2 4-4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconDenied({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <line x1="6" y1="6" x2="10" y2="10" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="10" y1="6" x2="6"  y2="10" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function IconFinal({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <path d="M5 9.5l2 2 4-5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="5" y1="5" x2="11" y2="5" stroke={color} strokeWidth="1"/>
    </svg>
  )
}

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS[status] || { label: status, bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' }
  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '5px',
      padding:      '3px 10px',
      borderRadius: '20px',
      background:   cfg.bg,
      fontSize:     '11px',
      fontWeight:   '600',
      color:        cfg.color,
      whiteSpace:   'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{
      background:   '#fff',
      border:       '0.5px solid #E5E5E5',
      borderRadius: '10px',
      padding:      '20px 22px',
      borderTop:    `3px solid ${accent}`,
      flex:         1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>{value}</p>
        </div>
        <div style={{ width: '36px', height: '36px', background: '#F9F9F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard Component ──────────────────────────────────────
// ── Shared inbox table ────────────────────────────────────────────
function InboxTable({ title, subtitle, accentColor, requests, actionLabel, actionStyle, onAction, emptyMsg }) {
  const thSt = { padding: '10px 14px', fontSize: '10px', fontWeight: '700', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', background: '#FAFAFA', borderBottom: '0.5px solid #F0F0F0', whiteSpace: 'nowrap' }
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
              {requests.map((req, i) => {
                const s = STATUS[req.status] || {}
                return (
                  <tr key={req.id} style={{ borderBottom: i < requests.length - 1 ? '0.5px solid #F0F0F0' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontWeight: '700', color: '#111' }}>{req.id}</td>
                    <td style={{ padding: '13px 14px', fontWeight: '600', color: '#111' }}>{req.partName}</td>
                    <td style={{ padding: '13px 14px', color: '#888', fontFamily: 'monospace', fontSize: '12px' }}>{req.partNumber}</td>
                    <td style={{ padding: '13px 14px', color: '#555' }}>{req.department}</td>
                    <td style={{ padding: '13px 14px', color: '#888', whiteSpace: 'nowrap' }}>{req.date}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: s.bg, color: s.color, borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot }} />{s.label}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <button onClick={() => onAction(req.id)}
                        style={{ padding: '7px 16px', background: accentColor, color: actionStyle?.color || '#fff', border: actionStyle?.border || 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        {actionLabel}
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

function PendingInbox({ requests, onEvaluate }) {
  return (
    <InboxTable
      title="Pending Request"
      subtitle="Drafts saved by QA staff — awaiting QA Manager's final check"
      accentColor="#111"
      actionLabel="Complete →"
      requests={requests}
      onAction={onEvaluate}
      emptyMsg="No pending drafts awaiting manager review."
    />
  )
}

function ApprovedInbox({ requests, onEvaluate }) {
  return (
    <InboxTable
      title="Approved Request"
      subtitle="MRFs pending QA evaluation"
      accentColor="#111"
      actionLabel="Evaluate →"
      requests={requests}
      onAction={onEvaluate}
      emptyMsg="No MRFs currently awaiting evaluation."
    />
  )
}

function DeniedInbox({ requests, onReturn }) {
  return (
    <InboxTable
      title="Denied Request"
      subtitle="MRFs denied by QA — return to preparer"
      accentColor="#EF4444"
      actionLabel="↩ Return"
      requests={requests}
      onAction={onReturn}
      emptyMsg="No denied MRFs at this time."
    />
  )
}

function FinalApprovedInbox({ requests, onView }) {
  return (
    <InboxTable
      title="Final Approved"
      subtitle="MRFs signed by QA Manager or President"
      accentColor="#166534"
      actionLabel="View →"
      requests={requests}
      onAction={onView}
      emptyMsg="No final approved MRFs yet."
    />
  )
}

export default function Dashboard({ user, onLogout, onNavigate }) {
  const [activeNav,    setActiveNav]    = useState('dashboard')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [evaluatingId, setEvaluatingId] = useState(null)
  const [summaryId,    setSummaryId]    = useState(null)
  const [summaryEval,  setSummaryEval]  = useState(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [pendingNav,   setPendingNav]   = useState(null)

  // Is user on a subpage with unsaved work?
  const isOnSubpage = !!(evaluatingId || summaryId)

  // ── Nav click — intercept if on a subpage ──────────────────────
  const handleNavClick = (id) => {
    if (isOnSubpage) { setPendingNav(id); setConfirmLeave(true) }
    else { setActiveNav(id) }
  }
  const confirmNav = () => {
    setEvaluatingId(null); setSummaryId(null); setSummaryEval(null)
    setActiveNav(pendingNav); setPendingNav(null); setConfirmLeave(false)
  }
  const cancelNav = () => { setPendingNav(null); setConfirmLeave(false) }

  // ── Handle navigate — intercept 'evaluate' and 'summary' ────────
  const handleNavigate = (dest, id, evalData) => {
    if (dest === 'evaluate') { setSummaryId(null); setEvaluatingId(id); return }
    if (dest === 'summary')  { setEvaluatingId(null); setSummaryId(id); setSummaryEval(evalData || null); return }
    onNavigate && onNavigate(dest, id)
  }

  // ── Stats — overall counts (replace with Firestore aggregation later)
  const total     = MOCK_REQUESTS.length
  const qaQueue   = MOCK_REQUESTS.filter(r => r.status === 'qa_review').length
  const approved  = MOCK_REQUESTS.filter(r => ['qa_approved','final_approved','issuance'].includes(r.status)).length
  const denied    = MOCK_REQUESTS.filter(r => r.status === 'qa_denied').length
  const pending   = MOCK_REQUESTS.filter(r => r.status === 'qa_draft').length
  const returned  = MOCK_REQUESTS.filter(r => r.status === 'qa_denied').length

  // ── Requests needing QA evaluation
  const toEvaluate = MOCK_REQUESTS.filter(r => r.status === 'qa_review')

  // ── Filter table
  const filtered = MOCK_REQUESTS.filter(r => {
    const q = searchQuery.toLowerCase()
    const matchSearch = q === '' ||
      r.id.toLowerCase().includes(q) ||
      r.partName.toLowerCase().includes(q) ||
      r.partNumber.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  // User initials
  const initials = (user?.name || 'QA')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', background: '#F5F5F5' }}>

      {/* ── Leave page confirmation dialog ───────────────────────── */}
      {confirmLeave && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px 32px', maxWidth: '380px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', fontFamily: 'Arial' }}>
            <div style={{ width: '44px', height: '44px', background: '#FEF3C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#111' }}>Leave this page?</h3>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
              Unsaved changes will be lost. Are you sure you want to leave the current page?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={cancelNav}
                style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '13px', color: '#555', cursor: 'pointer', fontWeight: '600' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#aaa'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E5E5'}
              >
                Stay on Page
              </button>
              <button onClick={confirmNav}
                style={{ padding: '9px 20px', background: '#EF4444', border: 'none', borderRadius: '6px', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: '700' }}
                onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
              >
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <div style={{
        width: '240px', flexShrink: 0, background: '#111',
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
      }}>
        <div style={{ height: '4px', background: '#F5C200', flexShrink: 0 }} />

        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/hst-logo.jpg"
              alt="HS Technologies Logo"
              style={{ width: '44px', height: '44px', objectFit: 'contain', flexShrink: 0 }}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
            />
            <div style={{ display:'none', width:'44px', height:'44px', background:'#F5C200', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontWeight:'700', fontSize:'12px', color:'#111', flexShrink:0 }}>HST</div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', color: '#F5C200', textTransform: 'uppercase', fontWeight: '700' }}>HS Technologies</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>MRF System</p>
            </div>
          </div>
        </div>

        {/* QA Admin badge */}
        <div style={{ padding: '10px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <span style={{
            display: 'inline-block', padding: '3px 10px',
            background: 'rgba(245,194,0,0.15)', border: '0.5px solid rgba(245,194,0,0.3)',
            borderRadius: '20px', fontSize: '10px', color: '#F5C200',
            fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            QA Admin
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeNav === id
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
                  padding: '10px 20px', background: isActive ? 'rgba(245,194,0,0.12)' : 'transparent',
                  border: 'none', borderLeft: isActive ? '3px solid #F5C200' : '3px solid transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  color: isActive ? '#F5C200' : 'rgba(255,255,255,0.45)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ flexShrink: 0 }}><Icon size={15} color={isActive ? '#F5C200' : 'rgba(255,255,255,0.4)'} /></span>
                <span style={{ fontSize: '12px', fontWeight: isActive ? '700' : '400', lineHeight: '1.3' }}>
                  {label}
                </span>
                {/* QA Review count badge on dashboard nav */}
                {id === 'dashboard' && qaQueue > 0 && (
                  <span style={{
                    marginLeft: 'auto', minWidth: '18px', height: '18px',
                    background: '#EF4444', borderRadius: '9px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', color: '#fff', fontWeight: '700', padding: '0 5px',
                  }}>{qaQueue}</span>
                )}
                {/* Pending draft badge on Pending Request nav item */}
                {id === 'pending_requests' && pending > 0 && (
                  <span style={{
                    marginLeft: 'auto', minWidth: '18px', height: '18px',
                    background: '#CA8A04', borderRadius: '9px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', color: '#fff', fontWeight: '700', padding: '0 5px',
                  }}>{pending}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User + Sign Out */}
        <div style={{ padding: '16px 20px', borderTop: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', background: '#F5C200',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', color: '#111', flexShrink: 0,
            }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'QA Admin'}
              </p>
              <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                Quality Assurance
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px',
              color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '1px',
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'Arial, Helvetica, sans-serif', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div style={{
          background: '#fff', borderBottom: '0.5px solid #E5E5E5',
          padding: '16px 28px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexShrink: 0,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
              QA Admin Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              Overall request management · QAD-F-7.1.1.2 REV.10
            </p>
          </div>
          {/* QA Review alert pill */}
          {qaQueue > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#FEF3C7', border: '1px solid #FDE68A',
              borderRadius: '20px', padding: '6px 14px',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: '#92400E', fontWeight: '700' }}>
                {qaQueue} request{qaQueue > 1 ? 's' : ''} awaiting evaluation
              </span>
            </div>
          )}
        </div>

        {/* Page body */}
        <div style={{ padding: '24px 28px', flex: 1 }}>

          {/* ── Evaluation Form ─────────────────────────────────── */}
          {evaluatingId ? (
            <EvaluationForm requestId={evaluatingId} user={user} onNavigate={handleNavigate} onBack={() => setEvaluatingId(null)} />
          ) : summaryId ? (
            <OverallSummary requestId={summaryId} evalData={summaryEval} user={user} onNavigate={handleNavigate} onBack={() => setSummaryId(null)} />
          ) : activeNav === 'matrix' ? (
            <MatrixPage />
          ) : activeNav === 'pending_requests' ? (
            <PendingInbox
              requests={MOCK_REQUESTS.filter(r => r.status === 'qa_draft')}
              onEvaluate={id => handleNavigate('evaluate', id)}
            />
          ) : activeNav === 'approved_requests' ? (
            <ApprovedInbox
              requests={MOCK_REQUESTS.filter(r => r.status === 'qa_review')}
              onEvaluate={id => handleNavigate('evaluate', id)}
            />
          ) : activeNav === 'denied_requests' ? (
            <DeniedInbox
              requests={MOCK_REQUESTS.filter(r => r.status === 'qa_denied')}
              onReturn={id => {
                toast.success('MRF returned to preparer', { description: `Request ${id} has been returned.` })
              }}
            />
          ) : activeNav === 'final_approved' ? (
            <FinalApprovedInbox
              requests={MOCK_REQUESTS.filter(r => r.status === 'final_approved')}
              onView={id => handleNavigate('final_approved_view', id)}
            />
          ) : activeNav === 'summary' ? (
            <SummaryPage user={user} onBack={() => setActiveNav('dashboard')} />
          ) : activeNav === 'final_approved_view' ? (
            <FinalApproved user={user} onNavigate={handleNavigate} onBack={() => setActiveNav('final_approved')} />
          ) : (
          <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Total',       value: total,    accent: '#111',    textColor: '#111'    },
              { label: 'Pending',     value: pending,  accent: '#F59E0B', textColor: '#92400E' },
              { label: 'QA Review',   value: qaQueue,  accent: '#A855F7', textColor: '#6B21A8' },
              { label: 'Approved',    value: approved, accent: '#22C55E', textColor: '#166534' },
              { label: 'Denied',      value: denied,   accent: '#EF4444', textColor: '#991B1B' },
              { label: 'Returned',    value: returned, accent: '#F97316', textColor: '#9A3412' },
            ].map(({ label, value, accent, textColor }) => (
              <div key={label} style={{
                background: '#fff', border: '0.5px solid #E5E5E5',
                borderTop: `3px solid ${accent}`, borderRadius: '10px', padding: '16px 18px',
              }}>
                <p style={{ margin: '0 0 6px', fontSize: '10px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: textColor, fontFamily: 'Georgia, serif' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── QA Review Queue ──────────────────────────────────── */}
          {toEvaluate.length > 0 && (
            <div style={{
              background: '#fff', border: '1px solid #E9D5FF',
              borderLeft: '4px solid #A855F7', borderRadius: '10px',
              padding: '16px 20px', marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A855F7', display: 'inline-block' }} />
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#6B21A8' }}>
                  QA Review Queue — {toEvaluate.length} request{toEvaluate.length > 1 ? 's' : ''} pending evaluation
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {toEvaluate.map(req => (
                  <div key={req.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: '#FAFAFA',
                    border: '0.5px solid #E5E5E5', borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#111' }}>{req.id}</span>
                      <div>
                        <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: '600', color: '#111' }}>{req.partName}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{req.department} · {req.date}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNavigate('evaluate', req.id)}
                      style={{
                        padding: '7px 16px', background: '#6B21A8',
                        color: '#fff', border: 'none', borderRadius: '6px',
                        fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                        fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.5px',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#7C3AAD'}
                      onMouseLeave={e => e.currentTarget.style.background = '#6B21A8'}
                    >
                      Evaluate →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── All Requests Table ───────────────────────────────── */}
          <div style={{ background: '#fff', border: '0.5px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden' }}>

            {/* Table toolbar */}
            <div style={{
              padding: '16px 20px', borderBottom: '0.5px solid #E5E5E5',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111' }}>All MRF Requests</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search ID, part, department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 14px', fontSize: '12px', border: '1px solid #E5E5E5',
                    borderRadius: '6px', outline: 'none', width: '240px',
                    fontFamily: 'Arial, Helvetica, sans-serif', color: '#111', background: '#FAFAFA',
                  }}
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px', fontSize: '12px', border: '1px solid #E5E5E5',
                    borderRadius: '6px', outline: 'none', background: '#FAFAFA',
                    fontFamily: 'Arial, Helvetica, sans-serif', color: '#111', cursor: 'pointer',
                  }}
                >
                  <option value="all">All Status</option>
                  {Object.entries(STATUS).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '0.5px solid #E5E5E5' }}>
                    {['Control No.', 'Part Details', 'Customer/Supplier', 'Department', 'App. Date', 'Status', 'Action'].map(col => (
                      <th key={col} style={{
                        padding: '11px 18px', textAlign: 'left', fontSize: '10px',
                        fontWeight: '700', color: '#888', letterSpacing: '1px',
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                        No requests found.
                      </td>
                    </tr>
                  ) : filtered.map((req, i) => {
                    const needsEval = req.status === 'qa_review'
                    return (
                      <tr
                        key={req.id}
                        style={{
                          borderBottom: i < filtered.length - 1 ? '0.5px solid #F0F0F0' : 'none',
                          background: needsEval ? '#FAF5FF' : 'transparent',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { if (!needsEval) e.currentTarget.style.background = '#FAFAFA' }}
                        onMouseLeave={e => { if (!needsEval) e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={{ padding: '13px 18px', fontFamily: 'monospace', fontSize: '12px', color: '#111', fontWeight: '700' }}>
                          {req.id}
                        </td>
                        <td style={{ padding: '13px 18px' }}>
                          <p style={{ margin: '0 0 2px', fontWeight: '600', color: '#111', fontSize: '13px' }}>{req.partName}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{req.partNumber}</p>
                        </td>
                        <td style={{ padding: '13px 18px', fontSize: '12px' }}>
                          <span style={{ padding: '2px 8px', background: '#F5F5F5', borderRadius: '4px', fontWeight: '600', color: '#555', fontSize: '11px', fontFamily: 'monospace' }}>
                            {req.customer || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '13px 18px', color: '#555', fontSize: '12px' }}>{req.department}</td>
                        <td style={{ padding: '13px 18px', color: '#555', fontSize: '12px', whiteSpace: 'nowrap' }}>{req.date}</td>
                        <td style={{ padding: '13px 18px' }}><StatusBadge status={req.status} /></td>
                        <td style={{ padding: '13px 18px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {/* View button — always shown */}
                            <button
                              onClick={() => handleNavigate('view', req.id)}
                              style={{
                                padding: '5px 12px', background: 'transparent',
                                border: '1px solid #E5E5E5', borderRadius: '5px',
                                fontSize: '12px', color: '#555', cursor: 'pointer',
                                fontFamily: 'Arial, Helvetica, sans-serif', transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#F5C200'; e.currentTarget.style.borderColor = '#111' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#E5E5E5' }}
                            >
                              View
                            </button>
                            {/* Evaluate button — only for qa_review */}
                            {needsEval && (
                              <button
                                onClick={() => handleNavigate('evaluate', req.id)}
                                style={{
                                  padding: '5px 12px', background: '#6B21A8',
                                  border: '1px solid #6B21A8', borderRadius: '5px',
                                  fontSize: '12px', color: '#fff', cursor: 'pointer',
                                  fontFamily: 'Arial, Helvetica, sans-serif',
                                  fontWeight: '700', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#7C3AAD'}
                                onMouseLeave={e => e.currentTarget.style.background = '#6B21A8'}
                              >
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

            {/* Table footer */}
            <div style={{ padding: '12px 18px', borderTop: '0.5px solid #F0F0F0', background: '#FAFAFA' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>
                Showing {filtered.length} of {total} requests
              </p>
            </div>
          </div>
          </> )} {/* end dashboard/evaluation toggle */}
        </div>
      </div>
    </div>
  )
}