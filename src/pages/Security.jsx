import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield, FiAlertTriangle, FiActivity, FiLock, FiUnlock, FiKey,
  FiUsers, FiGlobe, FiCheck, FiCheckCircle, FiX, FiXCircle, FiRefreshCw,
  FiDownload, FiEye, FiChevronRight, FiServer, FiWifi, FiMapPin, FiClock,
  FiTrendingUp, FiTrendingDown, FiZap, FiDatabase, FiAlertCircle, FiInfo,
  FiSearch, FiSlash,
} from "react-icons/fi";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:         "#0a0d14",
  surface:    "#111520",
  surfaceAlt: "#161c2d",
  surfaceHov: "#1c2338",
  border:     "rgba(99,115,177,0.18)",
  borderHov:  "rgba(99,115,177,0.38)",
  accent:     "#4f6ef7",
  accentDim:  "rgba(79,110,247,0.15)",
  accentGlow: "rgba(79,110,247,0.35)",
  emerald:    "#10d48e",
  rose:       "#f04f6e",
  amber:      "#f5a623",
  violet:     "#9b6ef7",
  cyan:       "#22d3ee",
  textPri:    "#e8ecf8",
  textSec:    "#7b87b8",
  textMut:    "#4a5478",
};

const card = (extra = {}) => ({
  background: `linear-gradient(135deg, ${T.surfaceAlt} 0%, ${T.surface} 100%)`,
  border: `1px solid ${T.border}`,
  borderRadius: 16,
  ...extra,
});

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay },
});

// ─── Mock data ─────────────────────────────────────────────────────────────────
let _id = 1;
const mkId = () => _id++;

const INITIAL_ALERTS = [
  {
    id: mkId(), severity: "critical", icon: FiAlertTriangle, color: T.rose,
    title: "Brute-force attack detected",
    detail: "203 failed login attempts from IP 203.0.113.42 against Prod Credentials vault in the last 10 minutes.",
    ip: "203.0.113.42", location: "Minsk, BY", time: "2 min ago",
  },
  {
    id: mkId(), severity: "high", icon: FiKey, color: T.amber,
    title: "Privileged key accessed outside business hours",
    detail: "HMAC signing key was read by service account svc-billing at 02:14 local time — outside its normal access window.",
    ip: "10.20.4.12", location: "us-east-1", time: "41 min ago",
  },
  {
    id: mkId(), severity: "high", icon: FiUnlock, color: T.amber,
    title: "New device login without MFA challenge",
    detail: "User priya.nair@securevault.io signed in from an unrecognized device; MFA step-up was bypassed via legacy session token.",
    ip: "88.212.4.9", location: "Mumbai, IN", time: "1 hr ago",
  },
  {
    id: mkId(), severity: "medium", icon: FiGlobe, color: T.cyan,
    title: "Access from new geolocation",
    detail: "Admin User authenticated from a country not seen in the last 90 days. Risk-based step-up was triggered and passed.",
    ip: "41.77.18.3", location: "Lagos, NG", time: "3 hr ago",
  },
  {
    id: mkId(), severity: "medium", icon: FiServer, color: T.cyan,
    title: "Anomalous API rate from integration token",
    detail: "Token int_splunk_01 issued 4.2x its typical request volume in a 5-minute window. Auto-throttling applied.",
    ip: "10.20.6.40", location: "us-east-1", time: "5 hr ago",
  },
];

const AUDIT_LOG = [
  { id: 1, actor: "admin@securevault.io", action: "Revoked API key", resource: "key_8f3a...c102", ip: "10.20.4.2", time: "12 min ago", status: "success" },
  { id: 2, actor: "system", action: "Auto-blocked IP", resource: "203.0.113.42", ip: "—", time: "14 min ago", status: "success" },
  { id: 3, actor: "j.martins@securevault.io", action: "Failed login", resource: "Console", ip: "203.0.113.42", time: "16 min ago", status: "failed" },
  { id: 4, actor: "svc-billing", action: "Read signing key", resource: "HMAC-prod-01", ip: "10.20.4.12", time: "41 min ago", status: "warning" },
  { id: 5, actor: "priya.nair@securevault.io", action: "Signed in (new device)", resource: "Console", ip: "88.212.4.9", time: "1 hr ago", status: "warning" },
  { id: 6, actor: "admin@securevault.io", action: "Updated IP allowlist", resource: "Org policy", ip: "10.20.4.2", time: "2 hr ago", status: "success" },
  { id: 7, actor: "int_splunk_01", action: "Rate limit triggered", resource: "API gateway", ip: "10.20.6.40", time: "5 hr ago", status: "warning" },
  { id: 8, actor: "admin@securevault.io", action: "Rotated encryption key", resource: "vault_prod_creds", ip: "10.20.4.2", time: "8 hr ago", status: "success" },
];

