// ─────────────────────────────────────────────────────────────────
// MRFProgress.jsx
// Progress tracker for MRFDetail.jsx
//
// Style: pill tabs (Style B) + yellow bg active pill (Variant 2)
//        + yellow left border on active sub-stage row (Option 1)
//
// Rules:
// - Active phase pill:  yellow bg, black text, black border
// - Done phase pill:    green bg, green text, check icon
// - Upcoming pill:      gray, dimmed, not clickable
// - All done/active phases clickable — completed show history
// - Active sub-stage row: yellow left border + "Current" badge
// - Returned state (returned_by_requester / qa_denied):
//     red left border + ↩ returned indicator ONLY when in that state
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'

// ── Status → phase ────────────────────────────────────────────────
const STATUS_PHASE = {
  draft:                      1,
  pending_noted:              1,
  noted_signed:               1,
  pending_conformed:          2,
  pending_requester_review:   2,
  returned_by_requester:      2,
  conformed_approved:         2,
  qa_review:                  3,
  qa_draft:                   3,
  awaiting_managers_approval: 3,
  qa_denied:                  3,
  qa_approved:                4,
  final_approved:             4,
  issuance:                   5,
}

const PHASE_DONE_AT = {
  1: ['noted_signed','pending_conformed','pending_requester_review','returned_by_requester','conformed_approved','qa_review','qa_draft','awaiting_managers_approval','qa_denied','qa_approved','final_approved','issuance'],
  2: ['conformed_approved','qa_review','qa_draft','awaiting_managers_approval','qa_denied','qa_approved','final_approved','issuance'],
  3: ['qa_approved','final_approved','issuance'],
  4: ['final_approved','issuance'],
  5: ['issuance'],
}

