// ─────────────────────────────────────────────────────────────────
// SummaryPage.jsx
// Modification Request Summary — QA Admin view
// Shows MRF history table and exports as official Excel file
// Matches QAD-F-7.1.1.4 REV. 01 format (excluding Encoded by col)
// TODO: Replace MOCK_SUMMARY_DATA with Firestore query once connected
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { utils, writeFile } from 'xlsx'

// ── Mock summary data — replace with Firestore query later ───────
// Each entry = one completed MRF (status: approved/issuance)
const MOCK_SUMMARY_DATA = [
  {
    controlNo:      '4M-M-7861', year: 2026,
    customer:       'TNPH',
    applicationDate:'10/18/2025',
    department:     'PRODUCTION',
    requestingPerson:'R. ABANICO',
    qaReceivingDate:'01/05/2026',
    partNumber:     '134852-6500A700',
    contentFrom:    '---',
    contentTo:      'DELETION OF STEP 2 TO 6\nINCLUSION OF VERIFICATION OF QTY INSIDE THE BOX',
    reasonOfChange: 'ALIGNMENT ON ACTUAL PROCESS ON PACKING (DIRECT PACKING)',
    preparedByName: 'V. PIO',
    preparedByDate: '01/05/2026',
    approvedByName: 'TSUBASA S.',
    approvedByDate: '01/05/2026',
    qaIntApproved:  '✓', qaIntDenied: null, qaExtApproved: null, qaExtDenied: null,
    issuanceDate:   '01/12/2026',
    hyperlink:      '2026\\4M-M-7861-TNPH-134852-6500A700.pdf',
    remarks:        '---',
  },
  {
    controlNo:      '4M-M-7862', year: 2026,
    customer:       'SHINSEI',
    applicationDate:'12/15/2025',
    department:     'PRODUCTION',
    requestingPerson:'J. PAREJA',
    qaReceivingDate:'01/12/2026',
    partNumber:     'H102BL',
    contentFrom:    'INDIVIDUAL MACHINE',
    contentTo:      'COMBINATION MACHINE\n(PROCESS 3/8)',
    reasonOfChange: 'TO SAVE MANPOWER\nVAVE ACTIVITY',
    preparedByName: 'V. PIO',
    preparedByDate: '01/12/2026',
    approvedByName: 'TSUBASA S.',
    approvedByDate: '01/12/2026',
    qaIntApproved:  '✓', qaIntDenied: null, qaExtApproved: null, qaExtDenied: null,
    issuanceDate:   '01/15/2026',
    hyperlink:      '2026\\4M-M-7862-SIPI-H102BL.pdf',
    remarks:        '---',
  },
  {
    controlNo:      '4M-M-7863', year: 2026,
    customer:       'SHINSEI',
    applicationDate:'12/15/2025',
    department:     'PRODUCTION',
    requestingPerson:'J. PAREJA',
    qaReceivingDate:'01/12/2026',
    partNumber:     'H101BL',
    contentFrom:    'INDIVIDUAL MACHINE',
    contentTo:      'COMBINATION MACHINE\n(PROCESS 3/8)',
    reasonOfChange: 'TO SAVE MANPOWER\nVAVE ACTIVITY',
    preparedByName: 'V. PIO',
    preparedByDate: '01/12/2026',
    approvedByName: 'TSUBASA S.',
    approvedByDate: '01/12/2026',
    qaIntApproved:  '✓', qaIntDenied: null, qaExtApproved: null, qaExtDenied: null,
    issuanceDate:   '01/15/2026',
    hyperlink:      '2026\\4M-M-7863-SIPI-H101BL.pdf',
    remarks:        '---',
  },
]

