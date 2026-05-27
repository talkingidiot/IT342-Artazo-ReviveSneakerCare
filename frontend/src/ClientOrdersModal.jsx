import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import gcashQr from "./assets/gcash-qr.png";
import bpiQr from "./assets/bpi-qr.png";

export function ClientOrdersModal({ onClose, token, apiRequest, resolveAssetUrl }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [receiptDrafts, setReceiptDrafts] = useState({});
  const [sendingReceiptId, setSendingReceiptId] = useState(null);

  const paymentOptions = [
    { label: "GCASH", qrSrc: gcashQr, accent: "#2ABF88" },
    { label: "BPI", qrSrc: bpiQr, accent: "#0B57D0" },
  ];

  const request = apiRequest || (() => {
    throw new Error("apiRequest is not available");
  });

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await request("/client/orders", { token });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load client orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const decideOnQuote = async (orderId, approved) => {
    setNoteLoading(true);
    setError("");
    try {
      await request(`/client/orders/${orderId}/decision`, {
        method: "POST",
        token,
        body: { approved },
      });
      await request(`/orders/${orderId}/messages`, {
        method: "POST",
        token,
        body: {
          message: approved
            ? "I approve the proposed service change."
            : "I do not approve the proposed service change.",
        },
      }).catch(() => {});
      await loadOrders();
    } catch (err) {
      setError(err.message || "Failed to submit decision");
    } finally {
      setNoteLoading(false);
    }
  };

  const updateReceiptDraft = (orderId, patch) => {
    setReceiptDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        ...patch,
      },
    }));
  };

  const clearReceiptDraft = (orderId) => {
    setReceiptDrafts((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  };

  const submitReceipt = async (order) => {
    const draft = receiptDrafts[order.id];
    if (!draft?.file) {
      setError("Please choose a receipt file before sending it.");
      return;
    }
    setSendingReceiptId(order.id);
    setError("");
    try {
      const formData = new FormData();
      formData.append("receipt", draft.file);
      formData.append("paymentMethod", draft.paymentMethod || order.paymentMethod || "GCASH");
      await request(`/client/orders/${order.id}/receipt`, {
        method: "POST",
        token,
        body: formData,
      });
      await request(`/orders/${order.id}/messages`, {
        method: "POST",
        token,
        body: {
          message: `I have paid online and sent my ${draft.paymentMethod || order.paymentMethod || "GCASH"} receipt.`,
        },
      }).catch(() => {});
      setQrPreview((prev) => (prev?.orderId === order.id ? null : prev));
      setReceiptPreview((prev) => (prev?.orderId === order.id ? null : prev));
      clearReceiptDraft(order.id);
      await loadOrders();
    } catch (err) {
      setError(err.message || "Failed to send receipt");
    } finally {
      setSendingReceiptId(null);
    }
  };

  const formatReceiptDate = (value) => {
    if (!value) return "Pending";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Pending";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return createPortal(
    <>
      {qrPreview && (
        <div
          onClick={() => setQrPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(92vw, 420px)",
              maxHeight: "90vh",
              background: "#fff",
              borderRadius: "12px",
              padding: "10px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
            }}
          >
            <img
              src={qrPreview.qrSrc}
              alt={`${qrPreview.label} enlarged`}
              style={{ width: "100%", height: "auto", display: "block", borderRadius: "8px", objectFit: "contain", cursor: "zoom-out" }}
            />
          </div>
          <button
            type="button"
            onClick={() => setQrPreview(null)}
            style={{ position: "fixed", top: "20px", right: "20px", width: "40px", height: "40px", borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "22px", cursor: "pointer", lineHeight: 1 }}
            aria-label="Close QR preview"
          >
            ×
          </button>
        </div>
      )}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          background: "rgba(58,46,30,0.52)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            background: "#fffdfb",
            borderRadius: "18px",
            width: "100%",
            maxWidth: "980px",
            maxHeight: "90vh",
            overflowY: "auto",
            overflowX: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
            border: "1px solid #efe5d8",
          }}
        >
          <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid #f0ebe4", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 700, color: "#3a2e1e", margin: 0 }}>My Orders</h2>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#999" }}>X</button>
          </div>
          <div style={{ padding: "24px 32px 32px", minHeight: "240px", background: "#fffdfb" }}>
            {loading ? (
              <div style={{ minHeight: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#7a6a57", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "16px" }}>
                Loading orders...
              </div>
            ) : error ? (
              <div style={{ minHeight: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#c0392b", fontFamily: "'Cormorant Garamond', Georgia, serif", textAlign: "center" }}>
                <div>{error}</div>
                <button onClick={loadOrders} style={{ background: "#8B7355", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 14px", cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ minHeight: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#7a6a57", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "16px" }}>
                No orders yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {orders.map((order) => {
                  const draft = receiptDrafts[order.id] || {};
                  const selectedPaymentMethod = draft.paymentMethod || order.paymentMethod || "GCASH";
                  return (
                    <div key={order.id} style={{ border: "1px solid #ece3d8", borderRadius: "12px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 360px" }}>
                          <div style={{ fontWeight: 700, color: "#3a2e1e" }}>Order #{order.id}</div>
                          <div style={{ color: "#7a6a57", fontSize: "13px" }}>{order.serviceType || order.shoeType || "Service"} | {order.status}</div>
                          <div style={{ color: "#7a6a57", fontSize: "13px" }}>Quote: {order.quotedPrice ?? "Pending"}</div>
                          <div style={{ color: "#7a6a57", fontSize: "13px" }}>Proposed completion: {order.estimatedCompletionDate ?? "Pending"}</div>
                          <div style={{ color: "#7a6a57", fontSize: "13px" }}>Claim window: {order.claimWindow ?? "Pending"}</div>
                        </div>
                        {order.status === "QUOTED" && (
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button onClick={() => decideOnQuote(order.id, true)} disabled={noteLoading} style={{ background: "#445f7a", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 14px", cursor: noteLoading ? "not-allowed" : "pointer" }}>
                              Approve proposal
                            </button>
                            <button onClick={() => decideOnQuote(order.id, false)} disabled={noteLoading} style={{ background: "#c85a46", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 14px", cursor: noteLoading ? "not-allowed" : "pointer" }}>
                              Decline proposal
                            </button>
                          </div>
                        )}
                      </div>

                      {order.status === "READY_FOR_PICKUP" && (
                        <div style={{ width: "100%", marginTop: "10px", borderTop: "1px solid #f1ebe4", paddingTop: "12px" }}>
                          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: "#7a6a57", marginBottom: "8px" }}>PAYMENT / PICKUP</div>
                          <div style={{ color: "#3a2e1e", fontSize: "13px", marginBottom: "10px" }}>
                            Your shoes are ready to claim. Please settle payment at pickup.
                          </div>
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                            {paymentOptions.map((option) => (
                              <button
                                key={option.label}
                                type="button"
                                onClick={() => setQrPreview({ orderId: order.id, ...option })}
                                style={{
                                  background: option.accent,
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "8px",
                                  padding: "10px 14px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                }}
                              >
                                View {option.label} QR
                              </button>
                            ))}
                          </div>

                          {qrPreview?.orderId === order.id && (
                            <div style={{ border: "1px solid #e6dccf", borderRadius: "12px", background: "#fff", padding: "14px", marginBottom: "12px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                                <div>
                                  <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: "#7a6a57" }}>IN-APP QR VIEWER</div>
                                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#3a2e1e" }}>{qrPreview.label} QR</div>
                                </div>
                                <button type="button" onClick={() => setQrPreview(null)} style={{ background: "none", border: "none", color: "#8B7355", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                                  Close QR
                                </button>
                              </div>
                              <div style={{ display: "flex", justifyContent: "center" }}>
                                <img src={qrPreview.qrSrc} alt={`${qrPreview.label} QR`} style={{ width: "100%", maxWidth: "280px", height: "auto", borderRadius: "12px", border: "1px solid #efe5d8" }} />
                              </div>
                            </div>
                          )}

                          <div style={{ border: "1px solid #ece3d8", borderRadius: "12px", background: "#fffdfb", padding: "14px" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: "#7a6a57", marginBottom: "8px" }}>RECEIPT</div>
                            <div style={{ display: "grid", gap: "6px", color: "#3a2e1e", fontSize: "13px" }}>
                              <div><strong>Receipt No:</strong> RCPT-{order.id}</div>
                              <div><strong>Order No:</strong> #{order.id}</div>
                              <div><strong>Service:</strong> {order.serviceType || order.shoeType || "Service"}</div>
                              <div><strong>Quoted Price:</strong> {order.quotedPrice ?? "Pending"}</div>
                              <div><strong>Estimated Completion:</strong> {formatReceiptDate(order.estimatedCompletionDate)}</div>
                              <div><strong>Status:</strong> {order.status}</div>
                              <div><strong>Payment Method:</strong> {order.paymentMethod || "Pending"}</div>
                              <div><strong>Receipt Date:</strong> {formatReceiptDate(order.createdAt)}</div>
                            </div>

                            <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
                              <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: "#7a6a57", marginBottom: "8px" }}>
                                  Upload payment receipt
                                </label>
                                <select value={selectedPaymentMethod} onChange={(e) => updateReceiptDraft(order.id, { paymentMethod: e.target.value })} style={{ width: "100%", border: "1px solid #dfd4c6", borderRadius: "8px", padding: "10px 12px", background: "#fff", color: "#3a2e1e", marginBottom: "10px" }}>
                                  {paymentOptions.map((option) => (
                                    <option key={option.label} value={option.label}>{option.label}</option>
                                  ))}
                                </select>
                                <input type="file" accept="image/*,application/pdf" onChange={(e) => updateReceiptDraft(order.id, { file: e.target.files?.[0] || null })} style={{ width: "100%", color: "#3a2e1e" }} />
                                {draft.file && (
                                  <div style={{ marginTop: "8px", fontSize: "12px", color: "#7a6a57" }}>
                                    Selected file: {draft.file.name}
                                  </div>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                <button type="button" onClick={() => submitReceipt(order)} disabled={sendingReceiptId === order.id} style={{ background: "#445f7a", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 14px", cursor: sendingReceiptId === order.id ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 700 }}>
                                  {sendingReceiptId === order.id ? "SENDING RECEIPT..." : "Send receipt"}
                                </button>
                                <button type="button" onClick={() => setReceiptPreview({ orderId: order.id, src: resolveAssetUrl(order.paymentProofUrl) })} disabled={!order.paymentProofUrl} style={{ background: order.paymentProofUrl ? "#8B7355" : "#c8c0b5", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 14px", cursor: order.paymentProofUrl ? "pointer" : "not-allowed", fontSize: "13px", fontWeight: 700 }}>
                                  View sent receipt
                                </button>
                              </div>
                            </div>

                            {receiptPreview?.orderId === order.id && (
                              <div style={{ marginTop: "12px", border: "1px solid #e6dccf", borderRadius: "12px", background: "#fff", padding: "14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                                  <div>
                                    <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: "#7a6a57" }}>RECEIPT PREVIEW</div>
                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#3a2e1e" }}>Payment receipt image</div>
                                  </div>
                                  <button type="button" onClick={() => setReceiptPreview(null)} style={{ background: "none", border: "none", color: "#8B7355", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                                    Close receipt
                                  </button>
                                </div>
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                  <img src={receiptPreview.src} alt="Payment receipt preview" style={{ width: "100%", maxWidth: "340px", height: "auto", borderRadius: "12px", border: "1px solid #efe5d8" }} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      </>,
      document.body
    );
  }
