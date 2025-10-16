// src/pages/Menu.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import { useCart } from "../context/CartContext"; // uses your existing CartContext
import "./info.css";

export default function Menu() {
  const authed = useMemo(() => !!localStorage.getItem("token"), []);
  const { addItem } = useCart?.() || { addItem: () => {} }; // safe fallback

  // UI state
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  // category state
  const [cats, setCats] = useState([]);
  const [catId, setCatId] = useState(null);

  // data state
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // login prompt modal
  const [showPrompt, setShowPrompt] = useState(false);

  // categories
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await api.categories();
        if (active) setCats(Array.isArray(list) ? list : []);
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  // fetch products
  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const params = { q, page, limit };
      if (catId) params.categoryId = catId;
      const res = await api.products(params);
      const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setItems(data);
      setMeta(res?.meta ?? { page, limit, total: data.length, pages: 1 });
    } catch (e) {
      setErr(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [q, page, limit, catId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [q, catId]);

  // layout styling (sidebar visible only when authed)
  const layoutStyle = authed
    ? { display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, alignItems: "start" }
    : {};

  const sideItem = (active) => ({
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid #eee",
    background: active ? "#fde68a" : "#fff",
    fontWeight: active ? 700 : 500,
    transition: ".15s ease",
  });

  // handle add click from a card
  const handleAdd = (product) => {
    if (!authed) {
      setShowPrompt(true);
      return;
    }
    try {
      addItem(product, 1); // your CartContext API
    } catch {
      // simple localStorage fallback if needed
      const key = "cart_items";
      const cur = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = cur.findIndex((x) => x.id === product.id);
      if (idx >= 0) cur[idx].qty = (cur[idx].qty || 1) + 1;
      else cur.push({ ...product, qty: 1 });
      localStorage.setItem(key, JSON.stringify(cur));
    }
  };

  return (
    <main className="page">
      <div className="page__bg" aria-hidden><img src="/images/background.jpg" alt=""/></div>
      <div className="page__shade" aria-hidden/>
      <div className="page__body">
        <h1 className="page__title">Menu</h1>
        <p className="page__lead">Browse our full selection of coffee, bakes, and bites.</p>

        <div className="section" />

        <div style={layoutStyle}>
          {authed && (
            <aside className="card-lite" style={{ position: "sticky", top: 84 }}>
              <h3 className="section__title" style={{ marginTop: 0 }}>Categories</h3>
              <div style={{ display: "grid", gap: 8 }}>
                <button type="button" style={sideItem(catId === null)} onClick={() => setCatId(null)}>All</button>
                {cats.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    style={sideItem(catId === c.id)}
                    onClick={() => setCatId(c.id)}
                    title={`Show ${c.name}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </aside>
          )}

          <div>
            <div className="section">
              <SearchBar value={q} onChange={setQ} placeholder="Search the menu…" />
            </div>

            {err && <div className="card-lite" style={{borderColor:"#fecaca", background:"#fee2e2"}}>{err}</div>}
            {loading && <div className="card-lite">Loading…</div>}

            <div className="grid">
              {items.map(p => (
                <ProductCard key={p.id} product={p} onAdd={handleAdd} showAdd />
              ))}
            </div>

            <div className="section" style={{display:"flex", justifyContent:"center"}}>
              <Pagination meta={meta} onPage={(p)=>setPage(p)} />
            </div>
          </div>
        </div>
      </div>

      {/* Login required modal */}
      {showPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            display: "grid",
            placeItems: "center",
            zIndex: 60,
          }}
          onClick={() => setShowPrompt(false)}
        >
          <div
            className="card-lite"
            style={{
              width: "min(480px, 92vw)",
              background: "#fff",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 12px 40px rgba(0,0,0,.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="section__title" style={{ marginTop: 0 }}>Login required</h3>
            <p style={{ marginBottom: 14 }}>
              Please <strong>sign in</strong> to add items to your cart.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-primary" onClick={() => setShowPrompt(false)}>
                Close
              </button>
              <Link to="/login" className="btn-primary">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