// ── Column config for display table ──────────────────────────────
const COLS = [
  { key: 'controlNo',       label: 'Control No.',     w: 120 },
  { key: 'year',            label: 'Year',            w: 55  },
  { key: 'customer',        label: 'Customer',        w: 90  },
  { key: 'applicationDate', label: 'App. Date',       w: 95  },
  { key: 'department',      label: 'Department',      w: 110 },
  { key: 'requestingPerson',label: 'Requesting',      w: 100 },
  { key: 'qaReceivingDate', label: 'QA Received',     w: 95  },
  { key: 'partNumber',      label: 'Part No.',        w: 130 },
  { key: 'contentFrom',     label: 'Content From',    w: 160 },
  { key: 'contentTo',       label: 'Content To',      w: 180 },
  { key: 'reasonOfChange',  label: 'Reason',          w: 160 },
  { key: 'preparedByName',  label: 'Prepared By',     w: 90  },
  { key: 'preparedByDate',  label: 'Prep. Date',      w: 90  },
  { key: 'approvedByName',  label: 'Approved By',     w: 100 },
  { key: 'approvedByDate',  label: 'App. Date',       w: 90  },
  { key: 'qaIntApproved',   label: 'Int ✓',           w: 50  },
  { key: 'qaIntDenied',     label: 'Int ✗',           w: 50  },
  { key: 'qaExtApproved',   label: 'Ext ✓',           w: 50  },
  { key: 'qaExtDenied',     label: 'Ext ✗',           w: 50  },
  { key: 'issuanceDate',    label: 'Issuance',        w: 90  },
  { key: 'remarks',         label: 'Remarks',         w: 100 },
]

// ── Excel export — official QAD-F-7.1.1.4 REV.01 layout ──────────
function exportToExcel(data) {
  const wb = utils.book_new()

  // Build aoa (array of arrays) for the sheet
  // Row 1: Title
  const aoa = []
  aoa.push(['MODIFICATION REQUEST SUMMARY', ...Array(22).fill(null)])  // row 1 A:W
  aoa.push(["QAD-F-7.1.1.4 REV. 01", ...Array(22).fill(null)])         // row 2

  // Row 3: Main column headers
  aoa.push([
    'Control Number', 'Year', 'Customer/\nSupplier', 'Application date\n(mo/date/yr)',
    'Requesting\nDepartment', 'Requesting\nPerson', 'QA receiving date\n(mo/date/yr)',
    'Part Number', 'Detailed Content of Change', null,
    'Reason of\nChange', 'Prepared by', null, 'Approved by', null,
    'QA disposition', null, null, null,
    'Issuance date\nthru e-mail', 'Hyperlink', 'Remarks',
  ])

  // Row 4: Sub-headers
  aoa.push([
    null, null, null, null, null, null, null, null,
    'From', 'To',
    null, ' (name)', '(mo/date/yr)', ' (name)', '(mo/date/yr)',
    'Internal', null, 'External', null,
    null, null, null,
  ])

  // Row 5: approved/denied
  aoa.push([
    null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null,
    'approved', 'denied', 'approved', 'denied',
    null, null, null,
  ])

  // Data rows — auto height based on content
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

  // Column widths
  ws['!cols'] = [
    {wch:14},{wch:6},{wch:12},{wch:13},{wch:14},{wch:13},
    {wch:13},{wch:18},{wch:25},{wch:25},{wch:22},{wch:12},
    {wch:12},{wch:12},{wch:12},{wch:8},{wch:7},{wch:8},
    {wch:7},{wch:13},{wch:22},{wch:16},
  ]

  // Merges
  ws['!merges'] = [
    // Title row
    {s:{r:0,c:0}, e:{r:0,c:22}},  // A1:W1
    {s:{r:1,c:0}, e:{r:1,c:22}},  // A2:W2
    // Row 3 single-col headers that span 3 rows
    {s:{r:2,c:0},  e:{r:4,c:0}},   // A3:A5
    {s:{r:2,c:1},  e:{r:4,c:1}},   // B3:B5
    {s:{r:2,c:2},  e:{r:4,c:2}},   // C3:C5
    {s:{r:2,c:3},  e:{r:4,c:3}},   // D3:D5
    {s:{r:2,c:4},  e:{r:4,c:4}},   // E3:E5
    {s:{r:2,c:5},  e:{r:4,c:5}},   // F3:F5
    {s:{r:2,c:6},  e:{r:4,c:6}},   // G3:G5
    {s:{r:2,c:7},  e:{r:4,c:7}},   // H3:H5
    {s:{r:2,c:10}, e:{r:4,c:10}},  // K3:K5
    {s:{r:2,c:19}, e:{r:4,c:19}},  // T3:T5
    {s:{r:2,c:20}, e:{r:4,c:20}},  // U3:U5
    {s:{r:2,c:21}, e:{r:4,c:21}},  // V3:V5
    // Detailed content I3:J3
    {s:{r:2,c:8},  e:{r:2,c:9}},
    // Prepared by L3:M3, then L4:L5 and M4:M5
    {s:{r:2,c:11}, e:{r:2,c:12}},
    {s:{r:3,c:11}, e:{r:4,c:11}},
    {s:{r:3,c:12}, e:{r:4,c:12}},
    // Approved by N3:O3, then N4:N5 and O4:O5
    {s:{r:2,c:13}, e:{r:2,c:14}},
    {s:{r:3,c:13}, e:{r:4,c:13}},
    {s:{r:3,c:14}, e:{r:4,c:14}},
    // QA disposition P3:S3
    {s:{r:2,c:15}, e:{r:2,c:18}},
    // Internal P4:Q4, External R4:S4
    {s:{r:3,c:15}, e:{r:3,c:16}},
    {s:{r:3,c:17}, e:{r:3,c:18}},
    // I4:I5, J4:J5
    {s:{r:3,c:8},  e:{r:4,c:8}},
    {s:{r:3,c:9},  e:{r:4,c:9}},
  ]

  // Set row heights — auto-size based on content line breaks
  ws['!rows'] = [
    { hpt: 22 },  // row 1 title
    { hpt: 14 },  // row 2 form code
    { hpt: 36 },  // row 3 headers
    { hpt: 20 },  // row 4
    { hpt: 14 },  // row 5
    // Data rows: estimate height from longest multi-line cell
    ...data.map(r => {
      const lines = Math.max(
        (r.contentTo    || '').split('\n').length,
        (r.contentFrom  || '').split('\n').length,
        (r.reasonOfChange || '').split('\n').length,
        1
      )
      return { hpt: Math.max(lines * 14, 28) }
    })
  ]

  const year = new Date().getFullYear()
  utils.book_append_sheet(wb, ws, `4M SUMMARY CY'${String(year).slice(2)}`)
  writeFile(wb, `F1_4M_SUMMARY_CY_${year}.xlsx`)
}

