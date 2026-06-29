import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell, FiShield, FiKey, FiAlertTriangle, FiUser, FiActivity,
  FiCheck, FiCheckCircle, FiX, FiFilter, FiSearch, FiTrash2,
  FiEye, FiRefreshCw, FiSettings, FiChevronRight, FiLock,
  FiUnlock, FiGlobe, FiZap, FiClock, FiArchive, FiInbox,
  FiAlertCircle, FiInfo, FiStar, FiServer, FiDownload,
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
  accentDim:  "rgba(79,110,247,0.14)",
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

// ─── Notification data ─────────────────────────────────────────────────────────
let _id = 1;
const mkId = () => _id++;

const INITIAL_NOTIFICATIONS = [
  {
    id: mkId(), type: "threat", priority: "critical", read: false, pinned: true,
    icon: FiAlertTriangle, color: T.rose,
    title: "Brute-force attack detected",
    body: "203 failed login attempts from IP 203.0.113.42 against vault Prod Credentials in the last 10 minutes. The source IP has been automatically blocked.",
    time: "2 min ago", ts: Date.now() - 2 * 60000,
    actions: ["View threat", "Unblock IP"],
    tag: "Threat Intelligence",
  },
  {
    id: mkId(), type: "key", priority: "high", read: false, pinned: false,
    icon: FiKey, color: T.amber,
    title: "3 keys approaching rotation deadline",
    body: "TLS certificate for api.securevault.io, HMAC signing key, and OAuth client secret are due for rotation within 7 days. Enable auto-rotate to avoid service disruption.",
    time: "18 min ago", ts: Date.now() - 18 * 60000,
    actions: ["Rotate now", "Set auto-rotate"],
    tag: "Key Management",
  },
  {
    id: mkId(), type: "access", priority: "medium", read: false, pinned: false,
    icon: FiUnlock, color: T.accent,
    title: "New device sign-in",
    body: "Your account was accessed from a new device: Windows PC running Edge 122 in San Francisco, CA. If this wasn't you, revoke the session immediately.",
    time: "1 hr ago", ts: Date.now() - 60 * 60000,
    actions: ["It was me", "Revoke session"],
    tag: "Account Security",
  },
  {
    id: mkId(), type: "system", priority: "medium", read: true, pinned: false,
    icon: FiServer, color: T.cyan,
    title: "Vault latency spike — Data Archive",
    body: "Average read latency on Data Archive vault increased to 142ms (threshold: 100ms) for 8 minutes starting at 14:22 UTC. The issue has resolved automatically.",
    time: "3 hr ago", ts: Date.now() - 3 * 3600000,
    actions: ["View metrics"],
    tag: "System Health",
  },
  {
    id: mkId(), type: "user", priority: "low", read: true, pinned: false,
    icon: FiUser, color: T.violet,
    title: "New user added to workspace",
    body: "grace.kim@finco.io has joined SecureVault as an Auditor. They have read-only access to the Compliance vault. Review their permissions in the Users panel.",
    time: "Yesterday", ts: Date.now() - 26 * 3600000,
    actions: ["View user"],
    tag: "User Management",
  },
  {
    id: mkId(), type: "compliance", priority: "low", read: true, pinned: false,
    icon: FiCheckCircle, color: T.emerald,
    title: "SOC 2 Type II audit report ready",
    body: "Your monthly SOC 2 compliance report has been generated for May 2025. Score: 98/100. Download the full report or share it directly with your auditor.",
    time: "2 days ago", ts: Date.now() - 2 * 86400000,
    actions: ["Download report", "Share"],
    tag: "Compliance",
  },
  {
    id: mkId(), type: "key", priority: "low", read: true, pinned: false,
    icon: FiKey, color: T.emerald,
    title: "Auto-rotation completed — TLS certificates",
    body: "5 TLS certificates were automatically rotated by the scheduled policy at 02:00 UTC. All certificates are now valid for 90 days. No action required.",
    time: "3 days ago", ts: Date.now() - 3 * 86400000,
    actions: ["View keys"],
    tag: "Key Management",
  },
  {
    id: mkId(), type: "threat", priority: "high", read: true, pinned: false,
    icon: FiAlertTriangle, color: T.rose,
    title: "Credential in public repository detected",
    body: "A GitHub Actions secret matching a pattern from your API Key Store was detected in a public repository. The key has been revoked automatically. Create a replacement now.",
    time: "4 days ago", ts: Date.now() - 4 * 86400000,
    actions: ["Create replacement", "View details"],
    tag: "Threat Intelligence",
  },
  {
    id: mkId(), type: "system", priority: "low", read: true, pinned: false,
    icon: FiZap, color: T.cyan,
    title: "Splunk integration reconnected",
    body: "The Splunk SIEM integration briefly disconnected at 09:14 UTC and automatically reconnected at 09:17 UTC. Audit log streaming has resumed with no data loss.",
    time: "5 days ago", ts: Date.now() - 5 * 86400000,
    actions: ["View integration"],
    tag: "Integrations",
  },
  {
    id: mkId(), type: "access", priority: "low", read: true, pinned: false,
    icon: FiGlobe, color: T.accent,
    title: "IP restriction updated",
    body: "Your approved IP allowlist was updated by admin@securevault.io. Two new CIDR ranges were added: 10.0.0.0/8 and 172.16.0.0/12. Sessions outside these ranges will be blocked.",
    time: "6 days ago", ts: Date.now() - 6 * 86400000,
    actions: ["Review settings"],
    tag: "Account Security",
  },
];

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const FILTER_TYPES = [
  { id: "all",        label: "All",         icon: FiInbox },
  { id: "threat",     label: "Threats",     icon: FiAlertTriangle },
  { id: "key",        label: "Keys",        icon: FiKey },
  { id: "access",     label: "Access",      icon: FiUnlock },
  { id: "system",     label: "System",      icon: FiServer },
  { id: "user",       label: "Users",       icon: FiUser },
  { id: "compliance", label: "Compliance",  icon: FiCheckCircle },
];