const PHASES = [
  {
    id: 1, label: 'Noting',
    subStages: [
      { key: 'pending_noted',  label: 'For Noting',    loopHere: false,
        doneAt:   ['noted_signed','pending_conformed','pending_requester_review','returned_by_requester','conformed_approved','qa_review','qa_draft','awaiting_managers_approval','qa_denied','qa_approved','final_approved','issuance'],
        activeAt: ['pending_noted'] },
      { key: 'noted_signed',   label: 'Noted & Signed', loopHere: false,
        doneAt:   ['pending_conformed','pending_requester_review','returned_by_requester','conformed_approved','qa_review','qa_draft','awaiting_managers_approval','qa_denied','qa_approved','final_approved','issuance'],
        activeAt: ['noted_signed'] },
    ],
  },
  {
    id: 2, label: 'Confirmation', loopStatus: 'returned_by_requester',
    subStages: [
      { key: 'pending_conformed',        label: 'For Confirmation',          loopHere: false,
        doneAt:   ['pending_requester_review','returned_by_requester','conformed_approved','qa_review','qa_draft','awaiting_managers_approval','qa_denied','qa_approved','final_approved','issuance'],
        activeAt: ['pending_conformed'] },
      { key: 'pending_requester_review', label: 'Pending Requester Review',  loopHere: true,
        doneAt:   ['conformed_approved','qa_review','qa_draft','awaiting_managers_approval','qa_denied','qa_approved','final_approved','issuance'],
        activeAt: ['pending_requester_review'] },
      { key: 'conformed_approved',       label: 'Conformed & Approved',      loopHere: false,
        doneAt:   ['qa_review','qa_draft','awaiting_managers_approval','qa_denied','qa_approved','final_approved','issuance'],
        activeAt: ['conformed_approved'] },
    ],
  },
  {
    id: 3, label: 'QA', loopStatus: 'qa_denied',
    subStages: [
      { key: 'qa_review',                  label: 'QA Review',                   loopHere: false,
        doneAt:   ['qa_draft','awaiting_managers_approval','qa_denied','qa_approved','final_approved','issuance'],
        activeAt: ['qa_review'] },
      { key: 'qa_draft',                   label: 'QA Draft',                    loopHere: false,
        doneAt:   ['awaiting_managers_approval','qa_denied','qa_approved','final_approved','issuance'],
        activeAt: ['qa_draft'] },
      { key: 'awaiting_managers_approval', label: "Awaiting Manager's Approval", loopHere: true,
        doneAt:   ['qa_approved','final_approved','issuance'],
        activeAt: ['awaiting_managers_approval'] },
      { key: 'qa_approved',                label: 'QA Approved',                 loopHere: false,
        doneAt:   ['final_approved','issuance'],
        activeAt: ['qa_approved'] },
    ],
  },
  {
    id: 4, label: 'Final Approval',
    subStages: [
      { key: 'awaiting_president', label: 'Awaiting President Signature', loopHere: false,
        doneAt:   ['final_approved','issuance'],
        activeAt: ['qa_approved'] },
      { key: 'final_approved',     label: 'Final Approved',               loopHere: false,
        doneAt:   ['issuance'],
        activeAt: ['final_approved'] },
    ],
  },
  {
    id: 5, label: 'Issuance',
    subStages: [
      { key: 'issuance', label: 'Issued to Departments', loopHere: false,
        doneAt:   [],
        activeAt: ['issuance'] },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────
const getPhaseState = (phaseId, status) => {
  if (PHASE_DONE_AT[phaseId]?.includes(status)) return 'done'
  if (STATUS_PHASE[status] === phaseId)          return 'active'
  return 'upcoming'
}
const getSubState = (sub, status) => {
  if (sub.doneAt.includes(status))   return 'done'
  if (sub.activeAt.includes(status)) return 'active'
  return 'upcoming'
}

// ── Tiny icons ────────────────────────────────────────────────────
function CheckIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="6" fill="#1D9E75"/>
      <path d="M3 6l2 2 4-4" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ChevronIcon({ open, color = 'currentColor' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12"
      style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <path d="M2 4l4 4 4-4" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function SubDot({ state }) {
  if (state === 'done') return <CheckIcon size={14} />
  if (state === 'active') return (
    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#F5C200', border: '2px solid #111', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#111' }} />
    </div>
  )
  return <div style={{ width: 14, height: 14, borderRadius: '50%', border: '0.5px solid var(--color-border-secondary)', flexShrink: 0 }} />
}

// ── Main ──────────────────────────────────────────────────────────
export default function MRFProgress({ status = 'pending_noted' }) {
  const activePhaseId         = STATUS_PHASE[status] || 1
  const isReturnedByRequester = status === 'returned_by_requester'
  const isReturnedByQA        = status === 'qa_denied'

  const [openPhases, setOpenPhases] = useState(() => {
    const init = {}
    PHASES.forEach(p => { init[p.id] = p.id === activePhaseId })
    return init
  })

  const togglePhase = (phaseId, state) => {
    if (state === 'upcoming') return
    setOpenPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }))
  }

  return (
    <div style={{ marginBottom: '20px', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* ── Pill row ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px', overflowX: 'auto' }}>
        {PHASES.map((phase) => {
          const state       = getPhaseState(phase.id, status)
          const isOpen      = openPhases[phase.id]
          const clickable   = state !== 'upcoming'
          const isLoopPhase = (isReturnedByRequester && phase.loopStatus === 'returned_by_requester') ||
                              (isReturnedByQA        && phase.loopStatus === 'qa_denied')

          // Pill appearance
          let bg, border, color
          if (state === 'done') {
            bg = '#E1F5EE'; border = '0.5px solid #5DCAA5'; color = '#085041'
          } else if (state === 'active') {
            if (isLoopPhase) {
              bg = '#FCEBEB'; border = '1.5px solid #A32D2D'; color = '#791F1F'
            } else {
              bg = '#F5C200'; border = '1.5px solid #111'; color = '#111'
            }
          } else {
            bg = 'var(--color-background-secondary)'; border = '0.5px solid var(--color-border-tertiary)'; color = 'var(--color-text-secondary)'
          }

          return (
            <div key={phase.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <div onClick={() => togglePhase(phase.id, state)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                  background: bg, border, borderRadius: '20px',
                  cursor: clickable ? 'pointer' : 'default',
                  opacity: state === 'upcoming' ? 0.45 : 1,
                  transition: 'all 0.15s', userSelect: 'none' }}>

                {state === 'done'   && <CheckIcon size={12} />}
                {state === 'active' && !isLoopPhase && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111', flexShrink: 0 }} />}
                {state === 'active' && isLoopPhase  && <span style={{ fontSize: '11px', fontWeight: '700', color: '#A32D2D' }}>↩</span>}
                {state === 'upcoming' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-border-secondary)', flexShrink: 0 }} />}

                <span style={{ fontSize: '12px', fontWeight: state === 'active' ? '500' : '400', color, whiteSpace: 'nowrap' }}>
                  {phase.label}
                </span>

                {clickable && <ChevronIcon open={isOpen} color={color} />}
              </div>

              {/* Connector */}
              {phase.id < PHASES.length && (
                <div style={{ width: 14, height: 1.5, background: state === 'done' ? '#5DCAA5' : 'var(--color-border-tertiary)', flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Expanded dropdowns ────────────────────────────────── */}
      {PHASES.map((phase) => {
        const state  = getPhaseState(phase.id, status)
        const isOpen = openPhases[phase.id]
        if (!isOpen || state === 'upcoming') return null

        const isLoopPhase = (isReturnedByRequester && phase.loopStatus === 'returned_by_requester') ||
                            (isReturnedByQA        && phase.loopStatus === 'qa_denied')
        const doneCount   = phase.subStages.filter(s => s.doneAt.includes(status)).length

        const cardBorder = isLoopPhase ? '0.5px solid #F09595'
          : state === 'active' ? '0.5px solid #F5C200'
          : '0.5px solid var(--color-border-tertiary)'

        return (
          <div key={phase.id} style={{ background: 'var(--color-background-primary)', border: cardBorder, borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>

            {/* Header */}
            <div style={{ padding: '9px 16px', background: 'var(--color-background-secondary)', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: isLoopPhase ? '#791F1F' : 'var(--color-text-primary)' }}>
                {phase.label}{isLoopPhase ? ' — returned' : ''}
              </span>
              {state === 'active' && (
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {doneCount} of {phase.subStages.length} complete
                </span>
              )}
              {state === 'done' && (
                <span style={{ fontSize: '11px', color: '#1D9E75', fontWeight: '500' }}>✓ Completed</span>
              )}
            </div>

            {/* Sub-stage rows */}
            {phase.subStages.map((sub, si) => {
              const subState  = getSubState(sub, status)
              const isLast    = si === phase.subStages.length - 1
              // Show returned indicator ONLY when this sub-stage is the loop point AND we're in a returned state for this phase
              const showLoop  = sub.loopHere && isLoopPhase

              // Row styling
              let rowBg   = 'var(--color-background-primary)'
              let rowBL   = 'none'
              let rowPL   = '16px'

              if (showLoop) {
                rowBg = '#FFF5F5'; rowBL = '3px solid #E24B4A'; rowPL = '13px'
              } else if (subState === 'active') {
                rowBg = 'var(--color-background-secondary)'; rowBL = '3px solid #F5C200'; rowPL = '13px'
              }

              return (
                <div key={sub.key} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: `10px ${rowPL}`,
                  borderBottom: !isLast ? '0.5px solid var(--color-border-tertiary)' : 'none',
                  borderLeft: rowBL,
                  background: rowBg,
                  opacity: subState === 'upcoming' && !showLoop ? 0.45 : 1,
                  transition: 'all 0.15s',
                }}>

                  {/* Left side — dot or returned indicator */}
                  {showLoop ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: '500', color: '#A32D2D', whiteSpace: 'nowrap' }}>↩ returned</span>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px dashed #E24B4A', flexShrink: 0 }} />
                    </div>
                  ) : (
                    <SubDot state={subState} />
                  )}

                  {/* Label */}
                  <span style={{
                    fontSize: '13px',
                    fontWeight: subState === 'active' || showLoop ? '500' : '400',
                    color: showLoop ? '#A32D2D' : subState === 'active' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  }}>
                    {sub.label}
                  </span>

                  {/* Right badge */}
                  {subState === 'active' && !showLoop && (
                    <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '10px', background: '#F5C200', color: '#412402' }}>
                      Current
                    </span>
                  )}
                  {showLoop && (
                    <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '10px', background: '#FCEBEB', color: '#A32D2D', border: '0.5px solid #F09595' }}>
                      Returned here
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {/* ── Legend ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
        {[
          { icon: <CheckIcon size={12} />, label: 'Completed' },
          { icon: <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F5C200', border: '1.5px solid #111' }} />, label: 'Active' },
          { icon: <div style={{ width: 10, height: 10, borderRadius: '50%', border: '0.5px solid var(--color-border-secondary)' }} />, label: 'Upcoming' },
        ].map(({ icon, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {icon}
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{label}</span>
          </div>
        ))}
        {(isReturnedByRequester || isReturnedByQA) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#A32D2D' }}>↩ returned</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Returned state</span>
          </div>
        )}
      </div>

    </div>
  )
}