// ── Status Badge ──────────────────────────────────────────────────
function Badge({ children, color, bg }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', background: bg, color, borderRadius: '10px', fontSize: '10px', fontWeight: '700' }}>
      {children}
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function SummaryPage({ user, onBack }) {
  const [search,   setSearch]   = useState('')
  const [yearFilter, setYearFilter] = useState('all')

  const data = MOCK_SUMMARY_DATA  // TODO: replace with Firestore query

  const years = [...new Set(data.map(r => r.year))].sort((a,b) => b - a)

  const filtered = data.filter(r => {
    const q = search.toLowerCase()
    const matchYear   = yearFilter === 'all' || String(r.year) === yearFilter
    const matchSearch = !q ||
      r.controlNo.toLowerCase().includes(q) ||
      r.partNumber.toLowerCase().includes(q) ||
      r.customer.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.requestingPerson.toLowerCase().includes(q)
    return matchYear && matchSearch
  })

  const inputStyle = {
    padding: '8px 12px', fontSize: '12px', border: '1px solid #E5E5E5',
    borderRadius: '6px', outline: 'none', fontFamily: 'Arial', background: '#FAFAFA',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111', fontFamily: 'Georgia, serif' }}>
              Modification Request Summary
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              QAD-F-7.1.1.4 REV. 01 · {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              {yearFilter !== 'all' ? ` · CY ${yearFilter}` : ''}
            </p>
          </div>
          {/* Export button */}
          <button
            onClick={() => exportToExcel(filtered)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#111', color: '#F5C200', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#333'}
            onMouseLeave={e => e.currentTarget.style.background = '#111'}
          >
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

      {/* ── Filters ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search control no., part, customer..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: '300px' }} />
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
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Records',   value: data.length,                                   color: '#111'    },
          { label: 'Internal Approved', value: data.filter(r => r.qaIntApproved).length,    color: '#166534' },
          { label: 'External Approved', value: data.filter(r => r.qaExtApproved).length,    color: '#1E40AF' },
          { label: 'Denied',          value: data.filter(r => r.qaIntDenied || r.qaExtDenied).length, color: '#991B1B' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '8px', padding: '14px 18px', border: '0.5px solid #E5E5E5' }}>
            <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</p>
          </div>
        ))}
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
                  <td colSpan={COLS.length} style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                    No records found.
                  </td>
                </tr>
              ) : filtered.map((row, i) => (
                <tr key={row.controlNo}
                  style={{ borderBottom: i < filtered.length - 1 ? '0.5px solid #F0F0F0' : 'none', verticalAlign: 'top' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
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

        <div style={{ padding: '10px 16px', background: '#FAFAFA', borderTop: '0.5px solid #F0F0F0' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>
            Showing {filtered.length} of {data.length} records · Export includes all visible records
          </p>
        </div>
      </div>

    </div>
  )
}