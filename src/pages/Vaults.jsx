import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  FiDatabase, FiSearch, FiPlus, FiLock, FiUnlock, FiShield,
  FiKey, FiMoreHorizontal, FiGrid, FiList, FiDownload,
  FiRefreshCw, FiClock, FiUser, FiAlertTriangle, FiCheckCircle,
  FiX, FiEye, FiEdit2, FiTrash2, FiCopy, FiActivity,
  FiGlobe, FiFilter, FiChevronRight, FiZap, FiArchive,
} from "react-icons/fi";

const T = {
  bg0: "#070B14", bg1: "#0B1220", bg2: "#111827", bg3: "#1a2235", bg4: "#1f2a3d",
  glassBorder: "rgba(255,255,255,0.07)",
  primary: "#6366F1", primaryGlow: "rgba(99,102,241,0.15)",
  secondary: "#06B6D4", secondaryGlow: "rgba(6,182,212,0.12)",
  accent: "#8B5CF6", accentGlow: "rgba(139,92,246,0.12)",
  success: "#10B981", successGlow: "rgba(16,185,129,0.12)",
  warning: "#F59E0B", warningGlow: "rgba(245,158,11,0.12)",
  danger: "#EF4444", dangerGlow: "rgba(239,68,68,0.12)",
  text0: "#F8FAFC", text1: "#CBD5E1", text2: "#94A3B8", text3: "#64748B",
  radius: "14px", radiusSm: "10px",
};

const glassCard = (extra = {}) => ({
  background: "linear-gradient(135deg,rgba(255,255,255,0.045) 0%,rgba(255,255,255,0.018) 100%)",
  border: `1px solid ${T.glassBorder}`,
  borderRadius: T.radius,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  ...extra,
});

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.42, delay: i * 0.065, ease: [0.22, 1, 0.36, 1] } }),
};

const VAULT_TYPES = ["All Types", "Credential", "Certificate", "Secret", "Key Store", "Data Archive"];
const VAULT_STATUSES = ["All Status", "Active", "Sealed", "Rotating", "Archived", "Compromised"];
const ENCRYPTION_ALGOS = { "AES-256": T.primary, "RSA-4096": T.accent, "ChaCha20": T.secondary, "ECDSA-521": T.success };

