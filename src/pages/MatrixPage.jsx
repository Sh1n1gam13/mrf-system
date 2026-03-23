// ─────────────────────────────────────────────────────────────────
// MatrixPage.jsx
// 4M+1E Matrix Reference — QAD-X-7.1.1.3 Rev.03
// HS Technologies (Phils.), Inc.
// Reference guide for required attachments per type of change
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { MATRIX_F1, MATRIX_F2, MATRIX_LEGEND } from '../constants'

// ── Attachment header labels — F1 (21 cols) ───────────────────────
const HEADER_ABBR_F1 = [
  { num: 1,  full: 'Samples' },
  { num: 2,  full: 'Insp. Data (Appearance) — QC' },
  { num: 3,  full: 'Insp. Data (Dimension) — QC' },
  { num: 4,  full: 'Full Dim./Appearance (n=5) — QA' },
  { num: 5,  full: 'Die Setting Std / Report' },
  { num: 6,  full: 'Control Plan / Process Flow' },
  { num: 7,  full: 'FMEA' },
  { num: 8,  full: 'Die History' },
  { num: 9,  full: 'Mold Job Order Report' },
  { num: 10, full: 'Training Records / Badge / Permit to Operate' },
  { num: 11, full: 'Packing Std (IP/FG)' },
  { num: 12, full: 'WPS/SI/RI/SIM/IPIIS/PIIS/JOIS/PIS/OIS' },
  { num: 13, full: 'Travel Card / Packing Tag' },
  { num: 14, full: 'SGS/MSDS/Test Report/Supplier Data/RoHS' },
  { num: 15, full: 'Technical Drawing (before & after condition)' },
  { num: 16, full: 'Calibration Record / Jig Inspection / Tools Tag' },
  { num: 17, full: 'E-mails from Customer' },
  { num: 18, full: 'Before & After Condition (picture/data)' },
  { num: 19, full: 'Organizational Chart' },
  { num: 20, full: 'Quality / Planning Record' },
  { num: 21, full: 'Calendar Schedule' },
]

// ── Attachment header labels — F2 (22 cols) ───────────────────────
const HEADER_ABBR_F2 = [
  { num: 1,  full: 'Samples / Slabs' },
  { num: 2,  full: 'Insp. Data (Appearance) — QC' },
  { num: 3,  full: 'Insp. Data (Dimension) — QC' },
  { num: 4,  full: 'Full Dim./Appearance (n=5) — QA' },
  { num: 5,  full: 'Parameter Data' },
  { num: 6,  full: 'Peel Off Test Results' },
  { num: 7,  full: 'Control Plan / Process Flow' },
  { num: 8,  full: 'FMEA' },
  { num: 9,  full: 'Mold History' },
  { num: 10, full: 'MJOR (Mold Job Order Report)' },
  { num: 11, full: 'Training Records / Badge / Operator Conformance Form' },
  { num: 12, full: 'Packing Std (IP/FG)' },
  { num: 13, full: 'WPS/SI/RI/SIM/IPIIS/JOIS/OPIIS/PMIIS' },
  { num: 14, full: 'Process Tag / Packing Tag' },
  { num: 15, full: 'SGS/MSDS/Test Report/Supplier Data/RoHS' },
  { num: 16, full: 'Technical Drawing (before and after revision)' },
  { num: 17, full: 'Calibration Record / Jig Inspection / Tools Tag' },
  { num: 18, full: 'E-mails from Customer' },
  { num: 19, full: 'Before & After Condition (picture/data)' },
  { num: 20, full: 'Organizational Chart' },
  { num: 21, full: 'Quality Records / Planning Records' },
  { num: 22, full: 'Calendar Schedule or Notice' },
]
const CAT_STYLE = {
  MAN:         { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  MATERIAL:    { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  MACHINE:     { bg: '#FFF7ED', color: '#9A3412', border: '#FED7AA' },
  METHOD:      { bg: '#F5F3FF', color: '#6B21A8', border: '#DDD6FE' },
  ENVIRONMENT: { bg: '#F0FDFA', color: '#065F46', border: '#99F6E4' },
}

// ── Mark cell ─────────────────────────────────────────────────────
function MarkCell({ value }) {
  if (value === 'P*') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: '#111', color: '#F5C200',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '9px', fontWeight: '700',
      }}>P*</span>
    </div>
  )
  if (value === 'P') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: '#DCFCE7', color: '#166534',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: '700',
      }}>P</span>
    </div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '12px', color: '#D1D5DB', fontWeight: '700' }}>×</span>
    </div>
  )
}