const COMPLIANCE_CHECKS = [
  { label: "MFA enforced org-wide", pass: true },
  { label: "Password policy meets NIST 800-63B", pass: true },
  { label: "Encryption at rest (AES-256)", pass: true },
  { label: "Automated key rotation enabled", pass: true },
  { label: "IP allowlist configured", pass: false },
  { label: "Audit log retention ≥ 1 year", pass: true },
  { label: "SSO enforced for all admins", pass: false },
];

const VAULT_RISK = [
  { name: "Prod Credentials", risk: "high", reason: "Active brute-force attempts" },
  { name: "Customer PII Store", risk: "medium", reason: "2 keys overdue for rotation" },
  { name: "Billing Secrets", risk: "medium", reason: "Off-hours access pattern" },
  { name: "Internal Tools", risk: "low", reason: "No anomalies detected" },
];

const riskColor = { high: T.rose, medium: T.amber, low: T.emerald };
const sevColor = { critical: T.rose, high: T.amber, medium: T.cyan, low: T.textSec };

// ─── Small components ──────────────────────────────────────────────────────────
function Toggle({ value, onChange, color = T.accent }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      whileTap={{ scale: 0.93 }}
      style={{
        width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
        background: value ? color : T.surfaceAlt, position: "relative", flexShrink: 0,
        boxShadow: value ? `0 0 12px ${color}60` : "none",
        transition: "background 0.2s, box-shadow 0.2s",
      }}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        style={{
          position: "absolute", top: 2, width: 18, height: 18, borderRadius: "50%",
          background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </motion.button>
  );
}

function ScoreRing({ score, size = 88, stroke = 9 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 85 ? T.emerald : score >= 60 ? T.amber : T.rose;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.surface} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${pct * c} ${c}`}
        initial={{ strokeDasharray: `0 ${c}` }}
        animate={{ strokeDasharray: `${pct * c} ${c}` }}
        transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
      <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fontSize="20" fontWeight="800" fill={T.textPri}>
        {score}
      </text>
    </svg>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function Security() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [ssoOnly, setSsoOnly] = useState(false);
  const [ipAllowlist, setIpAllowlist] = useState(false);
  const [anomalyDetection, setAnomalyDetection] = useState(true);

  const counts = useMemo(() => ({
    critical: alerts.filter(a => a.severity === "critical").length,
    high: alerts.filter(a => a.severity === "high").length,
  }), [alerts]);

  const failedLogins24h = 47;
  const mfaCoverage = 92;
  const securityScore = 87;

  const resolveAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  const runScan = () => {
    setScanning(true);
    setScanDone(false);
    setTimeout(() => {
      setScanning(false);
      setScanDone(true);
      setTimeout(() => setScanDone(false), 2500);
    }, 1800);
  };

  const stats = [
    { label: "Security score", val: securityScore, icon: FiShield, color: T.accent, suffix: "/100",
      sub: "+3 vs last week" },
    { label: "Active threats", val: counts.critical + counts.high, icon: FiAlertTriangle, color: T.rose,
      sub: `${counts.critical} critical · ${counts.high} high` },
    { label: "MFA coverage", val: `${mfaCoverage}%`, icon: FiLock, color: T.emerald,
      sub: "4 users not enrolled" },
    { label: "Failed logins (24h)", val: failedLogins24h, icon: FiUnlock, color: T.amber,
      sub: "↑ 12% vs yesterday" },
  ];

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <motion.div {...fadeUp(0)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: `linear-gradient(135deg, ${T.accent}30, ${T.violet}18)`,
            border: `1px solid ${T.accent}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FiShield size={18} color={T.accent} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: T.textPri }}>Security Center</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textSec }}>
              Real-time threat monitoring & access governance
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => {}} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 10, border: `1px solid ${T.border}`,
            background: T.surfaceAlt, color: T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            <FiDownload size={13} /> Export report
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={runScan} disabled={scanning} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 10, border: "none",
            background: scanDone ? T.emerald : T.accent, color: "#fff",
            fontSize: 12, fontWeight: 700, cursor: scanning ? "default" : "pointer",
            boxShadow: `0 4px 20px ${scanDone ? T.emerald : T.accent}40`,
          }}>
            {scanning
              ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}>
                  <FiRefreshCw size={13} />
                </motion.div>
              : scanDone ? <FiCheck size={13} /> : <FiZap size={13} />}
            {scanning ? "Scanning…" : scanDone ? "Scan complete" : "Run security scan"}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stat row ── */}
      <motion.div {...fadeUp(0.05)}
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06 }}
            whileHover={{ y: -2, borderColor: T.borderHov }}
            style={{ ...card({ padding: "16px 20px" }), display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `${s.color}18`, border: `1px solid ${s.color}28`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <s.icon size={15} color={s.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.textPri }}>
                {s.val}{s.suffix && <span style={{ fontSize: 13, color: T.textMut, fontWeight: 600 }}>{s.suffix}</span>}
              </div>
              <div style={{ fontSize: 11, color: T.textMut }}>{s.label}</div>
              <div style={{ fontSize: 10, color: T.textSec, marginTop: 2 }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ── Left column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Active alerts */}
          <motion.div {...fadeUp(0.1)} style={card({ padding: 24 })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.textPri }}>Active alerts</h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textSec }}>
                  {alerts.length} open · sorted by severity
                </p>
              </div>
              <FiSearch size={15} color={T.textMut} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <AnimatePresence>
                {alerts.length === 0 && (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                      padding: "32px 0", textAlign: "center", color: T.textMut,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    }}>
                    <FiCheckCircle size={24} color={T.emerald} />
                    <span style={{ fontSize: 13 }}>No active alerts. All clear.</span>
                  </motion.div>
                )}
                {alerts.map(a => (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, height: 0, marginBottom: -10 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: "flex", gap: 14, padding: "14px 16px", borderRadius: 12,
                      background: T.surface, border: `1px solid ${a.color}22`,
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: `${a.color}18`, border: `1px solid ${a.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <a.icon size={15} color={a.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.textPri }}>{a.title}</span>
                        <span style={{
                          padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800,
                          textTransform: "uppercase", letterSpacing: "0.04em",
                          background: `${sevColor[a.severity]}18`, color: sevColor[a.severity],
                          border: `1px solid ${sevColor[a.severity]}30`,
                        }}>{a.severity}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: T.textSec, lineHeight: 1.55 }}>{a.detail}</p>
                      <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: T.textMut, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FiWifi size={11} /> {a.ip}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FiMapPin size={11} /> {a.location}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FiClock size={11} /> {a.time}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => resolveAlert(a.id)} style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "6px 11px", borderRadius: 7, border: `1px solid ${T.emerald}30`,
                        background: `${T.emerald}10`, color: T.emerald, fontSize: 11, fontWeight: 700, cursor: "pointer",
                      }}>
                        <FiCheck size={11} /> Resolve
                      </button>
                      <button onClick={() => resolveAlert(a.id)} style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "6px 11px", borderRadius: 7, border: `1px solid ${T.border}`,
                        background: "transparent", color: T.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}>
                        <FiSlash size={11} /> Dismiss
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Audit log */}
          <motion.div {...fadeUp(0.15)} style={card({ padding: 24 })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.textPri }}>Security audit log</h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textSec }}>Most recent security-relevant events</p>
              </div>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 13px", borderRadius: 8, border: `1px solid ${T.border}`,
                background: "transparent", color: T.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>
                View full log <FiChevronRight size={11} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1.6fr 1.6fr 1.2fr 1fr 0.9fr 0.8fr", gap: 12,
                padding: "0 14px 10px", borderBottom: `1px solid ${T.border}`,
                fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                <span>Actor</span><span>Action</span><span>Resource</span><span>IP</span><span>Time</span><span>Status</span>
              </div>
              {AUDIT_LOG.map((row, i) => (
                <motion.div key={row.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 + i * 0.03 }}
                  style={{
                    display: "grid", gridTemplateColumns: "1.6fr 1.6fr 1.2fr 1fr 0.9fr 0.8fr", gap: 12,
                    padding: "11px 14px", borderBottom: i < AUDIT_LOG.length - 1 ? `1px solid ${T.border}` : "none",
                    fontSize: 12, alignItems: "center",
                  }}>
                  <span style={{ color: T.textPri, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.actor}</span>
                  <span style={{ color: T.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.action}</span>
                  <span style={{ color: T.textMut, fontFamily: "ui-monospace, monospace", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.resource}</span>
                  <span style={{ color: T.textMut, fontSize: 11 }}>{row.ip}</span>
                  <span style={{ color: T.textMut, fontSize: 11 }}>{row.time}</span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
                    color: row.status === "success" ? T.emerald : row.status === "warning" ? T.amber : T.rose,
                  }}>
                    {row.status === "success" ? <FiCheckCircle size={11} /> : row.status === "warning" ? <FiAlertCircle size={11} /> : <FiXCircle size={11} />}
                    {row.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Score ring panel */}
          <motion.div {...fadeUp(0.1)} style={{
            ...card({ padding: "22px 24px" }),
            background: `linear-gradient(135deg, ${T.accent}10, ${T.violet}08)`,
            border: `1px solid ${T.accent}25`,
            display: "flex", alignItems: "center", gap: 18,
          }}>
            <ScoreRing score={securityScore} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPri }}>Overall posture</div>
              <div style={{ fontSize: 11, color: T.textSec, marginTop: 3, lineHeight: 1.5 }}>
                Enable IP allowlist and SSO enforcement to reach 95+
              </div>
            </div>
          </motion.div>

          {/* Access control */}
          <motion.div {...fadeUp(0.15)} style={card({ padding: 22 })}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.textPri }}>Access control</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Enforce MFA org-wide", val: mfaEnforced, set: setMfaEnforced, icon: FiLock },
                { label: "SSO-only sign-in", val: ssoOnly, set: setSsoOnly, icon: FiUsers },
                { label: "IP allowlist", val: ipAllowlist, set: setIpAllowlist, icon: FiGlobe },
                { label: "Anomaly detection", val: anomalyDetection, set: setAnomalyDetection, icon: FiActivity },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <item.icon size={14} color={T.textMut} />
                  <span style={{ flex: 1, fontSize: 12.5, color: T.textPri, fontWeight: 500 }}>{item.label}</span>
                  <Toggle value={item.val} onChange={item.set} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Compliance checklist */}
          <motion.div {...fadeUp(0.2)} style={card({ padding: 22 })}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.textPri }}>Policy checklist</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {COMPLIANCE_CHECKS.map(c => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {c.pass
                    ? <FiCheckCircle size={14} color={T.emerald} style={{ flexShrink: 0 }} />
                    : <FiXCircle size={14} color={T.rose} style={{ flexShrink: 0 }} />}
                  <span style={{ fontSize: 12.5, color: c.pass ? T.textSec : T.textPri, fontWeight: c.pass ? 500 : 600 }}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Risk by vault */}
          <motion.div {...fadeUp(0.25)} style={card({ padding: 22 })}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.textPri }}>Risk by vault</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {VAULT_RISK.map(v => (
                <div key={v.name} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`,
                }}>
                  <FiDatabase size={13} color={T.textMut} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
                    <div style={{ fontSize: 10.5, color: T.textMut, marginTop: 1 }}>{v.reason}</div>
                  </div>
                  <span style={{
                    padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 800,
                    textTransform: "uppercase", flexShrink: 0,
                    background: `${riskColor[v.risk]}18`, color: riskColor[v.risk],
                    border: `1px solid ${riskColor[v.risk]}30`,
                  }}>{v.risk}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