const VAULTS = [
  { id: "VLT-4821", name: "Production Credentials", type: "Credential", status: "Active", encryption: "AES-256", owner: "Sarah Kim", region: "US-East", keys: 142, lastAccess: "2m ago", created: "Jan 12, 2024", size: "4.2 MB", health: 98, shared: 8 },
  { id: "VLT-2203", name: "TLS Certificate Store", type: "Certificate", status: "Sealed", encryption: "RSA-4096", owner: "James Rivera", region: "EU-West", keys: 37, lastAccess: "31m ago", created: "Mar 5, 2024", size: "1.8 MB", health: 100, shared: 3 },
  { id: "VLT-9104", name: "API Secret Registry", type: "Secret", status: "Active", encryption: "ChaCha20", owner: "Priya Mehta", region: "AP-Mumbai", keys: 89, lastAccess: "1h ago", created: "Feb 20, 2024", size: "2.1 MB", health: 95, shared: 12 },
  { id: "VLT-3310", name: "Signing Keys Vault", type: "Key Store", status: "Rotating", encryption: "ECDSA-521", owner: "Elena Volkov", region: "EU-East", keys: 24, lastAccess: "4h ago", created: "Apr 1, 2024", size: "0.9 MB", health: 88, shared: 2 },
  { id: "VLT-7752", name: "Customer Data Archive", type: "Data Archive", status: "Archived", encryption: "AES-256", owner: "Chloe Dupont", region: "EU-West", keys: 512, lastAccess: "7d ago", created: "Dec 3, 2023", size: "18.4 MB", health: 100, shared: 0 },
  { id: "VLT-1190", name: "OAuth Token Store", type: "Secret", status: "Active", encryption: "AES-256", owner: "Mateo Herrera", region: "SA-Bogota", keys: 67, lastAccess: "12m ago", created: "May 8, 2024", size: "3.3 MB", health: 91, shared: 6 },
  { id: "VLT-5543", name: "Infra Root Certificates", type: "Certificate", status: "Active", encryption: "RSA-4096", owner: "Sarah Kim", region: "US-East", keys: 19, lastAccess: "3h ago", created: "Nov 15, 2023", size: "0.6 MB", health: 100, shared: 4 },
  { id: "VLT-8821", name: "Staging Credentials", type: "Credential", status: "Active", encryption: "AES-256", owner: "Kenji Tanaka", region: "AP-Tokyo", keys: 55, lastAccess: "22m ago", created: "Jun 1, 2024", size: "1.5 MB", health: 79, shared: 5 },
  { id: "VLT-6634", name: "Payment HSM Keys", type: "Key Store", status: "Active", encryption: "ECDSA-521", owner: "Amara Nwosu", region: "AF-Lagos", keys: 11, lastAccess: "8m ago", created: "Feb 28, 2024", size: "0.3 MB", health: 100, shared: 1 },
  { id: "VLT-0091", name: "Legacy DB Secrets", type: "Secret", status: "Compromised", encryption: "AES-256", owner: "Lucas Becker", region: "EU-West", keys: 23, lastAccess: "4d ago", created: "Sep 9, 2023", size: "0.8 MB", health: 14, shared: 3 },
  { id: "VLT-3388", name: "Dev Environment Keys", type: "Key Store", status: "Active", encryption: "ChaCha20", owner: "Omar Hassan", region: "ME-Dubai", keys: 78, lastAccess: "1h ago", created: "Jul 10, 2024", size: "2.7 MB", health: 86, shared: 9 },
  { id: "VLT-7001", name: "Backup Encryption Keys", type: "Key Store", status: "Sealed", encryption: "AES-256", owner: "James Rivera", region: "US-West", keys: 8, lastAccess: "2d ago", created: "Oct 22, 2023", size: "0.2 MB", health: 100, shared: 0 },
];

const STATUS_META = {
  Active:      { color: T.success, bg: `${T.success}18`, border: `${T.success}28`, icon: FiCheckCircle },
  Sealed:      { color: T.text2,   bg: `${T.text2}12`,  border: `${T.text2}22`,   icon: FiLock        },
  Rotating:    { color: T.warning, bg: `${T.warning}18`,border: `${T.warning}28`, icon: FiRefreshCw   },
  Archived:    { color: T.text3,   bg: `${T.text3}12`,  border: `${T.text3}22`,   icon: FiArchive     },
  Compromised: { color: T.danger,  bg: `${T.danger}18`, border: `${T.danger}28`,  icon: FiAlertTriangle },
};

const TYPE_ICONS = {
  Credential: FiKey, Certificate: FiShield, Secret: FiEye,
  "Key Store": FiLock, "Data Archive": FiDatabase,
};

const TYPE_COLORS = {
  Credential: T.primary, Certificate: T.accent,
  Secret: T.secondary, "Key Store": T.warning, "Data Archive": T.text2,
};

function HealthBar({ pct }) {
  const color = pct >= 90 ? T.success : pct >= 70 ? T.warning : T.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: `${color}20`, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", borderRadius: 3, background: color }}
        />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 600, minWidth: 30 }}>{pct}%</span>
    </div>
  );
}

