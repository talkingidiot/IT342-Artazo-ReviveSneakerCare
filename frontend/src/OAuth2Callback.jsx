import { useEffect, useState } from "react";

const AUTH_TOKEN_KEY = "sia_auth_token";
const AUTH_USER_KEY = "sia_auth_user";

export function OAuth2Callback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userName = params.get("user");
    const email = params.get("email");
    const avatar = params.get("avatar");
    const errorParam = params.get("error");

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify({
          name: userName,
          email,
          avatarUrl: avatar,
          provider: "github",
        })
      );
      window.location.href = "/";
      return;
    }

    if (errorParam) {
      setError(errorParam || "Authentication failed");
      setLoading(false);
      return;
    }

    setError("Invalid OAuth callback response. Please try signing in again.");
    setLoading(false);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f5f2ee",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "40px",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 24px 80px rgba(0,0,0,0.12)",
        }}
      >
        {loading && !error && (
          <>
            <div
              style={{
                width: "44px",
                height: "44px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                border: "3px solid #e8ddd0",
                borderTopColor: "#8B7355",
                animation: "spin 1s linear infinite",
              }}
            />
            <h2 style={{ color: "#3a2e1e", marginBottom: "10px" }}>Signing you in</h2>
            <p style={{ color: "#8B7355", marginBottom: 0 }}>
              Please wait while we complete your GitHub login.
            </p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}

        {error && (
          <>
            <div
              style={{
                width: "44px",
                height: "44px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "#fdeaea",
                color: "#d32f2f",
                fontSize: "28px",
                lineHeight: "44px",
                fontWeight: 700,
              }}
            >
              !
            </div>
            <h2 style={{ color: "#d32f2f", marginBottom: "10px" }}>Login failed</h2>
            <p style={{ color: "#8B7355", marginBottom: "20px" }}>{error}</p>
            <a
              href="/"
              style={{
                display: "inline-block",
                background: "#8B7355",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Back to home
            </a>
          </>
        )}
      </div>
    </div>
  );
}
