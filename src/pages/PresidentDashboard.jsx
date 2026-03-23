// ─────────────────────────────────────────────────────────────────
// PresidentDashboard.jsx
// Dashboard for the President — shows MRFs awaiting signature
// and ones already signed, with stats cards
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import FinalApproved from './FinalApproved'

// ── Mock MRF data for president (replace with Firestore query) ────
const MOCK_MRFS = [
  { id: '4M-M-7902', partName: 'Filter Housing Unit',   partNumber: 'FH-1103', department: 'Engineering', date: '2026-03-12', status: 'pending_president' },
  { id: '4M-M-7904', partName: 'Coolant Pump Cover',    partNumber: 'CP-5505', department: 'Engineering', date: '2026-03-14', status: 'pending_president' },
  { id: '4M-M-7896', partName: 'Drive Shaft Coupling',  partNumber: 'DS-4402', department: 'Production',  date: '2026-03-05', status: 'signed'           },
  { id: '4M-M-7891', partName: 'Gear Box Seal',         partNumber: 'GB-3304', department: 'Production',  date: '2026-02-28', status: 'signed'           },
  { id: '4M-M-7903', partName: 'Valve Spring Retainer', partNumber: 'VS-6606', department: 'Engineering', date: '2026-03-15', status: 'pending_president' },
]

const STATUS_CONFIG = {
  pending_president: { label: 'Pending Signature', bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  signed:            { label: 'Signed',             bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
}

function StatCard({ label, value, color, borderColor }) {
  return (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '20px 24px', border: '0.5px solid #E5E5E5', borderTop: `3px solid ${borderColor}` }}>
      <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color }}>{value}</p>
    </div>
  )
}

export default function PresidentDashboard({ user, onLogout }) {
  const [reviewingId, setReviewingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery,  setSearchQuery]  = useState('')

  const total   = MOCK_MRFS.length
  const pending = MOCK_MRFS.filter(r => r.status === 'pending_president').length
  const signed  = MOCK_MRFS.filter(r => r.status === 'signed').length

  const filtered = MOCK_MRFS.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchSearch = !searchQuery ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  // ── Show FinalApproved review when an MRF is selected ─────────
  if (reviewingId) {
    return (
      <div style={{ height: '100vh', overflowY: 'auto', background: '#F5F5F5' }}>
        <div style={{ padding: '0 32px' }}>
          <FinalApproved
            requestId={reviewingId}
            user={user}
            onBack={() => setReviewingId(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', background: '#F5F5F5' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <div style={{ width: '220px', flexShrink: 0, background: '#111', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/hst-logo.jpg" alt="HST Logo" style={{ width: '44px', height: '44px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
            <div style={{ display:'none', width:'44px', height:'44px', background:'#F5C200', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontWeight:'700', fontSize:'12px', color:'#111', flexShrink:0 }}>HST</div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>MRF System</p>
              <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>HS Technologies</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '16px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F5C200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', color: '#111', marginBottom: '8px' }}>
            {user?.name?.[0] || 'P'}
          </div>
          <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '700', color: '#fff' }}>{user?.name || 'President'}</p>
          <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Executive</p>
        </div>

        {/* Nav */}
        <div style={{ padding: '12px 0', flex: 1 }}>
          <div style={{ padding: '10px 20px', background: 'rgba(245,194,0,0.1)', borderLeft: '3px solid #F5C200', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <span style={{ fontSize: '14px' }}>📋</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#F5C200' }}>Dashboard</span>
            {pending > 0 && (
              <span style={{ marginLeft: 'auto', background: '#EF4444', color: '#fff', borderRadius: '10px', fontSize: '10px', fontWeight: '700', padding: '1px 7px' }}>{pending}</span>
            )}
          </div>
        </div>

        {/* Sign out */}
        <div style={{ padding: '16px 20px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onLogout}
            style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Arial' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
            Welcome, {user?.name || 'President'}
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          <StatCard label="Total Requests"     value={total}   color="#111"     borderColor="#111"     />
          <StatCard label="Pending Signature"  value={pending} color="#F59E0B"  borderColor="#F59E0B"  />
          <StatCard label="Signed by You"      value={signed}  color="#22C55E"  borderColor="#22C55E"  />
        </div>

        {/* ── Pending Signature highlight ──────────────────────────── */}
        {pending > 0 && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderLeft: '4px solid #F59E0B', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#92400E' }}>
                {pending} MRF{pending > 1 ? 's' : ''} awaiting your signature
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#92400E' }}>
                Please review and sign the pending requests below.
              </p>
            </div>
          </div>
        )}

        {/* ── MRF Table ────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E5E5', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111' }}>MRF Requests</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '7px 12px', fontSize: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', outline: 'none', width: '180px', fontFamily: 'Arial', background: '#FAFAFA' }}
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '7px 12px', fontSize: '12px', border: '1px solid #E5E5E5', borderRadius: '6px', outline: 'none', fontFamily: 'Arial', background: '#FAFAFA', cursor: 'pointer' }}
              >
                <option value="all">All Status</option>
                <option value="pending_president">Pending Signature</option>
                <option value="signed">Signed</option>
              </select>
            </div>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 120px 160px 120px', padding: '10px 20px', background: '#FAFAFA', borderBottom: '0.5px solid #F0F0F0' }}>
            {['CONTROL NO.', 'PART NAME', 'PART NO.', 'DATE', 'STATUS', 'ACTION'].map(col => (
              <p key={col} style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#888', letterSpacing: '1px' }}>{col}</p>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>No requests found.</div>
          ) : filtered.map((req, i) => {
            const s = STATUS_CONFIG[req.status] || {}
            const isPending = req.status === 'pending_president'
            return (
              <div
                key={req.id}
                style={{
                  display: 'grid', gridTemplateColumns: '140px 1fr 120px 120px 160px 120px',
                  padding: '14px 20px', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '0.5px solid #F0F0F0' : 'none',
                  background: isPending ? '#FFFBEB' : '#fff',
                  transition: 'background 0.1s',
                }}
              >
                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#111' }}>{req.id}</p>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#111' }}>{req.partName}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{req.department}</p>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>{req.partNumber}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>{req.date}</p>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: s.bg, color: s.color, borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                    {s.label}
                  </span>
                </div>
                <button
                  onClick={() => setReviewingId(req.id)}
                  style={{
                    padding: '7px 16px',
                    background: isPending ? '#111' : 'transparent',
                    color: isPending ? '#F5C200' : '#555',
                    border: isPending ? 'none' : '1px solid #E5E5E5',
                    borderRadius: '6px', fontSize: '12px', fontWeight: isPending ? '700' : '400',
                    cursor: 'pointer', fontFamily: 'Arial', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isPending) { e.currentTarget.style.borderColor = '#aaa'; e.currentTarget.style.color = '#111' } }}
                  onMouseLeave={e => { if (!isPending) { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#555' } }}
                >
                  {isPending ? 'Sign →' : 'View →'}
                </button>
              </div>
            )
          })}

          <div style={{ padding: '10px 20px', background: '#FAFAFA', borderTop: '0.5px solid #F0F0F0' }}>
            <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>Showing {filtered.length} of {MOCK_MRFS.length} requests</p>
          </div>
        </div>
      </div>
    </div>
  )
}