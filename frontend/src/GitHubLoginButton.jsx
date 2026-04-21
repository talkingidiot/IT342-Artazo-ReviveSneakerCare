const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");
const GITHUB_AUTH_START_URL = `${API_BASE_URL}/auth/oauth2/authorize/github`;

export function GitHubLoginButton() {
  return (
    <a
      href={GITHUB_AUTH_START_URL}
      style={{
        width: "100%",
        background: "#1f2937",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "14px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "2px",
        cursor: "pointer",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        textDecoration: "none",
        display: "block",
        textAlign: "center",
        marginTop: "12px",
        transition: "background 0.3s ease",
      }}
      onMouseEnter={(e) => (e.target.style.background = "#111827")}
      onMouseLeave={(e) => (e.target.style.background = "#1f2937")}
    >
      SIGN IN WITH GITHUB
    </a>
  );
}
