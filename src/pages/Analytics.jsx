import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiActivity, FiShield, FiKey, FiUsers, FiTrendingUp, FiTrendingDown,
  FiDownload, FiRefreshCw, FiCalendar, FiFilter, FiAlertTriangle,
  FiCheckCircle, FiClock, FiGlobe, FiLock, FiEye, FiZap,
  FiBarChart2, FiPieChart, FiMap, FiMaximize2, FiInfo
} from "react-icons/fi";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:        "#0a0d14",
  surface:   "#111520",
  surfaceAlt:"#161c2d",
  border:    "rgba(99,115,177,0.18)",
  borderHov: "rgba(99,115,177,0.38)",
  accent:    "#4f6ef7",
  accentDim: "rgba(79,110,247,0.15)",
  accentGlow:"rgba(79,110,247,0.35)",
  emerald:   "#10d48e",
  rose:      "#f04f6e",
  amber:     "#f5a623",
  violet:    "#9b6ef7",
  cyan:      "#22d3ee",
  textPri:   "#e8ecf8",
  textSec:   "#7b87b8",
  textMut:   "#4a5478",
};

const glassCard = (extra = "") => ({
  background: `linear-gradient(135deg, ${T.surfaceAlt} 0%, ${T.surface} 100%)`,
  border: `1px solid ${T.border}`,
  borderRadius: 16,
  backdropFilter: "blur(12px)",
  ...parseExtra(extra),
});

