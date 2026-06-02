"use client";

const ACCENT = "#0066cc";

/**
 * Feed landing view. Placeholder post field — disabled until social/post
 * backend is wired. UI only for now.
 */
export function FeedView() {
  return (
    <div className="fade-in fd2" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="card" style={{ padding: "1rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.5rem" }}>
          Post to the feed
        </div>
        <textarea
          placeholder="Share your prediction take… (coming soon)"
          disabled
          rows={3}
          style={{
            width: "100%",
            padding: "0.6rem 0.75rem",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            fontSize: "0.88rem",
            fontFamily: "inherit",
            resize: "vertical",
            opacity: 0.7,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.6rem" }}>
          <button
            type="button"
            disabled
            style={{
              padding: "0.45rem 1rem",
              borderRadius: "6px",
              border: "none",
              background: "var(--border-subtle)",
              color: "var(--text-muted)",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "not-allowed",
            }}
          >
            Post
          </button>
        </div>
      </div>

      <div
        className="card fade-in"
        style={{
          textAlign: "center",
          padding: "2.5rem 1.5rem",
          color: "var(--text-muted)",
          borderStyle: "dashed",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📰</div>
        <div style={{ fontWeight: 600, color: ACCENT }}>Feed coming soon</div>
        <div style={{ fontSize: "0.78rem", marginTop: "0.4rem" }}>
          Posts, reactions and comments will land here once the backend is wired.
        </div>
      </div>
    </div>
  );
}
