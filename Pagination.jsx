// src/components/Pagination.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";

function rangeAround(page, pages, span = 1) {
  const nums = new Set([1, pages, page]);
  for (let i = 1; i <= span; i++) {
    if (page - i > 1) nums.add(page - i);
    if (page + i < pages) nums.add(page + i);
  }
  const arr = Array.from(nums).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i]);
    if (i < arr.length - 1 && arr[i + 1] !== arr[i] + 1) out.push("…");
  }
  return out;
}

export default function Pagination({ meta, onPage }) {
  // Fallback to URL query if meta is missing or inconsistent
  const [sp, setSp] = useSearchParams();
  const urlPage  = Number(sp.get("page")  || 1);
  const urlLimit = Number(sp.get("limit") || meta?.limit || 12);
  const q        = sp.get("q") || "";

  const page  = Number(meta?.page  ?? urlPage);
  const limit = Number(meta?.limit ?? urlLimit);

  // If backend didn’t send pages/total, compute from total+limit if available
  const pagesFromTotal = meta?.total != null ? Math.max(1, Math.ceil(Number(meta.total) / limit)) : 1;
  const pages = Number(meta?.pages ?? pagesFromTotal);

  if (!pages || pages <= 1) return null;

  const goViaUrl = (p) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    next.set("page", String(p));
    next.set("limit", String(limit));
    setSp(next);
  };

  const go = (p) => {
    if (p < 1 || p > pages || p === page) return;
    // Prefer parent callback if provided; otherwise update URL ourselves
    if (typeof onPage === "function") onPage(p);
    else goViaUrl(p);
  };

  const hasPrev = page > 1;
  const hasNext = page < pages;

  const baseBtn = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
  };

  return (
    <nav
      aria-label="Pagination"
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
      }}
    >
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={!hasPrev}
        style={{
          ...baseBtn,
          background: hasPrev ? "#fff" : "#f3f4f6",
          cursor: hasPrev ? "pointer" : "not-allowed",
        }}
      >
        ← Prev
      </button>

      {rangeAround(page, pages, 1).map((n, i) =>
        n === "…" ? (
          <span key={`dots-${i}`} aria-hidden="true" style={{ padding: "4px 8px", color: "#6b7280" }}>
            …
          </span>
        ) : (
          <button
            type="button"
            key={n}
            onClick={() => go(n)}
            aria-current={n === page ? "page" : undefined}
            disabled={n === page}
            style={{
              ...baseBtn,
              background: n === page ? "#fbbf24" : "#fff",
              fontWeight: n === page ? 700 : 500,
              cursor: n === page ? "default" : "pointer",
              minWidth: 36,
            }}
          >
            {n}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={!hasNext}
        style={{
          ...baseBtn,
          background: hasNext ? "#fff" : "#f3f4f6",
          cursor: hasNext ? "pointer" : "not-allowed",
        }}
      >
        Next →
      </button>
    </nav>
  );
}
