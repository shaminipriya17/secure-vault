import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser, FiShield, FiActivity, FiKey, FiAward, FiEdit2,
  FiCheck, FiCamera, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiGlobe, FiGithub, FiLinkedin, FiClock, FiLock, FiUnlock,
  FiAlertTriangle, FiTrendingUp, FiEye, FiDownload, FiStar,
  FiZap, FiRefreshCw, FiCopy, FiChevronRight,
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

// ─── Activity sparkline data ───────────────────────────────────────────────────
const ACTIVITY_WEEKS = Array.from({ length: 52 }, (_, wi) =>
  Array.from({ length: 7 }, (_, di) => {
    const val = Math.random();
    return val < 0.3 ? 0 : val < 0.6 ? 1 : val < 0.82 ? 2 : val < 0.94 ? 3 : 4;
  })
);

const RECENT_ACTIONS = [
  { type: "access",  icon: FiUnlock,       color: T.accent,   label: "Accessed Prod Credentials vault",     time: "2 min ago",    detail: "Read · 3 keys" },
  { type: "key",     icon: FiKey,          color: T.emerald,  label: "Rotated TLS certificate",             time: "41 min ago",   detail: "auto-rotate policy" },
  { type: "threat",  icon: FiAlertTriangle,color: T.rose,     label: "Blocked brute-force attempt",         time: "2 hr ago",     detail: "IP 203.0.113.42" },
  { type: "access",  icon: FiUnlock,       color: T.accent,   label: "Accessed API Key Store",              time: "5 hr ago",     detail: "Read · 1 key" },
  { type: "admin",   icon: FiShield,       color: T.violet,   label: "Added user grace@finco.io",           time: "Yesterday",    detail: "Role: Auditor" },
  { type: "key",     icon: FiKey,          color: T.emerald,  label: "Created backup-svc API key",          time: "2 days ago",   detail: "read-write scope" },
  { type: "access",  icon: FiEye,          color: T.cyan,     label: "Exported audit log",                  time: "3 days ago",   detail: "CSV · 4,812 rows" },
  { type: "admin",   icon: FiShield,       color: T.violet,   label: "Enabled SOC 2 compliance mode",      time: "4 days ago",   detail: "Workspace setting" },
];

const CERTS = [
  { name: "Vault Security Specialist",  issuer: "SecureVault",    date: "Mar 2025", color: T.accent  },
  { name: "CISSP",                      issuer: "ISC²",           date: "Jan 2024", color: T.violet  },
  { name: "AWS Security Specialty",     issuer: "Amazon",         date: "Aug 2023", color: T.amber   },
];

const STATS = [
  { label: "Vaults managed",  value: "12",    icon: FiShield,      color: T.accent  },
  { label: "Keys rotated",    value: "847",   icon: FiKey,         color: T.emerald },
  { label: "Threats blocked", value: "23",    icon: FiAlertTriangle,color: T.rose   },
  { label: "Audit score",     value: "98%",   icon: FiStar,        color: T.amber   },
];

// ─── Activity Heatmap ──────────────────────────────────────────────────────────
function Heatmap() {
  const colors = ["transparent", `${T.accent}28`, `${T.accent}55`, `${T.accent}88`, T.accent];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const cellSize = 11, gap = 3;

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: gap, marginBottom: 6 }}>
        {ACTIVITY_WEEKS.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap }}>
            {week.map((level, di) => (
              <motion.div key={di}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (wi * 7 + di) * 0.0008, duration: 0.2 }}
                title={`Level ${level}`}
                style={{
                  width: cellSize, height: cellSize, borderRadius: 2,
                  background: level === 0 ? T.surface : colors[level],
                  border: `1px solid ${T.border}`,
                  cursor: "default",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {months.map(m => (
          <span key={m} style={{ fontSize: 9, color: T.textMut }}>{m}</span>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: T.textMut }}>Less</span>
        {colors.map((c, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: 2,
            background: c === "transparent" ? T.surface : c,
            border: `1px solid ${T.border}`,
          }} />
        ))}
        <span style={{ fontSize: 10, color: T.textMut }}>More</span>
      </div>
    </div>
  );
}

// ─── Inline edit field ─────────────────────────────────────────────────────────
function InlineEdit({ value, onChange, fontSize = 14, bold }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  function commit() { onChange(draft); setEditing(false); }
  return editing ? (
    <input
      autoFocus
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      style={{
        background: T.surface, border: `1px solid ${T.accent}`,
        borderRadius: 7, padding: "4px 10px", color: T.textPri,
        fontSize, fontWeight: bold ? 700 : 400, fontFamily: "inherit", outline: "none",
      }}
    />
  ) : (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      style={{
        fontSize, fontWeight: bold ? 700 : 400, color: T.textPri, cursor: "text",
        borderBottom: `1px dashed ${T.textMut}`, paddingBottom: 1,
      }}
    >{value}</span>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      onAnimationComplete={() => setTimeout(onDone, 2000)}
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 999,
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 18px", borderRadius: 12,
        background: `${T.emerald}18`, border: `1px solid ${T.emerald}40`,
        color: T.emerald, fontSize: 13, fontWeight: 600,
        backdropFilter: "blur(12px)",
      }}
    >
      <FiCheck size={14} /> {message}
    </motion.div>
  );
}

