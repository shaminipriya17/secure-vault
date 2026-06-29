import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiDatabase,
  FiBarChart2,
  FiSettings,
  FiLock,
  FiShield,
  FiFileText,
  FiBell,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";

const T = {
  bg0: "#070B14",
  bg1: "#0B1220",
  bg2: "#111827",
  bg3: "#1a2235",
  primary: "#6366F1",
  primaryGlow: "rgba(99,102,241,0.25)",
  secondary: "#06B6D4",
  secondaryGlow: "rgba(6,182,212,0.2)",
  success: "#10B981",
  text0: "#F8FAFC",
  text1: "#CBD5E1",
  text2: "#94A3B8",
  text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  glass: "rgba(255,255,255,0.03)",
  glassHover: "rgba(255,255,255,0.055)",
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/dashboard", badge: null },
  { id: "users", label: "Users", icon: FiUsers, path: "/users", badge: null },
  { id: "vaults", label: "Vaults", icon: FiDatabase, path: "/vaults", badge: "3" },
  { id: "analytics", label: "Analytics", icon: FiBarChart2, path: "/analytics", badge: null },
  { id: "security", label: "Security", icon: FiShield, path: "/security", badge: null },
];

const SECONDARY_ITEMS = [
  { id: "profile", label: "Profile", icon: FiLock, path: "/profile", badge: null },
  { id: "notifications", label: "Notifications", icon: FiBell, path: "/notifications", badge: "5" },
  { id: "settings", label: "Settings", icon: FiSettings, path: "/settings", badge: null },
];

const Sidebar = ({ isCollapsed = false, onNavigate = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedGroup, setExpandedGroup] = useState(null);

  const activeRoute = useMemo(() => {
    return location.pathname;
  }, [location.pathname]);

  const handleNavigate = (path) => {
    navigate(path);
    onNavigate();
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
    }),
  };

  const renderNavItem = (item, index, isSecondary = false) => {
    const Icon = item.icon;
    const isActive = activeRoute === item.path;

    return (
      <motion.button
        key={item.id}
        custom={index}
        variants={navItemVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleNavigate(item.path)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: isCollapsed ? "0" : "12px",
          padding: isCollapsed ? "12px" : "12px 16px",
          marginBottom: "4px",
          background: isActive ? T.primaryGlow : "transparent",
          border: isActive ? `0.5px solid ${T.primary}` : `0.5px solid transparent`,
          borderRadius: "10px",
          color: isActive ? T.primary : T.text2,
          cursor: "pointer",
          fontSize: isCollapsed ? "16px" : "13px",
          fontWeight: 500,
          transition: "all 0.2s ease",
          position: "relative",
          justifyContent: isCollapsed ? "center" : "flex-start",
        }}
        onHoverStart={() => {
          if (!isActive) {
            // Hover style is handled by whileHover in motion
          }
        }}
      >
        <motion.div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          animate={{ color: isActive ? T.primary : T.text2 }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={18} />
        </motion.div>

        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            style={{
              flex: 1,
              textAlign: "left",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </motion.span>
        )}

        {!isCollapsed && item.badge && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: isActive ? T.primary : T.secondary,
              color: T.bg0,
              fontSize: "10px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {item.badge}
          </motion.div>
        )}

        {isActive && !isCollapsed && (
          <motion.div
            layoutId="activeIndicator"
            style={{
              position: "absolute",
              right: -12,
              width: "4px",
              height: "20px",
              background: T.primary,
              borderRadius: "2px",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      data-sidebar
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        overflow: "hidden",
        padding: "20px 12px",
      }}
    >
      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: isCollapsed ? "0" : "12px",
          marginBottom: "28px",
          padding: isCollapsed ? "0 4px" : "0 8px",
          justifyContent: isCollapsed ? "center" : "flex-start",
        }}
      >
        <motion.div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: T.text0,
            fontSize: "18px",
            fontWeight: 700,
            flexShrink: 0,
          }}
          whileHover={{ scale: 1.05 }}
        >
          SV
        </motion.div>

        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.2 }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: T.text0,
                letterSpacing: "-0.01em",
              }}
            >
              SecureVault
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 500,
                color: T.text3,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Enterprise
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Primary Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {NAV_ITEMS.map((item, index) => renderNavItem(item, index))}
      </motion.div>

      {/* Divider */}
      {!isCollapsed && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          style={{
            height: "0.5px",
            background: T.border,
            marginBottom: "16px",
            borderRadius: "1px",
          }}
        />
      )}

      {/* Secondary Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "auto",
        }}
      >
        {SECONDARY_ITEMS.map((item, index) =>
          renderNavItem(item, NAV_ITEMS.length + index, true)
        )}
      </motion.div>

      {/* Footer Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.28, duration: 0.3 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          paddingTop: "16px",
          borderTop: `0.5px solid ${T.border}`,
        }}
      >
        {/* User Profile */}
        {!isCollapsed && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.3 }}
            whileHover={{ background: T.glassHover }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 12px",
              background: T.glass,
              border: `0.5px solid ${T.border}`,
              borderRadius: "10px",
              color: T.text1,
              cursor: "pointer",
              width: "100%",
              transition: "all 0.2s ease",
            }}
            onClick={() => handleNavigate("/profile")}
          >
            <motion.div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: T.text0,
                fontSize: "13px",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              AD
            </motion.div>
            <motion.div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                flex: 1,
                textAlign: "left",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: T.text0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Admin User
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: T.text3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                admin@vault.io
              </div>
            </motion.div>
            <motion.div
              whileHover={{ x: 2 }}
              style={{ color: T.text3, flexShrink: 0 }}
            >
              <FiChevronRight size={16} />
            </motion.div>
          </motion.button>
        )}

        {isCollapsed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32, duration: 0.3 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.text0,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              alignSelf: "center",
              transition: "all 0.2s ease",
            }}
            onClick={() => handleNavigate("/profile")}
          >
            AD
          </motion.button>
        )}

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: isCollapsed ? "0" : "12px",
            padding: isCollapsed ? "12px" : "12px 16px",
            background: "transparent",
            border: `0.5px solid ${T.border}`,
            borderRadius: "10px",
            color: T.text2,
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            transition: "all 0.2s ease",
            width: isCollapsed ? "auto" : "100%",
          }}
          onHoverStart={(e) => {
            e.currentTarget.style.color = "#EF4444";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
          }}
          onHoverEnd={(e) => {
            e.currentTarget.style.color = T.text2;
            e.currentTarget.style.borderColor = T.border;
            e.currentTarget.style.background = "transparent";
          }}
        >
          <FiLogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </motion.button>
      </motion.div>

      <style>{`
        [data-sidebar] {
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
        }

        [data-sidebar]::-webkit-scrollbar {
          width: 6px;
        }

        [data-sidebar]::-webkit-scrollbar-track {
          background: transparent;
        }

        [data-sidebar]::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 3px;
        }

        [data-sidebar]::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </motion.div>
  );
};

export default Sidebar;
