import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser, FiShield, FiKey, FiBell, FiCreditCard, FiGlobe,
  FiSliders, FiSave, FiCheck, FiAlertTriangle, FiEye, FiEyeOff,
  FiCopy, FiRefreshCw, FiTrash2, FiPlus, FiToggleLeft, FiToggleRight,
  FiSmartphone, FiMail, FiLock, FiUnlock, FiActivity, FiDownload,
  FiChevronRight, FiInfo, FiX, FiZap, FiServer
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

// ─── Sidebar Nav Items ─────────────────────────────────────────────────────────
const NAV = [
  { id: "profile",       icon: FiUser,       label: "Profile",         sub: "Name, avatar, contact" },
  { id: "security",      icon: FiShield,     label: "Security",        sub: "Password, MFA, sessions" },
  { id: "apikeys",       icon: FiKey,        label: "API Keys",        sub: "Manage access tokens" },
  { id: "notifications", icon: FiBell,       label: "Notifications",   sub: "Alerts & digests" },
  { id: "integrations",  icon: FiServer,     label: "Integrations",    sub: "SIEM, LDAP, webhooks" },
  { id: "billing",       icon: FiCreditCard, label: "Billing",         sub: "Plan, invoices, limits" },
  { id: "advanced",      icon: FiSliders,    label: "Advanced",        sub: "Danger zone" },
];

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.94 }}
      onAnimationComplete={() => setTimeout(onDone, 2000)}
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 999,
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 18px", borderRadius: 12,
        background: type === "success" ? `${T.emerald}18` : `${T.rose}18`,
        border: `1px solid ${type === "success" ? T.emerald : T.rose}40`,
        color: type === "success" ? T.emerald : T.rose,
        fontSize: 13, fontWeight: 600, backdropFilter: "blur(12px)",
        boxShadow: `0 8px 32px ${type === "success" ? T.emerald : T.rose}20`,
      }}
    >
      {type === "success" ? <FiCheck size={15} /> : <FiAlertTriangle size={15} />}
      {message}
    </motion.div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange, color = T.accent }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: value ? color : T.surfaceAlt,
        position: "relative", flexShrink: 0,
        boxShadow: value ? `0 0 12px ${color}60` : "none",
        transition: "background 0.2s, box-shadow 0.2s",
      }}
      whileTap={{ scale: 0.93 }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        style={{
          position: "absolute", top: 3, width: 18, height: 18,
          borderRadius: "50%", background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </motion.button>
  );
}

// ─── Input Field ───────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", hint, suffix, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: T.textSec, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center",
        background: T.surface, borderRadius: 10,
        border: `1px solid ${focused ? T.accent : T.border}`,
        transition: "border-color 0.18s",
        boxShadow: focused ? `0 0 0 3px ${T.accentDim}` : "none",
        overflow: "hidden",
      }}>
        <input
          type={type} value={value}
          onChange={e => onChange && onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          disabled={disabled}
          style={{
            flex: 1, padding: "10px 14px", background: "transparent",
            border: "none", outline: "none", color: T.textPri, fontSize: 13,
            fontFamily: "inherit", opacity: disabled ? 0.5 : 1,
          }}
        />
        {suffix && (
          <div style={{ padding: "0 12px", color: T.textMut, fontSize: 13 }}>{suffix}</div>
        )}
      </div>
      {hint && <p style={{ margin: "5px 0 0", fontSize: 11, color: T.textMut }}>{hint}</p>}
    </div>
  );
}

// ─── Section Wrapper ───────────────────────────────────────────────────────────
function Section({ title, sub, children, danger }) {
  return (
    <div style={{
      ...card(),
      padding: 28, marginBottom: 20,
      borderColor: danger ? `${T.rose}30` : T.border,
    }}>
      <div style={{ marginBottom: 22, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: danger ? T.rose : T.textPri }}>
          {title}
        </h3>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: T.textSec }}>{sub}</p>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Save Button ───────────────────────────────────────────────────────────────
function SaveBtn({ onClick, saving, saved }) {
  return (
    <motion.button
      onClick={onClick} whileTap={{ scale: 0.96 }}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer",
        background: saved ? T.emerald : T.accent,
        color: "#fff", fontSize: 13, fontWeight: 700,
        transition: "background 0.25s",
        boxShadow: `0 4px 20px ${saved ? T.emerald : T.accent}40`,
      }}
    >
      {saving
        ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}><FiRefreshCw size={14} /></motion.div>
        : saved ? <FiCheck size={14} /> : <FiSave size={14} />}
      {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
    </motion.button>
  );
}

