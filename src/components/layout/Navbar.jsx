import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
  FiChevronDown,
  FiHelpCircle,
  FiMoon,
  FiSun,
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
  danger: "#EF4444",
  warning: "#F59E0B",
  text0: "#F8FAFC",
  text1: "#CBD5E1",
  text2: "#94A3B8",
  text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  glass: "rgba(255,255,255,0.03)",
  glassHover: "rgba(255,255,255,0.055)",
};

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Security Alert",
    message: "Unusual login attempt detected",
    timestamp: "2 min ago",
    icon: "🔒",
    unread: true,
    color: T.danger,
  },
  {
    id: 2,
    title: "Vault Updated",
    message: "Main vault synchronized",
    timestamp: "1 hour ago",
    icon: "📦",
    unread: true,
    color: T.success,
  },
  {
    id: 3,
    title: "Backup Complete",
    message: "Daily backup finished successfully",
    timestamp: "3 hours ago",
    icon: "✓",
    unread: false,
    color: T.secondary,
  },
  {
    id: 4,
    title: "Team Invitation",
    message: "John invited you to Engineering team",
    timestamp: "1 day ago",
    icon: "👥",
    unread: false,
    color: T.primary,
  },
];

const Navbar = ({ sidebarOpen = true, onToggleSidebar = () => {}, isMobile = false }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    if (notificationsOpen || profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [notificationsOpen, profileOpen]);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -12, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -12, scale: 0.95, transition: { duration: 0.15 } },
  };

  const notificationItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.04, duration: 0.2 },
    }),
  };

  return (
    <motion.nav
      data-navbar
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        width: "100%",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: `linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `0.5px solid ${T.border}`,
        flexShrink: 0,
        position: "relative",
        zIndex: 30,
      }}
    >
      <style>{`
        @media (max-width: 1023px) {
          [data-navbar] {
            padding: 0 16px;
          }
        }

        @media (max-width: 640px) {
          [data-navbar] {
            padding: 0 12px;
          }
          [data-navbar-search] {
            display: none;
          }
          [data-navbar-left] {
            gap: 8px;
          }
        }
      `}</style>

      {/* Left Section */}
      <motion.div
        data-navbar-left
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flex: 1,
        }}
      >
        {isMobile && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onToggleSidebar}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: T.glass,
              border: `0.5px solid ${T.border}`,
              color: T.text1,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onHoverStart={(e) => {
              e.currentTarget.style.background = T.glassHover;
              e.currentTarget.style.borderColor = T.borderHover;
            }}
            onHoverEnd={(e) => {
              e.currentTarget.style.background = T.glass;
              e.currentTarget.style.borderColor = T.border;
            }}
          >
            <FiMenu size={20} />
          </motion.button>
        )}

        {/* Search Bar */}
        <motion.div
          data-navbar-search
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.3 }}
          style={{
            flex: 1,
            maxWidth: "320px",
          }}
        >
          <motion.div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 16px",
              background: T.glass,
              border: `0.5px solid ${searchFocused ? T.primary : T.border}`,
              borderRadius: "10px",
              transition: "all 0.2s ease",
            }}
            animate={{
              borderColor: searchFocused ? T.primary : T.border,
              background: searchFocused ? "rgba(99,102,241,0.08)" : T.glass,
            }}
          >
            <motion.div
              animate={{ color: searchFocused ? T.primary : T.text2 }}
              transition={{ duration: 0.2 }}
            >
              <FiSearch size={16} />
            </motion.div>
            <input
              type="text"
              placeholder="Search vaults, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: T.text0,
                fontSize: "13px",
                outline: "none",
              }}
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  color: T.text3,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0",
                }}
              >
                <FiX size={14} />
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Section */}
      <motion.div
        data-navbar-right
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {/* Help Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: T.glass,
            border: `0.5px solid ${T.border}`,
            color: T.text2,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onHoverStart={(e) => {
            e.currentTarget.style.background = T.glassHover;
            e.currentTarget.style.borderColor = T.borderHover;
          }}
          onHoverEnd={(e) => {
            e.currentTarget.style.background = T.glass;
            e.currentTarget.style.borderColor = T.border;
          }}
        >
          <FiHelpCircle size={18} />
        </motion.button>

        {/* Notifications */}
        <motion.div
          ref={notificationsRef}
          style={{ position: "relative" }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: T.glass,
              border: `0.5px solid ${notificationsOpen ? T.primary : T.border}`,
              color: notificationsOpen ? T.primary : T.text2,
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onHoverStart={(e) => {
              if (!notificationsOpen) {
                e.currentTarget.style.background = T.glassHover;
                e.currentTarget.style.borderColor = T.borderHover;
              }
            }}
            onHoverEnd={(e) => {
              if (!notificationsOpen) {
                e.currentTarget.style.background = T.glass;
                e.currentTarget.style.borderColor = T.border;
              }
            }}
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: T.danger,
                  color: T.text0,
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${T.bg1}`,
                }}
              >
                {unreadCount}
              </motion.div>
            )}
          </motion.button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  position: "absolute",
                  top: "56px",
                  right: "0",
                  width: "360px",
                  maxHeight: "480px",
                  background: `linear-gradient(180deg, ${T.bg2} 0%, ${T.bg1} 100%)`,
                  border: `0.5px solid ${T.border}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  zIndex: 100,
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
              >
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    padding: "16px",
                    borderBottom: `0.5px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 600, color: T.text0 }}>
                    Notifications
                  </div>
                  {unreadCount > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: T.primary,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Mark all as read
                    </motion.button>
                  )}
                </motion.div>

                {/* Notifications List */}
                <motion.div
                  style={{
                    overflowY: "auto",
                    maxHeight: "400px",
                  }}
                >
                  {NOTIFICATIONS.length > 0 ? (
                    NOTIFICATIONS.map((notif, i) => (
                      <motion.button
                        key={notif.id}
                        custom={i}
                        variants={notificationItemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ background: T.glassHover }}
                        onClick={() => setNotificationsOpen(false)}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: notif.unread ? `rgba(99,102,241,0.1)` : "transparent",
                          border: "none",
                          borderBottom: `0.5px solid ${T.border}`,
                          color: "inherit",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <motion.div
                          style={{
                            fontSize: "20px",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          {notif.icon}
                        </motion.div>
                        <motion.div style={{ flex: 1, minWidth: 0 }}>
                          <motion.div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "4px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: T.text0,
                              }}
                            >
                              {notif.title}
                            </div>
                            {notif.unread && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background: T.primary,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </motion.div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: T.text2,
                              marginBottom: "4px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {notif.message}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: T.text3,
                            }}
                          >
                            {notif.timestamp}
                          </div>
                        </motion.div>
                      </motion.button>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        padding: "32px 16px",
                        textAlign: "center",
                        color: T.text3,
                        fontSize: "12px",
                      }}
                    >
                      No notifications yet
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Profile Dropdown */}
        <motion.div
          ref={profileRef}
          style={{ position: "relative" }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              background: T.glass,
              border: `0.5px solid ${profileOpen ? T.primary : T.border}`,
              color: profileOpen ? T.primary : T.text1,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onHoverStart={(e) => {
              if (!profileOpen) {
                e.currentTarget.style.background = T.glassHover;
                e.currentTarget.style.borderColor = T.borderHover;
              }
            }}
            onHoverEnd={(e) => {
              if (!profileOpen) {
                e.currentTarget.style.background = T.glass;
                e.currentTarget.style.borderColor = T.border;
              }
            }}
          >
            <motion.div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: T.text0,
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              AD
            </motion.div>
            <motion.div
              animate={{ rotate: profileOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiChevronDown size={16} />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  position: "absolute",
                  top: "56px",
                  right: "0",
                  width: "240px",
                  background: `linear-gradient(180deg, ${T.bg2} 0%, ${T.bg1} 100%)`,
                  border: `0.5px solid ${T.border}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  zIndex: 100,
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
              >
                {/* User Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08 }}
                  style={{
                    padding: "16px",
                    borderBottom: `0.5px solid ${T.border}`,
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600, color: T.text0 }}>
                    Admin User
                  </div>
                  <div style={{ fontSize: "11px", color: T.text3, marginTop: "2px" }}>
                    admin@vault.io
                  </div>
                </motion.div>

                {/* Menu Items */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.12 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "8px",
                  }}
                >
                  {[
                    { icon: FiUser, label: "Profile", action: () => setProfileOpen(false) },
                    { icon: FiSettings, label: "Settings", action: () => setProfileOpen(false) },
                  ].map((item, i) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.16 + i * 0.04 }}
                      whileHover={{ background: T.glassHover }}
                      onClick={item.action}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        color: T.text1,
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 500,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </motion.button>
                  ))}
                </motion.div>

                {/* Logout */}
                <motion.div
                  style={{
                    borderTop: `0.5px solid ${T.border}`,
                    padding: "8px",
                  }}
                >
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.24 }}
                    whileHover={{ background: "rgba(239,68,68,0.1)" }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      background: "transparent",
                      border: "none",
                      borderRadius: "6px",
                      color: T.danger,
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <FiLogOut size={16} />
                    Logout
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
