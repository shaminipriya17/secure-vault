import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import {
  FiUsers, FiSearch, FiFilter, FiPlus, FiMoreHorizontal,
  FiShield, FiEdit2, FiTrash2, FiLock, FiUnlock,
  FiDownload, FiRefreshCw, FiChevronUp, FiChevronDown,
  FiCheckCircle, FiAlertCircle, FiClock, FiX,
  FiMail, FiKey, FiUser, FiGlobe, FiSliders,
} from "react-icons/fi";

const T = {
  bg0: "#070B14", bg1: "#0B1220", bg2: "#111827", bg3: "#1a2235", bg4: "#1f2a3d",
  glass: "rgba(255,255,255,0.03)", glassBorder: "rgba(255,255,255,0.07)",
  primary: "#6366F1", primaryGlow: "rgba(99,102,241,0.15)",
  secondary: "#06B6D4", accent: "#8B5CF6",
  success: "#10B981", warning: "#F59E0B", danger: "#EF4444",
  text0: "#F8FAFC", text1: "#CBD5E1", text2: "#94A3B8", text3: "#64748B",
  radius: "14px", radiusSm: "10px", radiusLg: "20px",
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] } }),
};

const glassCard = (extra = {}) => ({
  background: "linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.018) 100%)",
  border: `1px solid ${T.glassBorder}`,
  borderRadius: T.radius,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  ...extra,
});

const ROLES = ["All Roles", "Super Admin", "Admin", "Vault Manager", "Auditor", "Read Only"];
const STATUSES = ["All Status", "Active", "Inactive", "Suspended", "Pending"];

const USERS = [
  { id: "USR-001", name: "Sarah Kim", email: "sarah.kim@corp.com", role: "Super Admin", status: "Active", vaults: 48, region: "US-East", lastSeen: "2m ago", mfa: true, avatar: "SK" },
  { id: "USR-002", name: "James Rivera", email: "j.rivera@corp.com", role: "Admin", status: "Active", vaults: 31, region: "EU-West", lastSeen: "18m ago", mfa: true, avatar: "JR" },
  { id: "USR-003", name: "Priya Mehta", email: "p.mehta@corp.com", role: "Vault Manager", status: "Active", vaults: 22, region: "AP-Mumbai", lastSeen: "1h ago", mfa: true, avatar: "PM" },
  { id: "USR-004", name: "Lucas Becker", email: "l.becker@corp.com", role: "Auditor", status: "Inactive", vaults: 0, region: "EU-West", lastSeen: "3d ago", mfa: false, avatar: "LB" },
  { id: "USR-005", name: "Amara Nwosu", email: "a.nwosu@corp.com", role: "Vault Manager", status: "Active", vaults: 17, region: "AF-Lagos", lastSeen: "34m ago", mfa: true, avatar: "AN" },
  { id: "USR-006", name: "Kenji Tanaka", email: "k.tanaka@corp.com", role: "Read Only", status: "Suspended", vaults: 5, region: "AP-Tokyo", lastSeen: "12d ago", mfa: false, avatar: "KT" },
  { id: "USR-007", name: "Elena Volkov", email: "e.volkov@corp.com", role: "Admin", status: "Active", vaults: 29, region: "EU-East", lastSeen: "5m ago", mfa: true, avatar: "EV" },
  { id: "USR-008", name: "Mateo Herrera", email: "m.herrera@corp.com", role: "Vault Manager", status: "Pending", vaults: 0, region: "SA-Bogota", lastSeen: "Never", mfa: false, avatar: "MH" },
  { id: "USR-009", name: "Chloe Dupont", email: "c.dupont@corp.com", role: "Auditor", status: "Active", vaults: 41, region: "EU-West", lastSeen: "2h ago", mfa: true, avatar: "CD" },
  { id: "USR-010", name: "Omar Hassan", email: "o.hassan@corp.com", role: "Read Only", status: "Active", vaults: 8, region: "ME-Dubai", lastSeen: "6h ago", mfa: false, avatar: "OH" },
];

