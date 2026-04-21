import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { OAuth2Callback } from "./OAuth2Callback";
import { GitHubLoginButton } from "./GitHubLoginButton";

const NAV_LINKS = ["HOME", "SERVICES", "BRANCHES", "ABOUT US", "CONTACT US"];

const SECTION_IDS = {
  "HOME": "section-home",
  "SERVICES": "section-services",
  "BRANCHES": "section-branches",
  "ABOUT US": "section-about",
  "CONTACT US": "section-contact",
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");
const AUTH_TOKEN_KEY = "sia_auth_token";
const AUTH_USER_KEY = "sia_auth_user";
const CLIENT_NOTIFICATION_SEEN_AT_KEY = "sia_client_notification_seen_at";

async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!response.ok) {
    const validationMessage =
      Array.isArray(data?.errors) && data.errors.length > 0
        ? data.errors.map((e) => e.defaultMessage || e.message).filter(Boolean).join(", ")
        : null;
    throw new Error(validationMessage || data?.message || "Request failed");
  }
  return data;
}

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

function AuthModal({ onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const inputStyle = {
    width: "100%", padding: "12px 14px", border: "1.5px solid #e0dbd4",
    borderRadius: "8px", fontSize: "14px", fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: "#3a2e1e", background: "#fff", outline: "none", boxSizing: "border-box",
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;
    if (isRegister && !name) {
      setError("Full name is required.");
      return;
    }
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = isRegister
        ? await apiRequest("/auth/register", { method: "POST", body: { name, email, password } })
        : await apiRequest("/auth/login", {
            method: "POST",
            body: { email, password },
          });
      onAuthSuccess({
        token: data.token,
        user: { name: data.name, email: data.email, role: data.role },
      });
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "440px", boxShadow: "0 24px 80px rgba(0,0,0,0.22)" }}>
        <div style={{ padding: "32px 36px 24px", borderBottom: "1px solid #f0ebe4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "30px", fontWeight: 700, color: "#3a2e1e", margin: 0 }}>
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#999" }}>X</button>
        </div>
        <div style={{ padding: "28px 36px 36px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {isRegister && (
            <div>
              <label style={{ display: "block", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", fontWeight: 700, letterSpacing: "1px", color: "#6b5a3e", marginBottom: "7px", textTransform: "uppercase" }}>Full name</label>
              <input type="text" placeholder="Juan Dela Cruz" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>
          )}
          <div>
            <label style={{ display: "block", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", fontWeight: 700, letterSpacing: "1px", color: "#6b5a3e", marginBottom: "7px", textTransform: "uppercase" }}>Email address</label>
            <input type="email" placeholder="your.email@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", fontWeight: 700, letterSpacing: "1px", color: "#6b5a3e", marginBottom: "7px", textTransform: "uppercase" }}>Password</label>
            <input type="password" placeholder="At least 8 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
          </div>
          <button onClick={handleSubmit} disabled={loading} style={{
            background: "#8B7355", color: "#fff", border: "none", borderRadius: "8px",
            padding: "14px", fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif", marginTop: "4px",
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Please wait..." : isRegister ? "Create account" : "Log in"}
          </button>
          <GitHubLoginButton />
          {error && <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", color: "#c0392b", margin: 0 }}>{error}</p>}
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", color: "#999", textAlign: "center", margin: 0 }}>
            {isRegister ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <span style={{ color: "#8B7355", cursor: "pointer", fontWeight: 700 }} onClick={() => setIsRegister((prev) => !prev)}>
              {isRegister ? "Log in here" : "Create one"}
            </span>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

function AdminOrdersModal({ onClose, token, initialView = "orders" }) {
  const [view, setView] = useState(initialView);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    serviceType: "Deep Cleaning",
    quotedPrice: "",
    estimatedCompletionDate: "",
    claimWindow: "5 - 7 days",
  });
  const [noteLoading, setNoteLoading] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState("");
  const [monthlySales, setMonthlySales] = useState(null);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  const loadOrders = async () => {
    try {
      const data = await apiRequest("/admin/orders", { token });
      const list = Array.isArray(data) ? data : [];
      setOrders(list);
      if (!selectedOrderId && list.length > 0) {
        setSelectedOrderId(list[0].id);
      }
    } catch (err) {
      setError(err.message || "Failed to load admin orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  useEffect(() => {
    const loadMonthlySales = async () => {
      setSalesLoading(true);
      setSalesError("");
      try {
        const data = await apiRequest(`/admin/orders/sales/monthly?month=${month}`, { token });
        setMonthlySales(data || null);
      } catch (err) {
        setSalesError(err.message || "Failed to load monthly sales");
      } finally {
        setSalesLoading(false);
      }
    };
    loadMonthlySales();
  }, [token, month]);

  useEffect(() => {
    if (!selectedOrder) return;
    setQuoteForm({
      serviceType: selectedOrder.serviceType || "Deep Cleaning",
      quotedPrice: selectedOrder.quotedPrice ?? "",
      estimatedCompletionDate: selectedOrder.estimatedCompletionDate || "",
      claimWindow: "5 - 7 days",
    });
  }, [selectedOrderId]);

  const saveQuoteAndNotify = async () => {
    if (!selectedOrder) return;
    const shouldUpdateQuote = selectedOrder.status === "WAITING_FOR_QUOTE";
    if (
      shouldUpdateQuote &&
      (!quoteForm.serviceType || quoteForm.quotedPrice === "" || !quoteForm.estimatedCompletionDate)
    ) {
      setError("Service type, total payment, and estimated completion date are required.");
      return;
    }
    setNoteLoading(true);
    setError("");
    try {
      if (shouldUpdateQuote) {
        await apiRequest(`/admin/orders/${selectedOrder.id}/quote`, {
          method: "PATCH",
          token,
          body: {
            serviceType: quoteForm.serviceType,
            quotedPrice: Number(quoteForm.quotedPrice),
            estimatedCompletionDate: quoteForm.estimatedCompletionDate,
          },
        });
      }
      const note = `Hi! Recommended service: ${quoteForm.serviceType}. Total payment: ${quoteForm.quotedPrice}. Estimated completion date: ${quoteForm.estimatedCompletionDate}. Claim in ${quoteForm.claimWindow}.`;
      await apiRequest(`/orders/${selectedOrder.id}/messages`, {
        method: "POST",
        token,
        body: { message: note },
      });
      await loadOrders();
    } catch (err) {
      setError(err.message || "Failed to save quote and notify client");
    } finally {
      setNoteLoading(false);
    }
  };

  const markOrderOngoingCleaning = async () => {
    if (!selectedOrder || selectedOrder.status !== "QUOTED") {
      return;
    }
    setNoteLoading(true);
    setError("");
    try {
      await apiRequest(`/admin/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        token,
        body: { status: "ONGOING_CLEANING" },
      });
      await apiRequest(`/orders/${selectedOrder.id}/messages`, {
        method: "POST",
        token,
        body: { message: "Your shoes are now under cleaning process." },
      });
      await loadOrders();
    } catch (err) {
      setError(err.message || "Failed to update order status to ongoing cleaning");
    } finally {
      setNoteLoading(false);
    }
  };

  const markOrderReadyToClaim = async () => {
    if (!selectedOrder || selectedOrder.status !== "ONGOING_CLEANING") {
      return;
    }
    setNoteLoading(true);
    setError("");
    try {
      await apiRequest(`/admin/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        token,
        body: { status: "READY_FOR_PICKUP" },
      });
      await apiRequest(`/orders/${selectedOrder.id}/messages`, {
        method: "POST",
        token,
        body: { message: "Your shoes are done and ready to be claimed." },
      });
      await loadOrders();
    } catch (err) {
      setError(err.message || "Failed to mark order as ready to claim");
    } finally {
      setNoteLoading(false);
    }
  };

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "920px", maxHeight: "88vh", overflow: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.22)" }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #f0ebe4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#3a2e1e", margin: 0 }}>
            {view === "orders" ? "Admin Orders" : "Monthly Sales"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#999" }}>X</button>
        </div>
        <div style={{ padding: "20px 28px 28px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <button
              onClick={() => setView("orders")}
              style={{
                background: view === "orders" ? "#8B7355" : "#efe8df",
                color: view === "orders" ? "#fff" : "#3a2e1e",
                border: "none",
                borderRadius: "18px",
                padding: "8px 14px",
                cursor: "pointer",
                fontWeight: 700,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
            >
              Orders
            </button>
            <button
              onClick={() => setView("sales")}
              style={{
                background: view === "sales" ? "#8B7355" : "#efe8df",
                color: view === "sales" ? "#fff" : "#3a2e1e",
                border: "none",
                borderRadius: "18px",
                padding: "8px 14px",
                cursor: "pointer",
                fontWeight: 700,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
            >
              Monthly Sales
            </button>
          </div>

          {view === "orders" && loading && <p style={{ margin: 0 }}>Loading orders...</p>}
          {view === "orders" && error && <p style={{ margin: 0, color: "#c0392b" }}>{error}</p>}
          {view === "orders" && !loading && !error && orders.length === 0 && <p style={{ margin: 0 }}>No orders yet.</p>}
          {view === "orders" && !loading && !error && orders.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "grid", gap: "12px", maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    style={{
                      border: order.id === selectedOrderId ? "2px solid #8B7355" : "1px solid #e8ddd0",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      background: "#fffdfb",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#3a2e1e" }}>Order #{order.id} - {order.status}</div>
                    <div style={{ fontSize: "14px", color: "#6b5a3e" }}>{order.clientName} ({order.clientEmail})</div>
                    <div style={{ fontSize: "13px", color: "#7d6a55", marginTop: "2px" }}>Drop-off: {order.dropOffDate} | Quote: {order.quotedPrice ?? "Pending"}</div>
                  </button>
                ))}
              </div>

              <div style={{ border: "1px solid #e8ddd0", borderRadius: "10px", padding: "14px 16px", background: "#fffdfb" }}>
                {!selectedOrder && <p style={{ margin: 0 }}>Select an order.</p>}
                {selectedOrder && (
                  <>
                    <div style={{ fontWeight: 700, color: "#3a2e1e", marginBottom: "10px" }}>Respond to Order #{selectedOrder.id}</div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <input
                        value={quoteForm.serviceType}
                        onChange={(e) => setQuoteForm((prev) => ({ ...prev, serviceType: e.target.value }))}
                        placeholder="Service type (e.g., Deep Cleaning, Reglue)"
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0dbd4", borderRadius: "8px" }}
                      />
                      <input
                        value={quoteForm.quotedPrice}
                        onChange={(e) => setQuoteForm((prev) => ({ ...prev, quotedPrice: e.target.value }))}
                        placeholder="Total payment"
                        type="number"
                        min="0"
                        step="0.01"
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0dbd4", borderRadius: "8px" }}
                      />
                      <input
                        value={quoteForm.estimatedCompletionDate}
                        onChange={(e) => setQuoteForm((prev) => ({ ...prev, estimatedCompletionDate: e.target.value }))}
                        type="date"
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0dbd4", borderRadius: "8px" }}
                      />
                      <input
                        value={quoteForm.claimWindow}
                        onChange={(e) => setQuoteForm((prev) => ({ ...prev, claimWindow: e.target.value }))}
                        placeholder="Claim window (e.g., 5 - 7 days)"
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0dbd4", borderRadius: "8px" }}
                      />
                      <button
                        onClick={saveQuoteAndNotify}
                        disabled={noteLoading}
                        style={{
                          background: "#8B7355", color: "#fff", border: "none", borderRadius: "8px",
                          padding: "12px 14px", fontSize: "12px", fontWeight: 700, letterSpacing: "1.2px",
                          cursor: noteLoading ? "not-allowed" : "pointer", opacity: noteLoading ? 0.7 : 1,
                        }}
                      >
                        {noteLoading ? "SAVING..." : selectedOrder.status === "WAITING_FOR_QUOTE" ? "SEND QUOTE TO CLIENT" : "SEND MESSAGE TO CLIENT"}
                      </button>
                      <button
                        onClick={markOrderOngoingCleaning}
                        disabled={noteLoading || selectedOrder.status !== "QUOTED"}
                        style={{
                          background: selectedOrder.status === "QUOTED" ? "#445f7a" : "#9aa5a0",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px 14px",
                          fontSize: "12px",
                          fontWeight: 700,
                          letterSpacing: "1.2px",
                          cursor: noteLoading || selectedOrder.status !== "QUOTED" ? "not-allowed" : "pointer",
                          opacity: noteLoading ? 0.7 : 1,
                        }}
                        title={selectedOrder.status !== "QUOTED" ? "Order must be QUOTED first" : "Mark this order as ongoing cleaning"}
                      >
                        {noteLoading ? "UPDATING..." : "START CLEANING"}
                      </button>
                      <button
                        onClick={markOrderReadyToClaim}
                        disabled={noteLoading || selectedOrder.status !== "ONGOING_CLEANING"}
                        style={{
                          background: selectedOrder.status === "ONGOING_CLEANING" ? "#2d7a46" : "#9aa5a0",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px 14px",
                          fontSize: "12px",
                          fontWeight: 700,
                          letterSpacing: "1.2px",
                          cursor: noteLoading || selectedOrder.status !== "ONGOING_CLEANING" ? "not-allowed" : "pointer",
                          opacity: noteLoading ? 0.7 : 1,
                        }}
                        title={selectedOrder.status !== "ONGOING_CLEANING" ? "Order must be ONGOING_CLEANING first" : "Mark this order as ready for pickup"}
                      >
                        {noteLoading ? "UPDATING..." : "MARK AS READY TO CLAIM"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {view === "sales" && (
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "#6b5a3e", fontWeight: 700 }}>
                Select Month
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d9d1c7", marginBottom: "16px" }}
              />
              {salesLoading && <p style={{ margin: 0 }}>Loading monthly sales...</p>}
              {salesError && <p style={{ margin: 0, color: "#c0392b" }}>{salesError}</p>}
              {!salesLoading && !salesError && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "#f9f4ee", borderRadius: "10px", padding: "16px" }}>
                    <div style={{ fontSize: "12px", color: "#7b6b58", marginBottom: "6px" }}>TOTAL SALES</div>
                    <div style={{ fontSize: "28px", color: "#3a2e1e", fontWeight: 700 }}>
                      ₱{Number(monthlySales?.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ background: "#f9f4ee", borderRadius: "10px", padding: "16px" }}>
                    <div style={{ fontSize: "12px", color: "#7b6b58", marginBottom: "6px" }}>COMPLETED SERVICES</div>
                    <div style={{ fontSize: "28px", color: "#3a2e1e", fontWeight: 700 }}>
                      {monthlySales?.completedOrders ?? 0}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function Navbar({
  cartCount,
  onCartOpen,
  onLoginOpen,
  currentUser,
  onLogout,
  onOpenAdminOrders,
  onOpenAdminSales,
  clientNotifications = [],
  unreadNotificationCount = 0,
  onOpenNotifications = () => {},
}) {
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const onClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleProfileMenu = () => {
    const nextOpen = !showProfileMenu;
    setShowProfileMenu(nextOpen);
    if (nextOpen && currentUser?.role === "CLIENT") {
      onOpenNotifications();
    }
  };

  const displayName = currentUser?.name?.trim() || currentUser?.email || "Account";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

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
        {!currentUser && (
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
        )}

        {currentUser && (
          <div ref={profileMenuRef} style={{ position: "relative" }}>
            <button
              onClick={toggleProfileMenu}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "1px solid #e2d8cd",
                background: "#fff",
                borderRadius: "24px",
                padding: "6px 10px 6px 6px",
                cursor: "pointer",
                minWidth: "160px",
              }}
            >
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#8B7355",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {initials}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#3a2e1e", maxWidth: "100px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {displayName}
                </span>
                <span style={{ fontSize: "10px", color: "#8b7a65", letterSpacing: "0.8px" }}>
                  {currentUser.role}
                </span>
              </div>
              <span style={{ marginLeft: "auto", color: "#7a6a57", fontSize: "11px" }}>{showProfileMenu ? "▲" : "▼"}</span>
            </button>

            {showProfileMenu && (
              <div style={{
                position: "absolute",
                right: 0,
                top: "42px",
                width: "340px",
                background: "#fff",
                border: "1px solid #ece3d8",
                borderRadius: "12px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
                overflow: "hidden",
              }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1ebe4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: "#6b5a3e" }}>PROFILE MENU</span>
                  {currentUser.role === "CLIENT" && unreadNotificationCount > 0 && (
                    <span style={{ fontSize: "11px", color: "#d14d1f", fontWeight: 700 }}>
                      {unreadNotificationCount} new
                    </span>
                  )}
                </div>

                {currentUser.role === "CLIENT" && (
                  <>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onCartOpen();
                      }}
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "11px 14px", fontSize: "13px", color: "#3a2e1e" }}
                    >
                      Cart {cartCount > 0 ? `(${cartCount})` : ""}
                    </button>
                    <div style={{ borderTop: "1px solid #f5efe8", padding: "8px 14px 10px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#7a6752", marginBottom: "6px" }}>Notifications</div>
                      {clientNotifications.length === 0 ? (
                        <div style={{ fontSize: "12px", color: "#9a8b78" }}>No notifications yet.</div>
                      ) : (
                        clientNotifications.slice(0, 3).map((notification) => (
                          <div key={notification.id} style={{ padding: "7px 0", borderTop: "1px solid #f5efe8" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#4a3d2f" }}>Order #{notification.orderId}</div>
                            <div style={{ fontSize: "12px", color: "#6b5a48", lineHeight: 1.4 }}>{notification.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {currentUser.role === "ADMIN" && (
                  <>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAdminOrders();
                      }}
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "11px 14px", fontSize: "13px", color: "#3a2e1e" }}
                    >
                      Admin Orders
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAdminSales();
                      }}
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderTop: "1px solid #f5efe8", cursor: "pointer", padding: "11px 14px", fontSize: "13px", color: "#3a2e1e" }}
                    >
                      Monthly Sales
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  style={{ width: "100%", textAlign: "left", background: "#fff7f4", border: "none", borderTop: "1px solid #f1ebe4", cursor: "pointer", padding: "11px 14px", fontSize: "13px", fontWeight: 700, color: "#b14722" }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function Hero({ onBookAction }) {
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
            onClick={onBookAction}
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
            onClick={onBookAction}
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

function BookingModal({ service, onClose, authToken }) {
  const [form, setForm] = useState({
    serviceType: service ? service.name : "Standard Cleaning",
    dropOffDate: "",
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...valid].slice(0, 3) }));
  };

  const handleSubmit = async () => {
    if (!authToken) {
      setSubmitError("Please log in first.");
      return;
    }
    if (!form.dropOffDate) {
      setSubmitError("Preferred drop-off date is required.");
      return;
    }
    if (form.photos.length < 1 || form.photos.length > 3) {
      setSubmitError("Upload 1 to 3 shoe images.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = new FormData();
      payload.append("dropOffDate", form.dropOffDate);
      payload.append("shoeType", form.serviceType);
      form.photos.forEach((photo) => payload.append("images", photo));

      const response = await fetch(`${API_BASE_URL}/client/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: payload,
      });
      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }
      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit booking");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
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
                <label style={labelStyle}>Preferred Drop-off Date <span style={{ color: "#e85c2c" }}>*</span></label>
                <input
                  type="date"
                  value={form.dropOffDate}
                  onChange={(e) => setForm({ ...form, dropOffDate: e.target.value })}
                  style={inputStyle}
                />
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
                    PNG, JPG - up to 3 images
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
                disabled={submitting}
                style={{
                  background: "#8B7355", color: "#fff", border: "none",
                  borderRadius: "8px", padding: "16px", fontSize: "13px", fontWeight: 700,
                  letterSpacing: "2px", cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif",
                  transition: "background 0.2s", width: "100%", marginTop: "4px",
                  opacity: submitting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => (e.target.style.background = "#6b5a3e")}
                onMouseLeave={(e) => (e.target.style.background = "#8B7355")}
              >
                {submitting ? "SUBMITTING..." : "BOOK NOW"}
              </button>
              {submitError && (
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "13px", color: "#c0392b", margin: 0 }}>
                  {submitError}
                </p>
              )}

            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
function ServiceCard({ service, onAddToCart, canBook, onRequireLogin, authToken }) {
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
              onClick={() => {
                if (!canBook) {
                  onRequireLogin && onRequireLogin();
                  return;
                }
                onAddToCart && onAddToCart(service);
              }}
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
              onClick={() => {
                if (!canBook) {
                  onRequireLogin && onRequireLogin();
                  return;
                }
                setShowBooking(true);
              }}
            >
              BOOK NOW
            </button>
          </div>
        </div>
      </div>
      {showBooking && <BookingModal service={service} onClose={() => setShowBooking(false)} authToken={authToken} />}
    </div>
  );
}

function ServicesSection({ onAddToCart, canBook, onRequireLogin, authToken }) {
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
          <ServiceCard
            key={service.id}
            service={service}
            onAddToCart={onAddToCart}
            canBook={canBook}
            onRequireLogin={onRequireLogin}
            authToken={authToken}
          />
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
  const [showAdminOrders, setShowAdminOrders] = useState(false);
  const [adminModalView, setAdminModalView] = useState("orders");
  const [clientNotifications, setClientNotifications] = useState([]);
  const [clientNotificationSeenAt, setClientNotificationSeenAt] = useState(() => {
    const raw = localStorage.getItem(CLIENT_NOTIFICATION_SEEN_AT_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY) || "");
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const isClientLoggedIn = Boolean(authToken && currentUser?.role === "CLIENT");

  useEffect(() => {
    if (!authToken || currentUser?.role !== "CLIENT") {
      setClientNotifications([]);
      return;
    }

    let cancelled = false;

    const loadClientNotifications = async () => {
      try {
        const orders = await apiRequest("/client/orders", { token: authToken });
        const safeOrders = Array.isArray(orders) ? orders : [];
        const messageLists = await Promise.all(
          safeOrders.map(async (order) => {
            try {
              const messages = await apiRequest(`/orders/${order.id}/messages`, { token: authToken });
              const safeMessages = Array.isArray(messages) ? messages : [];
              return safeMessages
                .filter((m) => m.senderRole === "ADMIN")
                .map((m) => ({
                  id: `${order.id}-${m.id}`,
                  orderId: order.id,
                  message: m.message,
                  timestamp: m.timestamp,
                }));
            } catch {
              return [];
            }
          })
        );
        const combined = messageLists
          .flat()
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (!cancelled) {
          setClientNotifications(combined);
        }
      } catch {
        if (!cancelled) {
          setClientNotifications([]);
        }
      }
    };

    loadClientNotifications();
    const intervalId = setInterval(loadClientNotifications, 30000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [authToken, currentUser?.role]);

  const unreadNotificationCount = clientNotifications.filter(
    (notification) => new Date(notification.timestamp).getTime() > clientNotificationSeenAt
  ).length;

  const addToCart = (service) => {
    setCart((prev) => [...prev, service]);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAuthSuccess = ({ token, user }) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthToken("");
    setCurrentUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(CLIENT_NOTIFICATION_SEEN_AT_KEY);
    setClientNotifications([]);
    setClientNotificationSeenAt(0);
  };

  const handleOpenNotifications = () => {
    const seenAt = Date.now();
    setClientNotificationSeenAt(seenAt);
    localStorage.setItem(CLIENT_NOTIFICATION_SEEN_AT_KEY, String(seenAt));
  };

  const handleBookAction = () => {
    if (!authToken) {
      setShowLogin(true);
      return;
    }
    if (currentUser?.role !== "CLIENT") {
      alert("Booking is available for CLIENT accounts only.");
      return;
    }
    const el = document.getElementById("section-services");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Router>
      <Routes>
        <Route path="/oauth/callback" element={<OAuth2Callback />} />
        <Route path="/" element={
          <div style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
            <Navbar
              cartCount={cart.length}
              onCartOpen={() => setShowCart(true)}
              onLoginOpen={() => setShowLogin(true)}
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenAdminOrders={() => {
                setAdminModalView("orders");
                setShowAdminOrders(true);
              }}
              onOpenAdminSales={() => {
                setAdminModalView("sales");
                setShowAdminOrders(true);
              }}
              clientNotifications={clientNotifications}
              unreadNotificationCount={unreadNotificationCount}
              onOpenNotifications={handleOpenNotifications}
            />
            <Hero onBookAction={handleBookAction} />
            <AboutSection />
            <ServicesSection
              onAddToCart={addToCart}
              canBook={isClientLoggedIn}
              onRequireLogin={handleBookAction}
              authToken={authToken}
            />
            <BranchesSection />
            <ReviewsSection />
            <AuthoritySection />
            <Footer />
            {showCart && <CartSidebar cart={cart} onClose={() => setShowCart(false)} onRemove={removeFromCart} />}
            {showLogin && <AuthModal onClose={() => setShowLogin(false)} onAuthSuccess={handleAuthSuccess} />}
            {showAdminOrders && authToken && currentUser?.role === "ADMIN" && (
              <AdminOrdersModal onClose={() => setShowAdminOrders(false)} token={authToken} initialView={adminModalView} />
            )}
          </div>
        } />
      </Routes>
    </Router>
  );
}
