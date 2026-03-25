// ─────────────────────────────────────────────────────────────────
// MRFDocument.jsx
// Shared component — renders MRF as close to official form layout.
// Used by MRFForm, MRFDetail, FinalApproved, InboxView.
//
// Stamp system (corrected):
//   Stamp 1 — Requester stamp
//     Hidden (not rendered) when mrf.requesterDecision is null/undefined
//     Green "✓ APPROVED" when requesterDecision === 'approved'
//     Red   "✗ DENIED"   when requesterDecision === 'denied'
//   Stamp 2 — QA stamp
//     Always visible. Gray pending / blue approved / red denied.
//
// Props:
//   mrf              — request form data (includes requesterDecision)
//   qa               — QA evaluation data
//   presidentSig     — base64 image (optional)
//   presidentName    — string (optional)
//   presidentDate    — string (optional)
//   showQA           — bool (default true)
//   showDistribution — bool (default true)
//   user             — logged-in user
// ─────────────────────────────────────────────────────────────────

const border = '1px solid #555'
const cell  = (extra = {}) => ({ border, padding: '3px 5px', fontSize: '10px', verticalAlign: 'top', ...extra })
const hcell = (extra = {}) => ({ border, padding: '3px 5px', fontSize: '10px', fontWeight: '700', verticalAlign: 'top', ...extra })

function Box({ checked }) {
  return (
    <span style={{ display: 'inline-block', width: '11px', height: '11px', border: '1px solid #444', background: checked ? '#111' : '#fff', marginRight: '4px', flexShrink: 0, verticalAlign: 'middle', position: 'relative', top: '-1px' }}>
      {checked && <span style={{ color: '#fff', fontSize: '8px', fontWeight: '700', position: 'absolute', top: '-2px', left: '1px' }}>✓</span>}
    </span>
  )
}

function SideLabel({ children, rows, bg }) {
  return (
    <td rowSpan={rows} style={{ border, width: '18px', writingMode: 'vertical-rl', textAlign: 'center', fontSize: '8px', fontWeight: '700', letterSpacing: '1.5px', padding: '4px 2px', background: bg || '#e8e8e8' }}>
      {children}
    </td>
  )
}

function SigCell({ name, sig, style }) {
  return (
    <td style={{ ...cell({ minHeight: '40px', height: '40px', position: 'relative', ...style }) }}>
      <span style={{ fontSize: '9px', color: '#555', position: 'absolute', bottom: '3px', left: '4px' }}>{name || ''}</span>
      {sig && <img src={sig} alt="sig" style={{ position: 'absolute', top: '2px', left: '4px', height: '32px', maxWidth: '100%', objectFit: 'contain', pointerEvents: 'none' }} />}
    </td>
  )
}

