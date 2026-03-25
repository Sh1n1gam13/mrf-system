// ─────────────────────────────────────────────────────────────────
// SummaryPage.jsx
// Modification Request Summary — QA Manager view
// Shows MRF history table + exports as official Excel file
// Matches QAD-F-7.1.1.4 REV. 01 format
//
// Changes (Task 6):
// - Metal / Plastic toggle switch (top right, beside Export button)
// - Metal  → filters 4M-M-XXXX  records (default)
// - Plastic → filters 4M-PL-XXXX records
// - Stats cards + Export update based on active toggle
// TODO: Replace MOCK_SUMMARY_DATA with Firestore query once connected
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { utils, writeFile } from 'xlsx'

// ── Mock data — Metal (4M-M-XXXX) ────────────────────────────────
const MOCK_METAL = [
  {
    controlNo:       '4M-M-7861', year: 2026,
    customer:        'TNPH',
    applicationDate: '10/18/2025',
    department:      'PRODUCTION',
    requestingPerson:'R. ABANICO',
    qaReceivingDate: '01/05/2026',
    partNumber:      '134852-6500A700',
    contentFrom:     '---',
    contentTo:       'DELETION OF STEP 2 TO 6\nINCLUSION OF VERIFICATION OF QTY INSIDE THE BOX',
    reasonOfChange:  'ALIGNMENT ON ACTUAL PROCESS ON PACKING (DIRECT PACKING)',
    preparedByName:  'V. PIO',
    preparedByDate:  '01/05/2026',
    approvedByName:  'TSUBASA S.',
    approvedByDate:  '01/05/2026',
    qaIntApproved: '✓', qaIntDenied: null, qaExtApproved: null, qaExtDenied: null,
    issuanceDate:    '01/12/2026',
    hyperlink:       '2026\\4M-M-7861-TNPH-134852-6500A700.pdf',
    remarks:         '---',
  },
  {
    controlNo:       '4M-M-7862', year: 2026,
    customer:        'SHINSEI',
    applicationDate: '12/15/2025',
    department:      'PRODUCTION',
    requestingPerson:'J. PAREJA',
    qaReceivingDate: '01/12/2026',
    partNumber:      'H102BL',
    contentFrom:     'INDIVIDUAL MACHINE',
    contentTo:       'COMBINATION MACHINE\n(PROCESS 3/8)',
    reasonOfChange:  'TO SAVE MANPOWER\nVAVE ACTIVITY',
    preparedByName:  'V. PIO',
    preparedByDate:  '01/12/2026',
    approvedByName:  'TSUBASA S.',
    approvedByDate:  '01/12/2026',
    qaIntApproved: '✓', qaIntDenied: null, qaExtApproved: null, qaExtDenied: null,
    issuanceDate:    '01/15/2026',
    hyperlink:       '2026\\4M-M-7862-SIPI-H102BL.pdf',
    remarks:         '---',
  },
  {
    controlNo:       '4M-M-7863', year: 2026,
    customer:        'SHINSEI',
    applicationDate: '12/15/2025',
    department:      'PRODUCTION',
    requestingPerson:'J. PAREJA',
    qaReceivingDate: '01/12/2026',
    partNumber:      'H101BL',
    contentFrom:     'INDIVIDUAL MACHINE',
    contentTo:       'COMBINATION MACHINE\n(PROCESS 3/8)',
    reasonOfChange:  'TO SAVE MANPOWER\nVAVE ACTIVITY',
    preparedByName:  'V. PIO',
    preparedByDate:  '01/12/2026',
    approvedByName:  'TSUBASA S.',
    approvedByDate:  '01/12/2026',
    qaIntApproved: '✓', qaIntDenied: null, qaExtApproved: null, qaExtDenied: null,
    issuanceDate:    '01/15/2026',
    hyperlink:       '2026\\4M-M-7863-SIPI-H101BL.pdf',
    remarks:         '---',
  },
]