function VaultCard({ vault, index, onClick }) {
  const sm = STATUS_META[vault.status];
  const TypeIcon = TYPE_ICONS[vault.type] || FiDatabase;
  const typeColor = TYPE_COLORS[vault.type];
  const encColor = ENCRYPTION_ALGOS[vault.encryption] || T.text2;
  const isCompromised = vault.status === "Compromised";

  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="show" custom={index}
      whileHover={{ y: -5, transition: { duration: 0.22 } }}
      onClick={() => onClick(vault)}
      style={{
        ...glassCard(),
        padding: "20px", cursor: "pointer", position: "relative", overflow: "hidden",
        boxShadow: isCompromised ? `0 0 0 1px ${T.danger}44, 0 8px 32px ${T.danger}18` : "none",
        transition: "box-shadow 0.3s",
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 120, height: 120,
        borderRadius: "50%", background: isCompromised ? T.dangerGlow : `${typeColor}18`,
        filter: "blur(30px)", pointerEvents: "none",
      }} />

      {isCompromised && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${T.danger}, ${T.warning})`,
        }} />
      )}

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: `linear-gradient(135deg,${typeColor}28,${typeColor}10)`,
          border: `1px solid ${typeColor}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <TypeIcon size={19} color={typeColor} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
            color: sm.color, background: sm.bg, border: `1px solid ${sm.border}`,
          }}>
            {vault.status}
          </span>
          <motion.button
            whileHover={{ background: T.bg3 }} whileTap={{ scale: 0.88 }}
            onClick={e => e.stopPropagation()}
            style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", color: T.text3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiMoreHorizontal size={15} />
          </motion.button>
        </div>
      </div>

      {/* Name / ID */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text0, marginBottom: 2, letterSpacing: "-0.01em" }}>{vault.name}</div>
        <div style={{ fontSize: 11, color: T.text3, fontFamily: "monospace" }}>{vault.id}</div>
      </div>

      {/* Health */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.text3, marginBottom: 5 }}>Vault Health</div>
        <HealthBar pct={vault.health} />
      </div>

      {/* Meta grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 0", marginBottom: 14 }}>
        {[
          { label: "Keys", val: vault.keys },
          { label: "Size", val: vault.size },
          { label: "Region", val: vault.region },
          { label: "Shared", val: vault.shared ? `${vault.shared} users` : "Private" },
        ].map(m => (
          <div key={m.label}>
            <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</div>
            <div style={{ fontSize: 12, color: T.text1, fontWeight: 500, marginTop: 2 }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ paddingTop: 12, borderTop: `1px solid ${T.glassBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10, color: encColor, background: `${encColor}15`, border: `1px solid ${encColor}28`, padding: "2px 7px", borderRadius: 4, fontWeight: 600, fontFamily: "monospace" }}>
            {vault.encryption}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <FiClock size={11} color={T.text3} />
          <span style={{ fontSize: 11, color: T.text3 }}>{vault.lastAccess}</span>
        </div>
      </div>
    </motion.div>
  );
}

function VaultRow({ vault, index, onClick, selected, onSelect }) {
  const sm = STATUS_META[vault.status];
  const TypeIcon = TYPE_ICONS[vault.type] || FiDatabase;
  const typeColor = TYPE_COLORS[vault.type];
  const encColor = ENCRYPTION_ALGOS[vault.encryption] || T.text2;

  return (
    <motion.div
      key={vault.id} layout
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: index * 0.03 } }}
      whileHover={{ background: "rgba(255,255,255,0.026)" }}
      onClick={() => onClick(vault)}
      style={{
        display: "flex", alignItems: "center", padding: "13px 20px",
        borderBottom: `1px solid ${T.glassBorder}`, cursor: "pointer",
        background: selected ? `${T.primary}08` : "transparent",
        transition: "background 0.15s",
      }}
    >
      <div style={{ width: 32, marginRight: 12, flexShrink: 0 }} onClick={e => { e.stopPropagation(); onSelect(vault.id); }}>
        <input type="checkbox" checked={selected} onChange={() => {}} style={{ cursor: "pointer", accentColor: T.primary }} />
      </div>

      <div style={{ flex: 2.4, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${typeColor}18`, border: `1px solid ${typeColor}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <TypeIcon size={15} color={typeColor} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text0 }}>{vault.name}</div>
          <div style={{ fontSize: 11, color: T.text3, fontFamily: "monospace" }}>{vault.id}</div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, color: sm.color, background: sm.bg, border: `1px solid ${sm.border}` }}>{vault.status}</span>
      </div>

      <div style={{ flex: 1, fontSize: 12, color: T.text2 }}>{vault.type}</div>

      <div style={{ flex: 0.8 }}>
        <span style={{ fontSize: 11, color: encColor, background: `${encColor}15`, border: `1px solid ${encColor}25`, padding: "2px 7px", borderRadius: 4, fontWeight: 600, fontFamily: "monospace" }}>{vault.encryption}</span>
      </div>

      <div style={{ flex: 0.6, fontSize: 13, color: T.text1, fontVariantNumeric: "tabular-nums" }}>{vault.keys}</div>

      <div style={{ flex: 0.9 }}>
        <HealthBar pct={vault.health} />
      </div>

      <div style={{ flex: 1, fontSize: 12, color: T.text2 }}>{vault.region}</div>

      <div style={{ flex: 0.9, fontSize: 12, color: T.text3 }}>{vault.lastAccess}</div>

      <div style={{ width: 32, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <motion.button whileHover={{ background: T.bg3 }} whileTap={{ scale: 0.88 }}
          style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", color: T.text3, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FiMoreHorizontal size={15} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function VaultDrawer({ vault, onClose }) {
  const [tab, setTab] = useState("overview");
  if (!vault) return null;
  const sm = STATUS_META[vault.status];
  const TypeIcon = TYPE_ICONS[vault.type] || FiDatabase;
  const typeColor = TYPE_COLORS[vault.type];
  const encColor = ENCRYPTION_ALGOS[vault.encryption] || T.text2;
  const TABS = ["overview", "keys", "access", "audit"];

  return (
    <AnimatePresence>
      <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40, backdropFilter: "blur(5px)" }} />

      <motion.div key="dr"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 310, damping: 34 }}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 420, zIndex: 50,
          background: T.bg1, borderLeft: `1px solid ${T.glassBorder}`,
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Drawer header */}
        <div style={{ padding: "22px 22px 0", borderBottom: `1px solid ${T.glassBorder}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${typeColor}22`, border: `1px solid ${typeColor}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TypeIcon size={17} color={typeColor} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>{vault.name}</div>
                <div style={{ fontSize: 11, color: T.text3, fontFamily: "monospace" }}>{vault.id}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.text3, padding: 4 }}>
              <FiX size={18} />
            </button>
          </div>

          <div style={{ display: "flex", gap: 4, paddingBottom: 0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  padding: "7px 14px", fontSize: 12, fontWeight: 500, border: "none",
                  background: "transparent", cursor: "pointer", textTransform: "capitalize",
                  color: tab === t ? T.text0 : T.text3,
                  borderBottom: `2px solid ${tab === t ? T.primary : "transparent"}`,
                  transition: "all 0.2s",
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {tab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, color: sm.color, background: sm.bg, border: `1px solid ${sm.border}` }}>{vault.status}</span>
                <span style={{ fontSize: 12, color: encColor, background: `${encColor}15`, border: `1px solid ${encColor}28`, padding: "4px 10px", borderRadius: 4, fontWeight: 600, fontFamily: "monospace" }}>{vault.encryption}</span>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: T.text3, marginBottom: 6 }}>Vault Health</div>
                <HealthBar pct={vault.health} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Type", val: vault.type },
                  { label: "Region", val: vault.region },
                  { label: "Owner", val: vault.owner },
                  { label: "Keys", val: `${vault.keys} items` },
                  { label: "Size", val: vault.size },
                  { label: "Shared With", val: vault.shared ? `${vault.shared} users` : "Private" },
                  { label: "Created", val: vault.created },
                  { label: "Last Access", val: vault.lastAccess },
                ].map(r => (
                  <div key={r.label} style={{ padding: "10px 12px", borderRadius: T.radiusSm, background: T.bg2, border: `1px solid ${T.glassBorder}` }}>
                    <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 13, color: T.text1, fontWeight: 500 }}>{r.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 12, color: T.text3, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: FiEye, label: "View Contents", color: T.primary },
                  { icon: FiEdit2, label: "Edit Vault", color: T.secondary },
                  { icon: FiKey, label: "Rotate Encryption Keys", color: T.accent },
                  { icon: FiCopy, label: "Clone Vault", color: T.text2 },
                  { icon: vault.status === "Sealed" ? FiUnlock : FiLock, label: vault.status === "Sealed" ? "Unseal Vault" : "Seal Vault", color: T.warning },
                  { icon: FiTrash2, label: "Delete Vault", color: T.danger },
                ].map(a => (
                  <motion.button key={a.label} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: T.radiusSm, background: `${a.color}10`, border: `1px solid ${a.color}25`, color: a.color, fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left" }}>
                    <a.icon size={14} /> {a.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "keys" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text0 }}>{vault.keys} Encryption Keys</div>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ ...glassCard(), padding: "7px 12px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: T.primary, fontSize: 12, border: `1px solid ${T.primary}33`, background: `${T.primary}12` }}>
                  <FiPlus size={12} /> Add Key
                </motion.button>
              </div>
              {Array.from({ length: Math.min(6, vault.keys) }, (_, i) => {
                const ages = ["2d ago", "5d ago", "12d ago", "1mo ago", "3mo ago", "6mo ago"];
                const algos = ["AES-256-GCM", "AES-256-CBC", "RSA-4096", "ChaCha20-Poly1305", "ECDSA-521", "AES-256-GCM"];
                const statuses = [T.success, T.success, T.success, T.warning, T.success, T.text3];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: T.radiusSm, background: T.bg2, border: `1px solid ${T.glassBorder}`, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${statuses[i]}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FiKey size={13} color={statuses[i]} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: T.text1, fontWeight: 500, fontFamily: "monospace" }}>KEY-{String(i + 1).padStart(4, "0")}</div>
                      <div style={{ fontSize: 11, color: T.text3 }}>{algos[i]}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: T.text3 }}>Rotated</div>
                      <div style={{ fontSize: 12, color: statuses[i] }}>{ages[i]}</div>
                    </div>
                  </div>
                );
              })}
              {vault.keys > 6 && <div style={{ textAlign: "center", fontSize: 12, color: T.text3, marginTop: 8 }}>+{vault.keys - 6} more keys</div>}
            </motion.div>
          )}

          {tab === "access" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text0, marginBottom: 16 }}>Access Control</div>
              {[
                { name: vault.owner, role: "Owner", color: T.danger },
                ...Array.from({ length: Math.min(vault.shared, 4) }, (_, i) => ({
                  name: ["James Rivera", "Priya Mehta", "Elena Volkov", "Chloe Dupont"][i],
                  role: ["Read/Write", "Read Only", "Read Only", "Auditor"][i],
                  color: [T.primary, T.text2, T.text2, T.accent][i],
                })),
              ].map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: T.radiusSm, background: T.bg2, border: `1px solid ${T.glassBorder}`, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${u.color},${u.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {u.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: T.text1, fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: T.text3 }}>{u.role}</div>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} style={{ fontSize: 11, color: T.danger, background: `${T.danger}12`, border: `1px solid ${T.danger}28`, padding: "3px 8px", borderRadius: 6, cursor: "pointer" }}>
                    Revoke
                  </motion.button>
                </div>
              ))}
              <motion.button whileHover={{ scale: 1.02 }} style={{ width: "100%", marginTop: 8, padding: "10px", background: `${T.primary}12`, border: `1px solid ${T.primary}28`, borderRadius: T.radiusSm, color: T.primary, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <FiPlus size={13} /> Grant Access
              </motion.button>
            </motion.div>
          )}

          {tab === "audit" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text0, marginBottom: 16 }}>Audit Trail</div>
              {[
                { action: "Key rotated", actor: "System", time: "2h ago", color: T.accent },
                { action: "Vault accessed", actor: vault.owner, time: vault.lastAccess, color: T.success },
                { action: "Permission granted", actor: "Admin", time: "1d ago", color: T.primary },
                { action: "Encryption updated", actor: "System", time: "3d ago", color: T.secondary },
                { action: "Vault created", actor: vault.owner, time: vault.created, color: T.text2 },
              ].map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, position: "relative" }}>
                  {i < 4 && <div style={{ position: "absolute", left: 15, top: 28, bottom: -16, width: 1, background: T.glassBorder }} />}
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${e.color}18`, border: `1px solid ${e.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FiActivity size={12} color={e.color} />
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ fontSize: 13, color: T.text1, fontWeight: 500 }}>{e.action}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{e.actor} · {e.time}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Vaults() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedVault, setSelectedVault] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const PER_PAGE = viewMode === "grid" ? 9 : 8;

  const toggleSelect = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = VAULTS.filter(v =>
    (v.name.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === "All Types" || v.type === typeFilter) &&
    (statusFilter === "All Status" || v.status === statusFilter)
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const STATS = [
    { label: "Total Vaults", val: VAULTS.length, color: T.primary, icon: FiDatabase },
    { label: "Active", val: VAULTS.filter(v => v.status === "Active").length, color: T.success, icon: FiUnlock },
    { label: "Sealed", val: VAULTS.filter(v => v.status === "Sealed").length, color: T.text2, icon: FiLock },
    { label: "Compromised", val: VAULTS.filter(v => v.status === "Compromised").length, color: T.danger, icon: FiAlertTriangle },
  ];

  const LIST_COLS = [
    { label: "Vault", flex: 2.4 }, { label: "Status", flex: 1 }, { label: "Type", flex: 1 },
    { label: "Encryption", flex: 0.8 }, { label: "Keys", flex: 0.6 }, { label: "Health", flex: 0.9 },
    { label: "Region", flex: 1 }, { label: "Last Access", flex: 0.9 },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "28px 32px 48px", fontFamily: "'Inter','SF Pro Display',system-ui,sans-serif", color: T.text0 }}>

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text0, margin: 0, letterSpacing: "-0.02em" }}>Vault Browser</h1>
          <p style={{ margin: "4px 0 0", color: T.text2, fontSize: 14 }}>Manage and monitor all encrypted vaults</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[{ icon: FiDownload, label: "Export" }, { icon: FiRefreshCw, label: "Sync" }].map(a => (
            <motion.button key={a.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ ...glassCard(), padding: "9px 16px", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", color: T.text1, fontSize: 13, fontWeight: 500 }}>
              <a.icon size={14} /> {a.label}
            </motion.button>
          ))}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: "9px 18px", borderRadius: T.radiusSm, display: "flex", alignItems: "center", gap: 7, background: `linear-gradient(135deg,${T.primary},${T.accent})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 20px ${T.primary}44` }}>
            <FiPlus size={14} /> New Vault
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {STATS.map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} initial="hidden" animate="show" custom={i + 1}
            style={{ ...glassCard(), padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <s.icon size={17} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text0, letterSpacing: "-0.02em" }}>{s.val}</div>
              <div style={{ fontSize: 12, color: T.text3 }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}
        style={{ ...glassCard(), padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <FiSearch size={14} color={T.text3} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search vault name or ID…"
            style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: T.radiusSm, background: T.bg2, border: `1px solid ${T.glassBorder}`, color: T.text0, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>

        {[{ val: typeFilter, set: v => { setTypeFilter(v); setPage(1); }, opts: VAULT_TYPES },
          { val: statusFilter, set: v => { setStatusFilter(v); setPage(1); }, opts: VAULT_STATUSES }].map((sel, i) => (
          <select key={i} value={sel.val} onChange={e => sel.set(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: T.radiusSm, background: T.bg2, border: `1px solid ${T.glassBorder}`, color: T.text1, fontSize: 13, cursor: "pointer", outline: "none" }}>
            {sel.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}

        <div style={{ display: "flex", gap: 4, marginLeft: "auto", background: T.bg2, borderRadius: T.radiusSm, border: `1px solid ${T.glassBorder}`, padding: 3 }}>
          {[{ mode: "grid", icon: FiGrid }, { mode: "list", icon: FiList }].map(v => (
            <motion.button key={v.mode} whileTap={{ scale: 0.9 }} onClick={() => setViewMode(v.mode)}
              style={{ width: 32, height: 32, borderRadius: 7, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === v.mode ? T.primary : "transparent", color: viewMode === v.mode ? "#fff" : T.text3, transition: "all 0.2s" }}>
              <v.icon size={15} />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Compromised Alert */}
      {filtered.some(v => v.status === "Compromised") && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ ...glassCard(), padding: "12px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, background: `${T.danger}10`, border: `1px solid ${T.danger}35` }}>
          <FiAlertTriangle size={16} color={T.danger} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: T.text0, fontWeight: 600 }}>Compromised vault detected — </span>
            <span style={{ fontSize: 13, color: T.text2 }}>VLT-0091 requires immediate attention. Rotate keys and revoke access.</span>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} style={{ padding: "6px 14px", borderRadius: T.radiusSm, background: T.danger, border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Remediate
          </motion.button>
        </motion.div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 18, marginBottom: 22 }}>
          <AnimatePresence mode="popLayout">
            {paginated.map((vault, i) => (
              <VaultCard key={vault.id} vault={vault} index={i} onClick={setSelectedVault} />
            ))}
          </AnimatePresence>
          {paginated.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0" }}>
              <FiDatabase size={36} color={T.text3} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: T.text2 }}>No vaults match your filters</div>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6} style={{ ...glassCard(), marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", borderBottom: `1px solid ${T.glassBorder}` }}>
            <div style={{ width: 32, marginRight: 12, flexShrink: 0 }}>
              <input type="checkbox" style={{ cursor: "pointer", accentColor: T.primary }}
                checked={paginated.length > 0 && paginated.every(v => selected.has(v.id))}
                onChange={() => {
                  if (paginated.every(v => selected.has(v.id))) setSelected(new Set());
                  else setSelected(new Set(paginated.map(v => v.id)));
                }} />
            </div>
            {LIST_COLS.map(col => (
              <div key={col.label} style={{ flex: col.flex }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{col.label}</span>
              </div>
            ))}
            <div style={{ width: 32 }} />
          </div>
          <AnimatePresence mode="popLayout">
            {paginated.map((vault, i) => (
              <VaultRow key={vault.id} vault={vault} index={i} onClick={setSelectedVault}
                selected={selected.has(vault.id)} onSelect={toggleSelect} />
            ))}
          </AnimatePresence>
          {paginated.length === 0 && (
            <div style={{ padding: "48px 0", textAlign: "center" }}>
              <FiDatabase size={32} color={T.text3} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: T.text2 }}>No vaults match your filters</div>
            </div>
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12, color: T.text3 }}>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} vaults
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <motion.button key={p} whileTap={{ scale: 0.9 }} onClick={() => setPage(p)}
                style={{ width: 32, height: 32, borderRadius: 8, background: page === p ? `linear-gradient(135deg,${T.primary},${T.accent})` : T.bg2, border: `1px solid ${page === p ? T.primary : T.glassBorder}`, color: page === p ? "#fff" : T.text2, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: page === p ? `0 0 14px ${T.primary}44` : "none" }}>
                {p}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <VaultDrawer vault={selectedVault} onClose={() => setSelectedVault(null)} />

      <style>{`
        select option { background: ${T.bg2}; color: ${T.text1}; }
        @media (max-width: 1024px) { .vaults-stats { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 768px) { .vaults-stats { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  );
}
