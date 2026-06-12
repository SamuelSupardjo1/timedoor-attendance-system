import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import timedoorLogo from "../assets/timedoor_logo.png";

/* ─── SVG Icon Components ─────────────────────────────────── */
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

/* ─── Particle canvas ────────────────────────────────────────── */
const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLES = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      PARTICLES.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134, 239, 172, ${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
};

/* ─── Feature cards data ─────────────────────────────────────── */
const FEATURES = [
  { icon: "📚", label: "Courses", desc: "Manage curriculum" },
  { icon: "🏫", label: "Classes", desc: "Organise groups" },
  { icon: "👩‍🏫", label: "Teachers", desc: "Staff records" },
  { icon: "📋", label: "Attendance", desc: "Track presence" },
  { icon: "📊", label: "Reports", desc: "Live analytics" },
  { icon: "👨‍👩‍👧", label: "Parents", desc: "Family portal" },
];

const ROLES = [
  { role: "Admin", icon: "🛡️", gradient: "linear-gradient(135deg,#7c3aed,#a855f7)" },
  { role: "Teacher", icon: "👩‍🏫", gradient: "linear-gradient(135deg,#0369a1,#38bdf8)" },
  { role: "Student", icon: "🎓", gradient: "linear-gradient(135deg,#16a34a,#4ade80)" },
  { role: "Parent", icon: "👨‍👩‍👧", gradient: "linear-gradient(135deg,#c2410c,#fb923c)" },
];