export default function MRFDocument({
  mrf = {}, qa = {},
  presidentSig = null, presidentName = '', presidentDate = '',
  showQA = true, showDistribution = true, user,
}) {
  const alts     = mrf.alterations || []
  const distCopy = qa.distributionCopy || []

  const REASONS = [
    { id: 'engg',        label: "Eng'g Change/s",               indent: 0 },
    { id: 'tooling',     label: 'Tooling Transfer',              indent: 0 },
    { id: 'correction',  label: 'Correction',                    indent: 0 },
    { id: 'quality',     label: 'Quality Enhancement',           indent: 0 },
    { id: 'method',      label: 'Method',                        indent: 0 },
    { id: 'partprocess', label: 'Change in Part Process',        indent: 1 },
    { id: 'changestd',   label: 'Change in Std.',                indent: 1 },
    { id: 'stdspec',     label: `Pls. specify  ${mrf.specifyValues?.changestd || '_____________'}`, indent: 2, plain: true },
    { id: 'others1',     label: 'Others',                        indent: 1 },
    { id: 'others1s',    label: `Pls. specify  ${mrf.specifyValues?.others1 || '_____________'}`,   indent: 2, plain: true },
    { id: 'subcon',      label: "Subcon or Mat'l Source Change", indent: 0 },
    { id: 'processplant',label: 'Change in Process Plant',       indent: 0 },
    { id: 'others2',     label: `Others (Pls. specify) ${mrf.specifyValues?.others2 || '___________'}`, indent: 0 },
    { id: 'machine',     label: 'Change in Machine',             indent: 0 },
    { id: 'material',    label: 'Change in Material',            indent: 0 },
    { id: 'manpower',    label: 'Change in Manpower',            indent: 0 },
  ]

  const ALTS_LEFT  = ['WPS','PIS/PMIIS','OIS/OPIIS','SIM','MSS','DSS','PSIS','PIIS']
  const ALTS_RIGHT = ['QCFC','FMEA','Packaging Std.','Travel Card / Process Tag','Packing Tag','JOIS','Others (Pls. specify)','']
  const DIST_LEFT  = ['PRODUCTION','QC','ENGINEERING/MOLD','PPIC','PURCHASING','DEVELOPMENT']
  const DIST_RIGHT = ['MARKETING','RMWHSE','FGWHSE','CS','GAD/MSIT','QA']

  const isChecked = (id) => !!(mrf.checkedReasons?.[id])

  // ── Stamp values ──────────────────────────────────────────────
  const requesterDecision = mrf.requesterDecision  // 'approved' | 'denied' | null/undefined
  const qaDecision        = mrf.qaDecision         // 'approved' | 'denied' | null/undefined

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10px', color: '#111', background: '#fff' }}>

      {/* ── Title + Stamps row ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
        {/* Left spacer mirrors stamp area for centering */}
        <div style={{ flex: '0 0 120px' }} />

        {/* Centered title */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '700' }}>MODIFICATION REQUEST FORM</div>
          <div style={{ fontSize: '9px', color: '#555' }}>QAD-F-7.1.1.2 REV.10</div>
        </div>

        {/* Stamps — right side */}
        <div style={{ flex: '0 0 auto', display: 'flex', gap: '6px', pointerEvents: 'none', paddingRight: '4px' }}>

          {/* ── Stamp 1: Requester stamp ─────────────────────────
              Only shown when Requester has acted (approved or denied).
              Hidden entirely when requesterDecision is null.          */}
          {requesterDecision && (() => {
            const approved = requesterDecision === 'approved'
            return (
              <div style={{
                fontSize: '8px', fontWeight: '900', letterSpacing: '1px', textAlign: 'center',
                color: approved ? '#166534' : '#991B1B',
                background: approved ? 'rgba(220,252,231,0.92)' : 'rgba(254,226,226,0.92)',
                border: `1.5px solid ${approved ? '#22C55E' : '#EF4444'}`,
                borderRadius: '3px', padding: '3px 6px',
                transform: 'rotate(-10deg)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                textTransform: 'uppercase', lineHeight: '1.4', minWidth: '52px',
              }}>
                <div>{approved ? '✓ APPROVED' : '✗ DENIED'}</div>
                <div style={{ fontSize: '6px', fontWeight: '700', marginTop: '1px' }}>by Requester</div>
              </div>
            )
          })()}

          {/* ── Stamp 2: QA stamp ────────────────────────────────
              Always visible. Gray = pending, Blue = approved, Red = denied. */}
          {(() => {
            const decided  = !!qaDecision
            const approved = qaDecision === 'approved'
            return (
              <div style={{
                fontSize: '8px', fontWeight: '900', letterSpacing: '1px', textAlign: 'center',
                color: decided ? (approved ? '#1E40AF' : '#991B1B') : '#555',
                background: decided ? (approved ? 'rgba(219,234,254,0.92)' : 'rgba(254,226,226,0.92)') : 'rgba(229,231,235,0.95)',
                border: `1.5px solid ${decided ? (approved ? '#3B82F6' : '#EF4444') : '#9CA3AF'}`,
                borderRadius: '3px', padding: '3px 6px',
                transform: 'rotate(-10deg)',
                boxShadow: decided ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                textTransform: 'uppercase', lineHeight: '1.4', minWidth: '52px',
              }}>
                <div>{decided ? (approved ? '✓ APPROVED' : '✗ DENIED') : '— PENDING —'}</div>
                <div style={{ fontSize: '6px', fontWeight: '700', marginTop: '1px' }}>by QA</div>
              </div>
            )
          })()}

        </div>
      </div>

      {/* ── TOP SECTION — Basic Info ──────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <colgroup>
          <col style={{ width: '13%' }} /><col style={{ width: '22%' }} />
          <col style={{ width: '11%' }} /><col style={{ width: '18%' }} />
          <col style={{ width: '10%' }} /><col style={{ width: '18%' }} />
          <col style={{ width: '8%'  }} /><col style={{ width: '18px' }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={hcell()}>Application date</td>
            <td style={cell()}>{mrf.applicationDate}</td>
            <td style={hcell()}>Prepared by:</td>
            <SigCell name={mrf.preparedBy} sig={mrf.preparedBySig} />
            <td style={hcell()}>Noted by :</td>
            <td style={{ ...cell({ height: '44px', position: 'relative', padding: '3px 4px' }) }}>
              {(() => {
                const signatories = [
                  { sig: mrf.notedBy1Sig, name: mrf.notedBy1Name, date: mrf.notedBy1Date },
                  { sig: mrf.notedBy2Sig, name: mrf.notedBy2Name, date: mrf.notedBy2Date },
                  { sig: mrf.notedBy3Sig, name: mrf.notedBy3Name, date: mrf.notedBy3Date },
                ].filter(s => s.sig || s.name)
                if (signatories.length === 0) return null
                return (
                  <div style={{ display: 'flex', gap: '2px', height: '38px' }}>
                    {signatories.map((s, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        {s.sig && <img src={s.sig} alt="sig" style={{ display: 'block', margin: '0 auto', height: '20px', maxWidth: '95%', objectFit: 'contain' }} />}
                        <div style={{ paddingTop: '1px', position: 'relative' }}>
                          <span style={{ fontSize: '6px', color: '#444' }}>{s.name || ''}</span>
                          {s.date && <span style={{ position: 'absolute', right: 0, fontSize: '6px', color: '#444' }}>{s.date}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </td>
            <td style={hcell({ fontSize: '9px', background: '#f5f5f5' })}>Conformed by :</td>
            <SideLabel rows={4}>REQUESTING DEPARTMENT</SideLabel>
          </tr>
          <tr>
            <td style={hcell()}>Part Number</td>
            <td style={cell()}>{mrf.partNumber}</td>
            <td colSpan={4} style={{ ...cell({ position: 'relative', height: '44px', padding: '3px 4px' }) }}>
              {(() => {
                const signatories = mrf.conformedBySignatories
                  ? mrf.conformedBySignatories
                  : (mrf.conformedByName || mrf.conformedBySig)
                    ? [{ sig: mrf.conformedBySig, name: mrf.conformedByName, date: mrf.conformedByDate }]
                    : []
                if (signatories.length === 0) return null
                return (
                  <div style={{ display: 'flex', gap: '2px', height: '38px' }}>
                    {signatories.map((s, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        {s.sig && <img src={s.sig} alt="sig" style={{ display: 'block', margin: '0 auto', height: '20px', maxWidth: '95%', objectFit: 'contain' }} />}
                        <div style={{ paddingTop: '1px', position: 'relative' }}>
                          <span style={{ fontSize: '6px', color: '#444' }}>{s.name || ''}</span>
                          {s.date && <span style={{ position: 'absolute', right: 0, fontSize: '6px', color: '#444' }}>{s.date}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </td>
            <td style={cell({ background: '#f5f5f5' })}></td>
          </tr>
          <tr>
            <td style={hcell()}>Part Name</td>
            <td style={cell()}>{mrf.partName}</td>
            <td colSpan={5} style={cell({ background: '#f5f5f5' })}></td>
          </tr>
          <tr>
            <td style={hcell()}>Target date</td>
            <td style={cell()}>{mrf.targetDate}</td>
            <td style={hcell()}>Factory No.:</td>
            <td style={cell()}>{mrf.factoryNo}</td>
            <td colSpan={3} style={cell({ background: '#f5f5f5' })}></td>
          </tr>
        </tbody>
      </table>

      {/* ── MIDDLE SECTION ───────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={hcell({ width: '38%' })}>REASON FOR SUBMISSION:</td>
            <td style={hcell({ width: '44%' })}>DETAILED CONTENT OF CHANGE:</td>
            <td style={hcell({ width: '18%', fontSize: '9px', background: '#f5f5f5' })} rowSpan={2}>REASON FOR CHANGE:</td>
          </tr>
          <tr>
            <td style={{ ...cell(), verticalAlign: 'top', padding: '4px 6px' }}>
              {REASONS.map((r, i) => (
                <div key={i} style={{ paddingLeft: `${r.indent * 14}px`, lineHeight: '1.6', fontSize: '10px' }}>
                  {r.plain
                    ? <span style={{ color: '#555', fontSize: '9px' }}>{r.label}</span>
                    : <><Box checked={isChecked(r.id)} /><span style={{ fontWeight: isChecked(r.id) ? '700' : '400' }}>{r.label}</span></>}
                </div>
              ))}
            </td>
            <td style={{ ...cell(), verticalAlign: 'top' }}>
              <div style={{ fontSize: '9px', color: '#888', fontStyle: 'italic', marginBottom: '4px' }}>(Illustration / Flow/ etc.)</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{mrf.detailedContent}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Reason for Change block */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-1px' }}>
        <colgroup><col style={{ width: '82%' }} /><col style={{ width: '18%' }} /></colgroup>
        <tbody>
          <tr>
            <td style={cell({ height: '50px', verticalAlign: 'top', padding: '4px 6px' })}>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '10px' }}>{mrf.reasonForChange}</div>
            </td>
            <td style={{ ...hcell({ verticalAlign: 'top', background: '#f5f5f5', fontSize: '9px' }) }}></td>
          </tr>
        </tbody>
      </table>

      {/* ── ALTERATION OF STANDARD ───────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <colgroup><col style={{ width: '38%' }} /><col style={{ width: '62%' }} /></colgroup>
        <tbody>
          <tr>
            <td style={hcell()}>ALTERATION OF STANDARD</td>
            <td style={hcell()}>ATTACHMENT:</td>
          </tr>
          <tr>
            <td style={{ ...cell(), padding: '4px 6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {ALTS_LEFT.map((left, i) => {
                    const right    = ALTS_RIGHT[i]
                    const lChecked = alts.includes(left)
                    const rChecked = right ? alts.includes(right) : false
                    return (
                      <tr key={i}>
                        <td style={{ padding: '1px 4px 1px 0', width: '50%', fontSize: '10px' }}>
                          <Box checked={lChecked} />{left}
                        </td>
                        {right ? (
                          <td style={{ padding: '1px 0', width: '50%', fontSize: '10px' }}>
                            <Box checked={rChecked} />
                            {right === 'Packaging Std.'
                              ? <span style={{ fontWeight: rChecked ? '700' : '400' }}>Packaging Std. ({mrf.pkgIp || '___'}IP{mrf.pkgFg || '___'}FG)</span>
                              : right}
                          </td>
                        ) : <td />}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </td>
            <td style={{ ...cell(), padding: '4px 6px', verticalAlign: 'top' }}>
              <div style={{ fontWeight: '700', marginBottom: '3px', fontSize: '10px' }}>* REFER TO 4M MATRIX FOR THE REQUIRED ATTACHMENT</div>
              <div style={{ fontWeight: '700', marginBottom: '6px', fontSize: '10px' }}>PRIOR SUBMISSION OF 4M REQUEST TO QC/QA</div>
              {['Evaluation Report / Inspection Report', 'Samples _______ pcs.', 'Others (pls. specify)'].map(label => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', fontSize: '10px' }}>
                  <Box checked={false} />{label}
                </div>
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── QA SECTION ───────────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <colgroup>
          <col style={{ width: '38%' }} /><col style={{ width: '22%' }} />
          <col style={{ width: '22%' }} /><col style={{ width: '18%' }} />
          <col style={{ width: '18px' }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={hcell({ fontWeight: '700' })}>QA REMARKS :</td>
            <td style={hcell()}>DATE RECEIVED :</td>
            <td style={hcell()}>CONTROL NO.</td>
            <td style={cell({ background: '#f5f5f5' })}></td>
            <SideLabel rows={9} bg="#d8e4f0">QA DEPT FILL IN</SideLabel>
          </tr>
          <tr>
            <td style={cell({ minHeight: '36px', height: '40px' })}>{showQA ? qa.qaRemarks : ''}</td>
            <td style={cell()}>{showQA ? qa.dateReceived : ''}</td>
            <td style={cell()}>{showQA ? qa.controlNo : ''}</td>
            <td style={cell({ background: '#f5f5f5' })}></td>
          </tr>
          <tr><td colSpan={4} style={hcell({ fontWeight: '700' })}>PROCESS/PART EVALUATION :</td></tr>
          <tr>
            <td style={cell()}><Box checked={showQA && qa.evalNeed === 'need'} /> NEED</td>
            <td style={cell()}><Box checked={showQA && qa.evalNeed === 'noneed'} /> NO NEED</td>
            <td colSpan={2} style={cell({ background: '#f5f5f5' })}></td>
          </tr>
          <tr><td colSpan={4} style={hcell({ fontWeight: '700' })}>RECOMMENDATION:</td></tr>
          <tr><td colSpan={4} style={cell({ minHeight: '40px', height: '44px' })}>{showQA ? qa.recommendation : ''}</td></tr>
          <tr>
            <td colSpan={2} style={hcell({ fontWeight: '700' })}>DISTRIBUTION COPY :</td>
            <td colSpan={2} style={hcell({ fontWeight: '700' })}>APPROVAL CATEGORY:</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell(), padding: '4px 6px', verticalAlign: 'top' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {DIST_LEFT.map((left, i) => {
                    const right = DIST_RIGHT[i]
                    return (
                      <tr key={i}>
                        <td style={{ padding: '1px 0', fontSize: '10px', width: '50%' }}><Box checked={showQA && showDistribution && distCopy.includes(left)} />{left}</td>
                        <td style={{ padding: '1px 0', fontSize: '10px', width: '50%' }}><Box checked={showQA && showDistribution && distCopy.includes(right)} />{right}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </td>
            <td colSpan={2} style={{ ...cell(), padding: '4px 6px', verticalAlign: 'top' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
                {['INTERNAL','EXTERNAL'].map(v => (
                  <div key={v} style={{ fontSize: '10px' }}><Box checked={showQA && qa.approvalCategory === v.toLowerCase()} />{v}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                {['ACCEPT','REJECT'].map(v => (
                  <div key={v} style={{ fontSize: '10px' }}><Box checked={showQA && ((v === 'ACCEPT' && qa.approvalDecision === 'accept') || (v === 'REJECT' && qa.approvalDecision === 'reject'))} />{v}</div>
                ))}
              </div>
              {(() => {
                const approvedSigners = []
                if (qa.qaManagerSig || qa.qaManagerName) approvedSigners.push({ sig: qa.qaManagerSig, name: qa.qaManagerName, date: qa.qaManagerDate })
                if (presidentSig || presidentName)        approvedSigners.push({ sig: presidentSig, name: presidentName, date: presidentDate })
                const SigBox = ({ sig, name, date, width = '100%' }) => (
                  <div style={{ position: 'relative', minHeight: '56px', width, textAlign: 'center' }}>
                    {sig && <img src={sig} alt="sig" style={{ display: 'block', margin: '0 auto', height: '34px', maxWidth: '90%', objectFit: 'contain', pointerEvents: 'none' }} />}
                    <div style={{ borderTop: '1px solid #555', marginTop: sig ? '2px' : '36px', paddingTop: '2px', position: 'relative' }}>
                      <span style={{ fontSize: '8px', color: '#444' }}>{name || 'Name / Date'}</span>
                      {date && <span style={{ position: 'absolute', right: 0, bottom: 0, fontSize: '8px', color: '#444' }}>{date}</span>}
                    </div>
                  </div>
                )
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '2px' }}>Prepared by:</div>
                      <SigBox sig={qa.preparedBySig} name={qa.preparedByName || 'Name / Date'} date={qa.preparedByDate} />
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '2px' }}>Approved by :</div>
                      {approvedSigners.length === 0 && <SigBox name="" date="" />}
                      {approvedSigners.length === 1 && <SigBox sig={approvedSigners[0].sig} name={approvedSigners[0].name} date={approvedSigners[0].date} />}
                      {approvedSigners.length >= 2 && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {approvedSigners.map((s, i) => <SigBox key={i} sig={s.sig} name={s.name} date={s.date} width="50%" />)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Customer Approval ─────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <colgroup><col style={{ width: '38%' }} /><col style={{ width: '62%' }} /></colgroup>
        <tbody>
          <tr>
            <td style={hcell()}>CUSTOMER APPROVAL</td>
            <td style={hcell()}>CUSTOMER REMARKS:</td>
          </tr>
          <tr>
            <td style={cell({ height: '40px', verticalAlign: 'bottom', textAlign: 'center' })}>
              <div style={{ borderTop: '1px solid #555', margin: '0 20px', paddingTop: '2px', fontSize: '8px', color: '#888' }}>Signature over printed name/date</div>
            </td>
            <td style={cell({ height: '40px' })}></td>
          </tr>
        </tbody>
      </table>

      {/* ── Footer ───────────────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ ...cell({ border: 'none', fontWeight: '700', fontSize: '9px', paddingTop: '4px' }), width: '50%' }}>HS TECHNOLOGIES (PHILS.), INC.</td>
            <td style={{ ...cell({ border: 'none', fontWeight: '700', fontSize: '9px', paddingTop: '4px', textAlign: 'right' }), width: '50%' }}>QUALITY ASSURANCE DEPARTMENT</td>
          </tr>
        </tbody>
      </table>

    </div>
  )
}