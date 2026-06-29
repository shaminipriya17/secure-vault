import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiShield, FiUsers, FiDatabase, FiActivity,
  FiAlertTriangle, FiCheckCircle, FiClock, FiArrowUpRight,
  FiArrowDownRight, FiLock, FiUnlock, FiEye, FiMoreHorizontal,
  FiRefreshCw, FiDownload, FiFilter, FiZap, FiGlobe,
  FiTrendingUp, FiKey, FiServer, FiX, FiCheck, FiLoader,
  FiChevronDown, FiInfo, FiCopy, FiExternalLink, FiPlus,
  FiSearch, FiTrash2, FiEdit3, FiToggleLeft, FiToggleRight,
  FiMoon, FiSun
} from "react-icons/fi";

// ─── API Client ───────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE || "https://api.securevault.internal/v1";
const getAuthToken = () => localStorage.getItem("sv_token") || "";

const apiClient = {
  request: async (method, path, body = null, signal = null) => {
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
        "X-Client-Version": "2.4.0",
      },
      signal,
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw Object.assign(new Error(err.message || "Request failed"), { status: res.status, data: err });
    }
    return res.json();
  },
  get: (path, signal) => apiClient.request("GET", path, null, signal),
  post: (path, body, signal) => apiClient.request("POST", path, body, signal),
  put: (path, body, signal) => apiClient.request("PUT", path, body, signal),
  delete: (path, signal) => apiClient.request("DELETE", path, null, signal),
};

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg0: "#070B14", bg1: "#0B1220", bg2: "#111827", bg3: "#1a2235",
  bg4: "#1f2a3d", glass: "rgba(255,255,255,0.03)",
  glassBorder: "rgba(255,255,255,0.07)",
  primary: "#6366F1", primaryGlow: "rgba(99,102,241,0.15)",
  secondary: "#06B6D4", secondaryGlow: "rgba(6,182,212,0.15)",
  accent: "#8B5CF6", accentGlow: "rgba(139,92,246,0.15)",
  success: "#10B981", successGlow: "rgba(16,185,129,0.12)",
  warning: "#F59E0B", warningGlow: "rgba(245,158,11,0.12)",
  danger: "#EF4444", dangerGlow: "rgba(239,68,68,0.12)",
  info: "#06B6D4",
  text0: "#F8FAFC", text1: "#CBD5E1", text2: "#94A3B8", text3: "#64748B",
  radius: "14px", radiusSm: "10px", radiusLg: "20px",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }
  }),
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.18 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

// ─── Style Helpers ────────────────────────────────────────────────────────────
const glassCard = (extra = {}) => ({
  background: `linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.018) 100%)`,
  border: `1px solid ${T.glassBorder}`,
  borderRadius: T.radius,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  ...extra,
});

const inputStyle = (error = false) => ({
  width: "100%",
  padding: "10px 14px",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${error ? T.danger : T.glassBorder}`,
  borderRadius: T.radiusSm,
  color: T.text0,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
});

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: T.text2,
  marginBottom: 6,
};

const btnPrimary = (color = T.primary, extra = {}) => ({
  padding: "10px 20px",
  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
  border: "none",
  borderRadius: T.radiusSm,
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 7,
  transition: "opacity 0.2s, transform 0.15s",
  ...extra,
});

const btnGhost = (extra = {}) => ({
  padding: "10px 16px",
  background: "transparent",
  border: `1px solid ${T.glassBorder}`,
  borderRadius: T.radiusSm,
  color: T.text2,
  fontSize: 13,
  cursor: "pointer",
  transition: "all 0.2s",
  fontFamily: "inherit",
  ...extra,
});

// ─── Static Data ──────────────────────────────────────────────────────────────
const STAT_CARDS = [
  {
    id: "vaults", label: "Active Vaults", value: "1,284", delta: "+12.4%", up: true,
    icon: FiDatabase, color: T.primary, glow: T.primaryGlow, sub: "48 created this week",
  },
  {
    id: "users", label: "Authorized Users", value: "8,391", delta: "+3.7%", up: true,
    icon: FiUsers, color: T.secondary, glow: T.secondaryGlow, sub: "217 active right now",
  },
  {
    id: "threats", label: "Threats Blocked", value: "342", delta: "-8.1%", up: false,
    icon: FiShield, color: T.success, glow: T.successGlow, sub: "Down from last week",
  },
  {
    id: "keys", label: "Encryption Keys", value: "29,740", delta: "+1.2%", up: true,
    icon: FiKey, color: T.accent, glow: T.accentGlow, sub: "AES-256 & RSA-4096",
  },
];

const INITIAL_LOG = [
  { id: 1, type: "access", icon: FiUnlock, color: T.success, msg: "Vault #VLT-4821 accessed", user: "Sarah K.", time: "2m ago", region: "US-East" },
  { id: 2, type: "threat", icon: FiAlertTriangle, color: T.warning, msg: "Brute-force attempt blocked", user: "Unknown", time: "7m ago", region: "CN-Shanghai" },
  { id: 3, type: "key", icon: FiKey, color: T.primary, msg: "Key rotation completed", user: "System", time: "14m ago", region: "EU-West" },
  { id: 4, type: "lock", icon: FiLock, color: T.accent, msg: "Vault #VLT-2203 sealed", user: "James R.", time: "31m ago", region: "US-West" },
  { id: 5, type: "access", icon: FiUnlock, color: T.success, msg: "Vault #VLT-9104 accessed", user: "Priya M.", time: "45m ago", region: "AP-Mumbai" },
  { id: 6, type: "threat", icon: FiAlertTriangle, color: T.danger, msg: "Credential leak detected", user: "System", time: "1h ago", region: "EU-London" },
  { id: 7, type: "server", icon: FiServer, color: T.secondary, msg: "Node failover completed", user: "System", time: "2h ago", region: "US-East" },
];

const VAULT_HEALTH = [
  { label: "Encrypted", pct: 94, color: T.success },
  { label: "Pending Rotation", pct: 4, color: T.warning },
  { label: "At Risk", pct: 2, color: T.danger },
];

const REGION_DATA = [
  { region: "US-East", vaults: 412, threats: 18, status: "healthy" },
  { region: "EU-West", vaults: 318, threats: 7, status: "healthy" },
  { region: "AP-Mumbai", vaults: 201, threats: 3, status: "healthy" },
  { region: "US-West", vaults: 198, threats: 12, status: "warning" },
  { region: "CN-Shanghai", vaults: 155, threats: 41, status: "critical" },
];

const ENCRYPTION_TYPES = ["AES-256-GCM", "AES-256-CBC", "ChaCha20-Poly1305", "RSA-4096"];
const RETENTION_OPTIONS = ["30 days", "90 days", "1 year", "3 years", "Indefinite"];
const VAULT_REGIONS = ["US-East", "EU-West", "AP-Mumbai", "US-West", "CN-Shanghai"];

const sparkData = {
  vaults: [38, 42, 39, 51, 47, 58, 61, 55, 67, 72, 69, 80],
  users: [210, 195, 220, 215, 230, 218, 240, 228, 251, 244, 260, 255],
  threats: [22, 30, 18, 25, 14, 19, 12, 17, 10, 15, 8, 11],
  keys: [900, 920, 910, 940, 935, 960, 955, 975, 970, 990, 985, 1010],
};

const barData = [28, 34, 31, 42, 38, 51, 46, 58, 54, 67, 62, 74];

// ─── Validation ───────────────────────────────────────────────────────────────
const validators = {
  vaultName: (v) => {
    if (!v.trim()) return "Vault name is required";
    if (v.trim().length < 3) return "Minimum 3 characters";
    if (v.trim().length > 64) return "Maximum 64 characters";
    if (!/^[a-zA-Z0-9_\- ]+$/.test(v)) return "Letters, numbers, spaces, hyphens and underscores only";
    return null;
  },
  description: (v) => {
    if (v.length > 256) return "Maximum 256 characters";
    return null;
  },
  rotationReason: (v) => {
    if (!v.trim()) return "Reason is required";
    if (v.trim().length < 10) return "Please provide more detail (min 10 chars)";
    return null;
  },
};

// ─── Primitive Components ─────────────────────────────────────────────────────
function SparkLine({ data, color }) {
  const w = 90, h = 32;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RingGauge({ pct, color, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}22`} strokeWidth={6} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle"
        style={{ fontSize: 13, fontWeight: 700, fill: color, fontFamily: "inherit" }}>
        {pct}%
      </text>
    </svg>
  );
}

