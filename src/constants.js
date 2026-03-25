// ─────────────────────────────────────────────────────────────────
// constants.js — Official Form Data
// Source: QAD-F-7.1.1.2 REV.10 / QAD-X-7.1.1.3 Rev.03 / QAD-F-7.1.1.4 REV.01
// HS Technologies (Phils.), Inc.
// ─────────────────────────────────────────────────────────────────

// ── Control No. format: 4M-M-XXXX ────────────────────────────────
export const CONTROL_NO_PREFIX = '4M-M-'

// ── Workflow roles (from form: Prepared by / Noted by / Conformed by / QA) ──
export const ROLES = {
  requester: 'Requester',
  noter:     'noter',
  conformer: 'conformer',  // "Conformed by" on the actual form
  qa:        'qa',
}

export const ROLE_LABELS = {
  preparer:  'Preparer',
  noter:     'Noted By',
  conformer: 'Conformed By',
  qa:        'QA Admin',
}

// ── Status flow ───────────────────────────────────────────────────
export const STATUS = {
  pending_noter:     { label: 'For Noting',      bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  pending_conformer: { label: 'For Confirmation', bg: '#FED7AA', color: '#9A3412', dot: '#F97316' },
  qa_review:         { label: 'QA Review',        bg: '#F3E8FF', color: '#6B21A8', dot: '#A855F7' },
  approved:          { label: 'Approved',          bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  denied:            { label: 'Denied',            bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  returned:          { label: 'Returned',          bg: '#FFEDD5', color: '#9A3412', dot: '#F97316' },
}

// ── Reason for Submission (from QAD-F-7.1.1.2 REV.10) ────────────
export const REASONS_FOR_SUBMISSION = [
  "Eng'g Change/s",
  'Tooling Transfer',
  'Correction',
  'Quality Enhancement',
  'Method',
  'Change in Part Process',
  'Change in Std.',
  'Subcon or Mat\'l Source Change',
  'Change in Process Plant',
  'Change in Machine',
  'Change in Material',
  'Change in Manpower',
  'Others (Pls. specify)',
]

// ── Alteration of Standard (from QAD-F-7.1.1.2 REV.10) ──────────
export const ALTERATIONS_OF_STANDARD = [
  'WPS',
  'QCFC',
  'PIS/PMIIS',
  'FMEA',
  'OIS/OPIIS',
  'Packaging Std.',
  'SIM',
  'Travel Card / Process Tag',
  'MSS',
  'Packing Tag',
  'DSS',
  'JOIS',
  'PSIS',
  'Others (Pls. specify)',
  'PIIS',
]

// ── Distribution Copy (from QAD-F-7.1.1.2 REV.10) ────────────────
export const DISTRIBUTION_COPY = [
  'PRODUCTION',
  'MARKETING',
  'QC',
  'RMWHSE',
  'ENGINEERING/MOLD',
  'FGWHSE',
  'PPIC',
  'CS',
  'PURCHASING',
  'GAD/MSIT',
  'DEVELOPMENT',
  'QA',
]

// ── Required Attachments referenced in form ───────────────────────
export const ATTACHMENTS_NOTE = '* REFER TO 4M MATRIX FOR THE REQUIRED ATTACHMENT'

// ── Summary columns (from QAD-F-7.1.1.4 REV.01) ─────────────────
export const SUMMARY_COLUMNS = [
  'Control Number',
  'Year',
  'Customer / Supplier',
  'Application Date',
  'Requesting Dept.',
  'Requesting Person',
  'QA Receiving Date',
  'Part Number',
  'Detailed Content (From)',
  'Detailed Content (To)',
  'Reason of Change',
  'Prepared By (Name)',
  'Prepared By (Date)',
  'Approved By (Name)',
  'Approved By (Date)',
  'QA Disposition — Internal Approved',
  'QA Disposition — Internal Denied',
  'QA Disposition — External Approved',
  'QA Disposition — External Denied',
  'Issuance Date (e-mail)',
  'Remarks',
  'Encoded By',
]

// ── 4M+1E Matrix — Factory 1 attachment headers ───────────────────
export const MATRIX_HEADERS_F1 = [
  'Samples',
  'Insp. Data (Appearance) — QC',
  'Insp. Data (Dimension) — QC',
  'Full Dim./Appearance (n=5) — QA',
  'Die Setting Std / Report',
  'Control Plan / Process Flow',
  'FMEA',
  'Die History',
  'Mold Job Order Report',
  'Training Records / Badge / Permit to Operate',
  'Packing Std (IP/FG)',
  'WPS/SI/RI/SIM/IPIIS/PIIS/JOIS/PIS/OIS',
  'Travel Card / Packing Tag',
  'SGS/MSDS/Test Report/Supplier Data/RoHS',
  'Technical Drawing (before & after condition)',
  'Calibration Record / Jig Inspection / Tools Tag',
  'E-mails from Customer',
  'Before & After Condition (picture/data)',
  'Organizational Chart',
  'Quality / Planning Record',
  'Calendar Schedule',
]

// ── 4M+1E Matrix — Factory 2 attachment headers ───────────────────
export const MATRIX_HEADERS_F2 = [
  'Samples / Slabs',
  'Insp. Data (Appearance) — QC',
  'Insp. Data (Dimension) — QC',
  'Full Dim./Appearance (n=5) — QA',
  'Parameter Data',
  'Peel Off Test Results',
  'Control Plan / Process Flow',
  'FMEA',
  'Mold History',
  'MJOR',
  'Training Records / Badge / Operator Conformance Form',
  'Packing Std (IP/FG)',
  'WPS/SI/RI/SIM/IPIIS/JOIS/OPIIS/IPIIS/PMIIS',
  'Process Tag / Packing Tag',
  'SGS/MSDS/Test Report/Supplier Data/RoHS',
  'Technical Drawing (before & after revision)',
  'Calibration Record / Jig Inspection / Tools Tag',
  'E-mails from Customer',
  'Before & After Condition (picture/data)',
  'Organizational Chart',
  'Quality Records / Planning Records',
  'Calendar Schedule or Notice',
]

export const MATRIX_F1 = [
  { cat: 'MAN',         noted: 'Francis / Vangie',           content: 'Newly hired operator / inspector assigned on critical process, additional process',                                                              initiator: 'Production / QC',          attach: ['X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MAN',         noted: 'Francis / Vangie /  Darwin', content: 'Shifting of operator / inspector from regular to contractual or vice versa (assigned on crtical process, additional process )',                  initiator: "Production / QC / Eng'g.",  attach: ['X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MAN',         noted: 'Francis / Vangie /  Darwin', content: 'Transfer of manpower to other assignment or machine assignment (critical process, additional process)',                                           initiator: "Production / QC / Eng'g.",  attach: ['X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MAN',         noted: 'Francis / Vangie /  Darwin', content: 'Change QA Customer in-charge, Head, Manager, including other Departments in higher position up to President',                                    initiator: 'QA / Concerned Section',    attach: ['X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X'], internal: '', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Glenda',                     content: 'Change in material specification (grade / code, maker, source )',                                                                                initiator: 'Purchasing',                attach: ['P*','X','X','P*','P*','X','X','X','X','X','X','P','X','P*','P*','X','X','P*','X','X','X'], internal: '', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Glenda',                     content: 'Material source changed (same material)',                                                                                                        initiator: 'Purchasing',                attach: ['P*','X','X','P*','P*','X','X','X','X','X','X','P*','X','P*','P*','X','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Darwin',                     content: 'Change in material specification (from customer request)',                                                                                       initiator: 'Development',               attach: ['P*','X','X','P*','P*','X','X','X','X','X','X','P*','X','P*','P*','X','P*','X','X','X','X'], internal: '', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Darwin',                     content: 'Change in Supplier requested by Customer',                                                                                                      initiator: 'Development',               attach: ['P*','X','X','P*','P*','X','X','X','X','X','X','X','X','P*','X','X','P*','P*','X','P*','X'], internal: '', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Glenda',                     content: 'Change in Supplier initiated by HST',                                                                                                           initiator: 'Purchasing',                attach: ['P*','X','X','P*','P*','X','X','X','X','X','X','X','X','P*','X','X','X','P*','X','P*','X'], internal: '', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Glenda',                     content: 'Use of different indirect material (carton, plastic, pentel pen, ballpen)',                                                                      initiator: 'Purchasing',                attach: ['P*','P*','X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Darwin',                     content: 'Change in die using newly fabricated',                                                                                                           initiator: 'Engineering / Development', attach: ['P*','X','X','P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Francis / Patrick',          content: 'Change in processing plant (from HST to Subcon or vice versa ) due to Quality issues',                                                          initiator: 'Production/ Planning',      attach: ['P','P','P','X','P','X','X','P','X','X','X','P','X','X','P*','X','X','X','X','P*','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Francis / Patrick',          content: 'Change in processing plant (from HST to Subcon or vice versa ) due to volume capacity',                                                         initiator: 'Production/ Planning',      attach: ['P','P','P','X','P','X','X','P','X','X','X','P','X','X','P*','X','X','X','X','P*','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Francis / Patrick',          content: 'New machine assignment, same tonnage /  same model of machine (machine transfer)',                                                               initiator: 'Production / Planning',     attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Francis',                    content: 'New machine assignment, different tonnage',                                                                                                      initiator: 'Production',                attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Francis',                    content: 'New machine assignment, same tonnage but different maker',                                                                                       initiator: 'Production',                attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Francis',                    content: 'Machine preventive maintenance ( machine parts replacement, repair, modification)',                                                              initiator: 'Machine Maintenance',       attach: ['X','P','P','P','P','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Francis',                    content: 'Machine preventive maintenance (cleaning only)',                                                                                                 initiator: 'Machine Maintenance',       attach: ['X','P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Darwin',                     content: 'Die preventive maintenance (cleaning only)',                                                                                                     initiator: 'Engineering',               attach: ['X','P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Darwin',                     content: 'Die repair and modification',                                                                                                                   initiator: "Engineering / DEV'T",       attach: ['P*','P*','P*','P*','P*','X','X','P*','P*','X','X','P','P','X','P*','X','P*','X','X','X','X'], internal: '', external: 'P' },
  { cat: 'MACHINE',     noted: 'Francis/ Darwin',            content: 'Installation of accessories on die for Quality  and productivity improvement',                                                                   initiator: 'Production/ PE',            attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','P*','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Francis/ Darwin',            content: 'Use of jig',                                                                                                                                    initiator: 'PE / Production',           attach: ['P*','P*','P*','X','X','X','X','X','X','X','X','P*','X','X','X','P*','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Francis/ Darwin',            content: 'Jig improvement from manual to automatic',                                                                                                      initiator: 'PE / Production',           attach: ['P*','P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Francis/ Darwin',            content: 'Jig replacement from old to new',                                                                                                               initiator: 'PE / Production',           attach: ['P*','P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'METHOD',      noted: 'Francis/ Darwin',            content: 'Additional manufacturing process (100% visual inspection and Manual process)',                                                                   initiator: 'Production / PE',           attach: ['P*','P*','P*','X','X','P*','P*','X','X','P*','X','P*','P*','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Francis',                    content: 'Change in Die Setting Parameter',                                                                                                               initiator: 'Production',                attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Vangie',                     content: 'Used of measuring devices with variance which are allowed to used',                                                                             initiator: 'QA',                        attach: ['X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Francis/ Darwin',            content: 'Change in Packaging standard (WIP)',                                                                                                            initiator: 'Production/ PE',            attach: ['X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Darwin/ Patrick',            content: 'Change in Packaging standard based on Customer request',                                                                                        initiator: 'Development / CS',          attach: ['X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','P*','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'METHOD',      noted: 'Francis/ Vangie/ Darwin',    content: 'Change in standards (WPS,PIS, OIS, PIIS, etc.)  due to quality improvements',                                                                  initiator: 'PE/PRODN/ QC/QA',           attach: ['X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Francis/ Vangie/ Darwin',    content: 'Change in process sequence or flow for productivity and quality improvement',                                                                   initiator: 'PE/PRODN/ QC/QA',           attach: ['X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Francis/ Darwin',            content: 'Change in process (e.g cycle time improvement / reduction, process improvement, etc.)',                                                         initiator: 'Prodn / PE',                attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','P*','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Glenda',                     content: 'Change of supplier (localization of material)',                                                                                                 initiator: 'Purchasing',                attach: ['P*','X','X','P*','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'METHOD',      noted: 'Darwin / Vangie',            content: 'Correction of standard to align with Customer standard / actual process',                                                                       initiator: 'Development PE/QC/QA',      attach: ['X','X','X','X','X','X','X','X','X','X','X','P*','P*','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Darwin',                     content: 'Change in drawing version due to dimension or appearance, material specs or customer upgrade - ECR, PCR, HINSEI',                               initiator: 'Development',               attach: ['X','X','X','P*','X','X','X','X','X','X','P*','P*','P*','X','P*','X','P*','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Darwin / Vangie',            content: 'Change in inspection method from visual/dimension to jig or upgrading of jig',                                                                  initiator: 'PE/QA',                     attach: ['P*','P*','P*','X','X','X','X','X','X','X','X','P*','X','X','X','P*','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Darwin',                     content: 'Change in process, additional 100% visual inspection for tooling near and/or exceeded on tooling life',                                         initiator: 'Engineering',               attach: ['P*','P*','P*','X','X','X','X','P*','X','X','X','P*','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'ENVIRONMENT', noted: 'Francis',                    content: 'Change chemical used (e.g oil, degreasing chemicals, etc.)',                                                                                    initiator: 'Production',                attach: ['P*','P*','P*','X','X','X','X','X','X','X','X','P','X','P*','X','X','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'ENVIRONMENT', noted: 'Francis/ Vangie',            content: 'Replacement of flourescent watts',                                                                                                             initiator: 'QC/ Production',            attach: ['X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'ENVIRONMENT', noted: 'Francis / Vangie',           content: 'Change in working lay out (new factory/building, relocation of manufacturing equipment, machines)',                                             initiator: 'Production/ QC /FBM',       attach: ['X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: '' },
]

export const MATRIX_F2 = [
  { cat: 'MAN',         noted: 'Merline / Vangie',           content: 'Newly hired operator / inspector assigned on critical process, additional process',                                                              initiator: 'Production / QC',             attach: ['X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MAN',         noted: 'Merline / Vangie /  Manny',  content: 'Shifting of operator / inspector from regular to contractual or vice versa (assigned on critical process, additional process )',                 initiator: "Production / QC / Eng'g.",    attach: ['X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MAN',         noted: 'Merline / Vangie /  Manny',  content: 'Transfer of manpower to other assignment or machine assignment (critical process, additional process)',                                           initiator: "Production / QC / Eng'g.",    attach: ['X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MAN',         noted: 'Vangie',                     content: 'Change QA Customer in-charge, Head, Manager, including other Departments in higher position up to President',                                    initiator: 'QA / Concerned Section',      attach: ['X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X'], internal: '', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Glenda',                     content: 'Change in material specification (grade / code, maker, source ) / Change in color but same material',                                           initiator: 'Purchasing',                  attach: ['P*','P*','P*','P*','P*','X','X','X','X','X','X','X','P','X','P*','X','X','X','X','X','X','X'], internal: '', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Glenda',                     content: 'Material source changed (same material)',                                                                                                        initiator: 'Purchasing',                  attach: ['P*','P*','P*','P*','P*','X','X','X','X','X','X','X','P','X','P*','X','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Manny',                      content: 'Change in material specification (from customer request)',                                                                                       initiator: 'Development',                 attach: ['P*','P*','P*','P*','P*','X','X','X','X','X','X','X','P*','X','P*','P*','X','P*','X','X','X','X'], internal: '', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Manny',                      content: 'Change in Supplier requested by Customer',                                                                                                      initiator: 'Development',                 attach: ['P*','X','X','P*','P*','X','X','X','X','X','X','X','X','X','P*','X','X','P*','P*','X','X','X'], internal: '', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Glenda',                     content: 'Change in Supplier initiated by HST',                                                                                                           initiator: 'Purchasing',                  attach: ['P*','X','X','P*','P*','X','X','X','X','X','X','X','X','X','P*','X','X','X','P*','X','X','X'], internal: '', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Merline / Patrick',          content: 'Use of recycled material-virgin to re-grind / pelletized,  Change in recycled material - mixing ratio',                                         initiator: 'Production/ Planning',        attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','X','P*','X','X','P*','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Glenda',                     content: 'Use of different indirect material (carton, plastic, pentel pen, ballpen)',                                                                      initiator: 'Purchasing',                  attach: ['P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Merline / Manny',            content: 'Change in mixing ratio (resin, paint , colorant, masterbatch,ink)',                                                                             initiator: 'Production / PE',             attach: ['P*','P*','P*','X','P*','P*','X','X','X','X','X','X','P*','X','X','P*','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MATERIAL',    noted: 'Merline',                    content: 'Change of cleaning agent',                                                                                                                      initiator: 'Production',                  attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','X','P*','X','P*','P*','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Manny',                      content: 'Change in mold using newly fabricated (NEW MOLD, NEW INSERT)',                                                                                  initiator: "Engineering / DEV'T",         attach: ['P*','P*','P*','P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Merline / Patrick',          content: 'Change in processing plant (from HST to Subcon or vice versa ) due to Quality issues',                                                          initiator: 'Production/ Planning',        attach: ['P','P','P','X','P','X','X','X','P','X','X','X','P','P','X','P*','X','X','X','X','P*','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Patrick',                    content: 'Change in processing plant (from HST to Subcon or vice versa ) due to volume capacity',                                                         initiator: 'Planning',                    attach: ['P','P','P','X','P','X','X','X','P','X','X','X','P','P','X','P*','X','X','X','X','P*','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Merline / Patrick',          content: 'New machine assignment, same tonnage /  same model of machine (machine transfer)',                                                               initiator: 'Production / Planning',       attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Merline',                    content: 'New machine assignment, different tonnage',                                                                                                      initiator: 'Production',                  attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Merline',                    content: 'New machine assignment, same tonnage but different maker',                                                                                       initiator: 'Production',                  attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Merline',                    content: 'Machine preventive maintenance / Machine parts replacement/Modification/Repair - Injection machine parts',                                       initiator: 'Machine Maintenance',         attach: ['X','P','P','P','P','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Merline',                    content: '-Solid state relay, grease alarm, thermocouple, hydraulic oil, pump motor, encoder (injection unit)',                                           initiator: 'Machine Maintenance',         attach: ['P','P','P','X','P','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*'], internal: '', external: 'P' },
  { cat: 'MACHINE',     noted: 'Merline',                    content: '-barrel, main heater, nozzle heater, screw head, trap ring, screw, nozzle',                                                                    initiator: 'Machine Maintenance',         attach: ['P','P','P','X','P','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*'], internal: '', external: 'P' },
  { cat: 'MACHINE',     noted: 'Merline',                    content: 'Consumable Parts Replacement (limit / proximity switches, mechanical stopper)',                                                                 initiator: 'Machine Maintenance',         attach: ['P','P','P','X','P','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*'], internal: '', external: 'P' },
  { cat: 'MACHINE',     noted: 'Manny',                      content: 'Mold repair and modification',                                                                                                                  initiator: "Engineering / DEV'T",         attach: ['P*','P*','P*','P*','P*','X','X','X','P*','P*','X','X','P','P','X','P*','X','P*','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Manny',                      content: 'Mold preventive maintenance (cleaning purpose only)',                                                                                           initiator: 'Engineering',                 attach: ['X','P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Manny',                      content: 'Mold preventive maintenance (replacement of worn out parts, mold not used for a long period of time - slow / non moving, spare parts replacement, re-grain / sandblast), change in oven', initiator: 'Engineering', attach: ['P','P','P','X','P','X','X','X','X','P','X','X','X','X','X','X','X','X','X','X','X','P*'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Manny',                      content: 'Jig replacement from old to new',                                                                                                               initiator: 'PE / Production',             attach: ['P*','P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Manny / Merline',            content: 'Jig improvement from manual to automatic',                                                                                                      initiator: 'PE / Production',             attach: ['P*','P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'MACHINE',     noted: 'Merline',                    content: 'Program of robot and gun replacement',                                                                                                          initiator: 'Production',                  attach: ['P*','P*','P*','P*','P*','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*'], internal: 'P', external: '' },
  { cat: 'MACHINE',     noted: 'Merline',                    content: 'New jig, new silicon pads, new silk screen',                                                                                                    initiator: 'Production',                  attach: ['P*','P*','P*','P*','P*','P*','X','X','X','X','X','X','X','X','X','X','P*','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'METHOD',      noted: 'Manny / Merline',            content: 'Additional manufacturing process (sorting,reworking/sandblast, etching,workmanship criteria)',                                                  initiator: 'Production / PE',             attach: ['P*','P*','P*','X','X','X','P*','P*','X','X','P*','X','P','P','X','X','X','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Merline',                    content: 'Additional manufacturing process (annealing, etc.)',                                                                                            initiator: 'Production',                  attach: ['P*','P*','P*','P*','P*','X','X','X','X','X','P*','X','P','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Merline',                    content: 'Parameters not within approved tolerance',                                                                                                      initiator: 'Production',                  attach: ['P*','P*','P*','P*','P*','X','X','X','P*','X','X','X','X','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Merline',                    content: 'Change in Packaging standard (WIP), Cavity no.',                                                                                                initiator: 'Production',                  attach: ['X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Patrick',                    content: 'Change in Packaging standard based on Customer request',                                                                                        initiator: 'CS',                          attach: ['X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','P*','P*','X','X','X'], internal: '', external: 'P' },
  { cat: 'METHOD',      noted: 'Manny / Merline / Vangie',   content: 'Change in standards (WPS,PMIIS, OPIIS, IPIIS, etc.)  due to quality improvements',                                                             initiator: 'PE/PRODN/ QC/QA',             attach: ['X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Manny / Merline / Vangie',   content: 'Change in process sequence or flow for productivity and quality improvement',                                                                   initiator: 'PE/PRODN/ QC/QA',             attach: ['X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Manny / Merline / Patrick',  content: 'Change in process (e.g cycle time improvement / reduction, process improvement, shot weight, cooling system, etc.)',                            initiator: 'PE/PRODN/ Planning',          attach: ['P*','P*','P*','P*','P*','X','X','X','X','X','X','X','P','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'METHOD',      noted: 'Glenda',                     content: 'Change of supplier (localization of material)',                                                                                                 initiator: 'Purchasing',                  attach: ['P*','X','X','P*','P*','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'METHOD',      noted: 'Manny / Vangie',             content: 'Correction of standard to align with Customer standard / actual process',                                                                       initiator: 'PE/QC/QA',                    attach: ['X','X','X','X','X','X','X','X','X','X','X','X','P*','P*','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Manny',                      content: 'Change in drawing version due to dimension or appearance, material specs or customer upgrade - ECR',                                            initiator: 'Development',                 attach: ['X','X','X','P*','P*','X','X','X','X','X','X','P*','P*','P*','X','P*','X','P*','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'METHOD',      noted: 'Merline',                    content: 'use of silk screen to die plate - productivity and quality improvement',                                                                        initiator: 'Production',                  attach: ['P*','P*','P*','X','P*','P*','X','X','X','X','X','X','P','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'METHOD',      noted: 'Patrick / Merline',          content: 'change of machine from approved machine to alternative machine',                                                                                initiator: 'Planning/ Production',        attach: ['P*','P*','P*','X','P*','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'METHOD',      noted: 'Vangie',                     content: 'measuring devices with variance which are allowed to used',                                                                                     initiator: 'QA',                          attach: ['X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Manny',                      content: 'mold hardening',                                                                                                                               initiator: 'Engineering',                 attach: ['P','P','P','P','P','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Manny',                      content: 'use of spray (mold release) due to stuck / over packed',                                                                                       initiator: 'Engineering',                 attach: ['P*','P*','P*','X','X','X','X','X','X','X','X','X','P','X','X','X','X','X','X','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'METHOD',      noted: 'Manny',                      content: 'Change in inspection method from visual /dimension to jig or upgrading of jig',                                                                 initiator: 'PE /QA',                      attach: ['P*','P*','P*','X','X','X','X','X','X','X','X','X','P*','X','X','X','P*','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'METHOD',      noted: 'Manny',                      content: 'Change in process, additional 100% visual inspection for tooling near and/or exceeded on tooling life',                                         initiator: 'Engineering',                 attach: ['P*','P*','P*','X','P*','X','X','X','P*','X','X','X','P*','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'ENVIRONMENT', noted: 'Merline / Manny',            content: 'Change in chemicals',                                                                                                                           initiator: 'Production / PE',             attach: ['P*','P*','P*','X','X','X','X','X','X','X','X','X','P','X','P*','X','X','X','P*','X','X','X'], internal: 'P', external: 'P' },
  { cat: 'ENVIRONMENT', noted: 'Vangie / Merline',           content: 'Replacement of flourescent watts',                                                                                                             initiator: 'QA / Production',            attach: ['X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: '' },
  { cat: 'ENVIRONMENT', noted: 'Merline / Vangie',           content: 'Change in working lay out (new factory/building, relocation of manufacturing equipment, machines)',                                             initiator: 'Production/ QC /FBM',         attach: ['X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','P*','X','X','X'], internal: 'P', external: '' },
]

export const MATRIX_LEGEND = [
  { mark: 'P*', meaning: 'Attachment required PRIOR to submission of 4M request to QA' },
  { mark: 'P',  meaning: 'Attachment will be verified by QA based on requested due date' },
  { mark: 'X',  meaning: 'No need to attach the document' },
]

// ── Nav items (both dashboards share the same sidebar) ────────────
export const NAV_ITEMS = [
  { id: 'dashboard',        label: 'Dashboard'               },
  { id: 'matrix',           label: 'Matrix'                  },
  { id: 'request_form',     label: 'Request Form'            },
  { id: 'attach_approved',  label: 'Attach Approved Request' },
  { id: 'attach_denied',    label: 'Attach Denied Request'   },
  { id: 'final_approved',   label: 'Final Approved'          },
]