const PRIORITY_META = {
  critical: { label: "Critical", color: T.rose,    bg: `${T.rose}14`   },
  high:     { label: "High",     color: T.amber,   bg: `${T.amber}14`  },
  medium:   { label: "Medium",   color: T.accent,  bg: `${T.accentDim}`},
  low:      { label: "Low",      color: T.textSec, bg: `${T.surface}`  },
};

// ─── Pulsing dot ───────────────────────────────────────────────────────────────
function PulseDot({ color }) {
  return (
    <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
      <motion.div
        style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `1.5px solid ${color}` }}
        animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Notification Card ─────────────────────────────────────────────────────────
function NotifCard({ notif, onRead, onDismiss, onPin, onAction, isExpanded, onToggle }) {
  const pm = PRIORITY_META[notif.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      style={{
        borderRadius: 14,
        border: `1px solid ${notif.read ? T.border : `${notif.color}40`}`,
        background: notif.read
          ? `linear-gradient(135deg, ${T.surfaceAlt} 0%, ${T.surface} 100%)`
          : `linear-gradient(135deg, ${notif.color}08 0%, ${T.surface} 60%)`,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* unread left stripe */}
      {!notif.read && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 3, background: notif.color, borderRadius: "14px 0 0 14px",
        }} />
      )}

      {/* pinned star */}
      {notif.pinned && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          color: T.amber, opacity: 0.7,
        }}>
          <FiStar size={12} fill={T.amber} />
        </div>
      )}

      {/* Main row */}
      <div
        onClick={onToggle}
        style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px" }}
      >
        {/* Icon */}
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: `${notif.color}18`, border: `1px solid ${notif.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginTop: 1,
        }}>
          <notif.icon size={16} color={notif.color} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: notif.read ? 500 : 700, color: T.textPri }}>
              {notif.title}
            </span>
            <span style={{
              padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 700,
              background: pm.bg, color: pm.color,
              border: `1px solid ${pm.color}28`,
            }}>{pm.label}</span>
            <span style={{
              padding: "2px 7px", borderRadius: 5, fontSize: 10,
              background: T.surface, color: T.textMut,
              border: `1px solid ${T.border}`,
            }}>{notif.tag}</span>
          </div>
          <p style={{
            margin: 0, fontSize: 12, color: T.textSec, lineHeight: 1.6,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: isExpanded ? "unset" : 2,
            WebkitBoxOrient: "vertical",
          }}>
            {notif.body}
          </p>
          {!notif.read && (
            <div style={{ marginTop: 5 }}>
              <PulseDot color={notif.color} />
            </div>
          )}
        </div>

        {/* Time + chevron */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: T.textMut, whiteSpace: "nowrap" }}>{notif.time}</span>
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <FiChevronRight size={14} color={T.textMut} />
          </motion.div>
        </div>
      </div>

      {/* Expanded actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "0 18px 16px 18px",
              borderTop: `1px solid ${T.border}`,
              paddingTop: 14,
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            }}>
              {notif.actions.map((a, i) => (
                <motion.button key={a}
                  whileTap={{ scale: 0.95 }}
                  onClick={e => { e.stopPropagation(); onAction(notif.id, a); }}
                  style={{
                    padding: "7px 16px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    border: i === 0 ? "none" : `1px solid ${T.border}`,
                    background: i === 0 ? notif.color : "transparent",
                    color: i === 0 ? "#fff" : T.textSec,
                    boxShadow: i === 0 ? `0 4px 14px ${notif.color}40` : "none",
                  }}>
                  {a}
                </motion.button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                {!notif.read && (
                  <button onClick={e => { e.stopPropagation(); onRead(notif.id); }} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                    background: "transparent", color: T.textSec, fontSize: 11, cursor: "pointer",
                  }}>
                    <FiEye size={11} /> Mark read
                  </button>
                )}
                <button onClick={e => { e.stopPropagation(); onPin(notif.id); }} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                  background: "transparent", color: notif.pinned ? T.amber : T.textSec, fontSize: 11, cursor: "pointer",
                }}>
                  <FiStar size={11} fill={notif.pinned ? T.amber : "none"} />
                  {notif.pinned ? "Unpin" : "Pin"}
                </button>
                <button onClick={e => { e.stopPropagation(); onDismiss(notif.id); }} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.rose}28`,
                  background: `${T.rose}0c`, color: T.rose, fontSize: 11, cursor: "pointer",
                }}>
                  <FiTrash2 size={11} /> Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      onAnimationComplete={() => setTimeout(onDone, 2200)}
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 9999,
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 20px", borderRadius: 12,
        background: `${T.emerald}18`, border: `1px solid ${T.emerald}40`,
        color: T.emerald, fontSize: 13, fontWeight: 600,
        backdropFilter: "blur(16px)",
        boxShadow: `0 8px 32px ${T.emerald}20`,
      }}
    >
      <FiCheck size={14} /> {msg}
    </motion.div>
  );
}