// ── Mock data — Plastic (4M-PL-XXXX) ─────────────────────────────
const MOCK_PLASTIC = [
  {
    controlNo:       '4M-PL-0021', year: 2026,
    customer:        'GLORY',
    applicationDate: '01/10/2026',
    department:      'ENGINEERING',
    requestingPerson:'L. SANTOS',
    qaReceivingDate: '01/14/2026',
    partNumber:      'GP-3301A',
    contentFrom:     'VIRGIN RESIN ONLY',
    contentTo:       'VIRGIN + 10% REGRIND',
    reasonOfChange:  'COST REDUCTION INITIATIVE',
    preparedByName:  'V. PIO',
    preparedByDate:  '01/14/2026',
    approvedByName:  'TSUBASA S.',
    approvedByDate:  '01/14/2026',
    qaIntApproved: null, qaIntDenied: null, qaExtApproved: '✓', qaExtDenied: null,
    issuanceDate:    '01/20/2026',
    hyperlink:       '2026\\4M-PL-0021-GLORY-GP-3301A.pdf',
    remarks:         '---',
  },
  {
    controlNo:       '4M-PL-0022', year: 2026,
    customer:        'MTMP',
    applicationDate: '01/20/2026',
    department:      'PRODUCTION',
    requestingPerson:'R. ABANICO',
    qaReceivingDate: '01/24/2026',
    partNumber:      'MT-4420B',
    contentFrom:     'MANUAL ASSEMBLY',
    contentTo:       'JIG-ASSISTED ASSEMBLY',
    reasonOfChange:  'QUALITY IMPROVEMENT — REDUCE DIMENSIONAL VARIANCE',
    preparedByName:  'V. PIO',
    preparedByDate:  '01/24/2026',
    approvedByName:  'TSUBASA S.',
    approvedByDate:  '01/25/2026',
    qaIntApproved: '✓', qaIntDenied: null, qaExtApproved: null, qaExtDenied: null,
    issuanceDate:    '01/28/2026',
    hyperlink:       '2026\\4M-PL-0022-MTMP-MT-4420B.pdf',
    remarks:         '---',
  },
]

// ── Column config for display table ──────────────────────────────
const COLS = [
  { key: 'controlNo',        label: 'Control No.',   w: 120 },
  { key: 'year',             label: 'Year',          w: 55  },
  { key: 'customer',         label: 'Customer',      w: 90  },
  { key: 'applicationDate',  label: 'App. Date',     w: 95  },
  { key: 'department',       label: 'Department',    w: 110 },
  { key: 'requestingPerson', label: 'Requesting',    w: 100 },
  { key: 'qaReceivingDate',  label: 'QA Received',   w: 95  },
  { key: 'partNumber',       label: 'Part No.',      w: 130 },
  { key: 'contentFrom',      label: 'Content From',  w: 160 },
  { key: 'contentTo',        label: 'Content To',    w: 180 },
  { key: 'reasonOfChange',   label: 'Reason',        w: 160 },
  { key: 'preparedByName',   label: 'Prepared By',   w: 90  },
  { key: 'preparedByDate',   label: 'Prep. Date',    w: 90  },
  { key: 'approvedByName',   label: 'Approved By',   w: 100 },
  { key: 'approvedByDate',   label: 'Appr. Date',    w: 90  },
  { key: 'qaIntApproved',    label: 'Int ✓',         w: 50  },
  { key: 'qaIntDenied',      label: 'Int ✗',         w: 50  },
  { key: 'qaExtApproved',    label: 'Ext ✓',         w: 50  },
  { key: 'qaExtDenied',      label: 'Ext ✗',         w: 50  },
  { key: 'issuanceDate',     label: 'Issuance',      w: 90  },
  { key: 'remarks',          label: 'Remarks',       w: 100 },
]