function StatusDot({ status }) {
  const map = { healthy: T.success, warning: T.warning, critical: T.danger };
  const c = map[status] || T.text3;
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <motion.span
        animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        style={{ position: "absolute", inset: 0, borderRadius: "50%", background: c, display: "block" }}
      />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "block", position: "relative" }} />
    </span>
  );
}

function Toast({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              ...glassCard(),
              padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 10,
              minWidth: 280, maxWidth: 380,
              borderLeft: `3px solid ${t.type === "success" ? T.success : t.type === "error" ? T.danger : T.warning}`,
              pointerEvents: "all",
              cursor: "pointer",
            }}
            onClick={() => remove(t.id)}
          >
            {t.type === "success" && <FiCheckCircle size={15} color={T.success} />}
            {t.type === "error" && <FiAlertTriangle size={15} color={T.danger} />}
            {t.type === "info" && <FiInfo size={15} color={T.secondary} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text0 }}>{t.title}</div>
              {t.body && <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>{t.body}</div>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      style={{ fontSize: 11, color: T.danger, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}
    >
      <FiAlertTriangle size={10} /> {msg}
    </motion.div>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          ...inputStyle(),
          appearance: "none",
          WebkitAppearance: "none",
          paddingRight: 36,
          cursor: "pointer",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value} style={{ background: T.bg2 }}>
            {typeof o === "string" ? o : o.label}
          </option>
        ))}
      </select>
      <FiChevronDown size={14} color={T.text3} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
      <span style={{ fontSize: 13, color: T.text1 }}>{label}</span>
      <motion.button
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: checked ? T.primary : "rgba(255,255,255,0.1)",
          border: "none", cursor: "pointer", position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <motion.span
          animate={{ x: checked ? 20 : 2 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute", top: 3, width: 16, height: 16,
            borderRadius: "50%", background: "#fff",
            display: "block",
          }}
        />
      </motion.button>
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, icon: Icon, iconColor, children, width = 520 }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={overlayVariants} initial="hidden" animate="show" exit="exit"
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(7,11,20,0.82)", backdropFilter: "blur(6px)",
            }}
          />
          <div style={{
            position: "fixed", inset: 0, zIndex: 1001,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, pointerEvents: "none",
          }}>
            <motion.div
              variants={modalVariants} initial="hidden" animate="show" exit="exit"
              onClick={e => e.stopPropagation()}
              style={{
                ...glassCard(),
                width: "100%", maxWidth: width,
                maxHeight: "90vh", overflow: "auto",
                pointerEvents: "all",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <div style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                padding: "24px 24px 0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {Icon && (
                    <div style={{
                      width: 42, height: 42, borderRadius: 11,
                      background: `linear-gradient(135deg, ${iconColor}28, ${iconColor}10)`,
                      border: `1px solid ${iconColor}33`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={18} color={iconColor} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: T.text0 }}>{title}</div>
                    {subtitle && <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{subtitle}</div>}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(255,255,255,0.06)", border: `1px solid ${T.glassBorder}`,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.text2, flexShrink: 0,
                  }}
                >
                  <FiX size={15} />
                </button>
              </div>
              <div style={{ padding: "20px 24px 24px" }}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── New Vault Modal ──────────────────────────────────────────────────────────
function NewVaultModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdVault, setCreatedVault] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    region: "US-East",
    encryptionType: "AES-256-GCM",
    retention: "1 year",
    mfa: true,
    auditLogging: true,
    immutable: false,
    tags: "",
  });
  const [errors, setErrors] = useState({});
  const abortRef = useRef(null);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const validate = () => {
    const e = {};
    const nameErr = validators.vaultName(form.name);
    if (nameErr) e.name = nameErr;
    const descErr = validators.description(form.description);
    if (descErr) e.description = descErr;
    if (!form.region) e.region = "Select a region";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    abortRef.current = new AbortController();
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        region: form.region,
        encryption: { algorithm: form.encryptionType },
        retention: form.retention,
        security: { mfaRequired: form.mfa, auditLogging: form.auditLogging, immutable: form.immutable },
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      const vault = await apiClient.post("/vaults", payload, abortRef.current.signal);
      setCreatedVault(vault);
      setStep(3);
      onSuccess?.({ type: "success", title: "Vault created", body: `${form.name} is ready to use` });
    } catch (err) {
      if (err.name !== "AbortError") {
        setErrors({ _global: err.message || "Failed to create vault" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setForm({ name: "", description: "", region: "US-East", encryptionType: "AES-256-GCM", retention: "1 year", mfa: true, auditLogging: true, immutable: false, tags: "" });
    setErrors({});
    setCreatedVault(null);
    onClose();
  };

  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <Modal open={open} onClose={handleClose} title="Create New Vault" subtitle={step < 3 ? `Step ${step} of 2` : "Vault ready"} icon={FiDatabase} iconColor={T.primary} width={540}>
      {/* Step indicator */}
      {step < 3 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? T.primary : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Vault Name <span style={{ color: T.danger }}>*</span></label>
                <input
                  style={inputStyle(!!errors.name)}
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="e.g. Production Secrets"
                  autoFocus
                />
                <FieldError msg={errors.name} />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle(!!errors.description), resize: "vertical", minHeight: 72 }}
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Optional — describe the vault's purpose"
                />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <FieldError msg={errors.description} />
                  <span style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{form.description.length}/256</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Region <span style={{ color: T.danger }}>*</span></label>
                  <Select value={form.region} onChange={v => set("region", v)} options={VAULT_REGIONS} />
                  <FieldError msg={errors.region} />
                </div>
                <div>
                  <label style={labelStyle}>Encryption</label>
                  <Select value={form.encryptionType} onChange={v => set("encryptionType", v)} options={ENCRYPTION_TYPES} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Retention Policy</label>
                <Select value={form.retention} onChange={v => set("retention", v)} options={RETENTION_OPTIONS} />
              </div>

              <div>
                <label style={labelStyle}>Tags <span style={{ color: T.text3, fontWeight: 400 }}>(comma-separated)</span></label>
                <input
                  style={inputStyle()}
                  value={form.tags}
                  onChange={e => set("tags", e.target.value)}
                  placeholder="production, us-east, payments"
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, gap: 10 }}>
              <button style={btnGhost()} onClick={handleClose}>Cancel</button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={btnPrimary(T.primary)}
                onClick={() => { if (validate()) setStep(2); }}
              >
                Continue <FiArrowUpRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: T.radiusSm, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: T.text3, marginBottom: 8 }}>Creating vault</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>{form.name}</div>
              <div style={{ fontSize: 12, color: T.text2, marginTop: 2 }}>{form.region} · {form.encryptionType}</div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, marginBottom: 12 }}>Security settings</div>
            <div style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${T.glassBorder}` }}>
              <Toggle checked={form.mfa} onChange={v => set("mfa", v)} label="Require MFA for access" />
              <div style={{ borderTop: `1px solid ${T.glassBorder}` }} />
              <Toggle checked={form.auditLogging} onChange={v => set("auditLogging", v)} label="Enable audit logging" />
              <div style={{ borderTop: `1px solid ${T.glassBorder}` }} />
              <Toggle checked={form.immutable} onChange={v => set("immutable", v)} label="Immutable vault (write-once)" />
            </div>

            {form.immutable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                style={{ marginTop: 12, padding: "10px 14px", borderRadius: T.radiusSm, background: `${T.warning}12`, border: `1px solid ${T.warning}28`, display: "flex", alignItems: "flex-start", gap: 8 }}
              >
                <FiAlertTriangle size={14} color={T.warning} style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: T.text1 }}>Immutable vaults cannot be modified or deleted after creation. This cannot be reversed.</span>
              </motion.div>
            )}

            {errors._global && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ marginTop: 14, padding: "10px 14px", borderRadius: T.radiusSm, background: `${T.danger}12`, border: `1px solid ${T.danger}28`, display: "flex", alignItems: "center", gap: 8 }}
              >
                <FiAlertTriangle size={14} color={T.danger} />
                <span style={{ fontSize: 12, color: T.danger }}>{errors._global}</span>
              </motion.div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 10 }}>
              <button style={btnGhost()} onClick={() => setStep(1)}>Back</button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
                style={btnPrimary(T.primary, { opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" })}
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? <><FiLoader size={14} style={{ animation: "spin 1s linear infinite" }} /> Creating...</> : <><FiDatabase size={14} /> Create Vault</>}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "8px 0 12px" }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
              style={{
                width: 64, height: 64, borderRadius: "50%", margin: "0 auto 18px",
                background: `${T.success}18`, border: `1px solid ${T.success}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <FiCheckCircle size={28} color={T.success} />
            </motion.div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text0, marginBottom: 6 }}>Vault Created Successfully</div>
            <div style={{ fontSize: 13, color: T.text2, marginBottom: 20 }}>
              Your vault is encrypted with {form.encryptionType} and ready to use.
            </div>

            {createdVault?.id && (
              <div style={{ ...glassCard(), padding: "12px 16px", marginBottom: 20, textAlign: "left" }}>
                <div style={{ fontSize: 11, color: T.text3, marginBottom: 4 }}>Vault ID</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <code style={{ fontSize: 13, color: T.primary, flex: 1, fontFamily: "monospace" }}>{createdVault.id}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(createdVault.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: T.text3 }}
                  >
                    <FiCopy size={13} />
                  </button>
                </div>
              </div>
            )}

            <button style={btnPrimary(T.primary, { width: "100%", justifyContent: "center" })} onClick={handleClose}>
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
}