export default function MatrixPage() {
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [factory,        setFactory]        = useState('F1')

  const matrixData  = factory === 'F1' ? MATRIX_F1 : MATRIX_F2
  const headerAbbr  = factory === 'F1' ? HEADER_ABBR_F1 : HEADER_ABBR_F2

  const categories = ['ALL', 'MAN', 'MATERIAL', 'MACHINE', 'METHOD', 'ENVIRONMENT']

  const filtered = matrixData.filter(row => {
    const matchCat    = activeCategory === 'ALL' || row.cat === activeCategory
    const matchSearch = searchQuery === '' ||
      row.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.initiator.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  // Track current category for row grouping
  let lastCat = null

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 0' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
              4M+1E Matrix
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              QAD-X-7.1.1.3 Rev.03 · Required attachments reference guide · {factory === 'F1' ? 'Factory 1' : 'Factory 2'}
            </p>
          </div>

          {/* Factory toggle */}
          <div style={{ display: 'flex', gap: '0', border: '1px solid #E5E5E5', borderRadius: '8px', overflow: 'hidden' }}>
            {['F1', 'F2'].map(f => (
              <button
                key={f}
                onClick={() => { setFactory(f); setActiveCategory('ALL') }}
                style={{
                  padding: '8px 20px',
                  background: factory === f ? '#111' : '#fff',
                  color: factory === f ? '#F5C200' : '#888',
                  border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '700',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                {f === 'F1' ? 'Factory 1' : 'Factory 2'}
              </button>
            ))}
          </div>
        </div>

        {/* Attachment note */}
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A', borderLeft: '3px solid #F5C200',
          borderRadius: '0 6px 6px 0', padding: '8px 14px',
        }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#92400E', lineHeight: '1.5' }}>
            <strong>Note:</strong> Prior submission of 4M request to QC/QA is required. Refer to this matrix for required attachments before submitting.
          </p>
        </div>
      </div>

      {/* ── Legend ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '16px', flexWrap: 'wrap',
        background: '#FAFAFA', border: '0.5px solid #E5E5E5',
        borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
      }}>
        <p style={{ margin: '0 8px 0 0', fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', alignSelf: 'center' }}>Legend:</p>
        {MATRIX_LEGEND.map(({ mark, meaning }) => (
          <div key={mark} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MarkCell value={mark} />
            <span style={{ fontSize: '11px', color: '#555' }}>{meaning}</span>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const style = cat !== 'ALL' ? CAT_STYLE[cat] : null
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 14px',
                  background: isActive
                    ? (style ? style.bg : '#111')
                    : 'transparent',
                  color: isActive
                    ? (style ? style.color : '#F5C200')
                    : '#888',
                  border: isActive
                    ? `1px solid ${style ? style.border : '#111'}`
                    : '1px solid #E5E5E5',
                  borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  letterSpacing: '0.5px',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search content or initiator..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            marginLeft: 'auto', padding: '7px 14px', fontSize: '12px',
            border: '1px solid #E5E5E5', borderRadius: '6px', outline: 'none',
            width: '220px', fontFamily: 'Arial, Helvetica, sans-serif',
            background: '#FAFAFA', color: '#111',
          }}
        />
      </div>

      {/* ── Matrix Table ─────────────────────────────────────────── */}
      <div style={{
        background: '#fff', border: '0.5px solid #E5E5E5',
        borderRadius: '10px', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#111' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#F5C200', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', whiteSpace: 'nowrap', minWidth: '80px' }}>CATEGORY</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#F5C200', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', minWidth: '260px' }}>CONTENT OF CHANGE</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#F5C200', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', minWidth: '110px', whiteSpace: 'nowrap' }}>INITIATOR</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#F5C200', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', minWidth: '110px', whiteSpace: 'nowrap' }}>NOTED</th>
                {headerAbbr.map(({ num, abbr }) => (
                  <th key={num} style={{
                    padding: '8px 4px', color: 'rgba(255,255,255,0.5)',
                    fontSize: '9px', fontWeight: '700', textAlign: 'center',
                    minWidth: '34px', maxWidth: '34px', lineHeight: '1.2',
                    verticalAlign: 'middle', whiteSpace: 'nowrap',
                  }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'rgba(245,194,0,0.15)', border: '1px solid rgba(245,194,0,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto', fontSize: '10px', fontWeight: '700', color: '#F5C200',
                    }}>
                      {num}
                    </div>
                  </th>
                ))}
                <th style={{ padding: '10px 8px', color: '#F5C200', fontSize: '9px', fontWeight: '700', textAlign: 'center', minWidth: '48px', whiteSpace: 'nowrap' }}>INT<br/>Appr.</th>
                <th style={{ padding: '10px 8px', color: '#F5C200', fontSize: '9px', fontWeight: '700', textAlign: 'center', minWidth: '48px', whiteSpace: 'nowrap' }}>EXT<br/>Appr.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={headerAbbr.length + 6} style={{ padding: '36px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                    No results found.
                  </td>
                </tr>
              ) : filtered.map((row, i) => {
                const showCatLabel = row.cat !== lastCat
                lastCat = row.cat
                const catStyle = CAT_STYLE[row.cat] || {}
                const isEven = i % 2 === 0
                return (
                  <tr
                    key={i}
                    style={{
                      background: isEven ? '#fff' : '#FAFAFA',
                      borderBottom: '0.5px solid #F0F0F0',
                    }}
                  >
                    {/* Category */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                      {showCatLabel && (
                        <span style={{
                          display: 'inline-block', padding: '3px 10px',
                          background: catStyle.bg, color: catStyle.color,
                          border: `1px solid ${catStyle.border}`,
                          borderRadius: '20px', fontSize: '10px', fontWeight: '700',
                          letterSpacing: '0.5px', whiteSpace: 'nowrap',
                        }}>
                          {row.cat}
                        </span>
                      )}
                    </td>

                    {/* Content */}
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#111', lineHeight: '1.5', verticalAlign: 'middle' }}>
                      {row.content}
                    </td>

                    {/* Initiator */}
                    <td style={{ padding: '10px 12px', fontSize: '11px', color: '#555', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {row.initiator}
                    </td>

                    {/* Noted */}
                    <td style={{ padding: '10px 12px', fontSize: '11px', color: '#555', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {row.noted}
                    </td>

                    {/* Attachment marks */}
                    {row.attach.map((val, j) => (
                      <td key={j} style={{ padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <MarkCell value={val} />
                      </td>
                    ))}

                    {/* Approval */}
                    <td style={{ padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
                      {row.internal ? <MarkCell value={row.internal} /> : <span style={{ fontSize: '12px', color: '#E5E5E5' }}>—</span>}
                    </td>
                    <td style={{ padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
                      {row.external ? <MarkCell value={row.external} /> : <span style={{ fontSize: '12px', color: '#E5E5E5' }}>—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div style={{ padding: '10px 16px', background: '#FAFAFA', borderTop: '0.5px solid #F0F0F0' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>
            Showing {filtered.length} of {matrixData.length} entries · Rev. 3.0 · In-charge: Vangie Pio · Approved by: Tsubasa Suzuki · {factory === 'F1' ? 'Factory 1' : 'Factory 2'}
          </p>
        </div>

        {/* Attachment key */}
        <div style={{ padding: '16px 20px', background: '#fff', borderTop: '0.5px solid #E5E5E5' }}>
          <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: '700', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Required Attachment Key
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 24px' }}>
            {headerAbbr.map(({ num, full }) => (
              <div key={num} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: '#F5F5F5', border: '1px solid #E5E5E5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '700', color: '#555',
                }}>
                  {num}
                </span>
                <span style={{ fontSize: '11px', color: '#555', lineHeight: '1.5', paddingTop: '3px' }}>{full}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}