// ── Excel export — QAD-F-7.1.1.4 REV.01 layout ───────────────────
function exportToExcel(data, type) {
  const wb  = utils.book_new()
  const aoa = []

  aoa.push(['MODIFICATION REQUEST SUMMARY', ...Array(22).fill(null)])
  aoa.push(['QAD-F-7.1.1.4 REV. 01',       ...Array(22).fill(null)])

  aoa.push([
    'Control Number', 'Year', 'Customer/\nSupplier', 'Application date\n(mo/date/yr)',
    'Requesting\nDepartment', 'Requesting\nPerson', 'QA receiving date\n(mo/date/yr)',
    'Part Number', 'Detailed Content of Change', null,
    'Reason of\nChange', 'Prepared by', null, 'Approved by', null,
    'QA disposition', null, null, null,
    'Issuance date\nthru e-mail', 'Hyperlink', 'Remarks',
  ])

  aoa.push([
    null, null, null, null, null, null, null, null,
    'From', 'To',
    null, ' (name)', '(mo/date/yr)', ' (name)', '(mo/date/yr)',
    'Internal', null, 'External', null,
    null, null, null,
  ])

  aoa.push([
    null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null,
    'approved', 'denied', 'approved', 'denied',
    null, null, null,
  ])

  data.forEach(r => {
    aoa.push([
      r.controlNo, r.year, r.customer, r.applicationDate,
      r.department, r.requestingPerson, r.qaReceivingDate,
      r.partNumber, r.contentFrom, r.contentTo,
      r.reasonOfChange, r.preparedByName, r.preparedByDate,
      r.approvedByName, r.approvedByDate,
      r.qaIntApproved || null, r.qaIntDenied || null,
      r.qaExtApproved || null, r.qaExtDenied || null,
      r.issuanceDate, r.hyperlink, r.remarks,
    ])
  })

  const ws = utils.aoa_to_sheet(aoa)

  ws['!cols'] = [
    {wch:14},{wch:6},{wch:12},{wch:13},{wch:14},{wch:13},
    {wch:13},{wch:18},{wch:25},{wch:25},{wch:22},{wch:12},
    {wch:12},{wch:12},{wch:12},{wch:8},{wch:7},{wch:8},
    {wch:7},{wch:13},{wch:22},{wch:16},
  ]

  ws['!merges'] = [
    {s:{r:0,c:0}, e:{r:0,c:22}},
    {s:{r:1,c:0}, e:{r:1,c:22}},
    {s:{r:2,c:0},  e:{r:4,c:0}},
    {s:{r:2,c:1},  e:{r:4,c:1}},
    {s:{r:2,c:2},  e:{r:4,c:2}},
    {s:{r:2,c:3},  e:{r:4,c:3}},
    {s:{r:2,c:4},  e:{r:4,c:4}},
    {s:{r:2,c:5},  e:{r:4,c:5}},
    {s:{r:2,c:6},  e:{r:4,c:6}},
    {s:{r:2,c:7},  e:{r:4,c:7}},
    {s:{r:2,c:10}, e:{r:4,c:10}},
    {s:{r:2,c:19}, e:{r:4,c:19}},
    {s:{r:2,c:20}, e:{r:4,c:20}},
    {s:{r:2,c:21}, e:{r:4,c:21}},
    {s:{r:2,c:8},  e:{r:2,c:9}},
    {s:{r:2,c:11}, e:{r:2,c:12}},
    {s:{r:3,c:11}, e:{r:4,c:11}},
    {s:{r:3,c:12}, e:{r:4,c:12}},
    {s:{r:2,c:13}, e:{r:2,c:14}},
    {s:{r:3,c:13}, e:{r:4,c:13}},
    {s:{r:3,c:14}, e:{r:4,c:14}},
    {s:{r:2,c:15}, e:{r:2,c:18}},
    {s:{r:3,c:15}, e:{r:3,c:16}},
    {s:{r:3,c:17}, e:{r:3,c:18}},
    {s:{r:3,c:8},  e:{r:4,c:8}},
    {s:{r:3,c:9},  e:{r:4,c:9}},
  ]

  ws['!rows'] = [
    { hpt: 22 },
    { hpt: 14 },
    { hpt: 36 },
    { hpt: 20 },
    { hpt: 14 },
    ...data.map(r => {
      const lines = Math.max(
        (r.contentTo      || '').split('\n').length,
        (r.contentFrom    || '').split('\n').length,
        (r.reasonOfChange || '').split('\n').length,
        1
      )
      return { hpt: Math.max(lines * 14, 28) }
    }),
  ]

  const year     = new Date().getFullYear()
  const typeCode = type === 'metal' ? 'METAL' : 'PLASTIC'
  const prefix   = type === 'metal' ? '4M_METAL' : '4M_PLASTIC'
  utils.book_append_sheet(wb, ws, `4M ${typeCode} CY'${String(year).slice(2)}`)
  writeFile(wb, `${prefix}_SUMMARY_CY_${year}.xlsx`)
}