// ─── Rotate Keys Modal ────────────────────────────────────────────────────────
function RotateKeysModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [form, setForm] = useState({
    scope: "all",
    algorithm: "AES-256-GCM",
    reason: "",
    notifyUsers: true,
    backupFirst: true,
  });
  const [errors, setErrors] = useState({});
  const abortRef = useRef(null);
  const intervalRef = useRef(null);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const validate = () => {
    const e = {};
    const rErr = validators.rotationReason(form.reason);
    if (rErr) e.reason = rErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const simulateProgress = () => {
    const steps = [
      { pct: 10, msg: "Initiating rotation..." },
      { pct: 25, msg: "Backing up existing keys..." },
      { pct: 45, msg: "Generating new key material..." },
      { pct: 65, msg: "Encrypting vaults with new keys..." },
      { pct: 80, msg: "Verifying integrity..." },
      { pct: 92, msg: "Revoking old keys..." },
      { pct: 100, msg: "Rotation complete" },
    ];
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= steps.length) { clearInterval(intervalRef.current); return; }
      setProgress(steps[i].pct);
      setCurrentAction(steps[i].msg);
      i++;
    }, 600);
  };

  const handleRotate = async () => {
    if (!validate()) return;
    setLoading(true);
    simulateProgress();
    abortRef.current = new AbortController();
    try {
      await apiClient.post("/keys/rotate", {
        scope: form.scope,
        algorithm: form.algorithm,
        reason: form.reason.trim(),
        options: { notifyUsers: form.notifyUsers, backupFirst: form.backupFirst },
      }, abortRef.current.signal);
      setTimeout(() => { setLoading(false); setDone(true); onSuccess?.({ type: "success", title: "Keys rotated", body: "All encryption keys updated successfully" }); }, 4200);
    } catch (err) {
      if (err.name !== "AbortError") {
        clearInterval(intervalRef.current);
        setLoading(false);
        setErrors({ _global: err.message || "Key rotation failed" });
      }
    }
  };

  const handleClose = () => {
    clearInterval(intervalRef.current);
    abortRef.current?.abort();
    setLoading(false);
    setDone(false);
    setProgress(0);
    setCurrentAction("");
    setForm({ scope: "all", algorithm: "AES-256-GCM", reason: "", notifyUsers: true, backupFirst: true });
    setErrors({});
    onClose();
  };

  useEffect(() => () => { clearInterval(intervalRef.current); abortRef.current?.abort(); }, []);

  return (
    <Modal open={open} onClose={loading ? undefined : handleClose} title="Rotate Encryption Keys" subtitle="Rotates keys across selected vaults" icon={FiRefreshCw} iconColor={T.accent} width={480}>
      <AnimatePresence mode="wait">
        {!loading && !done && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ padding: "12px 14px", borderRadius: T.radiusSm, background: `${T.warning}10`, border: `1px solid ${T.warning}22`, display: "flex", gap: 10, marginBottom: 20 }}>
              <FiAlertTriangle size={14} color={T.warning} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12, color: T.text1 }}>Key rotation is irreversible. Existing keys will be revoked. Schedule during low-traffic periods.</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Rotation Scope</label>
                <Select
                  value={form.scope}
                  onChange={v => set("scope", v)}
                  options={[
                    { value: "all", label: "All vaults (29,740 keys)" },
                    { value: "pending", label: "Pending rotation only (4%)" },
                    { value: "at-risk", label: "At-risk vaults only (2%)" },
                    { value: "region", label: "By region" },
                  ]}
                />
              </div>

              <div>
                <label style={labelStyle}>New Algorithm</label>
                <Select value={form.algorithm} onChange={v => set("algorithm", v)} options={ENCRYPTION_TYPES} />
              </div>

              <div>
                <label style={labelStyle}>Reason for rotation <span style={{ color: T.danger }}>*</span></label>
                <textarea
                  style={{ ...inputStyle(!!errors.reason), resize: "vertical", minHeight: 72 }}
                  value={form.reason}
                  onChange={e => set("reason", e.target.value)}
                  placeholder="e.g. Scheduled quarterly rotation per SOC2 compliance policy"
                />
                <FieldError msg={errors.reason} />
              </div>

              <div style={{ borderTop: `1px solid ${T.glassBorder}` }}>
                <Toggle checked={form.backupFirst} onChange={v => set("backupFirst", v)} label="Backup existing keys before rotation" />
                <div style={{ borderTop: `1px solid ${T.glassBorder}` }} />
                <Toggle checked={form.notifyUsers} onChange={v => set("notifyUsers", v)} label="Notify affected users" />
              </div>

              {errors._global && (
                <div style={{ padding: "10px 14px", borderRadius: T.radiusSm, background: `${T.danger}12`, border: `1px solid ${T.danger}28`, display: "flex", alignItems: "center", gap: 8 }}>
                  <FiAlertTriangle size={14} color={T.danger} />
                  <span style={{ fontSize: 12, color: T.danger }}>{errors._global}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22, gap: 10 }}>
              <button style={btnGhost()} onClick={handleClose}>Cancel</button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={btnPrimary(T.accent)}
                onClick={handleRotate}
              >
                <FiRefreshCw size={14} /> Rotate Keys
              </motion.button>
            </div>
          </motion.div>
        )}

        {loading && (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: "8px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                style={{ display: "inline-flex", color: T.accent }}
              >
                <FiRefreshCw size={32} />
              </motion.div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text0, marginTop: 14 }}>Rotating keys...</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>{currentAction}</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 8, overflow: "hidden" }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ height: "100%", background: `linear-gradient(to right, ${T.accent}, ${T.primary})`, borderRadius: 6 }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: T.text3 }}>Progress</span>
              <span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>{progress}%</span>
            </div>

            <div style={{ marginTop: 20, fontSize: 12, color: T.text3, textAlign: "center" }}>
              Do not close this window during rotation
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "8px 0 12px" }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
              style={{
                width: 64, height: 64, borderRadius: "50%", margin: "0 auto 18px",
                background: `${T.success}18`, border: `1px solid ${T.success}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <FiCheckCircle size={28} color={T.success} />
            </motion.div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text0, marginBottom: 6 }}>Keys Rotated Successfully</div>
            <div style={{ fontSize: 13, color: T.text2, marginBottom: 24 }}>
              All affected vaults now use the new {form.algorithm} keys. Previous keys have been revoked.
            </div>
            <button style={btnPrimary(T.primary, { width: "100%", justifyContent: "center" })} onClick={handleClose}>Done</button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

// ─── Audit Log Modal ──────────────────────────────────────────────────────────
function AuditLogModal({ open, onClose, log }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [dateRange, setDateRange] = useState("24h");

  const filtered = log.filter(e => {
    const matchType = filter === "all" || e.type === filter;
    const matchSearch = !search || e.msg.toLowerCase().includes(search.toLowerCase()) || e.user.toLowerCase().includes(search.toLowerCase()) || e.region.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const csvHeader = "Time,Type,Message,User,Region\n";
      const csvRows = filtered
        .map(e => `"${e.time}","${e.type}","${e.msg}","${e.user}","${e.region}"`)
        .join("\n");
      const csv = csvHeader + csvRows;
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Audit Log" subtitle="Full audit trail" icon={FiDownload} iconColor={T.secondary} width={680}>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <FiSearch size={13} color={T.text3} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            style={{ ...inputStyle(), paddingLeft: 34 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events, users, regions..."
          />
        </div>
        <Select
          value={dateRange}
          onChange={setDateRange}
          options={[{ value: "24h", label: "Last 24h" }, { value: "7d", label: "Last 7 days" }, { value: "30d", label: "Last 30 days" }]}
        />
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={btnPrimary(T.secondary, { opacity: downloading ? 0.7 : 1, cursor: downloading ? "not-allowed" : "pointer" })}
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? <FiLoader size={13} style={{ animation: "spin 1s linear infinite" }} /> : <FiDownload size={13} />}
          Export CSV
        </motion.button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["all", "access", "threat", "key", "lock", "server"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
              border: `1px solid ${filter === f ? T.secondary : T.glassBorder}`,
              background: filter === f ? `${T.secondary}22` : "transparent",
              color: filter === f ? T.secondary : T.text3,
              cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize",
            }}
          >{f}</button>
        ))}
      </div>

      <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, paddingRight: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.text3, fontSize: 13 }}>
            No events match the current filters
          </div>
        ) : filtered.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: i * 0.03 } }}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: T.radiusSm,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid transparent`,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.glassBorder}
            onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: `${entry.color}18`, border: `1px solid ${entry.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <entry.icon size={13} color={entry.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: T.text1 }}>{entry.msg}</div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{entry.user} · {entry.region}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: T.text3 }}>{entry.time}</div>
              <div style={{
                fontSize: 10, padding: "2px 6px", borderRadius: 4, marginTop: 3, display: "inline-block",
                background: `${entry.color}18`, color: entry.color, textTransform: "capitalize",
              }}>{entry.type}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.glassBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: T.text3 }}>{filtered.length} events shown</span>
        <button style={btnGhost({ fontSize: 12, padding: "7px 12px" })} onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

// ─── Threat Scan Modal ────────────────────────────────────────────────────────
function ThreatScanModal({ open, onClose, onSuccess }) {
  const [phase, setPhase] = useState("config"); // config | scanning | results
  const [scanOptions, setScanOptions] = useState({
    network: true,
    credentials: true,
    access: true,
    compliance: false,
    deepScan: false,
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanLog, setScanLog] = useState([]);
  const [results, setResults] = useState(null);
  const abortRef = useRef(null);
  const intervalRef = useRef(null);

  const addLog = (msg, type = "info") => setScanLog(l => [...l, { msg, type, ts: Date.now() }]);

  const startScan = async () => {
    setLoading(true);
    setPhase("scanning");
    setScanLog([]);
    setProgress(0);
    abortRef.current = new AbortController();

    const logSequence = [
      [0, "Initializing scanner...", "info"],
      [8, "Checking network exposure...", "info"],
      [20, "Analyzing access patterns...", "info"],
      [31, "Warning: Unusual login from CN-Shanghai", "warn"],
      [38, "Scanning credential stores...", "info"],
      [52, "Checking for leaked secrets...", "info"],
      [64, "2 weak credentials detected", "warn"],
      [71, "Running compliance checks...", "info"],
      [85, "Cross-referencing threat intelligence...", "info"],
      [93, "Threat detected: Brute-force source blocked", "danger"],
      [100, "Scan complete", "success"],
    ];

    let idx = 0;
    intervalRef.current = setInterval(() => {
      if (idx >= logSequence.length) { clearInterval(intervalRef.current); return; }
      const [pct, msg, type] = logSequence[idx];
      setProgress(pct);
      addLog(msg, type);
      idx++;
    }, 450);

    try {
      const res = await apiClient.post("/security/scan", {
        checks: Object.entries(scanOptions).filter(([, v]) => v).map(([k]) => k),
      }, abortRef.current.signal);
      setTimeout(() => {
        setResults(res || {
          critical: 1, high: 3, medium: 7, low: 12, passed: 241,
          findings: [
            { severity: "critical", title: "Active brute-force origin", region: "CN-Shanghai", action: "Blocked" },
            { severity: "high", title: "2 vaults with weak credentials", region: "US-East", action: "Review" },
            { severity: "high", title: "Key rotation overdue — 48 vaults", region: "EU-West", action: "Rotate" },
            { severity: "medium", title: "Session tokens expiry too long", region: "Global", action: "Configure" },
          ],
        });
        setLoading(false);
        setPhase("results");
        onSuccess?.({ type: "success", title: "Threat scan complete", body: "1 critical finding — action required" });
      }, 5000);
    } catch (err) {
      if (err.name !== "AbortError") {
        clearInterval(intervalRef.current);
        setLoading(false);
        setPhase("config");
        addLog("Scan failed: " + (err.message || "Unknown error"), "danger");
      }
    }
  };

  const handleClose = () => {
    clearInterval(intervalRef.current);
    abortRef.current?.abort();
    setPhase("config");
    setLoading(false);
    setProgress(0);
    setScanLog([]);
    setResults(null);
    onClose();
  };

  useEffect(() => () => { clearInterval(intervalRef.current); abortRef.current?.abort(); }, []);

  const sevColor = { critical: T.danger, high: T.warning, medium: T.accent, low: T.primary, info: T.secondary };
  const logColor = { info: T.text2, warn: T.warning, danger: T.danger, success: T.success };

  return (
    <Modal open={open} onClose={loading ? undefined : handleClose} title="Threat Scan" subtitle="Real-time security analysis" icon={FiZap} iconColor={T.warning} width={560}>
      <AnimatePresence mode="wait">
        {phase === "config" && (
          <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ fontSize: 13, color: T.text2, marginBottom: 16 }}>Select the checks to run:</div>
            <div style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${T.glassBorder}` }}>
              {[
                ["network", "Network exposure & open ports"],
                ["credentials", "Credential strength & leaks"],
                ["access", "Anomalous access patterns"],
                ["compliance", "Compliance policy violations"],
                ["deepScan", "Deep vault integrity scan (slower)"],
              ].map(([k, label]) => (
                <div key={k} style={{ borderBottom: `1px solid ${T.glassBorder}` }}>
                  <Toggle checked={scanOptions[k]} onChange={v => setScanOptions(s => ({ ...s, [k]: v }))} label={label} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, padding: "11px 14px", borderRadius: T.radiusSm, background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: T.text3 }}>Estimated scan time</span>
              <span style={{ fontSize: 12, color: T.text1, fontWeight: 600 }}>
                {scanOptions.deepScan ? "4–8 min" : "1–2 min"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22, gap: 10 }}>
              <button style={btnGhost()} onClick={handleClose}>Cancel</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={btnPrimary(T.warning)} onClick={startScan}>
                <FiZap size={14} /> Start Scan
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === "scanning" && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }} style={{ color: T.warning }}>
                <FiZap size={24} />
              </motion.div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text0 }}>Scanning in progress</div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>
                  {scanLog.length > 0 ? scanLog[scanLog.length - 1].msg : "Initializing..."}
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 4 }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ height: "100%", background: `linear-gradient(to right, ${T.warning}, ${T.danger})`, borderRadius: 6 }}
              />
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: T.warning, fontWeight: 600, marginBottom: 14 }}>{progress}%</div>

            <div style={{
              background: "rgba(0,0,0,0.3)", borderRadius: T.radiusSm,
              padding: "12px 14px", height: 160, overflowY: "auto",
              fontFamily: "monospace", fontSize: 11,
              display: "flex", flexDirection: "column", gap: 3,
            }}>
              {scanLog.map((l, i) => (
                <div key={i} style={{ color: logColor[l.type] || T.text2 }}>
                  <span style={{ color: T.text3 }}>[{new Date(l.ts).toLocaleTimeString()}]</span> {l.msg}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "results" && results && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
              {[
                { label: "Critical", count: results.critical, color: T.danger },
                { label: "High", count: results.high, color: T.warning },
                { label: "Medium", count: results.medium, color: T.accent },
                { label: "Passed", count: results.passed, color: T.success },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", padding: "12px 8px", borderRadius: T.radiusSm, background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, marginBottom: 10 }}>Findings</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
              {results.findings.map((f, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  borderRadius: T.radiusSm, background: `${sevColor[f.severity]}08`, border: `1px solid ${sevColor[f.severity]}22`,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: sevColor[f.severity], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: T.text0, fontWeight: 500 }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{f.region}</div>
                  </div>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: `${sevColor[f.severity]}20`, color: sevColor[f.severity], fontWeight: 600 }}>
                    {f.action}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18, gap: 10 }}>
              <button style={btnGhost()} onClick={handleClose}>Close</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={btnPrimary(T.danger)}>
                <FiShield size={13} /> Remediate Critical
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState("1Y");
  const [logFilter, setLogFilter] = useState("all");
  const [hoveredStat, setHoveredStat] = useState(null);
  const [log, setLog] = useState(INITIAL_LOG);
  const [toasts, setToasts] = useState([]);

  const [modal, setModal] = useState(null); // "vault" | "keys" | "audit" | "scan"

  const addToast = useCallback((t) => {
    const id = Date.now();
    setToasts(ts => [...ts, { ...t, id }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id) => setToasts(ts => ts.filter(x => x.id !== id)), []);

  const handleActionSuccess = useCallback((toast, logEntry) => {
    if (toast) addToast(toast);
    if (logEntry) {
      setLog(l => [{ ...logEntry, id: Date.now() }, ...l]);
    }
  }, [addToast]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filteredLog = logFilter === "all" ? log : log.filter(e => e.type === logFilter);
  const fmt = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const QUICK_ACTIONS = [
    { label: "New Vault", icon: FiDatabase, color: T.primary, action: () => setModal("vault") },
    { label: "Rotate Keys", icon: FiRefreshCw, color: T.accent, action: () => setModal("keys") },
    { label: "Audit Log", icon: FiDownload, color: T.secondary, action: () => setModal("audit") },
    { label: "Threat Scan", icon: FiZap, color: T.warning, action: () => setModal("scan") },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "28px 32px 48px", fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", color: T.text0 }}>

      {/* Header */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="show" custom={0}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.success, boxShadow: `0 0 8px ${T.success}` }} />
            <span style={{ fontSize: 12, color: T.text2, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
              All systems operational
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text0, margin: 0, letterSpacing: "-0.02em" }}>Security Overview</h1>
          <p style={{ margin: "4px 0 0", color: T.text2, fontSize: 14 }}>SecureVault Enterprise · Real-time monitoring</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ ...glassCard(), padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <FiClock size={13} color={T.text3} />
            <span style={{ fontSize: 13, color: T.text2, fontVariantNumeric: "tabular-nums" }}>{fmt(time)}</span>
          </div>
          {QUICK_ACTIONS.map((a, i) => (
            <motion.button
              key={a.label}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.06 } }}
              onClick={a.action}
              style={{
                ...glassCard(),
                padding: "8px 14px", border: `1px solid ${a.color}33`,
                display: "flex", alignItems: "center", gap: 7,
                cursor: "pointer", color: a.color, fontSize: 13, fontWeight: 500,
                background: `linear-gradient(135deg, ${a.color}12, ${a.color}05)`,
              }}
            >
              <a.icon size={14} />
              {a.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 18, marginBottom: 24 }}>
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.id}
            variants={fadeUp} initial="hidden" animate="show" custom={i + 1}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            onHoverStart={() => setHoveredStat(card.id)}
            onHoverEnd={() => setHoveredStat(null)}
            style={{
              ...glassCard(),
              padding: "22px 22px 18px",
              position: "relative", overflow: "hidden", cursor: "default",
              boxShadow: hoveredStat === card.id ? `0 0 0 1px ${card.color}44, 0 16px 40px ${card.color}18` : "none",
              transition: "box-shadow 0.3s ease",
            }}
          >
            <div style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: "50%", background: card.glow, filter: "blur(28px)", pointerEvents: "none" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `linear-gradient(135deg, ${card.color}28, ${card.color}10)`,
                border: `1px solid ${card.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <card.icon size={18} color={card.color} />
              </div>
              <SparkLine data={sparkData[card.id]} color={card.color} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: T.text0, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: T.text2, margin: "4px 0 10px" }}>{card.label}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {card.up ? <FiArrowUpRight size={13} color={T.success} /> : <FiArrowDownRight size={13} color={T.success} />}
                <span style={{ fontSize: 12, color: T.success, fontWeight: 600 }}>{card.delta}</span>
              </div>
              <span style={{ fontSize: 11, color: T.text3 }}>{card.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 340px", gap: 18, marginBottom: 24 }}>

        {/* Access Volume */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} style={{ ...glassCard(), padding: "22px 22px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>Access Volume</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Last 12 months</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["1W", "1M", "3M", "1Y"].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                  border: `1px solid ${activeFilter === f ? T.primary : T.glassBorder}`,
                  background: activeFilter === f ? `${T.primary}22` : "transparent",
                  color: activeFilter === f ? T.primary : T.text3,
                  cursor: "pointer", transition: "all 0.2s",
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 120 }}>
            {barData.map((v, i) => {
              const max = Math.max(...barData);
              const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
              const isLast = i === barData.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / max) * 100}px` }}
                    transition={{ duration: 0.7, delay: 0.4 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      width: "100%", borderRadius: "5px 5px 3px 3px",
                      background: isLast ? `linear-gradient(to top, ${T.primary}, ${T.accent})` : `linear-gradient(to top, ${T.primary}55, ${T.primary}22)`,
                      boxShadow: isLast ? `0 0 16px ${T.primary}44` : "none",
                    }}
                  />
                  <span style={{ fontSize: 9, color: T.text3 }}>{months[i]}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.glassBorder}` }}>
            {[{ label: "Total Accesses", val: "89,241" }, { label: "Avg. / day", val: "7,437" }, { label: "Peak", val: "Dec" }].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text0 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Threat Intelligence */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6} style={{ ...glassCard(), padding: "22px 22px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>Threat Intelligence</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Live feed</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${T.danger}18`, border: `1px solid ${T.danger}33`, borderRadius: 6, padding: "5px 10px" }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ width: 6, height: 6, borderRadius: "50%", background: T.danger }} />
              <span style={{ fontSize: 11, color: T.danger, fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          {[
            { label: "Brute Force", count: 142, pct: 41, color: T.danger },
            { label: "Credential Stuffing", count: 89, pct: 26, color: T.warning },
            { label: "SQL Injection", count: 61, pct: 18, color: T.accent },
            { label: "Phishing", count: 50, pct: 15, color: T.primary },
          ].map((t, i) => (
            <div key={t.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: T.text1 }}>{t.label}</span>
                <span style={{ fontSize: 12, color: t.color, fontWeight: 600 }}>{t.count}</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: `${t.color}20`, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${t.pct}%` }}
                  transition={{ duration: 0.9, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: "100%", borderRadius: 3, background: `linear-gradient(to right, ${t.color}, ${t.color}aa)` }}
                />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "12px 14px", borderRadius: T.radiusSm, background: `${T.warning}12`, border: `1px solid ${T.warning}28`, display: "flex", alignItems: "center", gap: 10 }}>
            <FiAlertTriangle size={14} color={T.warning} />
            <span style={{ fontSize: 12, color: T.text1 }}>Elevated risk from <strong style={{ color: T.warning }}>CN-Shanghai</strong> — 41 attempts blocked today</span>
          </div>
        </motion.div>

        {/* Vault Health */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} style={{ ...glassCard(), padding: "22px 22px 18px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text0, marginBottom: 4 }}>Vault Health</div>
          <div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>Encryption status across all nodes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {VAULT_HEALTH.map((v) => (
              <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <RingGauge pct={v.pct} color={v.color} size={54} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text0 }}>{v.label}</div>
                  <div style={{ fontSize: 12, color: T.text3 }}>{Math.round(1284 * v.pct / 100).toLocaleString()} vaults</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.glassBorder}` }}>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 8 }}>Next key rotation</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FiClock size={13} color={T.accent} />
              <span style={{ fontSize: 13, color: T.text1 }}>Auto-rotation in <strong style={{ color: T.accent }}>6h 24m</strong></span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18 }}>

        {/* Activity Log */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8} style={{ ...glassCard(), padding: "22px 22px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>Activity Log</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Audit trail — last 24 hours</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "access", "threat", "key"].map(f => (
                <button key={f} onClick={() => setLogFilter(f)} style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                  border: `1px solid ${logFilter === f ? T.primary : T.glassBorder}`,
                  background: logFilter === f ? `${T.primary}22` : "transparent",
                  color: logFilter === f ? T.primary : T.text3,
                  cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize",
                }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <AnimatePresence mode="popLayout">
              {filteredLog.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                  exit={{ opacity: 0, x: 10 }}
                  whileHover={{ background: "rgba(255,255,255,0.04)" }}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", borderRadius: T.radiusSm, transition: "background 0.15s" }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `${entry.color}18`, border: `1px solid ${entry.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <entry.icon size={14} color={entry.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: T.text1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.msg}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{entry.user} · {entry.region}</div>
                  </div>
                  <span style={{ fontSize: 11, color: T.text3, whiteSpace: "nowrap" }}>{entry.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            style={{
              width: "100%", marginTop: 12, padding: "10px",
              background: "transparent", border: `1px solid ${T.glassBorder}`,
              borderRadius: T.radiusSm, color: T.text2, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s", fontFamily: "inherit",
            }}
            onClick={() => setModal("audit")}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.glassBorder; e.currentTarget.style.color = T.text2; }}
          >
            <FiEye size={13} /> View full audit log
          </button>
        </motion.div>

        {/* Regional Status */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={9} style={{ ...glassCard(), padding: "22px 22px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>Regional Nodes</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Infrastructure health</div>
            </div>
            <FiGlobe size={16} color={T.text3} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {REGION_DATA.map((r, i) => {
              const statusColor = { healthy: T.success, warning: T.warning, critical: T.danger }[r.status];
              return (
                <motion.div
                  key={r.region}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.7 + i * 0.07 } }}
                  whileHover={{ background: "rgba(255,255,255,0.04)" }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: T.radiusSm, transition: "background 0.15s" }}
                >
                  <StatusDot status={r.status} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: T.text1, fontWeight: 500 }}>{r.region}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{r.vaults} vaults</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: r.threats > 20 ? T.danger : T.text2, fontWeight: 600 }}>{r.threats} threats</div>
                    <div style={{ fontSize: 10, color: statusColor, textTransform: "capitalize", fontWeight: 500, marginTop: 2 }}>{r.status}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: T.radiusSm, background: `${T.success}10`, border: `1px solid ${T.success}25` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <FiCheckCircle size={13} color={T.success} />
              <span style={{ fontSize: 12, color: T.success, fontWeight: 600 }}>4 / 5 regions healthy</span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[{ label: "Uptime", val: "99.97%" }, { label: "Latency", val: "12ms" }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text0 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: T.text3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 8 }}>Compliance coverage</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["SOC 2 Type II", "ISO 27001", "GDPR", "HIPAA"].map(tag => (
                <span key={tag} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: `${T.primary}18`, border: `1px solid ${T.primary}30`, color: T.primary, fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <NewVaultModal
        open={modal === "vault"}
        onClose={() => setModal(null)}
        onSuccess={(t) => handleActionSuccess(t, { type: "access", icon: FiDatabase, color: T.primary, msg: "New vault created", user: "You", time: "just now", region: "US-East" })}
      />
      <RotateKeysModal
        open={modal === "keys"}
        onClose={() => setModal(null)}
        onSuccess={(t) => handleActionSuccess(t, { type: "key", icon: FiKey, color: T.accent, msg: "Key rotation completed", user: "You", time: "just now", region: "Global" })}
      />
      <AuditLogModal
        open={modal === "audit"}
        onClose={() => setModal(null)}
        log={log}
      />
      <ThreatScanModal
        open={modal === "scan"}
        onClose={() => setModal(null)}
        onSuccess={(t) => handleActionSuccess(t, { type: "threat", icon: FiZap, color: T.warning, msg: "Threat scan completed — 1 critical finding", user: "System", time: "just now", region: "Global" })}
      />

      <Toast toasts={toasts} remove={removeToast} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: ${T.text3}; }
        input:focus, textarea:focus, select:focus { border-color: ${T.primary} !important; box-shadow: 0 0 0 3px ${T.primaryGlow}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
        @media (max-width: 1280px) {
          .dash-mid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .dash-mid, .dash-bot { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}