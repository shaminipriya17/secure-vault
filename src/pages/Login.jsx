import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../App";

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
  text0: "#F8FAFC",
  text1: "#CBD5E1",
  text2: "#94A3B8",
  text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  glass: "rgba(255,255,255,0.03)",
  glassHover: "rgba(255,255,255,0.055)",
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setSuccess(false);

      if (!email.trim()) {
        setError("Email is required");
        return;
      }

      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (!password) {
        setError("Password is required");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await login({ email, password });
        setSuccess(true);
        
        await new Promise((resolve) => setTimeout(resolve, 800));
        navigate("/dashboard");
      } catch (err) {
        setError(err.message || "Login failed. Please try again.");
        setLoading(false);
      }
    },
    [email, password, login, navigate]
  );

  const handleDemoLogin = useCallback(async () => {
    setEmail("demo@securevault.io");
    setPassword("Demo123!");
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await login({ email: "demo@securevault.io", password: "Demo123!" });
      setSuccess(true);
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/dashboard");
    } catch (err) {
      setError("Demo login failed. Please try again.");
      setLoading(false);
    }
  }, [login, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut", delay: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.2 + i * 0.08, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: `linear-gradient(135deg, ${T.bg0} 0%, ${T.bg1} 50%, ${T.bg0} 100%)`,
        backgroundAttachment: "fixed",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          [data-login-card] {
            max-width: 100% !important;
          }
          [data-login-header] h1 {
            font-size: 24px !important;
          }
        }
      `}</style>

      {/* Background gradient blob */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          top: "-50%",
          right: "-50%",
          width: "600px",
          height: "600px",
          background: `radial-gradient(circle, ${T.primary}20 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        animate={{
          scale: [1, 0.9, 1],
          rotate: [0, -180, -360],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "-30%",
          width: "500px",
          height: "500px",
          background: `radial-gradient(circle, ${T.secondary}15 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Login Card */}
      <motion.div
        data-login-card
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: `linear-gradient(135deg, ${T.glass} 0%, rgba(255,255,255,0.015) 100%)`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `0.5px solid ${T.border}`,
          borderRadius: "20px",
          padding: "48px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <motion.div
          data-login-header
          custom={0}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          style={{
            marginBottom: "32px",
            textAlign: "center",
          }}
        >
          <motion.div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "14px",
              background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.text0,
              fontSize: "28px",
              fontWeight: 700,
              margin: "0 auto 16px",
            }}
            whileHover={{ scale: 1.05 }}
          >
            SV
          </motion.div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: T.text0,
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            SecureVault
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: T.text2,
              margin: 0,
            }}
          >
            Enterprise password management platform
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              background: "rgba(239,68,68,0.1)",
              border: "0.5px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              color: T.danger,
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            <FiAlertCircle size={16} />
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              background: "rgba(16,185,129,0.1)",
              border: "0.5px solid rgba(16,185,129,0.3)",
              borderRadius: "10px",
              color: T.success,
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            <FiCheckCircle size={16} />
            Login successful! Redirecting...
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email Field */}
          <motion.div
            custom={1}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: T.text1,
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <FiMail size={14} />
              Email Address
            </label>
            <motion.input
              type="email"
              placeholder="admin@securevault.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              whileFocus={{ scale: 1.01 }}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: T.glass,
                border: `0.5px solid ${T.border}`,
                borderRadius: "10px",
                color: T.text0,
                fontSize: "14px",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = T.primary;
                e.target.style.background = `rgba(99,102,241,0.08)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = T.border;
                e.target.style.background = T.glass;
              }}
            />
          </motion.div>

          {/* Password Field */}
          <motion.div
            custom={2}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: T.text1,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <FiLock size={14} />
                Password
              </label>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  color: T.text3,
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 500,
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = T.primary)}
                onMouseLeave={(e) => (e.target.style.color = T.text3)}
              >
                {showPassword ? "Hide" : "Show"}
              </motion.button>
            </div>
            <motion.input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              whileFocus={{ scale: 1.01 }}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: T.glass,
                border: `0.5px solid ${T.border}`,
                borderRadius: "10px",
                color: T.text0,
                fontSize: "14px",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = T.primary;
                e.target.style.background = `rgba(99,102,241,0.08)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = T.border;
                e.target.style.background = T.glass;
              }}
            />
          </motion.div>

          {/* Remember & Forgot */}
          <motion.div
            custom={3}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: T.text2,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                style={{
                  width: "14px",
                  height: "14px",
                  cursor: "pointer",
                  accentColor: T.primary,
                }}
              />
              Remember me
            </label>
            <motion.button
              type="button"
              whileHover={{ color: T.primary }}
              style={{
                background: "none",
                border: "none",
                color: T.text2,
                cursor: "pointer",
                fontWeight: 500,
                transition: "color 0.2s ease",
              }}
            >
              Forgot password?
            </motion.button>
          </motion.div>

          {/* Login Button */}
          <motion.button
            custom={4}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: `linear-gradient(90deg, ${T.primary}, ${T.secondary})`,
              border: "none",
              borderRadius: "10px",
              color: T.text0,
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              marginTop: "8px",
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: T.text0,
                }}
              />
            ) : (
              <>
                Sign In
                <FiArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <motion.div
          custom={5}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "24px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "0.5px",
              background: T.border,
            }}
          />
          <span style={{ fontSize: "11px", color: T.text3 }}>OR</span>
          <div
            style={{
              flex: 1,
              height: "0.5px",
              background: T.border,
            }}
          />
        </motion.div>

        {/* Demo Button */}
        <motion.button
          custom={6}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: T.glass,
            border: `0.5px solid ${T.border}`,
            borderRadius: "10px",
            color: T.text1,
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.glassHover;
            e.currentTarget.style.borderColor = T.borderHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = T.glass;
            e.currentTarget.style.borderColor = T.border;
          }}
        >
          Try Demo Account
        </motion.button>

        {/* Footer */}
        <motion.div
          custom={7}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "12px",
            color: T.text3,
          }}
        >
          <p style={{ margin: "8px 0" }}>
            By signing in, you agree to our{" "}
            <motion.a
              href="#"
              whileHover={{ color: T.primary }}
              style={{ color: T.primary, transition: "color 0.2s ease" }}
            >
              Terms of Service
            </motion.a>
            {" "}and{" "}
            <motion.a
              href="#"
              whileHover={{ color: T.primary }}
              style={{ color: T.primary, transition: "color 0.2s ease" }}
            >
              Privacy Policy
            </motion.a>
          </p>
        </motion.div>
      </motion.div>

      {/* Bottom decoration */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: T.text3,
            margin: 0,
          }}
        >
          Demo credentials: demo@securevault.io / Demo123!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
