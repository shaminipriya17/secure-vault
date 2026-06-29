import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "./components/layout/MainLayout";
import PageContainer from "./components/layout/PageContainer";
import DarkVeil from "./components/DarkVeil";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Vaults from "./pages/Vaults";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Security from "./pages/Security";

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem("auth");
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          setUser(authData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback((credentials) => {
    try {
      const userData = {
        id: "user_001",
        email: credentials.email,
        name: "Admin User",
        role: "Administrator",
        avatar: "AD",
        organization: "SecureVault",
      };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("auth", JSON.stringify(userData));
      return Promise.resolve(userData);
    } catch (error) {
      return Promise.reject(error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("auth");
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "2px solid rgba(99,102,241,0.2)",
          borderTopColor: "#6366F1",
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ fontSize: "12px", color: "#64748B", letterSpacing: "0.08em" }}
      >
        SECUREVAULT
      </motion.div>
    </div>
  </motion.div>
);

// ─── Route Guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── Layout Wrapper ───────────────────────────────────────────────────────────
const LayoutWrapper = ({ children }) => (
  <MainLayout>
    <PageContainer animated>{children}</PageContainer>
  </MainLayout>
);

// ─── Page Transition Wrapper ──────────────────────────────────────────────────
const Page = ({ id, children }) => (
  <motion.div
    key={id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.22, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// ─── App Routes ───────────────────────────────────────────────────────────────
const AppContent = () => (
  <AnimatePresence mode="wait">
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Page id="login"><Login /></Page>
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Page id="dashboard">
              <LayoutWrapper><Dashboard /></LayoutWrapper>
            </Page>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Page id="users">
              <LayoutWrapper><Users /></LayoutWrapper>
            </Page>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vaults"
        element={
          <ProtectedRoute>
            <Page id="vaults">
              <LayoutWrapper><Vaults /></LayoutWrapper>
            </Page>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Page id="analytics">
              <LayoutWrapper><Analytics /></LayoutWrapper>
            </Page>
          </ProtectedRoute>
        }
      />
      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <Page id="security">
              <LayoutWrapper><Security /></LayoutWrapper>
            </Page>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Page id="settings">
              <LayoutWrapper><Settings /></LayoutWrapper>
            </Page>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Page id="profile">
              <LayoutWrapper><Profile /></LayoutWrapper>
            </Page>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Page id="notifications">
              <LayoutWrapper><Notifications /></LayoutWrapper>
            </Page>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="*"
        element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              width: "100%",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              style={{
                fontSize: "80px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                background: "linear-gradient(135deg, #818CF8 0%, #22D3EE 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              404
            </motion.div>
            <div style={{ fontSize: "15px", color: "#64748B" }}>
              This page doesn't exist
            </div>
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => (window.location.href = "/")}
              style={{
                marginTop: "8px",
                padding: "10px 22px",
                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                boxShadow: "0 0 20px rgba(99,102,241,0.35)",
              }}
            >
              Go back home
            </motion.button>
          </motion.div>
        }
      />
    </Routes>
  </AnimatePresence>
);

// ─── Root App ─────────────────────────────────────────────────────────────────
const App = () => (
  <Router>
    <AuthProvider>

      {/* ── DarkVeil WebGL background — fixed, full viewport, behind everything ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <DarkVeil
          hueShift={260}
          speed={2.5}
          warpAmount={1.2}
          noiseIntensity={0.18}
          scanlineIntensity={0.08}
          scanlineFrequency={2.5}
          resolutionScale={1}
        />
      </div>

      {/* ── Dark overlay — keeps text/cards readable over the animation ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: "rgba(2, 5, 9, 0.72)",
        }}
      />

      {/* ── App shell — all pages render above the background ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          minHeight: "100vh",
          color: "#F8FAFC",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        }}
      >
        <AppContent />
      </motion.div>

    </AuthProvider>
  </Router>
);

export default App;
export { useAuth, AuthProvider };

