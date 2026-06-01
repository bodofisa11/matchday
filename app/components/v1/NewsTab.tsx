"use client";

import { useState, useEffect } from "react";
import { fetchNews, type NewsArticleRow } from "@/app/lib/v1/fetch-standings-client";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NewsCard({ article, accent }: { article: NewsArticleRow; accent: string }) {
  const imageUrl =
    article.image_path && process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${article.image_path}`
      : null;

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: article.source_url ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onClick={() =>
        article.source_url && window.open(article.source_url, "_blank", "noopener,noreferrer")
      }
      onMouseEnter={(e) => {
        if (article.source_url) {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {imageUrl && (
        <div style={{ width: "100%", height: "140px", overflow: "hidden", flexShrink: 0 }}>
          <img
            src={imageUrl}
            alt={article.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div
        style={{
          padding: "0.9rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            color: accent,
            letterSpacing: "0.05em",
          }}
        >
          {article.competition ?? article.sport}
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: "0.88rem",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            color: "var(--text-primary)",
          }}
        >
          {article.title}
        </div>
        {article.summary && (
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {article.summary}
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "0.4rem",
            paddingTop: "0.4rem",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
            {article.source ?? "MatchDay"}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {timeAgo(article.published_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function NewsTab({
  competition,
  accent,
}: {
  competition: string;
  accent: string;
}) {
  const [articles, setArticles] = useState<NewsArticleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews(competition).then((a) => {
      setArticles(a);
      setLoading(false);
    });
  }, [competition]);

  if (loading) {
    return (
      <div style={{ color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>
        Loading…
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div
        className="card fade-in"
        style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📰</div>
        <div style={{ fontWeight: 600 }}>No news yet</div>
        <div style={{ fontSize: "0.78rem", marginTop: "0.4rem" }}>
          Articles will appear here once they are added.
        </div>
      </div>
    );
  }

  return (
    <div
      className="fade-in"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1rem",
      }}
    >
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} accent={accent} />
      ))}
    </div>
  );
}
