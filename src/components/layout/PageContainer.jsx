import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const T = {
  bg0: "#070B14",
  bg1: "#0B1220",
  bg2: "#111827",
  bg3: "#1a2235",
  primary: "#6366F1",
  secondary: "#06B6D4",
  text0: "#F8FAFC",
  text1: "#CBD5E1",
  text2: "#94A3B8",
  text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
  glass: "rgba(255,255,255,0.03)",
};

const PageContainer = ({ 
  children, 
  title, 
  subtitle,
  breadcrumbs,
  actions,
  className = "",
  animated = true,
  maxWidth = "100%",
  padding = "24px"
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const headerElement = container.querySelector("[data-page-header]");
      if (headerElement) {
        if (scrollTop > 0) {
          headerElement.style.borderBottom = `0.5px solid ${T.border}`;
          headerElement.style.backdropFilter = "blur(16px)";
          headerElement.style.background = "rgba(255,255,255,0.01)";
        } else {
          headerElement.style.borderBottom = "none";
          headerElement.style.backdropFilter = "blur(12px)";
          headerElement.style.background = "rgba(255,255,255,0.02)";
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", delay: 0.08 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", delay: 0.16 },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      className={className}
      initial={animated ? "hidden" : "visible"}
      animate="visible"
      variants={containerVariants}
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        background: 'transparent',
        
        position: "relative",
        color: T.text0,
      }}
      onMouseMove={(e) => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          containerRef.current.style.setProperty("--cursor-x", `${x}px`);
          containerRef.current.style.setProperty("--cursor-y", `${y}px`);
        }
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          [data-page-container] {
            padding: 16px !important;
          }
          [data-page-header] {
            padding: 16px !important;
          }
          [data-page-content] {
            padding: 0 !important;
          }
        }

        @media (max-width: 480px) {
          [data-page-container] {
            padding: 12px !important;
          }
          [data-page-header] {
            padding: 12px !important;
            flex-direction: column;
            align-items: flex-start;
          }
          [data-page-header-title] {
            margin-bottom: 12px;
          }
        }

        [data-page-container]::-webkit-scrollbar {
          width: 8px;
        }

        [data-page-container]::-webkit-scrollbar-track {
          background: transparent;
        }

        [data-page-container]::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        [data-page-container]::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>

      {(title || subtitle || breadcrumbs || actions) && (
        <motion.div
          data-page-header
          initial={animated ? "hidden" : "visible"}
          animate="visible"
          variants={headerVariants}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: padding,
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "none",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {breadcrumbs && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: T.text3,
                }}
              >
                {breadcrumbs.map((crumb, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {idx > 0 && <span>/</span>}
                    <span 
                      style={{
                        cursor: crumb.onClick ? "pointer" : "default",
                        color: idx === breadcrumbs.length - 1 ? T.primary : T.text3,
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (crumb.onClick) e.target.style.color = T.primary;
                      }}
                      onMouseLeave={(e) => {
                        if (crumb.onClick) e.target.style.color = T.text3;
                      }}
                      onClick={crumb.onClick}
                    >
                      {crumb.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            <div
              data-page-header-title
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {title && (
                <motion.h1
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.3 }}
                  style={{
                    margin: 0,
                    fontSize: "28px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: T.text0,
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </motion.h1>
              )}
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.16, duration: 0.3 }}
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: T.text2,
                    fontWeight: 400,
                    lineHeight: 1.5,
                  }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>

          {actions && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexShrink: 0,
                marginLeft: "24px",
              }}
            >
              {actions}
            </motion.div>
          )}
        </motion.div>
      )}

      <motion.div
        data-page-content
        initial={animated ? "hidden" : "visible"}
        animate="visible"
        variants={contentVariants}
        style={{
          padding: padding,
          maxWidth: maxWidth,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {children}
      </motion.div>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.03,
          backgroundImage: `
            radial-gradient(
              circle at var(--cursor-x, 50%) var(--cursor-y, 50%),
              ${T.primary} 0%,
              transparent 100%
            )
          `,
          transition: "opacity 0.3s ease",
          zIndex: 1,
        }}
      />
    </motion.div>
  );
};

export default PageContainer;