// ─── Row: label + toggle ───────────────────────────────────────────────────────
function ToggleRow({ label, sub, value, onChange, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 13, color: T.textPri, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{sub}</div>}
      </div>
      <Toggle value={value} onChange={onChange} color={color} />
    </div>
  );
}

// ─── API Key Row ───────────────────────────────────────────────────────────────
function ApiKeyRow({ keyObj, onRevoke, onCopy }) {
  const [visible, setVisible] = useState(false);
  const masked = keyObj.key.slice(0, 8) + "•".repeat(24) + keyObj.key.slice(-4);
  return (
    <motion.div
      layout
      style={{
        padding: "14px 16px", borderRadius: 12,
        background: T.surface, border: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.textPri }}>{keyObj.name}</span>
          <span style={{
            marginLeft: 10, padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700,
            background: keyObj.scope === "read-only" ? `${T.cyan}18` : `${T.amber}18`,
            color: keyObj.scope === "read-only" ? T.cyan : T.amber,
            border: `1px solid ${keyObj.scope === "read-only" ? T.cyan : T.amber}30`,
          }}>
            {keyObj.scope}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setVisible(v => !v)} style={{
            background: "transparent", border: `1px solid ${T.border}`, borderRadius: 7,
            padding: "5px 10px", color: T.textSec, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12,
          }}>
            {visible ? <FiEyeOff size={12} /> : <FiEye size={12} />}
            {visible ? "Hide" : "Reveal"}
          </button>
          <button onClick={() => onCopy(keyObj.key)} style={{
            background: "transparent", border: `1px solid ${T.border}`, borderRadius: 7,
            padding: "5px 10px", color: T.textSec, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12,
          }}>
            <FiCopy size={12} /> Copy
          </button>
          <button onClick={() => onRevoke(keyObj.id)} style={{
            background: `${T.rose}12`, border: `1px solid ${T.rose}30`, borderRadius: 7,
            padding: "5px 10px", color: T.rose, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12,
          }}>
            <FiTrash2 size={12} /> Revoke
          </button>
        </div>
      </div>
      <code style={{
        fontSize: 12, color: T.textSec, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        background: T.bg, padding: "8px 12px", borderRadius: 8, display: "block",
        border: `1px solid ${T.border}`, letterSpacing: "0.04em",
      }}>
        {visible ? keyObj.key : masked}
      </code>
      <div style={{ display: "flex", gap: 16, fontSize: 11, color: T.textMut }}>
        <span>Created {keyObj.created}</span>
        <span>Last used {keyObj.lastUsed}</span>
        {keyObj.expires && <span style={{ color: T.amber }}>Expires {keyObj.expires}</span>}
      </div>
    </motion.div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast]         = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "Alexandra", lastName: "Chen",
    email: "alex.chen@securevault.io", title: "Security Engineer",
    timezone: "America/New_York", language: "en-US",
  });

  // Security state
  const [mfa, setMfa]           = useState(true);
  const [ssoOnly, setSsoOnly]   = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("8h");
  const [ipRestrict, setIpRestrict] = useState(false);
  const [pwVisible, setPwVisible]   = useState(false);
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "CI/CD Pipeline",    key: "svk_live_8f3k2mxp9qr1tnvb4j7yw6sd0czahoel5ui", scope: "read-write", created: "Mar 12, 2025", lastUsed: "2 hours ago",  expires: null },
    { id: 2, name: "Monitoring Agent",  key: "svk_live_2bq7nvxp4mr9fd1yk3st0cwjz6uelh8oia5", scope: "read-only",  created: "Jan 4, 2025",  lastUsed: "5 minutes ago", expires: "Dec 31, 2025" },
    { id: 3, name: "Backup Service",    key: "svk_live_6rz0mp1bk9vyw3nq4st7fxc2dhlj8oaue5i", scope: "read-write", created: "Feb 28, 2025", lastUsed: "Yesterday",     expires: null },
  ]);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("read-only");

  // Notifications state
  const [notifs, setNotifs] = useState({
    threatAlerts:    true,  threatEmail:    true,
    keyRotation:     true,  keyEmail:       false,
    auditDigest:     true,  auditEmail:     true,
    userActivity:    false, userEmail:      false,
    systemHealth:    true,  systemEmail:    false,
    complianceReport:true,
  });

  // Integrations state
  const [integrations, setIntegrations] = useState({
    splunk: true, pagerduty: false, slack: true, ldap: false, okta: true,
  });

  // Advanced
  const [deleteConfirm, setDeleteConfirm] = useState("");

  function showToast(msg, type = "success") {
    setToast({ msg, type });
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      showToast("Settings saved successfully");
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  }

  function handleCopyKey(key) {
    navigator.clipboard?.writeText(key).catch(() => {});
    showToast("API key copied to clipboard");
  }

  function handleRevokeKey(id) {
    setApiKeys(k => k.filter(x => x.id !== id));
    showToast("API key revoked", "success");
  }

  function handleCreateKey() {
    if (!newKeyName.trim()) return;
    const generated = "svk_live_" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 30);
    setApiKeys(k => [...k, {
      id: Date.now(), name: newKeyName, key: generated, scope: newKeyScope,
      created: "Just now", lastUsed: "Never", expires: null,
    }]);
    setNewKeyName(""); setShowNewKey(false);
    showToast(`"${newKeyName}" key created`);
  }

  const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

  // ── Panel Renderers ──────────────────────────────────────────────────────────
  function renderProfile() {
    return (
      <motion.div key="profile" {...fadeUp}>
        <Section title="Personal information" sub="Your name and contact details">
          {/* Avatar row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.accent}, ${T.violet})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 700, color: "#fff", flexShrink: 0,
              boxShadow: `0 0 0 3px ${T.accentDim}`,
            }}>AC</div>
            <div>
              <button style={{
                padding: "8px 16px", borderRadius: 9, border: `1px solid ${T.border}`,
                background: T.surfaceAlt, color: T.textPri, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>Change photo</button>
              <p style={{ margin: "5px 0 0", fontSize: 11, color: T.textMut }}>
                PNG or JPG up to 2 MB
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="First name" value={profile.firstName} onChange={v => setProfile(p => ({ ...p, firstName: v }))} />
            <Field label="Last name"  value={profile.lastName}  onChange={v => setProfile(p => ({ ...p, lastName: v }))} />
          </div>
          <Field label="Work email" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} type="email"
            hint="Changing your email will require re-verification." />
          <Field label="Job title" value={profile.title} onChange={v => setProfile(p => ({ ...p, title: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Timezone" value={profile.timezone} onChange={v => setProfile(p => ({ ...p, timezone: v }))} />
            <Field label="Language" value={profile.language} onChange={v => setProfile(p => ({ ...p, language: v }))} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
          </div>
        </Section>
      </motion.div>
    );
  }

  function renderSecurity() {
    const sessions = [
      { device: "MacBook Pro 16", browser: "Chrome 124", location: "New York, US",     last: "Active now",    current: true },
      { device: "iPhone 15 Pro",   browser: "Safari 17",  location: "New York, US",     last: "2 hours ago",   current: false },
      { device: "Windows PC",      browser: "Edge 122",   location: "San Francisco, US", last: "3 days ago",    current: false },
    ];
    return (
      <motion.div key="security" {...fadeUp} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <Section title="Authentication" sub="Control how you sign in to SecureVault">
          <ToggleRow label="Multi-factor authentication" sub="Required for all vault access" value={mfa} onChange={setMfa} color={T.emerald} />
          <ToggleRow label="SSO-only login" sub="Disable password login when SSO is active" value={ssoOnly} onChange={setSsoOnly} />
          <ToggleRow label="IP restriction" sub="Limit sessions to approved IP ranges" value={ipRestrict} onChange={setIpRestrict} />
          <div>
            <label style={{ display: "block", fontSize: 12, color: T.textSec, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>Session timeout</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["1h", "4h", "8h", "24h", "Never"].map(opt => (
                <button key={opt} onClick={() => setSessionTimeout(opt)} style={{
                  padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${sessionTimeout === opt ? T.accent : T.border}`,
                  background: sessionTimeout === opt ? T.accentDim : "transparent",
                  color: sessionTimeout === opt ? T.accent : T.textSec,
                  transition: "all 0.15s",
                }}>{opt}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
          </div>
        </Section>

        <Section title="Change password" sub="Use a strong, unique password for this account">
          <div>
            <label style={{ display: "block", fontSize: 12, color: T.textSec, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>Current password</label>
            <div style={{
              display: "flex", alignItems: "center",
              background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, overflow: "hidden",
            }}>
              <input type={pwVisible ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                placeholder="••••••••••••" style={{
                  flex: 1, padding: "10px 14px", background: "transparent", border: "none", outline: "none",
                  color: T.textPri, fontSize: 13, fontFamily: "inherit",
                }} />
              <button onClick={() => setPwVisible(v => !v)} style={{
                padding: "0 14px", background: "transparent", border: "none", color: T.textMut, cursor: "pointer",
              }}>
                {pwVisible ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>
          <Field label="New password" value={newPw} onChange={setNewPw} type="password"
            hint="Minimum 12 characters, must include numbers and symbols." />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => showToast("Password updated")} style={{
              padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer",
              background: T.accent, color: "#fff", fontSize: 13, fontWeight: 700,
            }}>Update password</button>
          </div>
        </Section>

        <Section title="Active sessions" sub="Sign out of devices you don't recognise">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderRadius: 10, background: T.surface,
                border: `1px solid ${s.current ? `${T.accent}40` : T.border}`,
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <FiSmartphone size={18} color={s.current ? T.accent : T.textMut} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>{s.device}</div>
                    <div style={{ fontSize: 11, color: T.textMut }}>{s.browser} · {s.location}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, color: s.current ? T.emerald : T.textMut }}>{s.last}</span>
                  {!s.current && (
                    <button onClick={() => showToast("Session revoked")} style={{
                      padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.rose}30`,
                      background: `${T.rose}10`, color: T.rose, fontSize: 11, cursor: "pointer",
                    }}>Revoke</button>
                  )}
                  {s.current && (
                    <span style={{
                      padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: `${T.accent}18`, color: T.accent, border: `1px solid ${T.accent}30`,
                    }}>This device</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => showToast("All other sessions revoked")} style={{
            padding: "9px 18px", borderRadius: 9, border: `1px solid ${T.rose}30`,
            background: `${T.rose}10`, color: T.rose, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>Revoke all other sessions</button>
        </Section>
      </motion.div>
    );
  }

  function renderApiKeys() {
    return (
      <motion.div key="apikeys" {...fadeUp}>
        <Section title="API Keys" sub="Keys grant programmatic access to your vaults. Treat them like passwords.">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AnimatePresence>
              {apiKeys.map(k => (
                <ApiKeyRow key={k.id} keyObj={k} onRevoke={handleRevokeKey} onCopy={handleCopyKey} />
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showNewKey && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ padding: 18, borderRadius: 12, background: T.surface, border: `1px solid ${T.accent}40`, overflow: "hidden" }}
              >
                <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: T.textPri }}>New API key</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 12 }}>
                  <Field label="Key name" value={newKeyName} onChange={setNewKeyName} />
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: T.textSec, fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>Scope</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["read-only", "read-write"].map(s => (
                        <button key={s} onClick={() => setNewKeyScope(s)} style={{
                          padding: "10px 14px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                          border: `1px solid ${newKeyScope === s ? T.accent : T.border}`,
                          background: newKeyScope === s ? T.accentDim : "transparent",
                          color: newKeyScope === s ? T.accent : T.textSec,
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleCreateKey} style={{
                    padding: "9px 20px", borderRadius: 9, border: "none",
                    background: T.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}>Generate key</button>
                  <button onClick={() => setShowNewKey(false)} style={{
                    padding: "9px 16px", borderRadius: 9, border: `1px solid ${T.border}`,
                    background: "transparent", color: T.textSec, fontSize: 13, cursor: "pointer",
                  }}>Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showNewKey && (
            <button onClick={() => setShowNewKey(true)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 10,
              border: `1px dashed ${T.accent}50`, background: T.accentDim,
              color: T.accent, fontSize: 13, fontWeight: 600, cursor: "pointer",
              width: "100%", justifyContent: "center",
            }}>
              <FiPlus size={15} /> Create new API key
            </button>
          )}
        </Section>
      </motion.div>
    );
  }

  function renderNotifications() {
    const rows = [
      { key: "threat",    label: "Threat alerts",         sub: "Brute force, anomalies, breaches",  toggle: "threatAlerts",    email: "threatEmail",    color: T.rose },
      { key: "key",       label: "Key rotation reminders",sub: "Keys approaching expiry",            toggle: "keyRotation",     email: "keyEmail",       color: T.amber },
      { key: "audit",     label: "Audit digest",          sub: "Daily summary of vault activity",   toggle: "auditDigest",     email: "auditEmail",     color: T.accent },
      { key: "user",      label: "User activity",         sub: "New sign-ins and role changes",      toggle: "userActivity",    email: "userEmail",      color: T.violet },
      { key: "system",    label: "System health",         sub: "Vault unavailability and latency",   toggle: "systemHealth",    email: "systemEmail",    color: T.cyan },
    ];
    return (
      <motion.div key="notifications" {...fadeUp}>
        <Section title="Notification preferences" sub="Choose what you're alerted about and how">
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "10px 16px", alignItems: "center" }}>
            <div />
            <span style={{ fontSize: 11, color: T.textMut, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" }}>In-app</span>
            <span style={{ fontSize: 11, color: T.textMut, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" }}>Email</span>
            {rows.map(r => (
              <>
                <div key={`${r.key}-label`}>
                  <div style={{ fontSize: 13, color: T.textPri, fontWeight: 500 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: T.textMut }}>{r.sub}</div>
                </div>
                <div key={`${r.key}-toggle`} style={{ display: "flex", justifyContent: "center" }}>
                  <Toggle value={notifs[r.toggle]} onChange={v => setNotifs(n => ({ ...n, [r.toggle]: v }))} color={r.color} />
                </div>
                <div key={`${r.key}-email`} style={{ display: "flex", justifyContent: "center" }}>
                  <Toggle value={notifs[r.email]} onChange={v => setNotifs(n => ({ ...n, [r.email]: v }))} color={r.color} />
                </div>
              </>
            ))}
          </div>
          <div style={{ paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
            <ToggleRow label="Monthly compliance report" sub="Sent on the 1st of each month"
              value={notifs.complianceReport} onChange={v => setNotifs(n => ({ ...n, complianceReport: v }))} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveBtn onClick={handleSave} saving={saving} saved={saved} />
          </div>
        </Section>
      </motion.div>
    );
  }

  function renderIntegrations() {
    const list = [
      { id: "splunk",     name: "Splunk SIEM",     sub: "Stream audit logs to your SIEM",    color: "#f9a825" },
      { id: "pagerduty",  name: "PagerDuty",       sub: "Route threat alerts to on-call",    color: "#06AC38" },
      { id: "slack",      name: "Slack",            sub: "Post alerts to a workspace channel", color: "#4A154B" },
      { id: "ldap",       name: "LDAP / AD",        sub: "Sync users from directory",         color: T.cyan },
      { id: "okta",       name: "Okta SSO",         sub: "SAML 2.0 single sign-on",          color: "#00297A" },
    ];
    return (
      <motion.div key="integrations" {...fadeUp}>
        <Section title="Integrations" sub="Connect SecureVault to your existing security stack">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {list.map((intg, i) => (
              <motion.div key={intg.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 18px", borderRadius: 12,
                  background: T.surface, border: `1px solid ${integrations[intg.id] ? `${T.accent}30` : T.border}`,
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${intg.color}18`, border: `1px solid ${intg.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FiZap size={16} color={intg.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.textPri }}>{intg.name}</div>
                    <div style={{ fontSize: 11, color: T.textMut }}>{intg.sub}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {integrations[intg.id] && (
                    <span style={{ fontSize: 11, color: T.emerald, fontWeight: 600 }}>Connected</span>
                  )}
                  <Toggle
                    value={integrations[intg.id]}
                    onChange={v => {
                      setIntegrations(s => ({ ...s, [intg.id]: v }));
                      showToast(v ? `${intg.name} connected` : `${intg.name} disconnected`);
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </motion.div>
    );
  }

  function renderBilling() {
    const invoices = [
      { date: "Jun 1, 2025", amount: "$299.00", status: "Paid",    id: "INV-2025-06" },
      { date: "May 1, 2025", amount: "$299.00", status: "Paid",    id: "INV-2025-05" },
      { date: "Apr 1, 2025", amount: "$299.00", status: "Paid",    id: "INV-2025-04" },
    ];
    return (
      <motion.div key="billing" {...fadeUp}>
        <Section title="Current plan" sub="Enterprise · billed monthly">
          <div style={{
            padding: "20px 24px", borderRadius: 14,
            background: `linear-gradient(135deg, ${T.accent}22, ${T.violet}12)`,
            border: `1px solid ${T.accent}30`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.textPri, marginBottom: 2 }}>Enterprise</div>
              <div style={{ fontSize: 13, color: T.textSec }}>Unlimited vaults · SSO · Priority support · SLA 99.99%</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: T.accent }}>$299</div>
              <div style={{ fontSize: 12, color: T.textMut }}>per month</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Active vaults", val: "12 / ∞" },
              { label: "Users",         val: "47 / ∞" },
              { label: "API calls",     val: "2.4M / ∞" },
            ].map(m => (
              <div key={m.label} style={{
                padding: "14px 16px", borderRadius: 10, background: T.surface,
                border: `1px solid ${T.border}`,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.textPri }}>{m.val}</div>
                <div style={{ fontSize: 11, color: T.textMut, marginTop: 3 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Invoice history" sub="Download past receipts for your records">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {invoices.map((inv, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>{inv.id}</div>
                  <div style={{ fontSize: 11, color: T.textMut }}>{inv.date}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.textPri }}>{inv.amount}</span>
                  <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: `${T.emerald}18`, color: T.emerald, border: `1px solid ${T.emerald}30` }}>
                    {inv.status}
                  </span>
                  <button onClick={() => showToast(`Downloading ${inv.id}…`)} style={{
                    background: "transparent", border: `1px solid ${T.border}`, borderRadius: 7,
                    padding: "5px 10px", color: T.textSec, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5, fontSize: 12,
                  }}>
                    <FiDownload size={12} /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </motion.div>
    );
  }

  function renderAdvanced() {
    return (
      <motion.div key="advanced" {...fadeUp} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <Section title="Data export" sub="Download a full export of your vault metadata and audit logs">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["Audit logs (CSV)", "Vault metadata (JSON)", "User report (CSV)"].map(label => (
              <button key={label} onClick={() => showToast(`Preparing ${label}…`)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 16px", borderRadius: 9, border: `1px solid ${T.border}`,
                background: T.surfaceAlt, color: T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>
                <FiDownload size={13} /> {label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Delete organisation" sub="Permanently removes all vaults, keys, users, and audit history." danger>
          <div style={{
            padding: "14px 16px", borderRadius: 10,
            background: `${T.rose}0c`, border: `1px solid ${T.rose}30`,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <FiAlertTriangle size={16} color={T.rose} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 12, color: T.rose, lineHeight: 1.6 }}>
              This action is irreversible. All vault data, encryption keys, and audit logs will be permanently destroyed and cannot be recovered.
            </p>
          </div>
          <Field label="Type your organisation name to confirm"
            value={deleteConfirm} onChange={setDeleteConfirm}
            hint='Type "SecureVault" to enable the delete button.' />
          <motion.button
            disabled={deleteConfirm !== "SecureVault"}
            whileTap={deleteConfirm === "SecureVault" ? { scale: 0.97 } : {}}
            style={{
              padding: "10px 22px", borderRadius: 10, border: `1px solid ${T.rose}50`,
              background: deleteConfirm === "SecureVault" ? T.rose : `${T.rose}18`,
              color: deleteConfirm === "SecureVault" ? "#fff" : `${T.rose}70`,
              fontSize: 13, fontWeight: 700, cursor: deleteConfirm === "SecureVault" ? "pointer" : "not-allowed",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <FiTrash2 size={14} /> Permanently delete organisation
          </motion.button>
        </Section>
      </motion.div>
    );
  }

  const panels = { profile: renderProfile, security: renderSecurity, apikeys: renderApiKeys,
    notifications: renderNotifications, integrations: renderIntegrations, billing: renderBilling, advanced: renderAdvanced };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Settings Sidebar ── */}
      <div style={{
        width: 240, flexShrink: 0, padding: "28px 16px",
        borderRight: `1px solid ${T.border}`, position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.textPri }}>Settings</h2>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: T.textMut }}>Workspace configuration</p>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => {
            const active = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 2 }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: active ? T.accentDim : "transparent",
                  borderLeft: `2px solid ${active ? T.accent : "transparent"}`,
                  textAlign: "left", width: "100%", transition: "all 0.15s",
                }}
              >
                <item.icon size={15} color={active ? T.accent : T.textMut} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: active ? 700 : 500,
                    color: active ? T.accent : T.textPri }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: T.textMut }}>{item.sub}</div>
                </div>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* ── Settings Content ── */}
      <div style={{ flex: 1, padding: "28px 36px", overflowY: "auto", maxWidth: 780 }}>
        <AnimatePresence mode="wait">
          {panels[activeTab]?.()}
        </AnimatePresence>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast key={toast.msg} message={toast.msg} type={toast.type}
            onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
