// src/pages/AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const card   = { padding: "14px 16px", border: "1px solid #eee", borderRadius: 12, background: "#fff" };
const btn    = { display:"inline-block", padding:"8px 12px", borderRadius:8, background:"#fbbf24", color:"#1a1a1a", textDecoration:"none", fontWeight:700 };
const gray   = { ...btn, background:"#e5e7eb", color:"#111" };
const danger = { background:"#fee2e2", border:"1px solid #fecaca", color:"#991b1b", padding:"8px 10px", borderRadius:10 };
const muted  = { color:"#6b5c51" };

export default function AdminDashboard() {
  const [cats, setCats]     = useState([]);
  const [prods, setProds]   = useState([]);
  const [err, setErr]       = useState("");
  const [loading, setLoad]  = useState(true);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);
  const role       = user?.role;
  const isSuper    = role === "SuperAdmin";
  const canManage  = role === "Admin" || role === "SuperAdmin";

  const catNameById = useMemo(
    () => Object.fromEntries(cats.map(c => [c.id, c.name])),
    [cats]
  );

  const loadAll = async () => {
    try {
      setErr("");
      setLoad(true);
      const [c, p] = await Promise.all([
        api.categories(),
        api.products({ page: 1, limit: 100 }),
      ]);
      setCats(Array.isArray(c) ? c : []);
      setProds(Array.isArray(p) ? p : (Array.isArray(p?.data) ? p.data : []));
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const delCat = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.deleteCategory(id);
      setCats((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const delProd = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      setProds((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const inr = (n) => `₹${Number(n).toFixed(2)}`;

  if (!canManage) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Admin Panel</h1>
        <p style={{ ...muted, marginBottom: 16 }}>
          You’re signed in as <strong>{user?.username || "Guest"}</strong> (<em>{role || "User"}</em>).
        </p>
        <div style={danger}>You don’t have permission to view this page.</div>
        <div style={{ marginTop: 14 }}>
          <Link to="/" style={gray}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:16 }}>
      {/* simple side links */}
      <aside style={{ background:"#fff", border:"1px solid #eee", borderRadius:12, padding:12 }}>
        <div style={{ fontWeight:800, marginBottom:8 }}>Admin</div>
        <div style={{ display:"grid", gap:8 }}>
          <Link to="/admin/products" style={{ textDecoration:"none" }}>Products</Link>
          <Link to="/admin/categories" style={{ textDecoration:"none" }}>Categories</Link>
        </div>
      </aside>

      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Admin Panel</h1>
        <p style={{ ...muted, marginBottom: 18 }}>
          Welcome {user?.username} ({role})
        </p>
        {err && <div style={{ ...danger, marginBottom: 12 }}>{err}</div>}

        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom: 20 }}>
          <button type="button" onClick={loadAll} style={{ ...gray, background:"#fff", border:"1px solid #d1d5db" }}>⟳ Refresh</button>
          {isSuper && <Link to="/admin/users" style={btn}>👥 Users</Link>}
        </div>

        {loading && <div style={{ ...muted, margin: "8px 0 20px" }}>Loading…</div>}

        {/* Categories (incremental display IDs) */}
        <div style={card}>
          <h2 style={{ margin:"0 0 10px", fontWeight:800 }}>
            Categories <span style={{ ...muted, fontWeight: 500 }}>({cats.length})</span>
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ textAlign:"left", borderBottom:"1px solid #eee" }}>
                  <th style={{ padding:"10px" }}>ID</th>
                  <th style={{ padding:"10px" }}>Name</th>
                  <th style={{ padding:"10px", width: 160 }} />
                </tr>
              </thead>
              <tbody>
                {cats.map((c, idx) => (
                  <tr key={c.id} style={{ borderBottom:"1px solid #f2f2f2" }}>
                    {/* 👇 display incremental ID, still use c.id for actions */}
                    <td style={{ padding:"10px" }}>{idx + 1}</td>
                    <td style={{ padding:"10px" }}>{c.name}</td>
                    <td style={{ padding:"10px" }}>
                      <button
                        onClick={() => delCat(c.id)}
                        style={{ ...btn, background:"#ef4444", color:"#fff" }}
                        title={`Delete category ${c.name}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!cats.length && !loading && (
                  <tr><td colSpan={3} style={{ padding:"10px" }}>No categories</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Products (incremental display IDs) */}
        <div style={{ ...card, marginTop:16 }}>
          <h2 style={{ margin:"0 0 10px", fontWeight:800 }}>
            Products <span style={{ ...muted, fontWeight: 500 }}>({prods.length})</span>
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ textAlign:"left", borderBottom:"1px solid #eee" }}>
                  <th style={{ padding:"10px" }}>ID</th>
                  <th style={{ padding:"10px" }}>Name</th>
                  <th style={{ padding:"10px" }}>Price</th>
                  <th style={{ padding:"10px" }}>Category</th>
                  <th style={{ padding:"10px", width: 200 }} />
                </tr>
              </thead>
              <tbody>
                {prods.map((p, idx) => (
                  <tr key={p.id} style={{ borderBottom:"1px solid #f2f2f2" }}>
                    {/* 👇 incremental ID for display */}
                    <td style={{ padding:"10px" }}>{idx + 1}</td>
                    <td style={{ padding:"10px" }}>{p.name}</td>
                    <td style={{ padding:"10px" }}>{inr(p.price)}</td>
                    <td style={{ padding:"10px" }}>
                      {catNameById[p.categoryId] || <span style={muted}>#{p.categoryId}</span>}
                    </td>
                    <td style={{ padding:"10px" }}>
                      <button
                        onClick={() => delProd(p.id)}
                        style={{ ...btn, background:"#ef4444", color:"#fff" }}
                        title={`Delete product ${p.name}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!prods.length && !loading && (
                  <tr><td colSpan={5} style={{ padding:"10px" }}>No products</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}