/* ─── Main Component ─────────────────────────────────────────── */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [mounted, setMounted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Google Fonts ── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div className="login-root">

        {/* ══════════════════════ LEFT PANEL ══════════════════════ */}
        <div className="left-panel">
          <ParticleField />

          {/* Glowing orbs */}
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        {/* ══════════════════════ RIGHT PANEL ══════════════════════ */}
        <div className="right-panel">
          {/* Subtle background grid */}
          <div className="right-grid" />

          {/* Logo — top-left */}
          <div className="right-logo">
            <img src={timedoorLogo} alt="Timedoor" style={{ height: '60px', display: 'block' }} />
          </div>

          <div className={`form-card anim-slide ${mounted ? "anim-in" : ""}`} style={{ animationDelay: "0.1s" }}>

            {/* Form header */}
            <div className="form-header">
              <h2 className="form-title">Welcome to Timedoor</h2>
              <p className="form-subtitle">Sign in to manage attendance and stay connected.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="error-banner">
                <IconAlert />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">

              {/* Email field */}
              <div className="field">
                <label className="field-label" htmlFor="login-email">Email address</label>
                <div className={`field-wrap ${focused === "email" ? "focused" : ""}`}>
                  <span className="field-icon">
                    <IconMail />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="you@school.com"
                    required
                    className="field-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="field">
                <label className="field-label" htmlFor="login-password">Password</label>
                <div className={`field-wrap ${focused === "password" ? "focused" : ""}`}>
                  <span className="field-icon">
                    <IconLock />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    required
                    className="field-input field-input-pw"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-pw"
                    title={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className={`submit-btn ${loading ? "loading" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <IconArrow />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>

      {/* ── Styles ─────────────────────────────────────────────── */}
      <style>{`
        /* Reset */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #080c14;
        }

        /* ─── Animations ─────────── */
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 30px) scale(0.97); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }
        @keyframes pulseGreen {
          0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
          50%      { box-shadow: 0 0 0 6px rgba(74,222,128,0); }
        }

        .anim-fade { opacity: 0; }
        .anim-fade.anim-in { animation: fadeUp 0.6s cubic-bezier(.16,1,.3,1) both; }
        .anim-slide { opacity: 0; }
        .anim-slide.anim-in { animation: slideRight 0.65s cubic-bezier(.16,1,.3,1) both; }

        /* ─── Left panel ─────────── */
        .left-panel {
          flex: 0 0 40%;
          background: linear-gradient(160deg, #14532d 0%, #16a34a 45%, #22c55e 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 48px;
          position: relative;
          overflow: hidden;
        }

        /* Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(70px);
          animation: floatOrb 12s ease-in-out infinite;
        }
        .orb-1 {
          width: 420px; height: 420px;
          top: -120px; right: -100px;
          background: radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%);
          animation-delay: 0s;
        }
        .orb-2 {
          width: 380px; height: 380px;
          bottom: -140px; left: -80px;
          background: radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 70%);
          animation-delay: -4s;
        }
        .orb-3 {
          width: 280px; height: 280px;
          top: 45%; right: -60px;
          background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
          animation-delay: -8s;
        }

        /* Logo */
        .left-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }
        .logo-pill {
          width: 46px; height: 46px;
          border-radius: 14px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        .logo-name {
          color: #fff;
          font-weight: 800;
          font-size: 19px;
          letter-spacing: -0.3px;
        }

        /* Hero */
        .left-hero { position: relative; z-index: 2; }

        .left-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(74,222,128,0.12);
          border: 1px solid rgba(74,222,128,0.25);
          color: #4ade80;
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4ade80;
          display: inline-block;
          animation: pulseGreen 2s ease-in-out infinite;
        }
        .badge-dot.green { background: #22c55e; animation: pulseGreen 2s ease-in-out infinite; }

        .left-heading {
          font-size: clamp(32px, 3.5vw, 46px);
          font-weight: 900;
          color: #fff;
          line-height: 1.12;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }
        .heading-accent {
          background: linear-gradient(90deg, #4ade80, #86efac);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .left-sub {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          line-height: 1.75;
          max-width: 340px;
          margin-bottom: 36px;
        }

        /* Feature grid */
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          max-width: 280px;
        }
        .feature-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 14px 10px 12px;
          text-align: center;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
          cursor: default;
        }
        .feature-card:hover {
          background: rgba(74,222,128,0.1);
          border-color: rgba(74,222,128,0.3);
          transform: translateY(-3px);
        }
        .feature-icon { display: block; font-size: 22px; margin-bottom: 5px; }
        .feature-label {
          display: block;
          color: rgba(255,255,255,0.85);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .feature-desc {
          display: block;
          color: rgba(255,255,255,0.35);
          font-size: 9px;
          letter-spacing: 0.2px;
        }

        /* Stats */
        .left-stats {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
          position: relative;
          z-index: 2;
        }
        .stat-item {}
        .stat-value { color: #fff; font-weight: 700; font-size: 14px; }
        .stat-label { color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 2px; }
        .stat-divider {
          width: 1px; height: 32px;
          background: rgba(255,255,255,0.12);
        }

        /* ─── Right panel ─────────── */
        .right-panel {
          flex: 0 0 60%;
          background: #ffffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
        }

        /* Subtle dot grid */
        .right-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* Form card */
        .form-card {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
        }

        /* Logo top-left of right panel */
        .right-logo {
          position: absolute;
          top: 36px;
          left: 44px;
          z-index: 2;
        }

        /* Form header */
        .form-header { margin-bottom: 32px; }
        .form-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.2);
          color: #22c55e;
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .form-title {
          font-size: 30px;
          font-weight: 800;
          color: #000000ff;
          letter-spacing: -0.6px;
          margin-bottom: 8px;
        }
        .form-subtitle {
          color: #475569;
          font-size: 14px;
          line-height: 1.6;
        }

        /* Error */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.3);
          color: #dc2626;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
          animation: shake 0.4s ease;
        }

        /* Login form */
        .login-form { display: flex; flex-direction: column; gap: 20px; }

        /* Fields */
        .field {}
        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          letter-spacing: 0.1px;
        }
        .field-wrap {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1.5px solid #d1d5db;
          border-radius: 14px;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field-wrap.focused {
          background: #f0fdf4;
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.12);
        }
        .field-icon {
          display: flex;
          align-items: center;
          padding: 0 14px;
          color: #6b7280;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .field-wrap.focused .field-icon { color: #16a34a; }

        .field-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #111827;
          font-size: 14px;
          font-family: inherit;
          padding: 14px 14px 14px 0;
        }
        .field-input::placeholder { color: #9ca3af; }
        .field-input-pw { padding-right: 0; }

        .toggle-pw {
          background: none;
          border: none;
          color: #6b7280;
          display: flex;
          align-items: center;
          padding: 0 14px;
          cursor: pointer;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .toggle-pw:hover { color: #374151; }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 15px 20px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          box-shadow: 0 4px 20px rgba(22,163,74,0.3), 0 0 0 0 rgba(74,222,128,0);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.2px;
          margin-top: 4px;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(22,163,74,0.45);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 3px 14px rgba(22,163,74,0.3);
        }
        .submit-btn.loading {
          background: #166534;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        /* Spinner */
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Role section */
        .role-section {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
        .role-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .role-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .role-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          border-radius: 8px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.2px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }
        .role-hint {
          color: #6b7280;
          font-size: 11.5px;
          line-height: 1.6;
        }

        /* ─── Responsive ─────────── */
        @media (max-width: 820px) {
          .login-root { flex-direction: column; }
          .left-panel {
            flex: none;
            min-height: 320px;
            padding: 36px 28px;
          }
          .left-hero { display: none; }
          .left-stats { display: none; }
          .right-panel { padding: 40px 24px; }
        }

        @media (max-width: 480px) {
          .left-panel { min-height: 220px; padding: 28px 20px; }
          .form-card { max-width: 100%; }
        }
      `}</style>
    </>
  );
};

export default Login;