function parseExtra(str) {
  if (!str) return {};
  const map = {};
  str.split(";").forEach(s => {
    const [k, v] = s.split(":").map(x => x.trim());
    if (k && v) map[k] = v;
  });
  return map;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const RANGES = ["24H", "7D", "30D", "90D"];

function genSeries(pts, base, volatility, trend = 0) {
  return Array.from({ length: pts }, (_, i) => ({
    i,
    v: Math.max(0, base + trend * i + (Math.random() - 0.5) * volatility),
  }));
}

const DATA = {
  "24H": {
    accessVol:    genSeries(24, 340, 120, 2),
    threats:      genSeries(24, 8,   12,  0),
    keyOps:       genSeries(24, 90,  40,  1),
    userSessions: genSeries(24, 55,  25, -0.5),
  },
  "7D": {
    accessVol:    genSeries(7,  2800, 600,  80),
    threats:      genSeries(7,  44,   30,   2),
    keyOps:       genSeries(7,  620,  200,  10),
    userSessions: genSeries(7,  380,  100, -5),
  },
  "30D": {
    accessVol:    genSeries(30, 11200, 2400, 120),
    threats:      genSeries(30, 180,  100,   3),
    keyOps:       genSeries(30, 2500,  800,  40),
    userSessions: genSeries(30, 1520,  400, -8),
  },
  "90D": {
    accessVol:    genSeries(90, 33000, 7200,  200),
    threats:      genSeries(90, 540,   300,    5),
    keyOps:       genSeries(90, 7500,  2400,  60),
    userSessions: genSeries(90, 4560,  1200, -12),
  },
};

const THREAT_TYPES = [
  { label: "Brute Force",      count: 47, pct: 38, color: T.rose },
  { label: "Credential Leak",  count: 29, pct: 23, color: T.amber },
  { label: "Anomalous Access", count: 24, pct: 19, color: T.violet },
  { label: "Replay Attack",    count: 16, pct: 13, color: T.cyan },
  { label: "Enumeration",      count:  8, pct:  6, color: T.textSec },
];

const VAULT_PERF = [
  { name: "Prod Credentials", reads: 8420, writes: 1240, latency: 12,  health: 98 },
  { name: "TLS Certificates", reads: 3310, writes:  420, latency: 8,   health: 100 },
  { name: "API Key Store",     reads: 6180, writes:  980, latency: 18,  health: 94 },
  { name: "Config Secrets",   reads: 2240, writes:  670, latency: 14,  health: 97 },
  { name: "Data Archive",     reads:  880, writes: 1890, latency: 42,  health: 88 },
];

const REGION_DATA = [
  { region: "us-east-1",  lat: 39,   lon: -75,  ops: 14200, threats: 12, status: "healthy" },
  { region: "eu-west-1",  lat: 53,   lon: -6,   ops: 9800,  threats: 4,  status: "healthy" },
  { region: "ap-south-1", lat: 19,   lon: 73,   ops: 6100,  threats: 8,  status: "warning" },
  { region: "us-west-2",  lat: 46,   lon: -120, ops: 7300,  threats: 2,  status: "healthy" },
  { region: "sa-east-1",  lat: -23,  lon: -46,  ops: 2400,  threats: 1,  status: "healthy" },
];

const KEY_AGE = [
  { bucket: "<30d",   count: 48, pct: 38, color: T.emerald },
  { bucket: "30–90d", count: 37, pct: 29, color: T.cyan },
  { bucket: "90–180d",count: 24, pct: 19, color: T.amber },
  { bucket: ">180d",  count: 17, pct: 14, color: T.rose },
];

const COMPLIANCE = [
  { framework: "SOC 2 Type II", score: 98, delta: +2 },
  { framework: "ISO 27001",     score: 95, delta: +1 },
  { framework: "GDPR",         score: 97, delta:  0 },
  { framework: "HIPAA",        score: 92, delta: -1 },
  { framework: "PCI DSS",      score: 89, delta: +3 },
];

// ─── CSV Export ───────────────────────────────────────────────────────────────
function buildCSV(range, series) {
  const rows = [];
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;

  // Section 1: Metric Trends
  rows.push(["METRIC TRENDS", `Range: ${range}`]);
  rows.push(["Period Index", "Access Volume", "Threat Events", "Key Operations", "User Sessions"]);
  const len = series.accessVol.length;
  for (let i = 0; i < len; i++) {
    rows.push([
      i,
      series.accessVol[i].v.toFixed(2),
      series.threats[i].v.toFixed(2),
      series.keyOps[i].v.toFixed(2),
      series.userSessions[i].v.toFixed(2),
    ]);
  }
  rows.push([
    "TOTAL",
    series.accessVol.reduce((s, d) => s + d.v, 0).toFixed(2),
    series.threats.reduce((s, d) => s + d.v, 0).toFixed(2),
    series.keyOps.reduce((s, d) => s + d.v, 0).toFixed(2),
    series.userSessions.reduce((s, d) => s + d.v, 0).toFixed(2),
  ]);

  rows.push([]);

  // Section 2: Threat Breakdown
  rows.push(["THREAT BREAKDOWN"]);
  rows.push(["Attack Vector", "Count", "Percentage (%)"]);
  THREAT_TYPES.forEach(t => rows.push([t.label, t.count, t.pct]));

  rows.push([]);

  // Section 3: Vault Performance
  rows.push(["VAULT PERFORMANCE"]);
  rows.push(["Vault", "Reads", "Writes", "Avg Latency (ms)", "Health (%)", "Status"]);
  VAULT_PERF.forEach(v => rows.push([
    v.name, v.reads, v.writes, v.latency, v.health,
    v.health > 95 ? "Optimal" : "Degraded",
  ]));

  rows.push([]);

  // Section 4: Key Age Distribution
  rows.push(["KEY AGE DISTRIBUTION"]);
  rows.push(["Age Bucket", "Count", "Percentage (%)"]);
  KEY_AGE.forEach(k => rows.push([k.bucket, k.count, k.pct]));

  rows.push([]);

  // Section 5: Compliance Posture
  rows.push(["COMPLIANCE POSTURE"]);
  rows.push(["Framework", "Score (%)", "Delta"]);
  COMPLIANCE.forEach(c => rows.push([
    c.framework, c.score,
    c.delta > 0 ? `+${c.delta}` : c.delta === 0 ? "—" : c.delta,
  ]));

  rows.push([]);

  // Section 6: Regional Distribution
  rows.push(["REGIONAL DISTRIBUTION"]);
  rows.push(["Region", "Operations", "Threats", "Status"]);
  REGION_DATA.forEach(r => rows.push([r.region, r.ops, r.threats, r.status]));

  return rows.map(row => row.map(cell => esc(cell)).join(",")).join("\r\n");
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Tiny SVG Sparkline ───────────────────────────────────────────────────────
function Sparkline({ data, color, height = 48, filled = false }) {
  const vals = data.map(d => d.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const w = 200, h = height;
  const points = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 0.001)) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  const fillD = `${pathD} L ${w},${h} L 0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }}>
      {filled && (
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
      )}
      {filled && <path d={fillD} fill={`url(#sg-${color})`} />}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── SVG Area Chart (main) ────────────────────────────────────────────────────
function AreaChart({ series, color, height = 180 }) {
  const vals = series.map(d => d.v);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);
  const W = 800, H = height;
  const pad = { t: 8, r: 8, b: 24, l: 40 };
  const iW  = W - pad.l - pad.r;
  const iH  = H - pad.t - pad.b;

  const pt = (v, i) => {
    const x = pad.l + (i / (vals.length - 1)) * iW;
    const y = pad.t + iH - ((v - min) / (max - min + 1)) * iH;
    return [x, y];
  };

  const points = vals.map((v, i) => pt(v, i));
  const linePath = "M " + points.map(([x, y]) => `${x} ${y}`).join(" L ");
  const fillPath = linePath + ` L ${points[points.length - 1][0]} ${pad.t + iH} L ${points[0][0]} ${pad.t + iH} Z`;

  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    v: Math.round(min + f * (max - min)),
    y: pad.t + iH - f * iH,
  }));

  const ticks = vals.length <= 8
    ? vals.map((_, i) => i)
    : [0, Math.floor(vals.length * 0.25), Math.floor(vals.length * 0.5), Math.floor(vals.length * 0.75), vals.length - 1];

  const uid = color.replace(/[^a-z0-9]/gi, "");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height }}>
      <defs>
        <linearGradient id={`ag-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {yLabels.map(({ y }, i) => (
        <line key={i} x1={pad.l} y1={y} x2={W - pad.r} y2={y}
          stroke={T.border} strokeWidth="1" strokeDasharray="4 4" />
      ))}
      {yLabels.map(({ v, y }, i) => (
        <text key={i} x={pad.l - 6} y={y + 4} textAnchor="end"
          fontSize="11" fill={T.textMut}>{v > 999 ? `${(v/1000).toFixed(1)}k` : v}</text>
      ))}
      {ticks.map(i => (
        <text key={i} x={pad.l + (i / (vals.length - 1)) * iW} y={H - 4}
          textAnchor="middle" fontSize="11" fill={T.textMut}>{i}</text>
      ))}
      <path d={fillPath} fill={`url(#ag-${uid})`} />
      <motion.path
        d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {points.length > 0 && (
        <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]}
          r="4" fill={color} />
      )}
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, delta, color, spark }) {
  const up = delta >= 0;
  return (
    <motion.div
      style={{ ...glassCard(), padding: 20, position: "relative", overflow: "hidden" }}
      whileHover={{ y: -3, borderColor: T.borderHov }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 100, height: 100, borderRadius: "50%",
        background: color, opacity: 0.08, filter: "blur(28px)", pointerEvents: "none",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${color}33, ${color}11)`,
            border: `1px solid ${color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={15} color={color} />
          </div>
          <span style={{ color: T.textSec, fontSize: 12, fontWeight: 500, letterSpacing: "0.04em" }}>
            {label}
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          color: up ? T.emerald : T.rose, fontSize: 12, fontWeight: 600,
        }}>
          {up ? <FiTrendingUp size={13} /> : <FiTrendingDown size={13} />}
          {up ? "+" : ""}{delta}%
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: T.textPri, marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ height: 40 }}>
        <Sparkline data={spark} color={color} height={40} filled />
      </div>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Icon size={15} color={T.accent} />
          <span style={{ color: T.textSec, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            {title}
          </span>
        </div>
        {subtitle && <p style={{ color: T.textMut, fontSize: 12, margin: 0 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Tab Pill ─────────────────────────────────────────────────────────────────
function TabPill({ tabs, active, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 4, background: T.surface,
      border: `1px solid ${T.border}`, borderRadius: 10, padding: 4,
    }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
          fontSize: 12, fontWeight: 600, transition: "all 0.18s",
          background: active === t ? T.accent : "transparent",
          color: active === t ? "#fff" : T.textSec,
        }}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Donut Chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ segments, size = 140, thickness = 28 }) {
  const r = size / 2 - thickness / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const cx = size / 2, cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const gap  = circ - dash;
        const el = (
          <motion.circle key={i}
            cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: "easeOut" }}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
export default function Analytics() {
  const [range, setRange]         = useState("7D");
  const [metricTab, setMetricTab] = useState("accessVol");
  const [exporting, setExporting] = useState(false);

  const series = DATA[range];

  const metricConfig = {
    accessVol:    { label: "Access Volume",   color: T.accent  },
    threats:      { label: "Threat Events",   color: T.rose    },
    keyOps:       { label: "Key Operations",  color: T.emerald },
    userSessions: { label: "User Sessions",   color: T.violet  },
  };

  const totalOps = useMemo(() =>
    series.accessVol.reduce((s, d) => s + d.v, 0), [series]);

  function handleExport() {
    setExporting(true);
    setTimeout(() => {
      const today = new Date().toISOString().slice(0, 10);
      const csv = buildCSV(range, series);
      downloadCSV(csv, `analytics_${range}_${today}.csv`);
      setExporting(false);
    }, 800);
  }

  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Page Header ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.textPri }}>Analytics</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSec }}>
            Security telemetry · vault performance · compliance posture
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <TabPill tabs={RANGES} active={range} onChange={setRange} />
          <motion.button
            onClick={handleExport}
            whileTap={{ scale: 0.96 }}
            disabled={exporting}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 10, border: `1px solid ${T.border}`,
              background: T.surfaceAlt, color: T.textSec, fontSize: 13,
              fontWeight: 600, cursor: exporting ? "not-allowed" : "pointer",
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting
              ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}><FiRefreshCw size={14} /></motion.div>
              : <FiDownload size={14} />}
            {exporting ? "Exporting…" : "Export CSV"}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.06 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon={FiActivity}  label="ACCESS EVENTS"   value={totalOps > 9999 ? `${(totalOps/1000).toFixed(1)}k` : totalOps.toFixed(0)} delta={+12} color={T.accent}  spark={series.accessVol} />
        <StatCard icon={FiShield}    label="THREAT EVENTS"   value={series.threats.reduce((s,d)=>s+d.v,0).toFixed(0)} delta={-8}  color={T.rose}    spark={series.threats} />
        <StatCard icon={FiKey}       label="KEY OPERATIONS"  value={`${(series.keyOps.reduce((s,d)=>s+d.v,0)/1000).toFixed(1)}k`} delta={+5} color={T.emerald} spark={series.keyOps} />
        <StatCard icon={FiUsers}     label="USER SESSIONS"   value={series.userSessions.reduce((s,d)=>s+d.v,0).toFixed(0)} delta={-3} color={T.violet}  spark={series.userSessions} />
      </motion.div>

      {/* ── Main Chart ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }}
        style={{ ...glassCard(), padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <SectionHeader icon={FiBarChart2} title="Metric Trend"
            subtitle={`${metricConfig[metricTab].label} over ${range}`} />
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(metricConfig).map(([k, cfg]) => (
              <button key={k} onClick={() => setMetricTab(k)} style={{
                padding: "5px 13px", borderRadius: 8, border: `1px solid`,
                borderColor: metricTab === k ? cfg.color : T.border,
                background: metricTab === k ? `${cfg.color}22` : "transparent",
                color: metricTab === k ? cfg.color : T.textSec,
                fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.16s",
              }}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={metricTab + range}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
            <AreaChart series={series[metricTab]} color={metricConfig[metricTab].color} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Middle Row: Threat Breakdown + Key Age ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.14 }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Threat Breakdown */}
        <div style={{ ...glassCard(), padding: 24 }}>
          <SectionHeader icon={FiAlertTriangle} title="Threat Breakdown"
            subtitle="By attack vector this period" />
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ flexShrink: 0, position: "relative" }}>
              <DonutChart segments={THREAT_TYPES} size={140} thickness={26} />
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: T.textPri }}>
                  {THREAT_TYPES.reduce((s,t)=>s+t.count,0)}
                </span>
                <span style={{ fontSize: 10, color: T.textMut }}>total</span>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {THREAT_TYPES.map((t, i) => (
                <motion.div key={t.label}
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.08 }}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: T.textSec, flex: 1 }}>{t.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.textPri }}>{t.count}</span>
                  <div style={{ width: 60, height: 4, borderRadius: 3, background: T.surfaceAlt, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${t.pct}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.08 }}
                      style={{ height: "100%", borderRadius: 3, background: t.color }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: T.textMut, width: 28, textAlign: "right" }}>{t.pct}%</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Age Distribution */}
        <div style={{ ...glassCard(), padding: 24 }}>
          <SectionHeader icon={FiKey} title="Key Age Distribution"
            subtitle="Rotation health across all vaults" />
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ flexShrink: 0, position: "relative" }}>
              <DonutChart segments={KEY_AGE} size={140} thickness={26} />
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: T.textPri }}>126</span>
                <span style={{ fontSize: 10, color: T.textMut }}>keys</span>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {KEY_AGE.map((k, i) => (
                <motion.div key={k.bucket}
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.08 }}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: k.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: T.textSec, flex: 1 }}>{k.bucket}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.textPri }}>{k.count}</span>
                  <div style={{ width: 60, height: 4, borderRadius: 3, background: T.surfaceAlt, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${k.pct}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.08 }}
                      style={{ height: "100%", borderRadius: 3, background: k.color }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: T.textMut, width: 28, textAlign: "right" }}>{k.pct}%</span>
                </motion.div>
              ))}
              {KEY_AGE.find(k => k.bucket === ">180d") && (
                <div style={{
                  marginTop: 8, padding: "7px 12px", borderRadius: 8,
                  background: `${T.rose}14`, border: `1px solid ${T.rose}30`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <FiAlertTriangle size={12} color={T.rose} />
                  <span style={{ fontSize: 11, color: T.rose }}>17 keys overdue for rotation</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Vault Performance Table ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.18 }}
        style={{ ...glassCard(), padding: 24, marginBottom: 24 }}>
        <SectionHeader icon={FiZap} title="Vault Performance"
          subtitle="Read / write throughput and latency per vault" />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Vault", "Reads", "Writes", "Avg Latency", "Health", "Status"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left",
                    fontSize: 11, color: T.textMut, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.07em",
                    borderBottom: `1px solid ${T.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VAULT_PERF.map((v, i) => (
                <motion.tr key={v.name}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.07 }}
                  style={{ borderBottom: `1px solid ${T.border}22` }}>
                  <td style={{ padding: "12px 12px", color: T.textPri, fontSize: 13, fontWeight: 600 }}>
                    {v.name}
                  </td>
                  <td style={{ padding: "12px 12px", color: T.textSec, fontSize: 13 }}>
                    {v.reads.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 12px", color: T.textSec, fontSize: 13 }}>
                    {v.writes.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{
                      color: v.latency > 30 ? T.rose : v.latency > 15 ? T.amber : T.emerald,
                      fontSize: 13, fontWeight: 700,
                    }}>{v.latency}ms</span>
                  </td>
                  <td style={{ padding: "12px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: T.surfaceAlt, overflow: "hidden", minWidth: 80 }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${v.health}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                          style={{
                            height: "100%", borderRadius: 3,
                            background: v.health > 95 ? T.emerald : v.health > 90 ? T.amber : T.rose,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 12, color: T.textSec, minWidth: 32 }}>{v.health}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: v.health > 95 ? `${T.emerald}18` : `${T.amber}18`,
                      color: v.health > 95 ? T.emerald : T.amber,
                      border: `1px solid ${v.health > 95 ? T.emerald : T.amber}30`,
                    }}>
                      {v.health > 95 ? "Optimal" : "Degraded"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Bottom Row: Compliance + Regional ── */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.22 }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Compliance Scores */}
        <div style={{ ...glassCard(), padding: 24 }}>
          <SectionHeader icon={FiCheckCircle} title="Compliance Posture"
            subtitle="Framework scores this period" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {COMPLIANCE.map((c, i) => (
              <motion.div key={c.framework}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 + i * 0.07 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: T.textPri, fontWeight: 500 }}>{c.framework}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: c.delta > 0 ? T.emerald : c.delta < 0 ? T.rose : T.textMut,
                    }}>
                      {c.delta > 0 ? `+${c.delta}` : c.delta < 0 ? c.delta : "—"}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.textPri }}>{c.score}%</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: T.surfaceAlt, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${c.score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.07, ease: "easeOut" }}
                    style={{
                      height: "100%", borderRadius: 4,
                      background: c.score >= 95
                        ? `linear-gradient(90deg, ${T.emerald}, ${T.cyan})`
                        : c.score >= 90
                          ? `linear-gradient(90deg, ${T.amber}, ${T.emerald})`
                          : `linear-gradient(90deg, ${T.rose}, ${T.amber})`,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Regional Nodes */}
        <div style={{ ...glassCard(), padding: 24 }}>
          <SectionHeader icon={FiGlobe} title="Regional Distribution"
            subtitle="Operations across deployment zones" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {REGION_DATA.map((r, i) => (
              <motion.div key={r.region}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 + i * 0.07 }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10,
                  background: T.surface, border: `1px solid ${T.border}`,
                }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: r.status === "healthy" ? T.emerald : T.amber,
                  }} />
                  {r.status === "healthy" && (
                    <motion.div
                      style={{
                        position: "absolute", inset: -3, borderRadius: "50%",
                        border: `1.5px solid ${T.emerald}`,
                      }}
                      animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.textPri, marginBottom: 2 }}>
                    {r.region}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMut }}>
                    {r.ops.toLocaleString()} ops
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5,
                    background: r.threats > 0 ? `${T.rose}18` : `${T.emerald}18`,
                    color: r.threats > 0 ? T.rose : T.emerald,
                    border: `1px solid ${r.threats > 0 ? T.rose : T.emerald}30`,
                  }}>
                    {r.threats > 0 ? `${r.threats} threats` : "Clean"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
