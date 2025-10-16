import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import SidePanel from "../components/SidePanel";
import Pagination from "../components/Pagination";

const inr = (n) => `₹${Number(n).toFixed(2)}`;

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page  = Math.max(parseInt(searchParams.get("page")  || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "10", 10), 1);
  const q     = (searchParams.get("q") || "").trim();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page, limit, pages: 1, total: 0 });
  const [err, setErr]   = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setBusy(true); setErr("");
        const res  = await api.products({ page, limit, q });
        const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const m    = res?.meta || { page, limit, total: data.length, pages: 1 };
        if (live) { setRows(data); setMeta(m); }
      } catch (e) {
        if (live) setErr(e.message || "Failed to load products");
      } finally {
        if (live) setBusy(false);
      }
    })();
    return () => { live = false; };
  }, [page, limit, q]);

  // ---- helpers to mutate the URL params ----
  const setParam = (patch) => {
    const sp = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") sp.delete(k);
      else sp.set(k, String(v));
    });
    setSearchParams(sp);
  };

  const onPage   = (p)   => setParam({ page: p, limit, q });
  const onSearch = (val) => setParam({ q: val?.trim() || undefined, page: 1, limit });
  const onLimit  = (n)   => setParam({ limit: n, page: 1, q });

  const del = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      // if we deleted the last row on the page, step back
      if (rows.length === 1 && page > 1) onPage(page - 1);
      else onPage(page);
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  // serial number for the first column (frontend only)
  const startIndex = (meta.page - 1) * meta.limit;

  // minimal styles
  const card   = { padding:"14px 16px", border:"1px solid #eee", borderRadius:12, background:"#fff" };
  const muted  = { color:"#6b5c51" };
  const btn    = { padding:"6px 10px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" };
  const primary= { ...btn, background:"#fbbf24", fontWeight:700 };
  const danger = { ...btn, background:"#ef4444", color:"#fff", borderColor:"#ef4444" };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6" style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:16 }}>
      <SidePanel />
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>Products</h1>
            <div style={{ ...muted }}>Manage your catalog</div>
          </div>
          <Link to="/admin/products/new" style={primary}>+ Add Product</Link>
        </div>

        {/* search + per-page */}
        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
          <input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search products…"
            style={{ flex: "1 1 auto", padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb" }}
          />
          <label style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
            <span style={{ ...muted, fontSize:14 }}>Per page</span>
            <select
              value={limit}
              onChange={(e) => onLimit(Number(e.target.value))}
              style={{ padding:"8px 10px", borderRadius:8, border:"1px solid #e5e7eb" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>

        {err  && <div style={{ marginBottom:10, padding:10, borderRadius:10, background:"#fee2e2", border:"1px solid #fecaca" }}>{err}</div>}
        {busy && <div style={{ ...muted, marginBottom:10 }}>Loading…</div>}

        <div style={card}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ textAlign:"left", borderBottom:"1px solid #eee" }}>
                  {/* show serial number, not DB id */}
                  <th style={{ padding:10, width:70 }}>S.no</th>
                  <th style={{ padding:10 }}>Name</th>
                  <th style={{ padding:10 }}>Price</th>
                  <th style={{ padding:10 }}>Category</th>
                  <th style={{ padding:10, width:180 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom:"1px solid #f2f2f2" }}>
                    <td style={{ padding:10 }}>{startIndex + i + 1}</td>
                    <td style={{ padding:10 }}>{p.name}</td>
                    <td style={{ padding:10 }}>{inr(p.price)}</td>
                    <td style={{ padding:10 }}>{p.Category?.name ?? `#${p.categoryId}`}</td>
                    <td style={{ padding:10, display:"flex", gap:8 }}>
                      <button onClick={() => del(p.id)} style={danger}>Delete</button>
                    </td>
                  </tr>
                ))}
                {!rows.length && !busy && (
                  <tr><td colSpan={5} style={{ padding:10 }}>No products</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* server-driven pagination via your component */}
        <Pagination meta={meta} onPage={onPage} />
      </div>
    </div>
  );
}
