// src/pages/Category.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import "./category.css";

/* ---------- helpers for images ---------- */
const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const productImages = {
  "Espresso":        "/images/espressocoffee.jpg",
  "Cappuccino":      "/images/cappuccino.jpg",
  "Latte":           "/images/latte.jpg",
  "Chocolate Cake": "/images/chocolatecake.jpg",
  "Cheesecake":      "/images/cheesecake.jpg",
  "Club Sandwich": "/images/clubsandwich.jpg",
  "Croissant":       "/images/croissant.jpg",
  "Iced Coffee":   "/images/icedcoffee.jpg",
  "Lemon Iced Tea":"/images/lemonicetea.jpg",
  "Garlic Bread":  "/images/garlicbread.jpg",
  "Cold Coffee":   "/images/coldcoffee.jpg",
  "Black Coffee":  "/images/BlackCoffee.jpg",
  "Iced-Mocha":       "/images/mocha.jpg",
  "Banana-Bread":"/images/bananabread.jpg",
  "Mini Lemon Cakes":"/images/minilemoncakes.jpg",
  "Blueberry Muffin":"/images/blueberrymuffin.jpg",
  "Chocolate Muffin":"/images/chocolatemuffin.jpg",
  "Veggie Sandwich":"/images/veggiesandwich.jpg",
  "Grilled Sandwich":"/images/grilledsandwich.jpg",
  "Tomato Soup":"/images/tomatosoup.jpg",
  "Minestrone Soup":"/images/minestronesoup.jpg",
};

const normalizeUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `/images/products/${url}`;
};

// ⬇️ THIS was missing
const candidatesFor = (p) => {
  const name = p?.name || "";
  const s = slugify(name);
  const list = [
    normalizeUrl(p?.imageUrl),
    productImages[name],
    s ? `/images/products/${s}.jpg` : null,
    s ? `/images/products/${s}.png` : null,
    s ? `/images/${s}.jpg` : null,
    s ? `/images/${s}.png` : null,
    "/images/fallback.jpg",
  ].filter(Boolean);
  return [...new Set(list)];
};
/* ---------------------------------------- */

export default function CategoryPage() {
  const { id } = useParams();

  // keep page/limit/q in URL
  const [searchParams, setSearchParams] = useSearchParams();
  const page  = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "2", 10), 1);
  const q     = (searchParams.get("q") || "").trim();

  const [items, setItems]  = useState([]);
  const [meta, setMeta]    = useState(null);
  const [loading, setLoad] = useState(true);
  const [err, setErr]      = useState("");

  const fetchPage = useCallback(async () => {
    try {
      setLoad(true);
      setErr("");
      const res = await api.categoryProducts(id, { page, limit, q });
      const data = res?.data ?? res ?? [];
      setItems(data);
      setMeta(res?.meta ?? { page, limit, total: data.length, pages: 1 });
    } catch (e) {
      setErr(e.message || "Failed to load products");
    } finally {
      setLoad(false);
    }
  }, [id, page, limit, q]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const imageSources = useMemo(() => items.map((p) => candidatesFor(p)), [items]);

  // Search -> set q + reset page to 1 (keep limit)
  const onSearch = (next) => {
    const nextQ = (next || "").trim();
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      const currentQ = (sp.get("q") || "").trim();
      if (nextQ) sp.set("q", nextQ); else sp.delete("q");
      if (nextQ !== currentQ) sp.set("page", "1");
      sp.set("limit", String(limit));
      return sp;
    });
  };

  // Pagination -> update page in URL (keeps q & limit)
  const onPage = (p) => {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      if (q) sp.set("q", q); else sp.delete("q");
      sp.set("page", String(p));
      sp.set("limit", String(limit));
      return sp;
    });
  };

  return (
    <main className="category-page">
      {/* blurred background */}
      <div className="category-page__bg" aria-hidden="true">
        <img src="/images/background.jpg" alt="" />
      </div>
      <div className="category-page__scrim" aria-hidden="true" />

      <div className="container">
        <h1 className="category-page__title">Category</h1>

        <div className="category-page__search">
          <SearchBar value={q} onChange={onSearch} placeholder="Search within this category…" />
        </div>

        {err && <div style={{ color: "#991b1b", marginBottom: 12 }}>{err}</div>}
        {loading && <div style={{ color: "#6b7280", marginBottom: 12 }}>Loading…</div>}
        {!loading && !items.length && <div>No products in this category.</div>}

        <div className="cat-grid">
          {items.map((p, i) => {
            const sources = imageSources?.[i] || ["/images/fallback.jpg"];
            return (
              <Link key={p.id} to={`/product/${p.id}`} className="cat-card">
                <div className="cat-card__thumb">
                  <img
                    src={sources[0]}
                    alt={p.name}
                    data-fallbacks={sources.slice(1).join("|")}
                    onError={(e) => {
                      const rest = (e.currentTarget.dataset.fallbacks || "")
                        .split("|")
                        .filter(Boolean);
                      if (rest.length) {
                        e.currentTarget.src = rest[0];
                        e.currentTarget.dataset.fallbacks = rest.slice(1).join("|");
                      } else {
                        e.currentTarget.replaceWith(
                          Object.assign(document.createElement("div"), {
                            className: "w-full h-full flex items-center justify-center",
                            textContent: "🍰",
                          })
                        );
                      }
                    }}
                  />
                </div>

                <div className="cat-card__body">
                  <div className="cat-card__title">{p.name}</div>
                  <div className="cat-card__desc">{p.description}</div>
                  <div className="cat-card__price">₹{Number(p.price).toFixed(2)}</div>
                </div>
              </Link>
            );
          })}
        </div>

        <Pagination meta={meta || { page, pages: 1, limit, total: items.length }} onPage={onPage} />
      </div>
    </main>
  );
}
