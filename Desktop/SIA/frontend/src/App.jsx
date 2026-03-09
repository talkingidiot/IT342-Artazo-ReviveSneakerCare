import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const NAV_LINKS = ["HOME", "SERVICES", "BRANCHES", "ABOUT US", "CONTACT US"];

const SECTION_IDS = {
  "HOME": "section-home",
  "SERVICES": "section-services",
  "BRANCHES": "section-branches",
  "ABOUT US": "section-about",
  "CONTACT US": "section-contact",
};

function CartSidebar({ cart, onClose, onRemove }) {
  const total = cart.reduce((sum, item) => sum + (item.basePrice || 0), 0);
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 998, display: "flex" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div style={{
        width: "380px", background: "#fff", height: "100%",
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
      }}>
        {/* Header */}
        <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid #f0ebe4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#3a2e1e", margin: 0 }}>
            Your Cart {cart.length > 0 && <span style={{ fontSize: "14px", color: "#8B7355" }}>({cart.length})</span>}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#999" }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛒</div>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "16px" }}>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #f5f2ee" }}>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px", fontWeight: 700, color: "#3a2e1e" }}>{item.name}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", color: "#8B7355" }}>{item.price}</div>
                </div>
                <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "16px" }}>✕</button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: "20px 28px 28px", borderTop: "1px solid #f0ebe4" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px", color: "#555" }}>Total</span>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "17px", fontWeight: 700, color: "#3a2e1e" }}>
                {total > 0 ? `From ₱${total}` : "See pricing"}
              </span>
            </div>
            <button style={{
              width: "100%", background: "#8B7355", color: "#fff", border: "none",
              borderRadius: "8px", padding: "14px",
              fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
              cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}>
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function LoginModal({ onClose }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const inputStyle = {
    width: "100%", padding: "12px 14px", border: "1.5px solid #e0dbd4",
    borderRadius: "8px", fontSize: "14px", fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: "#3a2e1e", background: "#fff", outline: "none", boxSizing: "border-box",
  };
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "440px", boxShadow: "0 24px 80px rgba(0,0,0,0.22)" }}>
        <div style={{ padding: "32px 36px 24px", borderBottom: "1px solid #f0ebe4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 700, color: "#3a2e1e", margin: 0 }}>Welcome Back</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#999" }}>✕</button>
        </div>
        <div style={{ padding: "28px 36px 36px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "14px", fontWeight: 600, color: "#3a2e1e", marginBottom: "7px" }}>Email Address</label>
            <input type="email" placeholder="your.email@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#8B7355")}
              onBlur={(e) => (e.target.style.borderColor = "#e0dbd4")} />
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "14px", fontWeight: 600, color: "#3a2e1e", marginBottom: "7px" }}>Password</label>
            <input type="password" placeholder="Enter your password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#8B7355")}
              onBlur={(e) => (e.target.style.borderColor = "#e0dbd4")} />
          </div>
          <button
            onClick={() => { /* TODO: connect to your auth API */ onClose(); }}
            style={{
              background: "#8B7355", color: "#fff", border: "none", borderRadius: "8px",
              padding: "14px", fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
              cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif", marginTop: "4px",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#6b5a3e")}
            onMouseLeave={(e) => (e.target.style.background = "#8B7355")}
          >
            LOG IN
          </button>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", color: "#999", textAlign: "center", margin: 0 }}>
            Don't have an account? <span style={{ color: "#8B7355", cursor: "pointer", fontWeight: 700 }}>Sign up</span>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Navbar({ cartCount, onCartOpen, onLoginOpen }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: "64px",
        background: scrolled ? "rgba(255,255,255,0.97)" : "#fff",
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.08)" : "none",
        borderBottom: "1px solid #ececec",
        transition: "box-shadow 0.3s",
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
      }}
    >
      {/* Logo */}
      <div
        style={{ cursor: "pointer" }}
        onClick={() => scrollTo("section-home")}
      >
        <div style={{
          border: "1.5px solid #8B7355", padding: "4px 10px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 700, fontSize: "15px", letterSpacing: "2px", color: "#3a2e1e", lineHeight: 1.1,
        }}>
          <div>REVIVE</div>
          <div style={{ fontSize: "7px", fontWeight: 400, letterSpacing: "1.5px", color: "#8B7355" }}>Sneaker Care</div>
        </div>
      </div>

      {/* Nav Links */}
      <ul style={{ display: "flex", gap: "36px", listStyle: "none", margin: 0, padding: 0 }}>
        {NAV_LINKS.map((link) => (
          <li key={link}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); scrollTo(SECTION_IDS[link]); }}
              style={{
                textDecoration: "none", fontSize: "12px", fontWeight: 600,
                letterSpacing: "1.5px", color: "#3a2e1e",
                fontFamily: "'Cormorant Garamond', Georgia, serif", transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#8B7355")}
              onMouseLeave={(e) => (e.target.style.color = "#3a2e1e")}
            >
              {link}
            </a>
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <button
          onClick={onCartOpen}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, position: "relative" }}
          aria-label="Cart"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3a2e1e" strokeWidth="1.8">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: "-6px", right: "-8px",
              background: "#e85c2c", color: "#fff", borderRadius: "50%",
              width: "18px", height: "18px", fontSize: "10px", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{cartCount}</span>
          )}
        </button>
        <button
          onClick={onLoginOpen}
          style={{
            background: "#8B7355", color: "#fff", border: "none", borderRadius: "24px",
            padding: "9px 22px", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px",
            cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif", transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#6b5a3e")}
          onMouseLeave={(e) => (e.target.style.background = "#8B7355")}
        >
          LOG IN
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      id="section-home"
      style={{
        position: "relative",
        height: "100vh",
        minHeight: "560px",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      {/* Background neon text effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          pointerEvents: "none",
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(160px, 22vw, 320px)",
            fontWeight: 700,
            lineHeight: 0.85,
            letterSpacing: "-0.02em",
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(100,210,190,0.55)",
            textShadow: "0 0 60px rgba(100,210,190,0.18), 0 0 120px rgba(100,210,190,0.08)",
            paddingRight: "4vw",
            animation: "flicker 6s infinite",
          }}
        >
          YOUR<br />DAMN
        </div>
      </div>

      {/* Dark overlay gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.2) 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "0 80px",
          maxWidth: "660px",
          animation: "fadeUp 0.9s ease both",
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(40px, 5vw, 66px)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.1,
            margin: "0 0 20px",
            letterSpacing: "-0.01em",
          }}
        >
          Revitalize Your Sneakers,<br />Restore Their Glory
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "15px",
            lineHeight: 1.75,
            margin: "0 0 40px",
            maxWidth: "480px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}
        >
          Specializing in the highest quality sneaker cleaning and restoration services.
          We treat your kicks like treasure, bringing them back to their original condition
          with professional care and attention to detail.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <button
            style={{
              background: "#8B7355",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              padding: "14px 32px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              cursor: "pointer",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              transition: "background 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => { e.target.style.background = "#6b5a3e"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.target.style.background = "#8B7355"; e.target.style.transform = "translateY(0)"; }}
          >
            BOOK NOW ONLINE
          </button>
          <button
            style={{
              background: "transparent",
              color: "#fff",
              border: "2px solid rgba(255,255,255,0.7)",
              borderRadius: "30px",
              padding: "14px 32px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              cursor: "pointer",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              transition: "border-color 0.2s, color 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#fff"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.7)"; e.target.style.transform = "translateY(0)"; }}
          >
            SEND SHOE
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes flicker {
          0%,100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.6; }
          94% { opacity: 1; }
          96% { opacity: 0.7; }
          97% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}

function AboutSection() {
  return (
    <section
      id="section-about"
      style={{
        background: "#f9f7f4",
        padding: "100px 80px",
        display: "flex",
        alignItems: "center",
        gap: "80px",
        flexWrap: "wrap",
      }}
    >
      {/* Sneaker image placeholder */}
      <div
        style={{
          flex: "0 0 460px",
          maxWidth: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          background: "#ddd",
          aspectRatio: "4/3",
          boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
          position: "relative",
        }}
      >
        {/* Placeholder for sneaker image — replace src with real image */}
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: "320px",
            background: "linear-gradient(135deg, #b0c4c2 0%, #7a9a99 50%, #4a6a6a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
            fontSize: "13px",
            letterSpacing: "2px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}
        >
          {/* Replace this div with: <img src="YOUR_SNEAKER_IMAGE_URL" alt="Sneakers" style={{width:'100%',height:'100%',objectFit:'cover'}} /> */}
          SNEAKER IMAGE
        </div>
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: "260px", maxWidth: "560px" }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(30px, 4vw, 48px)",
            fontWeight: 700,
            color: "#8B7355",
            margin: "0 0 28px",
            lineHeight: 1.15,
          }}
        >
          About Revive Sneaker Care
        </h2>
        <p
          style={{
            color: "#555",
            fontSize: "15px",
            lineHeight: 1.8,
            margin: "0 0 18px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}
        >
          At Revive Sneaker Care, we're passionate about preserving the life and beauty of your
          favorite sneakers. Founded by sneaker enthusiasts, we understand the emotional and
          financial value of your collection.
        </p>
        <p
          style={{
            color: "#555",
            fontSize: "15px",
            lineHeight: 1.8,
            margin: "0 0 18px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}
        >
          Our team of skilled technicians uses industry-leading techniques and eco-friendly
          products to deliver exceptional results. Whether it's a basic cleaning or a complete
          restoration, we treat every pair with the utmost care and attention to detail.
        </p>
        <p
          style={{
            color: "#555",
            fontSize: "15px",
            lineHeight: 1.8,
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}
        >
          With multiple locations and convenient online booking, we make it easy to keep your
          sneakers looking fresh. Trust us to revive your kicks and restore their glory.
        </p>
      </div>
    </section>
  );
}

const SERVICES = [
  {
    id: "standard",
    name: "Standard Cleaning",
    icon: "✦",
    description: "Basic cleaning service to refresh your sneakers. Includes surface cleaning, dirt removal, and basic stain treatment.",
    features: ["Surface cleaning", "Dirt & dust removal", "Basic stain treatment", "Lace cleaning"],
    price: "From ₱25",
    imageBg: "linear-gradient(135deg, #c9b99a 0%, #a08060 100%)",
    imageLabel: "SERVICE IMAGE",
  },
  {
    id: "deep",
    name: "Deep Cleaning",
    icon: "⟐",
    description: "Comprehensive deep cleaning for heavily soiled sneakers. Includes intensive stain removal and complete restoration.",
    features: ["Intensive cleaning", "Deep stain removal", "Sole whitening", "Interior cleaning", "Deodorizing"],
    price: "From ₱45",
    imageBg: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    imageLabel: "SERVICE IMAGE",
    dark: true,
  },
  {
    id: "reglue",
    name: "Reglue",
    icon: "⚙",
    description: "Expert sole reattachment and repair service. We fix loose soles and restore structural integrity to your sneakers.",
    features: ["Sole reattachment", "Structural repair", "Industrial adhesive", "24-hour curing time"],
    price: "From ₱35",
    imageBg: "linear-gradient(135deg, #8a6a4a 0%, #5a3a1a 100%)",
    imageLabel: "SERVICE IMAGE",
  },
  {
    id: "repaint",
    name: "Repaint",
    icon: "◈",
    description: "Professional color restoration and custom painting. Bring faded colors back to life or customize your sneakers.",
    features: ["Color restoration", "Custom painting", "Premium paint", "Protective finish", "Color matching"],
    price: "From ₱60",
    imageBg: "linear-gradient(135deg, #e8e8e8 0%, #c0c0c0 100%)",
    imageLabel: "SERVICE IMAGE",
  },
];

function BookingModal({ service, onClose }) {
  const [form, setForm] = useState({
    serviceType: service ? service.name : "Standard Cleaning",
    name: "",
    contact: "",
    email: "",
    address: "",
    remarks: "",
    payment: "",
    photos: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid #e0dbd4",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: "#3a2e1e",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "14px",
    fontWeight: 600,
    color: "#3a2e1e",
    marginBottom: "7px",
  };

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.match(/image\/(png|jpeg)/));
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...valid].slice(0, 5) }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff",
        borderRadius: "18px",
        width: "100%",
        maxWidth: "600px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        position: "relative",
      }}>
        <div style={{ padding: "32px 36px 24px", borderBottom: "1px solid #f0ebe4" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#3a2e1e", margin: 0 }}>
              Book Your Shoes
            </h2>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#999", lineHeight: 1, padding: "4px" }}>
              \u2715
            </button>
          </div>
        </div>

        {submitted ? (
          <div style={{ padding: "60px 36px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>\u2705</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#3a2e1e", margin: "0 0 12px" }}>Booking Submitted!</h3>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px", color: "#777", margin: "0 0 28px", lineHeight: 1.6 }}>
              We've received your booking for <strong>{form.serviceType}</strong>. We'll contact you shortly.
            </p>
            <button onClick={onClose} style={{ background: "#8B7355", color: "#fff", border: "none", borderRadius: "30px", padding: "13px 32px", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              CLOSE
            </button>
          </div>
        ) : (
          <div style={{ padding: "28px 36px 36px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <div>
                <label style={labelStyle}>Type of Service <span style={{ color: "#e85c2c" }}>*</span></label>
                <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                  {["Standard Cleaning", "Deep Cleaning", "Reglue", "Repaint"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Complete Name <span style={{ color: "#e85c2c" }}>*</span></label>
                <input type="text" placeholder="Enter your full name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#8B7355")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0dbd4")} />
              </div>

              <div>
                <label style={labelStyle}>Contact Number <span style={{ color: "#e85c2c" }}>*</span></label>
                <input type="tel" placeholder="09XX XXX XXXX" value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })} style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#8B7355")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0dbd4")} />
              </div>

              <div>
                <label style={labelStyle}>Email Address <span style={{ color: "#e85c2c" }}>*</span></label>
                <input type="email" placeholder="your.email@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#8B7355")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0dbd4")} />
              </div>

              <div>
                <label style={labelStyle}>Address <span style={{ color: "#e85c2c" }}>*</span></label>
                <textarea placeholder="Enter your complete address" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                  onFocus={(e) => (e.target.style.borderColor = "#8B7355")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0dbd4")} />
              </div>

              <div>
                <label style={labelStyle}>Additional remarks</label>
                <textarea placeholder="Any special instructions or notes..." value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={3}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                  onFocus={(e) => (e.target.style.borderColor = "#8B7355")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0dbd4")} />
              </div>

              <div>
                <label style={labelStyle}>Upload sneaker photos <span style={{ color: "#e85c2c" }}>*</span></label>
                <div
                  onClick={() => document.getElementById("sneaker-photo-input").click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                  style={{
                    border: `2px dashed ${dragOver ? "#8B7355" : "#d0c9bf"}`,
                    borderRadius: "10px", padding: "36px 20px", textAlign: "center",
                    cursor: "pointer", background: dragOver ? "#faf7f4" : "#fdfcfb", transition: "all 0.2s",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" style={{ marginBottom: "10px" }}>
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "14px", color: "#777", margin: "0 0 4px" }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "12px", color: "#aaa", margin: 0 }}>
                    PNG, JPG up to 10MB
                  </p>
                  <input id="sneaker-photo-input" type="file" accept="image/png,image/jpeg" multiple
                    style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
                </div>
                {form.photos.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                    {form.photos.map((file, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={URL.createObjectURL(file)} alt=""
                          style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e0dbd4" }} />
                        <button
                          onClick={() => setForm(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))}
                          style={{ position: "absolute", top: "-6px", right: "-6px", background: "#e85c2c", color: "#fff", border: "none", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >\u2715</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Payment Options <span style={{ color: "#e85c2c" }}>*</span></label>
                <div style={{ border: "1.5px solid #e0dbd4", borderRadius: "8px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px", background: "#fafafa" }}>
                  {["GCASH", "BPI", "BDO"].map((option) => (
                    <label key={option} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px", color: "#3a2e1e" }}>
                      <input type="radio" name="payment" value={option} checked={form.payment === option}
                        onChange={(e) => setForm({ ...form, payment: e.target.value })}
                        style={{ accentColor: "#8B7355", width: "16px", height: "16px", cursor: "pointer" }} />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ background: "#fff8f0", border: "1.5px solid #f0dbc8", borderRadius: "10px", padding: "20px 22px" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "14px", fontWeight: 700, color: "#c0622a", margin: "0 0 10px" }}>
                  Important Reminders
                </p>
                <ul style={{ margin: "0 0 12px", paddingLeft: "18px" }}>
                  {["Bring your laces", "Bring both shoes", "Pair of shoes", "We will do our best to clean your sneakers"].map((r) => (
                    <li key={r} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", color: "#c0622a", marginBottom: "4px" }}>{r}</li>
                  ))}
                </ul>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "12px", color: "#c0622a", margin: 0, fontWeight: 700 }}>
                  NOTE: <span style={{ fontWeight: 400 }}>PLEASE TAKE CLEAR PICTURES OF THE SHOES YOU'LL BE SENDING FOR OUR REFERENCE</span>
                </p>
              </div>

              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", color: "#888", margin: 0 }}>
                If you need to book in other store, <span style={{ color: "#8B7355", cursor: "pointer", textDecoration: "underline" }}>click here</span>
              </p>

              <button
                onClick={handleSubmit}
                style={{
                  background: "#8B7355", color: "#fff", border: "none",
                  borderRadius: "8px", padding: "16px", fontSize: "13px", fontWeight: 700,
                  letterSpacing: "2px", cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif",
                  transition: "background 0.2s", width: "100%", marginTop: "4px",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#6b5a3e")}
                onMouseLeave={(e) => (e.target.style.background = "#8B7355")}
              >
                BOOK NOW
              </button>

            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
function ServiceCard({ service, onAddToCart }) {
  const [hovered, setHovered] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: hovered
          ? "0 20px 60px rgba(0,0,0,0.13)"
          : "0 4px 24px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.3s, transform 0.3s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div
        style={{
          height: "200px",
          background: service.imageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: service.dark ? "rgba(100,210,190,0.4)" : "rgba(255,255,255,0.35)",
          fontSize: "13px",
          letterSpacing: "2px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Replace with: <img src="YOUR_IMAGE" alt={service.name} style={{width:'100%',height:'100%',objectFit:'cover'}} /> */}
        {service.imageLabel}
        {service.dark && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(48px, 8vw, 80px)",
            fontWeight: 700,
            color: "transparent",
            WebkitTextStroke: "1px rgba(100,210,190,0.5)",
            letterSpacing: "-0.02em",
            lineHeight: 0.85,
            textAlign: "center",
          }}>
            YOUR<br />DAMN
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "28px 28px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Icon + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
          <div style={{
            width: "44px", height: "44px",
            borderRadius: "50%",
            background: "#8B7355",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            fontSize: "18px",
            flexShrink: 0,
          }}>
            {service.icon}
          </div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "#3a2e1e",
            margin: 0,
          }}>
            {service.name}
          </h3>
        </div>

        <p style={{
          color: "#666",
          fontSize: "14px",
          lineHeight: 1.7,
          margin: "0 0 18px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
        }}>
          {service.description}
        </p>

        {/* Features */}
        <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0, flex: 1 }}>
          {service.features.map((f) => (
            <li key={f} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: "#555",
              marginBottom: "6px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}>
              <span style={{ color: "#8B7355", fontWeight: 700 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* Price + Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "18px",
            fontWeight: 700,
            color: "#8B7355",
          }}>
            {service.price}
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{
                background: "#3a4a5a",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "10px 18px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.2px",
                cursor: "pointer",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#2a3a4a")}
              onMouseLeave={(e) => (e.target.style.background = "#3a4a5a")}
              onClick={() => onAddToCart && onAddToCart(service)}
            >
              ADD TO CART
            </button>
            <button
              style={{
                background: "#8B7355",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "10px 18px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.2px",
                cursor: "pointer",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#6b5a3e")}
              onMouseLeave={(e) => (e.target.style.background = "#8B7355")}
              onClick={() => setShowBooking(true)}
            >
              BOOK NOW
            </button>
          </div>
        </div>
      </div>
      {showBooking && <BookingModal service={service} onClose={() => setShowBooking(false)} />}
    </div>
  );
}

function ServicesSection({ onAddToCart }) {
  return (
    <section id="section-services" style={{ background: "#fff", padding: "100px 80px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(32px, 4vw, 52px)",
          fontWeight: 700,
          color: "#8B7355",
          margin: "0 0 16px",
        }}>
          Our Services
        </h2>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "15px",
          color: "#777",
          margin: 0,
          maxWidth: "500px",
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.7,
        }}>
          Professional sneaker care services tailored to restore and maintain your footwear collection
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "28px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        {SERVICES.map((service) => (
          <ServiceCard key={service.id} service={service} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}

const BRANCHES = [
  {
    id: "megamall",
    name: "SM Megamall",
    address: "Lower Ground Floor, Building A, SM Megamall",
    phone: "0905 205 5890",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.0!2d121.056!3d14.5836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90adf2e68e3%3A0x5ca30f8e6da6e4a5!2sSM%20Megamall!5e0!3m2!1sen!2sph!4v1680000000000",
    mapsUrl: "https://maps.google.com/?q=SM+Megamall+Mandaluyong",
  },
  {
    id: "trinoma",
    name: "Trinoma Mall",
    address: "Ground Floor, North Wing, TriNoma Mall, Quezon City",
    phone: "0905 205 5891",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.5!2d121.0386!3d14.6565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b6a6db0e7c5d%3A0x4a4a5e6b5f5f5f5f!2sTriNoma!5e0!3m2!1sen!2sph!4v1680000000001",
    mapsUrl: "https://maps.google.com/?q=TriNoma+Mall+Quezon+City",
  },
];

function BranchCard({ branch }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      minHeight: "380px",
    }}>
      <div style={{ padding: "40px 40px 36px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "#8B7355", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "26px", fontWeight: 700, color: "#3a2e1e", margin: 0,
          }}>{branch.name}</h3>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px", color: "#555", lineHeight: 1.6 }}>
            {branch.address}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="1.8">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px", color: "#555" }}>
            {branch.phone}
          </span>
        </div>
        <a
          href={branch.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "#e85c2c", color: "#fff",
            borderRadius: "30px", padding: "12px 24px",
            fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px",
            textDecoration: "none",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            width: "fit-content",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#c94a1e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#e85c2c")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          GO TO LOCATION
        </a>
        <div style={{
          borderRadius: "12px", overflow: "hidden", height: "150px",
          background: "linear-gradient(135deg, #2a2a3a 0%, #3a3a4a 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.25)", fontSize: "12px", letterSpacing: "2px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          marginTop: "auto",
        }}>
          BRANCH PHOTO
        </div>
      </div>
      <div style={{ position: "relative", background: "#e8e8e8" }}>
        <a
          href={branch.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "absolute", top: "14px", left: "14px", zIndex: 10,
            background: "#fff", borderRadius: "6px",
            padding: "7px 14px", fontSize: "12px", fontWeight: 600,
            color: "#3a2e1e", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "6px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          Open in Maps
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
        <iframe
          src={branch.mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0, display: "block", minHeight: "380px" }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${branch.name}`}
        />
      </div>
    </div>
  );
}

function BranchesSection() {
  return (
    <section id="section-branches" style={{ background: "#f0f2f0", padding: "100px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: "#8B7355", margin: "0 0 16px",
        }}>Our Branches</h2>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "15px", color: "#777", margin: "0 auto",
          maxWidth: "500px", lineHeight: 1.7,
        }}>
          Visit us at any of our convenient locations for professional sneaker care services
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        {BRANCHES.map((branch) => (
          <BranchCard key={branch.id} branch={branch} />
        ))}
      </div>
    </section>
  );
}

const REVIEWS = [
  {
    name: "Michael Chen",
    stars: 5,
    text: "Absolutely amazing service! My vintage Jordans looked brand new after their treatment. The attention to detail is incredible.",
  },
  {
    name: "Sarah Johnson",
    stars: 5,
    text: "I was skeptical at first, but Revive completely transformed my dirty white sneakers. They look better than when I bought them!",
  },
  {
    name: "David Martinez",
    stars: 5,
    text: "Professional, reliable, and the results speak for themselves. I wouldn't trust my sneaker collection with anyone else.",
  },
];

function Stars({ count = 5 }) {
  return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "14px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: "#8B7355", fontSize: "18px" }}>★</span>
      ))}
    </div>
  );
}

function ReviewsSection() {
  return (
    <section style={{ background: "#0f1623", padding: "100px 80px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "20px" }}>
        {[1,2,3,4,5].map((i) => (
          <span key={i} style={{ color: "#8B7355", fontSize: "28px" }}>★</span>
        ))}
      </div>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, color: "#fff", margin: "0 0 16px",
      }}>
        What Our Clients Say
      </h2>
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "16px", color: "rgba(255,255,255,0.55)",
        margin: "0 auto 60px", maxWidth: "600px", lineHeight: 1.6, fontStyle: "italic",
      }}>
        "Professional, friendly, and reliable—they always go above and beyond to make our sneakers shine!"
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
        maxWidth: "1100px",
        margin: "0 auto 56px",
      }}>
        {REVIEWS.map((r) => (
          <div
            key={r.name}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "28px 28px 24px",
              textAlign: "left",
            }}
          >
            <Stars count={r.stars} />
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "15px", color: "rgba(255,255,255,0.75)",
              lineHeight: 1.75, margin: "0 0 20px", fontStyle: "italic",
            }}>
              "{r.text}"
            </p>
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "14px", fontWeight: 700, color: "#8B7355",
            }}>
              - {r.name}
            </span>
          </div>
        ))}
      </div>
      <button
        style={{
          background: "#8B7355", color: "#fff", border: "none",
          borderRadius: "30px", padding: "16px 40px",
          fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
          cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.background = "#6b5a3e")}
        onMouseLeave={(e) => (e.target.style.background = "#8B7355")}
      >
        SCHEDULE A CLEANING
      </button>
    </section>
  );
}

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Trusted Service",
    desc: "Years of experience in professional sneaker care",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
        <path d="M12 2.69l.94 2.89a1 1 0 0 0 .95.69h3.04l-2.46 1.79a1 1 0 0 0-.36 1.12l.94 2.89-2.46-1.79a1 1 0 0 0-1.18 0L9.01 12.07l.94-2.89a1 1 0 0 0-.36-1.12L7.13 6.27h3.04a1 1 0 0 0 .95-.69L12 2.69z"/>
        <circle cx="12" cy="12" r="10"/>
      </svg>
    ),
    title: "Eco-Friendly",
    desc: "Premium, environmentally safe cleaning solutions",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
    title: "Quality Guaranteed",
    desc: "100% satisfaction or your money back",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "Fast Turnaround",
    desc: "Quick service without compromising quality",
  },
];

function AuthoritySection() {
  return (
    <section style={{ background: "#f9f7f4", padding: "100px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 700,
          color: "#3a2e1e", margin: "0 0 16px",
        }}>
          The Authority is here!
        </h2>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "15px", color: "#777",
          margin: "0 auto", maxWidth: "520px", lineHeight: 1.7,
        }}>
          Our experienced team uses only the best products and techniques to ensure your sneakers receive the care they deserve.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        {FEATURES.map((f) => (
          <div
            key={f.title}
            style={{
              background: "#8B7355",
              borderRadius: "14px",
              padding: "40px 28px 36px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div style={{
              width: "60px", height: "60px", borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {f.icon}
            </div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "18px", fontWeight: 700, color: "#fff", margin: 0,
            }}>
              {f.title}
            </h3>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "14px", color: "rgba(255,255,255,0.8)",
              margin: 0, lineHeight: 1.65, textAlign: "center",
            }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="section-contact" style={{ background: "#0a0a0a", padding: "70px 80px 40px", color: "#fff" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr",
        gap: "48px",
        maxWidth: "1200px",
        margin: "0 auto 48px",
      }}>
        {/* Brand */}
        <div>
          <div style={{
            border: "1.5px solid #8B7355",
            padding: "4px 10px",
            display: "inline-block",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700, fontSize: "15px",
            letterSpacing: "2px", color: "#fff", lineHeight: 1.1,
            marginBottom: "20px",
          }}>
            <div>REVIVE</div>
            <div style={{ fontSize: "7px", fontWeight: 400, letterSpacing: "1.5px", color: "#8B7355" }}>
              Sneaker Care
            </div>
          </div>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "14px", color: "rgba(255,255,255,0.5)",
            lineHeight: 1.7, margin: 0, maxWidth: "240px",
          }}>
            Professional sneaker cleaning and restoration services. Bringing your kicks back to life.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
            color: "#8B7355", margin: "0 0 20px", textTransform: "uppercase",
          }}>Quick Links</h4>
          {["Home", "Services", "Branches", "About Us"].map((l) => (
            <a key={l} href="#" style={{
              display: "block", fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "14px", color: "rgba(255,255,255,0.55)",
              textDecoration: "none", marginBottom: "10px",
              transition: "color 0.2s",
            }}
              onMouseEnter={(e) => (e.target.style.color = "#8B7355")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.55)")}
            >{l}</a>
          ))}
        </div>

        {/* Services */}
        <div>
          <h4 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
            color: "#8B7355", margin: "0 0 20px", textTransform: "uppercase",
          }}>Services</h4>
          {["Standard Cleaning", "Deep Cleaning", "Reglue", "Repaint"].map((s) => (
            <a key={s} href="#" style={{
              display: "block", fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "14px", color: "rgba(255,255,255,0.55)",
              textDecoration: "none", marginBottom: "10px",
              transition: "color 0.2s",
            }}
              onMouseEnter={(e) => (e.target.style.color = "#8B7355")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.55)")}
            >{s}</a>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
            color: "#8B7355", margin: "0 0 20px", textTransform: "uppercase",
          }}>Contact</h4>
          {[
            { icon: "📞", text: "(555) 123-4567" },
            { icon: "✉", text: "info@revivesneakercare.com" },
            { icon: "📍", text: "123 Sneaker St, City, ST 12345" },
          ].map((c) => (
            <div key={c.text} style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              marginBottom: "12px",
            }}>
              <span style={{ fontSize: "14px", marginTop: "1px", flexShrink: 0 }}>{c.icon}</span>
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5,
              }}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingTop: "24px",
        textAlign: "center",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "13px",
        color: "rgba(255,255,255,0.25)",
      }}>
        © {new Date().getFullYear()} Revive Sneaker Care. All rights reserved.
      </div>
    </footer>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const addToCart = (service) => {
    setCart((prev) => [...prev, service]);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
      <Navbar
        cartCount={cart.length}
        onCartOpen={() => setShowCart(true)}
        onLoginOpen={() => setShowLogin(true)}
      />
      <Hero />
      <AboutSection />
      <ServicesSection onAddToCart={addToCart} />
      <BranchesSection />
      <ReviewsSection />
      <AuthoritySection />
      <Footer />
      {showCart && <CartSidebar cart={cart} onClose={() => setShowCart(false)} onRemove={removeFromCart} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