const STATUS_STYLES = {
  Active:    { color: T.success, bg: `${T.success}18`, border: `${T.success}30` },
  Inactive:  { color: T.text3,   bg: `${T.text3}18`,  border: `${T.text3}30`   },
  Suspended: { color: T.danger,  bg: `${T.danger}18`, border: `${T.danger}30`  },
  Pending:   { color: T.warning, bg: `${T.warning}18`,border: `${T.warning}30` },
};

const ROLE_COLORS = {
  "Super Admin": T.danger, Admin: T.primary,
  "Vault Manager": T.secondary, Auditor: T.accent, "Read Only": T.text2,
};

const AVATAR_COLORS = [
  ["#6366F1","#818CF8"], ["#06B6D4","#67E8F9"], ["#8B5CF6","#A78BFA"],
  ["#10B981","#34D399"], ["#F59E0B","#FCD34D"], ["#EF4444","#F87171"],
];

function Avatar({ initials, index, size = 36 }) {
  const [from, to] = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 700, color: "#fff",
      boxShadow: `0 0 0 2px ${from}44`,
    }}>
      {initials}
    </div>
  );
}

function Badge({ label, color, bg, border }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 9px",
      borderRadius: 20, color, background: bg, border: `1px solid ${border}`,
      letterSpacing: "0.03em", whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function SortIcon({ field, sort }) {
  if (sort.field !== field) return <FiChevronUp size={12} style={{ opacity: 0.2 }} />;
  return sort.dir === "asc" ? <FiChevronUp size={12} color={T.primary} /> : <FiChevronDown size={12} color={T.primary} />;
}

function UserDrawer({ user, onClose }) {
  if (!user) return null;
  const statusStyle = STATUS_STYLES[user.status];
  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 40, backdropFilter: "blur(4px)" }}
      />
      <motion.div
        key="drawer"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 380, zIndex: 50,
          background: T.bg1, borderLeft: `1px solid ${T.glassBorder}`,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        <div style={{ padding: "24px 24px 20px", borderBottom: `1px solid ${T.glassBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>User Details</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.text3, padding: 4 }}>
            <FiX size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <Avatar initials={user.avatar} index={USERS.indexOf(user)} size={56} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.text0 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: T.text2, marginTop: 3 }}>{user.email}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                <Badge label={user.status} {...STATUS_STYLES[user.status]} />
                <Badge label={user.role} color={ROLE_COLORS[user.role]} bg={`${ROLE_COLORS[user.role]}18`} border={`${ROLE_COLORS[user.role]}30`} />
              </div>
            </div>
          </div>

          {[
            { icon: FiUser, label: "User ID", val: user.id },
            { icon: FiGlobe, label: "Region", val: user.region },
            { icon: FiKey, label: "MFA", val: user.mfa ? "Enabled" : "Disabled", valColor: user.mfa ? T.success : T.danger },
            { icon: FiClock, label: "Last Seen", val: user.lastSeen },
            { icon: FiShield, label: "Vaults Access", val: `${user.vaults} vaults` },
          ].map(r => (
            <div key={r.label} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
              borderBottom: `1px solid ${T.glassBorder}`,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: T.bg3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <r.icon size={14} color={T.text3} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.text3 }}>{r.label}</div>
                <div style={{ fontSize: 13, color: r.valColor || T.text1, fontWeight: 500, marginTop: 2 }}>{r.val}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: FiEdit2, label: "Edit User", color: T.primary },
                { icon: user.status === "Active" ? FiLock : FiUnlock, label: user.status === "Active" ? "Suspend Account" : "Activate Account", color: user.status === "Active" ? T.warning : T.success },
                { icon: FiKey, label: "Force Key Rotation", color: T.accent },
                { icon: FiMail, label: "Send Reset Email", color: T.secondary },
                { icon: FiTrash2, label: "Delete User", color: T.danger },
              ].map(a => (
                <motion.button
                  key={a.label}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: T.radiusSm,
                    background: `${a.color}10`, border: `1px solid ${a.color}25`,
                    color: a.color, fontSize: 13, fontWeight: 500, cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <a.icon size={14} /> {a.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Users() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sort, setSort] = useState({ field: "name", dir: "asc" });
  const [selected, setSelected] = useState(new Set());
  const [drawerUser, setDrawerUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const toggleSort = (field) => {
    setSort(s => s.field === field ? { field, dir: s.dir === "asc" ? "desc" : "asc" } : { field, dir: "asc" });
  };

  const toggleSelect = (id) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleAll = (list) => {
    if (list.every(u => selected.has(u.id))) setSelected(new Set());
    else setSelected(new Set(list.map(u => u.id)));
  };

  const filtered = USERS
    .filter(u => {
      const q = search.toLowerCase();
      return (
        (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)) &&
        (roleFilter === "All Roles" || u.role === roleFilter) &&
        (statusFilter === "All Status" || u.status === statusFilter)
      );
    })
    .sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.field === "vaults") return (a.vaults - b.vaults) * dir;
      return String(a[sort.field]).localeCompare(String(b[sort.field])) * dir;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const STATS = [
    { label: "Total Users", val: USERS.length, icon: FiUsers, color: T.primary },
    { label: "Active", val: USERS.filter(u => u.status === "Active").length, icon: FiCheckCircle, color: T.success },
    { label: "Suspended", val: USERS.filter(u => u.status === "Suspended").length, icon: FiLock, color: T.danger },
    { label: "MFA Enabled", val: USERS.filter(u => u.mfa).length, icon: FiShield, color: T.accent },
  ];

  const COL_HEADERS = [
    { label: "User", field: "name", flex: 2.2 },
    { label: "Role", field: "role", flex: 1.4 },
    { label: "Status", field: "status", flex: 1 },
    { label: "Vaults", field: "vaults", flex: 0.8 },
    { label: "Region", field: "region", flex: 1.1 },
    { label: "Last Seen", field: "lastSeen", flex: 1 },
    { label: "MFA", field: "mfa", flex: 0.7 },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "28px 32px 48px", fontFamily: "'Inter','SF Pro Display',system-ui,sans-serif", color: T.text0 }}>

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text0, margin: 0, letterSpacing: "-0.02em" }}>User Management</h1>
          <p style={{ margin: "4px 0 0", color: T.text2, fontSize: 14 }}>Manage access control and user permissions</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { icon: FiDownload, label: "Export" },
            { icon: FiRefreshCw, label: "Sync" },
          ].map(a => (
            <motion.button key={a.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ ...glassCard(), padding: "9px 16px", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", color: T.text1, fontSize: 13, fontWeight: 500 }}>
              <a.icon size={14} /> {a.label}
            </motion.button>
          ))}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: "9px 18px", borderRadius: T.radiusSm, display: "flex", alignItems: "center", gap: 7,
              background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
              border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: `0 4px 20px ${T.primary}44`,
            }}>
            <FiPlus size={14} /> Invite User
          </motion.button>
        </div>
      </motion.div>

      {/* Stat Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
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

      {/* Table Card */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} style={{ ...glassCard() }}>

        {/* Toolbar */}
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${T.glassBorder}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <FiSearch size={14} color={T.text3} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search users, email, ID…"
              style={{
                width: "100%", padding: "9px 12px 9px 36px", borderRadius: T.radiusSm,
                background: T.bg2, border: `1px solid ${T.glassBorder}`,
                color: T.text0, fontSize: 13, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            style={{ padding: "9px 12px", borderRadius: T.radiusSm, background: T.bg2, border: `1px solid ${T.glassBorder}`, color: T.text1, fontSize: 13, cursor: "pointer", outline: "none" }}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>

          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: "9px 12px", borderRadius: T.radiusSm, background: T.bg2, border: `1px solid ${T.glassBorder}`, color: T.text1, fontSize: 13, cursor: "pointer", outline: "none" }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>

          {selected.size > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
              <span style={{ fontSize: 12, color: T.text2 }}>{selected.size} selected</span>
              {[
                { icon: FiLock, label: "Suspend", color: T.warning },
                { icon: FiTrash2, label: "Delete", color: T.danger },
              ].map(a => (
                <motion.button key={a.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ ...glassCard(), padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: a.color, fontSize: 12, border: `1px solid ${a.color}30`, background: `${a.color}10` }}>
                  <a.icon size={12} /> {a.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Table Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", borderBottom: `1px solid ${T.glassBorder}` }}>
          <div style={{ width: 32, marginRight: 12, flexShrink: 0 }}>
            <input type="checkbox"
              checked={paginated.length > 0 && paginated.every(u => selected.has(u.id))}
              onChange={() => toggleAll(paginated)}
              style={{ cursor: "pointer", accentColor: T.primary }}
            />
          </div>
          {COL_HEADERS.map(col => (
            <div key={col.field} onClick={() => toggleSort(col.field)}
              style={{ flex: col.flex, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", userSelect: "none" }}>
              <span style={{ fontSize: 11, color: sort.field === col.field ? T.primary : T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{col.label}</span>
              <SortIcon field={col.field} sort={sort} />
            </div>
          ))}
          <div style={{ width: 36, flexShrink: 0 }} />
        </div>

        {/* Table Body */}
        <div>
          <AnimatePresence mode="popLayout">
            {paginated.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ padding: "48px 20px", textAlign: "center" }}>
                <FiUsers size={32} color={T.text3} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: T.text2 }}>No users match your filters</div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>Try adjusting your search or filters</div>
              </motion.div>
            ) : paginated.map((user, i) => {
              const isSel = selected.has(user.id);
              const statusStyle = STATUS_STYLES[user.status];
              return (
                <motion.div
                  key={user.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                  exit={{ opacity: 0 }}
                  whileHover={{ background: "rgba(255,255,255,0.025)" }}
                  style={{
                    display: "flex", alignItems: "center", padding: "14px 20px",
                    borderBottom: `1px solid ${T.glassBorder}`,
                    background: isSel ? `${T.primary}08` : "transparent",
                    transition: "background 0.15s", cursor: "pointer",
                  }}
                  onClick={() => setDrawerUser(user)}
                >
                  <div style={{ width: 32, marginRight: 12, flexShrink: 0 }} onClick={e => { e.stopPropagation(); toggleSelect(user.id); }}>
                    <input type="checkbox" checked={isSel} onChange={() => {}} style={{ cursor: "pointer", accentColor: T.primary }} />
                  </div>

                  {/* User col */}
                  <div style={{ flex: 2.2, display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar initials={user.avatar} index={USERS.indexOf(user)} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text0 }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: T.text3 }}>{user.email}</div>
                    </div>
                  </div>

                  <div style={{ flex: 1.4 }}>
                    <Badge label={user.role} color={ROLE_COLORS[user.role]} bg={`${ROLE_COLORS[user.role]}15`} border={`${ROLE_COLORS[user.role]}28`} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <Badge label={user.status} color={statusStyle.color} bg={statusStyle.bg} border={statusStyle.border} />
                  </div>

                  <div style={{ flex: 0.8, fontSize: 13, color: T.text1, fontVariantNumeric: "tabular-nums" }}>
                    {user.vaults}
                  </div>

                  <div style={{ flex: 1.1, fontSize: 12, color: T.text2 }}>{user.region}</div>

                  <div style={{ flex: 1, fontSize: 12, color: T.text3 }}>{user.lastSeen}</div>

                  <div style={{ flex: 0.7 }}>
                    {user.mfa
                      ? <FiShield size={14} color={T.success} title="MFA Enabled" />
                      : <FiAlertCircle size={14} color={T.warning} title="MFA Disabled" />
                    }
                  </div>

                  <div style={{ width: 36, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <motion.button whileHover={{ background: T.bg3 }} whileTap={{ scale: 0.9 }}
                      style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.text3 }}>
                      <FiMoreHorizontal size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12, color: T.text3 }}>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} users
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <motion.button key={p} whileTap={{ scale: 0.9 }} onClick={() => setPage(p)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: page === p ? `linear-gradient(135deg, ${T.primary}, ${T.accent})` : T.bg2,
                  border: `1px solid ${page === p ? T.primary : T.glassBorder}`,
                  color: page === p ? "#fff" : T.text2,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  boxShadow: page === p ? `0 0 14px ${T.primary}44` : "none",
                }}>
                {p}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <UserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} />

      <style>{`
        select option { background: ${T.bg2}; color: ${T.text1}; }
        input[type="checkbox"] { width: 15px; height: 15px; }
        @media (max-width: 1024px) {
          .users-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .users-stats { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
