import { CheckCircle, Circle, Clock, Lock, Microscope, ShieldCheck, Crown, FileText, Upload, FolderOpen } from 'lucide-react';
import './CaseProgressTracker.css';

/* ─────────────────────────────────────────────────────────────
   The full pipeline a case travels through all three levels.
   Each stage belongs to a "level" which controls its colour block.
   status derivation:
     'done'    → step completed
     'active'  → current step (pulsing)
     'pending' → not reached yet
───────────────────────────────────────────────────────────────  */

const STAGES = [
  // ── INSPECTOR LEVEL ──────────────────────────────────────────
  {
    level: 'inspector',
    levelLabel: 'Inspector Level',
    levelColor: '#4f6af0',
    steps: [
      { key: 'fir_registered',  label: 'FIR Registered',       icon: <FolderOpen size={16} />,  desc: 'Case file created & assigned a unique FIR number' },
      { key: 'investigation',   label: 'Under Investigation',   icon: <ShieldCheck size={16} />, desc: 'Inspector actively investigating the case on ground' },
      { key: 'evidence_upload', label: 'Evidence Uploaded',     icon: <Upload size={16} />,      desc: 'Digital evidence collected & sealed in the vault' },
    ]
  },
  // ── FORENSIC LEVEL ───────────────────────────────────────────
  {
    level: 'forensic',
    levelLabel: 'Forensic Level',
    levelColor: '#4ade80',
    steps: [
      { key: 'forensic_analysis', label: 'Forensic Analysis',    icon: <Microscope size={16} />, desc: 'Forensic team examining uploaded evidence in lab' },
      { key: 'forensic_report',   label: 'Forensic Report Filed', icon: <FileText size={16} />,   desc: 'Officially signed forensic report submitted to system' },
    ]
  },
  // ── ADMIN LEVEL ──────────────────────────────────────────────
  {
    level: 'admin',
    levelLabel: 'Admin / Court Level',
    levelColor: '#e55454',
    steps: [
      { key: 'admin_review', label: 'Admin Review',  icon: <Crown size={16} />,       desc: 'Superintendent reviews full case file & forensic report' },
      { key: 'court_trial',  label: 'Court Trial',   icon: <ShieldCheck size={16} />, desc: 'Case & evidence presented in court proceedings' },
      { key: 'closed',       label: 'Case Closed',   icon: <Lock size={16} />,        desc: 'Case permanently sealed — verdict recorded' },
    ]
  },
];

/* Map case status → which keys are "done" */
const STATUS_MAP = {
  'Open':                ['fir_registered'],
  'Under Investigation': ['fir_registered', 'investigation'],
  'Active Search':       ['fir_registered', 'investigation'],
  'Evidence Uploaded':   ['fir_registered', 'investigation', 'evidence_upload'],
  'Forensic Analysis':   ['fir_registered', 'investigation', 'evidence_upload', 'forensic_analysis'],
  'Forensic Report':     ['fir_registered', 'investigation', 'evidence_upload', 'forensic_analysis', 'forensic_report'],
  'Court Trial':         ['fir_registered', 'investigation', 'evidence_upload', 'forensic_analysis', 'forensic_report', 'admin_review', 'court_trial'],
  'Closed':              ['fir_registered', 'investigation', 'evidence_upload', 'forensic_analysis', 'forensic_report', 'admin_review', 'court_trial', 'closed'],
};

/* Derive which keys are done given a caseStatus + evidenceCount + hasForensicReport */
const getCompletedKeys = (caseStatus, evidenceCount = 0, hasForensicReport = false) => {
  let done = STATUS_MAP[caseStatus] || ['fir_registered'];

  // Auto-promote using real data
  if (evidenceCount > 0 && !done.includes('evidence_upload')) {
    done = [...done, 'evidence_upload'];
  }
  if (hasForensicReport && !done.includes('forensic_report')) {
    done = [...done, 'forensic_analysis', 'forensic_report'];
  }
  return done;
};

const getStepStatus = (key, done) => {
  if (done.includes(key)) return 'done';
  const allKeys = STAGES.flatMap(l => l.steps.map(s => s.key));
  const nextPending = allKeys.find(k => !done.includes(k));
  if (nextPending === key) return 'active';
  return 'pending';
};

/* ── Main Component ──────────────────────────────────────────── */
const CaseProgressTracker = ({ caseData, evidenceCount = 0, hasForensicReport = false, compact = false }) => {
  if (!caseData) return null;

  const done = getCompletedKeys(caseData.status, evidenceCount, hasForensicReport);
  const totalSteps = STAGES.reduce((a, l) => a + l.steps.length, 0);
  const pct = Math.round((done.length / totalSteps) * 100);

  return (
    <div className="cpt-wrapper">
      {/* Header */}
      <div className="cpt-header">
        <div>
          <div className="cpt-title">Case Progress Tracker</div>
          <div className="cpt-subtitle">FIR {caseData.firNumber} — {caseData.title}</div>
        </div>
        <div className="cpt-pct-badge">
          <svg viewBox="0 0 36 36" className="cpt-circle">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={pct === 100 ? '#4ade80' : '#4f6af0'}
              strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset="25"
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <span className="cpt-pct-text">{pct}%</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="cpt-levels">
        {STAGES.map((level, li) => (
          <div key={level.level} className="cpt-level">
            {/* Level header badge */}
            <div className="cpt-level-label" style={{ borderColor: level.levelColor, color: level.levelColor, background: `${level.levelColor}18` }}>
              {level.levelLabel}
            </div>

            {/* Steps */}
            <div className={`cpt-steps ${compact ? 'compact' : ''}`}>
              {level.steps.map((step, si) => {
                const status = getStepStatus(step.key, done);
                const isLast = si === level.steps.length - 1;

                return (
                  <div key={step.key} className={`cpt-step ${status}`}>
                    {/* Connector line */}
                    {!isLast && <div className={`cpt-connector ${status === 'done' ? 'done' : ''}`} style={{ borderColor: status === 'done' ? level.levelColor : undefined }} />}

                    {/* Icon circle */}
                    <div
                      className="cpt-icon"
                      style={
                        status === 'done'    ? { background: `${level.levelColor}25`, borderColor: level.levelColor, color: level.levelColor } :
                        status === 'active'  ? { background: 'rgba(79,106,240,0.15)', borderColor: '#4f6af0', color: '#4f6af0' } :
                        {}
                      }
                    >
                      {status === 'done'   ? <CheckCircle size={14} style={{ color: level.levelColor }} /> :
                       status === 'active' ? <Clock size={14} className="cpt-spin" /> :
                                             <Circle size={14} />}
                    </div>

                    {/* Text */}
                    <div className="cpt-step-text">
                      <div className={`cpt-step-label ${status}`}>{step.label}</div>
                      {!compact && <div className="cpt-step-desc">{step.desc}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Arrow between levels */}
            {li < STAGES.length - 1 && (
              <div className="cpt-level-arrow">▼ passed to next division</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseProgressTracker;