// ─── Notifications Page ────────────────────────────────────────────────────────
export default function Notifications() {
  const [notifs, setNotifs]       = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [showUnread, setShowUnread] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast]         = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const notify = msg => setToast(msg);

  // ── Derived ────────────────────────────────────────────────────────────────
  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = notifs
    .filter(n => filter === "all" || n.type === filter)
    .filter(n => !showUnread || !n.read)
    .filter(n => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || n.tag.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });

  // ── Actions ────────────────────────────────────────────────────────────────
  const markRead    = id => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss     = id => { setNotifs(ns => ns.filter(n => n.id !== id)); notify("Notification dismissed"); };
  const pin         = id => setNotifs(ns => ns.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const markAllRead = () => { setNotifs(ns => ns.map(n => ({ ...n, read: true }))); notify("All notifications marked as read"); };
  const clearAll    = () => { setNotifs([]); notify("All notifications cleared"); };
  const handleAction = (id, action) => {
    markRead(id);
    notify(`"${action}" — opening…`);
  };
  const toggle = id => {
    setExpandedId(prev => prev === id ? null : id);
    markRead(id);
  };

  // ── Summary stats ──────────────────────────────────────────────────────────
  const summary = [
    { label: "Unread",   val: unreadCount,                           color: T.rose,   icon: FiBell },
    { label: "Critical", val: notifs.filter(n => n.priority === "critical").length, color: T.rose,   icon: FiAlertTriangle },
    { label: "High",     val: notifs.filter(n => n.priority === "high").length,     color: T.amber,  icon: FiAlertCircle },
    { label: "Total",    val: notifs.length,                         color: T.accent, icon: FiInbox },
  ];

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay },
  });

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <motion.div {...fadeUp(0)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: `linear-gradient(135deg, ${T.accent}30, ${T.violet}18)`,
              border: `1px solid ${T.accent}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FiBell size={18} color={T.accent} />
            </div>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{
                  position: "absolute", top: -5, right: -5,
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: T.rose, color: "#fff",
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 4px", border: `2px solid ${T.bg}`,
                }}
              >{unreadCount}</motion.div>
            )}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: T.textPri }}>Notifications</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textSec }}>
              {unreadCount > 0 ? `${unreadCount} unread · ` : "All caught up · "}{notifs.length} total
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={markAllRead} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 10, border: `1px solid ${T.border}`,
            background: T.surfaceAlt, color: T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            <FiCheckCircle size={13} /> Mark all read
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={clearAll} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 10,
            border: `1px solid ${T.rose}28`, background: `${T.rose}0c`,
            color: T.rose, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            <FiTrash2 size={13} /> Clear all
          </motion.button>
        </div>
      </motion.div>

      {/* ── Summary stat row ── */}
      <motion.div {...fadeUp(0.05)}
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        {summary.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06 }}
            whileHover={{ y: -2, borderColor: T.borderHov }}
            style={{
              ...card({ padding: "16px 20px" }),
              display: "flex", alignItems: "center", gap: 14,
            }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${s.color}18`, border: `1px solid ${s.color}28`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <s.icon size={15} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.textPri }}>{s.val}</div>
              <div style={{ fontSize: 11, color: T.textMut }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Main layout: sidebar + feed ── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>

        {/* ── Type filter sidebar ── */}
        <motion.div {...fadeUp(0.1)} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ margin: "0 0 10px 4px", fontSize: 11, fontWeight: 700, color: T.textMut,
            textTransform: "uppercase", letterSpacing: "0.09em" }}>Filter by type</p>
          {FILTER_TYPES.map(f => {
            const count = f.id === "all"
              ? notifs.length
              : notifs.filter(n => n.type === f.id).length;
            const unread = f.id === "all"
              ? notifs.filter(n => !n.read).length
              : notifs.filter(n => n.type === f.id && !n.read).length;
            const active = filter === f.id;
            return (
              <motion.button key={f.id}
                onClick={() => setFilter(f.id)}
                whileHover={{ x: 2 }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: active ? T.accentDim : "transparent",
                  borderLeft: `2px solid ${active ? T.accent : "transparent"}`,
                  textAlign: "left", width: "100%", transition: "all 0.15s",
                }}>
                <f.icon size={14} color={active ? T.accent : T.textMut} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 700 : 500,
                  color: active ? T.accent : T.textPri }}>{f.label}</span>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {unread > 0 && (
                    <span style={{
                      minWidth: 16, height: 16, borderRadius: 8,
                      background: T.rose, color: "#fff",
                      fontSize: 9, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
                    }}>{unread}</span>
                  )}
                  <span style={{ fontSize: 11, color: T.textMut }}>{count}</span>
                </div>
              </motion.button>
            );
          })}

          {/* Unread toggle */}
          <div style={{
            marginTop: 16, padding: "10px 12px", borderRadius: 10,
            background: T.surface, border: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, color: T.textSec, fontWeight: 500 }}>Unread only</span>
            <motion.button
              onClick={() => setShowUnread(v => !v)}
              style={{
                width: 38, height: 21, borderRadius: 11, border: "none", cursor: "pointer",
                background: showUnread ? T.accent : T.surfaceAlt, position: "relative",
                boxShadow: showUnread ? `0 0 10px ${T.accent}50` : "none",
                transition: "background 0.2s",
              }}
              whileTap={{ scale: 0.92 }}
            >
              <motion.div
                animate={{ x: showUnread ? 19 : 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                style={{
                  position: "absolute", top: 2.5, width: 16, height: 16,
                  borderRadius: "50%", background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              />
            </motion.button>
          </div>

          {/* Quick actions */}
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={() => notify("Notification settings opened")} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
              borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt,
              color: T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              <FiSettings size={13} /> Notification settings
            </button>
            <button onClick={() => notify("Exporting notification log…")} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
              borderRadius: 10, border: `1px solid ${T.border}`, background: T.surfaceAlt,
              color: T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              <FiDownload size={13} /> Export log
            </button>
          </div>
        </motion.div>

        {/* ── Notification feed ── */}
        <motion.div {...fadeUp(0.12)}>
          {/* Search bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: T.surfaceAlt,
            border: `1px solid ${searchFocused ? T.accent : T.border}`,
            borderRadius: 12, padding: "10px 16px", marginBottom: 16,
            boxShadow: searchFocused ? `0 0 0 3px ${T.accentDim}` : "none",
            transition: "border-color 0.18s, box-shadow 0.18s",
          }}>
            <FiSearch size={15} color={T.textMut} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Search notifications…"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: T.textPri, fontSize: 13, fontFamily: "inherit",
              }}
            />
            {search && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
                onClick={() => setSearch("")} style={{
                  background: "transparent", border: "none", color: T.textMut,
                  cursor: "pointer", display: "flex",
                }}>
                <FiX size={14} />
              </motion.button>
            )}
          </div>

          {/* Results info */}
          {(search || filter !== "all" || showUnread) && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ margin: "0 0 12px", fontSize: 12, color: T.textMut }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {filter !== "all" ? ` in ${filter}` : ""}
              {showUnread ? " · unread only" : ""}
              {search ? ` matching "${search}"` : ""}
            </motion.p>
          )}

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    ...card({ padding: "48px 32px" }),
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 14, textAlign: "center",
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: T.surfaceAlt, border: `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FiCheckCircle size={24} color={T.emerald} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.textPri }}>All clear</p>
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textSec }}>
                      {search ? "No notifications match your search." : "No notifications in this category."}
                    </p>
                  </div>
                  {search && (
                    <button onClick={() => setSearch("")} style={{
                      padding: "8px 18px", borderRadius: 9, border: `1px solid ${T.border}`,
                      background: T.surfaceAlt, color: T.textSec, fontSize: 12,
                      fontWeight: 600, cursor: "pointer",
                    }}>Clear search</button>
                  )}
                </motion.div>
              ) : (
                filtered.map(n => (
                  <NotifCard
                    key={n.id}
                    notif={n}
                    onRead={markRead}
                    onDismiss={dismiss}
                    onPin={pin}
                    onAction={handleAction}
                    isExpanded={expandedId === n.id}
                    onToggle={() => toggle(n.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast key={toast} msg={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