// ── Badge ─────────────────────────────────────────────────────────
function Badge({ children, color, bg }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', background: bg, color, borderRadius: '10px', fontSize: '10px', fontWeight: '700' }}>
      {children}
    </span>
  )
}

// ── Metal / Plastic Toggle ────────────────────────────────────────
function MaterialToggle({ value, onChange }) {
  return (
    <div style={{ display: 'flex', background: '#F5F5F5', border: '0.5px solid #E5E5E5', borderRadius: '8px', padding: '3px', gap: '2px' }}>
      {[
        { id: 'metal',   label: 'Metal',   prefix: '4M-M-' },
        { id: 'plastic', label: 'Plastic', prefix: '4M-PL-' },
      ].map(opt => {
        const isActive = value === opt.id
        return (
          <button key={opt.id} onClick={() => onChange(opt.id)}
            style={{ padding: '6px 16px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: isActive ? '700' : '400',
              background: isActive ? '#111' : 'transparent',
              color: isActive ? '#F5C200' : '#888',
              cursor: 'pointer', fontFamily: 'Arial', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>{opt.prefix}</span>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function SummaryPage({ user, onBack }) {
  const [materialType, setMaterialType] = useState('metal')   // 'metal' | 'plastic'
  const [search,       setSearch]       = useState('')
  const [yearFilter,   setYearFilter]   = useState('all')

  // Source data driven by toggle
  const sourceData = materialType === 'metal' ? MOCK_METAL : MOCK_PLASTIC

  const years = [...new Set(sourceData.map(r => r.year))].sort((a, b) => b - a)

  const filtered = sourceData.filter(r => {
    const q           = search.toLowerCase()
    const matchYear   = yearFilter === 'all' || String(r.year) === yearFilter
    const matchSearch = !q ||
      r.controlNo.toLowerCase().includes(q) ||
      r.partNumber.toLowerCase().includes(q) ||
      r.customer.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.requestingPerson.toLowerCase().includes(q)
    return matchYear && matchSearch
  })

  // Stats — based on sourceData (unfiltered) for totals, filtered for display
  const stats = {
    total:           filtered.length,
    intApproved:     filtered.filter(r => r.qaIntApproved).length,
    extApproved:     filtered.filter(r => r.qaExtApproved).length,
    denied:          filtered.filter(r => r.qaIntDenied || r.qaExtDenied).length,
  }

  const inputStyle = {
    padding: '8px 12px', fontSize: '12px', border: '1px solid #E5E5E5',
    borderRadius: '6px', outline: 'none', fontFamily: 'Arial', background: '#FAFAFA', color: '#111',
  }

  const thStyle = {
    padding: '10px 12px', fontSize: '10px', fontWeight: '700', color: '#888',
    letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left',
    background: '#FAFAFA', borderBottom: '0.5px solid #E5E5E5', whiteSpace: 'nowrap',
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'Arial, Helvetica, sans-serif', maxWidth: '100%' }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <button onClick={onBack}
          style={{ padding: '7px 14px', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#555', fontWeight: '600', fontFamily: 'Arial', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          ← Back to Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
              Modification Request Summary
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              QAD-F-7.1.1.4 REV. 01 · {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              {yearFilter !== 'all' ? ` · CY ${yearFilter}` : ''}
              {' · '}
              <span style={{ fontWeight: '600', color: materialType === 'metal' ? '#111' : '#1E40AF' }}>
                {materialType === 'metal' ? 'Metal (4M-M-)' : 'Plastic (4M-PL-)'}
              </span>
            </p>
          </div>

          {/* Right side: toggle + export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Metal / Plastic toggle */}
            <MaterialToggle value={materialType} onChange={(t) => { setMaterialType(t); setYearFilter('all'); setSearch('') }} />

            {/* Export button */}
            <button
              onClick={() => exportToExcel(filtered, materialType)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = '#333'}
              onMouseLeave={e => e.currentTarget.style.background = '#111'}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1"/>
                <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1"/>
                <line x1="5" y1="11" x2="8"  y2="11" stroke="currentColor" strokeWidth="1"/>
              </svg>
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '18px' }}>
        {[
          { label: 'Total Records',     value: stats.total,       accent: '#111',    textColor: '#111'    },
          { label: 'Internal Approved', value: stats.intApproved, accent: '#1D9E75', textColor: '#085041' },
          { label: 'External Approved', value: stats.extApproved, accent: '#3B82F6', textColor: '#1E40AF' },
          { label: 'Denied',            value: stats.denied,      accent: '#EF4444', textColor: '#991B1B' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '8px', padding: '14px 18px', border: '0.5px solid #E5E5E5', borderTop: `3px solid ${s.accent}` }}>
            <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: s.textColor, fontFamily: 'Georgia, serif' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="Search control no., part, customer..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: '280px' }} />
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
        </select>
        {(search || yearFilter !== 'all') && (
          <button onClick={() => { setSearch(''); setYearFilter('all') }}
            style={{ ...inputStyle, background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', cursor: 'pointer' }}>
            ✕ Clear
          </button>
        )}
        {/* Material type indicator pill */}
        <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
          background: materialType === 'metal' ? '#F5F5F5' : '#EFF6FF',
          color:      materialType === 'metal' ? '#555'    : '#1E40AF',
          border:     materialType === 'metal' ? '0.5px solid #E5E5E5' : '0.5px solid #BFDBFE' }}>
          {materialType === 'metal' ? '4M-M-XXXX' : '4M-PL-XXXX'}
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E5E5', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                {COLS.map(c => (
                  <th key={c.key} style={{ ...thStyle, minWidth: c.w }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} style={{ padding: '48px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                    <p style={{ fontSize: '24px', margin: '0 0 8px' }}>📭</p>
                    No {materialType === 'metal' ? 'Metal' : 'Plastic'} records found.
                  </td>
                </tr>
              ) : filtered.map((row, i) => (
                <tr key={row.controlNo}
                  style={{ borderBottom: i < filtered.length - 1 ? '0.5px solid #F0F0F0' : 'none', verticalAlign: 'top' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: '700', color: '#111' }}>{row.controlNo}</td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{row.year}</td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{row.customer}</td>
                  <td style={{ padding: '10px 12px', color: '#555', whiteSpace: 'nowrap' }}>{row.applicationDate}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge color="#9A3412" bg="#FED7AA">{row.department}</Badge>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{row.requestingPerson}</td>
                  <td style={{ padding: '10px 12px', color: '#555', whiteSpace: 'nowrap' }}>{row.qaReceivingDate}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#111' }}>{row.partNumber}</td>
                  <td style={{ padding: '10px 12px', color: '#555', fontSize: '11px', maxWidth: '160px' }}>{row.contentFrom}</td>
                  <td style={{ padding: '10px 12px', color: '#555', fontSize: '11px', maxWidth: '180px', whiteSpace: 'pre-wrap' }}>{row.contentTo}</td>
                  <td style={{ padding: '10px 12px', color: '#555', fontSize: '11px', maxWidth: '160px', whiteSpace: 'pre-wrap' }}>{row.reasonOfChange}</td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{row.preparedByName}</td>
                  <td style={{ padding: '10px 12px', color: '#555', whiteSpace: 'nowrap' }}>{row.preparedByDate}</td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{row.approvedByName}</td>
                  <td style={{ padding: '10px 12px', color: '#555', whiteSpace: 'nowrap' }}>{row.approvedByDate}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {row.qaIntApproved && <Badge color="#166534" bg="#DCFCE7">{row.qaIntApproved}</Badge>}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {row.qaIntDenied && <Badge color="#991B1B" bg="#FEE2E2">{row.qaIntDenied}</Badge>}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {row.qaExtApproved && <Badge color="#1E40AF" bg="#DBEAFE">{row.qaExtApproved}</Badge>}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {row.qaExtDenied && <Badge color="#991B1B" bg="#FEE2E2">{row.qaExtDenied}</Badge>}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#555', whiteSpace: 'nowrap' }}>{row.issuanceDate}</td>
                  <td style={{ padding: '10px 12px', color: '#aaa', fontSize: '10px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '10px 16px', background: '#FAFAFA', borderTop: '0.5px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>
            Showing {filtered.length} of {sourceData.length} {materialType === 'metal' ? 'Metal' : 'Plastic'} records · Export includes all visible records
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>
            {materialType === 'metal' ? '4M_METAL_SUMMARY_CY_2026.xlsx' : '4M_PLASTIC_SUMMARY_CY_2026.xlsx'}
          </p>
        </div>
      </div>

    </div>
  )
}