// ─── Profile Page ──────────────────────────────────────────────────────────────
export default function Profile() {
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("activity");
  const [avatarHov, setAvatarHov] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "Alexandra",
    lastName:  "Chen",
    title:     "Security Engineer",
    email:     "alex.chen@securevault.io",
    phone:     "+1 (212) 555-0184",
    location:  "New York, USA",
    timezone:  "EST (UTC−5)",
    website:   "alexchen.dev",
    bio:       "Platform security lead at SecureVault. Passionate about zero-trust architecture, secrets management, and building teams that take compliance seriously.",
    joined:    "January 2023",
    role:      "Admin",
    mfa:       true,
  });

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const notify = msg => setToast(msg);

  const TABS = [
    { id: "activity", label: "Activity" },
    { id: "security", label: "Security" },
    { id: "certs",    label: "Credentials" },
  ];

  const roleColor = { Admin: T.accent, "Security Engineer": T.violet, Auditor: T.cyan }[profile.role] || T.textSec;

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.38, delay },
  });

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Hero banner ── */}
      <motion.div {...fadeUp(0)} style={{
        ...card({ borderRadius: 20, overflow: "hidden", marginBottom: 20, position: "relative" }),
      }}>
        {/* Banner gradient stripe */}
        <div style={{
          height: 110,
          background: `linear-gradient(135deg, #1a2260 0%, #0f1635 40%, #1a1040 70%, #0f1228 100%)`,
          position: "relative", overflow: "hidden",
        }}>
          {/* Subtle mesh blobs */}
          {[
            { top: -30, left: "15%",  w: 160, color: T.accent  },
            { top: -20, left: "60%",  w: 120, color: T.violet  },
            { top: 10,  left: "85%",  w: 80,  color: T.cyan    },
          ].map((b, i) => (
            <div key={i} style={{
              position: "absolute", top: b.top, left: b.left,
              width: b.w, height: b.w, borderRadius: "50%",
              background: b.color, opacity: 0.18, filter: "blur(32px)",
            }} />
          ))}
        </div>

        {/* Profile row */}
        <div style={{ padding: "0 28px 24px", display: "flex", alignItems: "flex-end", gap: 20, marginTop: -44 }}>
          {/* Avatar */}
          <div
            style={{ position: "relative", flexShrink: 0 }}
            onMouseEnter={() => setAvatarHov(true)}
            onMouseLeave={() => setAvatarHov(false)}
          >
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.accent}, ${T.violet})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 800, color: "#fff",
              border: `3px solid ${T.bg}`,
              boxShadow: `0 0 0 2px ${T.accent}60, 0 8px 32px ${T.accent}30`,
            }}>AC</div>
            <AnimatePresence>
              {avatarHov && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "rgba(0,0,0,0.55)", display: "flex",
                    alignItems: "center", justifyContent: "center", cursor: "pointer",
                    border: `3px solid ${T.bg}`,
                  }}
                  onClick={() => notify("Photo upload coming soon")}
                >
                  <FiCamera size={20} color="#fff" />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Online dot */}
            <div style={{
              position: "absolute", bottom: 4, right: 4,
              width: 14, height: 14, borderRadius: "50%",
              background: T.emerald, border: `2px solid ${T.bg}`,
            }} />
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, paddingBottom: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.textPri }}>
                <InlineEdit value={`${profile.firstName} ${profile.lastName}`}
                  onChange={v => { const [f, ...rest] = v.split(" "); set("firstName", f); set("lastName", rest.join(" ")); }}
                  fontSize={22} bold />
              </div>
              <span style={{
                padding: "3px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                background: `${roleColor}20`, color: roleColor, border: `1px solid ${roleColor}40`,
              }}>{profile.role}</span>
              {profile.mfa && (
                <span style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "3px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                  background: `${T.emerald}14`, color: T.emerald, border: `1px solid ${T.emerald}30`,
                }}>
                  <FiShield size={10} /> MFA
                </span>
              )}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: T.textSec }}>
              <InlineEdit value={profile.title} onChange={v => set("title", v)} fontSize={13} />
            </div>
            <div style={{ marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { icon: FiMapPin, val: profile.location },
                { icon: FiClock,  val: profile.timezone },
                { icon: FiCalendar, val: `Joined ${profile.joined}` },
              ].map(({ icon: Icon, val }) => (
                <span key={val} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.textMut }}>
                  <Icon size={11} /> {val}
                </span>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
            <motion.button whileTap={{ scale: 0.94 }}
              onClick={() => notify("Edit mode enabled")}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                background: T.accent, color: "#fff", fontSize: 13, fontWeight: 700,
                boxShadow: `0 4px 16px ${T.accent}40`,
              }}>
              <FiEdit2 size={13} /> Edit profile
            </motion.button>
            <motion.button whileTap={{ scale: 0.94 }}
              onClick={() => notify("Profile link copied")}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 14px", borderRadius: 10,
                border: `1px solid ${T.border}`, background: T.surfaceAlt,
                color: T.textSec, fontSize: 13, cursor: "pointer",
              }}>
              <FiCopy size={13} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Two-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

        {/* ── LEFT column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Stat cards */}
          <motion.div {...fadeUp(0.06)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                style={{
                  ...card({ padding: "14px 16px" }),
                  display: "flex", flexDirection: "column", gap: 6,
                }}
                whileHover={{ y: -2, borderColor: T.borderHov }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: `${s.color}18`, border: `1px solid ${s.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <s.icon size={13} color={s.color} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.textPri }}>{s.value}</div>
                <div style={{ fontSize: 10, color: T.textMut, lineHeight: 1.3 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* About / contact */}
          <motion.div {...fadeUp(0.1)} style={{ ...card({ padding: 20 }) }}>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: T.textMut,
              textTransform: "uppercase", letterSpacing: "0.09em" }}>About</p>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: T.textSec, lineHeight: 1.7 }}>
              {profile.bio}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { icon: FiMail,   val: profile.email,    href: `mailto:${profile.email}` },
                { icon: FiPhone,  val: profile.phone,    href: null },
                { icon: FiGlobe,  val: profile.website,  href: `https://${profile.website}` },
              ].map(({ icon: Icon, val, href }) => (
                <div key={val} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon size={13} color={T.textMut} style={{ flexShrink: 0 }} />
                  {href
                    ? <a href={href} style={{ fontSize: 12, color: T.accent, textDecoration: "none" }}>{val}</a>
                    : <span style={{ fontSize: 12, color: T.textSec }}>{val}</span>
                  }
                </div>
              ))}
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div {...fadeUp(0.14)} style={{ ...card({ padding: 20 }) }}>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: T.textMut,
              textTransform: "uppercase", letterSpacing: "0.09em" }}>Certifications</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CERTS.map((c, i) => (
                <motion.div key={c.name}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + i * 0.08 }}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: `${c.color}18`, border: `1px solid ${c.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FiAward size={14} color={c.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.textPri }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: T.textMut }}>{c.issuer} · {c.date}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Activity heatmap */}
          <motion.div {...fadeUp(0.08)} style={{ ...card({ padding: 22 }) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.textMut,
                  textTransform: "uppercase", letterSpacing: "0.09em" }}>Vault activity</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: T.textSec }}>
                  1,284 operations this year
                </p>
              </div>
              <span style={{ fontSize: 11, color: T.emerald, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <FiTrendingUp size={12} /> +18% vs last year
              </span>
            </div>
            <Heatmap />
          </motion.div>

          {/* Tab panel */}
          <motion.div {...fadeUp(0.12)} style={{ ...card({ padding: 0, overflow: "hidden" }) }}>
            {/* Tab bar */}
            <div style={{
              display: "flex", borderBottom: `1px solid ${T.border}`,
              padding: "0 20px",
            }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: "14px 16px", background: "transparent", border: "none",
                  borderBottom: `2px solid ${activeTab === t.id ? T.accent : "transparent"}`,
                  color: activeTab === t.id ? T.accent : T.textSec,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s", marginBottom: -1,
                }}>{t.label}</button>
              ))}
            </div>

            <div style={{ padding: 20 }}>
              <AnimatePresence mode="wait">

                {/* Activity tab */}
                {activeTab === "activity" && (
                  <motion.div key="activity"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {RECENT_ACTIONS.map((a, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 14,
                            padding: "12px 0",
                            borderBottom: i < RECENT_ACTIONS.length - 1 ? `1px solid ${T.border}22` : "none",
                          }}>
                          {/* Icon + connector */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 9,
                              background: `${a.color}18`, border: `1px solid ${a.color}28`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <a.icon size={14} color={a.color} />
                            </div>
                            {i < RECENT_ACTIONS.length - 1 && (
                              <div style={{ width: 1, flex: 1, minHeight: 12, background: T.border, margin: "4px 0" }} />
                            )}
                          </div>
                          <div style={{ flex: 1, paddingTop: 4 }}>
                            <div style={{ fontSize: 13, color: T.textPri, fontWeight: 500 }}>{a.label}</div>
                            <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>
                              {a.detail}
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: T.textMut, flexShrink: 0, paddingTop: 4 }}>{a.time}</span>
                        </motion.div>
                      ))}
                    </div>
                    <button onClick={() => notify("Full audit log exported")} style={{
                      marginTop: 14, display: "flex", alignItems: "center", gap: 7,
                      padding: "9px 16px", borderRadius: 9, border: `1px solid ${T.border}`,
                      background: T.surfaceAlt, color: T.textSec, fontSize: 12,
                      fontWeight: 600, cursor: "pointer", width: "100%", justifyContent: "center",
                    }}>
                      <FiDownload size={13} /> Download full audit log
                    </button>
                  </motion.div>
                )}

                {/* Security tab */}
                {activeTab === "security" && (
                  <motion.div key="security"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { label: "Multi-factor authentication", status: true,  icon: FiShield,   color: T.emerald, sub: "Authenticator app · Last verified 2hr ago" },
                        { label: "Password strength",           status: true,  icon: FiLock,     color: T.emerald, sub: "Strong · Changed 42 days ago" },
                        { label: "SSO login",                   status: true,  icon: FiZap,      color: T.accent,  sub: "Okta · Connected" },
                        { label: "IP restriction",              status: false, icon: FiGlobe,    color: T.amber,   sub: "Not configured — any IP can sign in" },
                        { label: "Recovery codes",              status: true,  icon: FiKey,      color: T.violet,  sub: "8 of 10 codes remaining" },
                      ].map((item, i) => (
                        <motion.div key={item.label}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "14px 16px", borderRadius: 12,
                            background: T.surface, border: `1px solid ${item.status ? T.border : `${T.amber}30`}`,
                          }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: `${item.color}14`, border: `1px solid ${item.color}28`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <item.icon size={15} color={item.color} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{item.sub}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                              padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                              background: item.status ? `${T.emerald}14` : `${T.amber}14`,
                              color: item.status ? T.emerald : T.amber,
                              border: `1px solid ${item.status ? T.emerald : T.amber}28`,
                            }}>
                              {item.status ? "Enabled" : "Not set"}
                            </span>
                            <FiChevronRight size={14} color={T.textMut} style={{ cursor: "pointer" }}
                              onClick={() => notify(`Manage ${item.label}`)} />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Security score ring */}
                    <div style={{
                      marginTop: 16, padding: "18px 20px", borderRadius: 14,
                      background: `linear-gradient(135deg, ${T.accent}10, ${T.violet}08)`,
                      border: `1px solid ${T.accent}25`,
                      display: "flex", alignItems: "center", gap: 20,
                    }}>
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke={T.surface} strokeWidth="8" />
                        <motion.circle cx="32" cy="32" r="26" fill="none"
                          stroke={T.accent} strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${0.84 * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
                          strokeDashoffset={0.25 * 2 * Math.PI * 26}
                          initial={{ strokeDasharray: `0 ${2 * Math.PI * 26}` }}
                          animate={{ strokeDasharray: `${0.84 * 2 * Math.PI * 26} ${2 * Math.PI * 26}` }}
                          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                        />
                        <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="800"
                          fill={T.textPri}>84</text>
                      </svg>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.textPri }}>Security score</div>
                        <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>
                          Enable IP restriction to reach 95+
                        </div>
                        <button onClick={() => notify("Navigating to IP restriction settings")} style={{
                          marginTop: 10, padding: "6px 14px", borderRadius: 8, border: "none",
                          background: T.accent, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        }}>Fix now</button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Credentials tab */}
                {activeTab === "certs" && (
                  <motion.div key="certs"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {CERTS.map((c, i) => (
                        <motion.div key={c.name}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          style={{
                            padding: "18px 20px", borderRadius: 14,
                            background: T.surface, border: `1px solid ${c.color}28`,
                            display: "flex", alignItems: "center", gap: 18,
                          }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                            background: `${c.color}18`, border: `1px solid ${c.color}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <FiAward size={22} color={c.color} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: T.textPri }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>
                              Issued by {c.issuer} · {c.date}
                            </div>
                          </div>
                          <button onClick={() => notify(`Downloading ${c.name} certificate`)} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "7px 14px", borderRadius: 9,
                            border: `1px solid ${c.color}30`, background: `${c.color}10`,
                            color: c.color, fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}>
                            <FiDownload size={12} /> Download
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    <div style={{
                      marginTop: 16, padding: "14px 18px", borderRadius: 12,
                      border: `1px dashed ${T.border}`, background: "transparent",
                      display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    }}
                      onClick={() => notify("Certificate upload coming soon")}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: T.surfaceAlt, border: `1px solid ${T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <FiAward size={16} color={T.textMut} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: T.textSec, fontWeight: 600 }}>Add certification</div>
                        <div style={{ fontSize: 11, color: T.textMut }}>Upload a badge or certificate PDF</div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast key={toast} message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
