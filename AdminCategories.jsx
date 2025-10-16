import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import SidePanel from "../components/SidePanel";
import Pagination from "../components/Pagination";

export default function AdminCategories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page  = Math.max(parseInt(searchParams.get("page")  || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "10", 10), 1);
  const q     = (searchParams.get("q") || "").trim();

  const [all, setAll]   = useState([]);
  const [err, setErr]   = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setBusy(true); setErr("");
        const list = await api.categories();
        if (live) setAll(Array.isArray(list) ? list : []);
      } catch (e) {
        if (live) setErr(e.message || "Failed to load categories");
      } finally {
        if (live) setBusy(false);
      }
    })();
    return () => { live = false; };
  }, []);

  // filter (client-side) + paginate (client-side)
  const filtered = useMemo(
    () => (q ? all.filter(c => c.name.toLowerCase().includes(q.toLowerCase())) : all),
    [all, q]
  );

  const pages    = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, pages);
  const start    = (safePage - 1) * limit;
  const slice    = filtered.slice(start, start + limit);
  const meta     = { page: safePage, limit, total: filtered.length, pages };

  // --- URL helpers
  const onPage = (p) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(p));
    sp.set("limit", String(limit));
    if (q) sp.set("q", q); else sp.delete("q");
    setSearchParams(sp);
  };

  const onSearch = (val) => {
    const sp = new URLSearchParams(searchParams);
    if (val?.trim()) sp.set("q", val.trim()); else sp.delete("q");
    sp.set("page", "1");
    sp.set("limit", String(limit));
    setSearchParams(sp);
  };

  const onLimit = (n) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("limit", String(n));
    sp.set("page", "1");
    if (q) sp.set("q", q); else sp.delete("q");
    setSearchParams(sp);
  };

  const del = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.deleteCategory(id);
      // remove locally
      setAll((s) => s.filter((x) => x.id !== id));
      // if we deleted the last row on this page, step back
      if (slice.length === 1 && safePage > 1) onPage(safePage - 1);
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  // small inline styles (same spirit as your other admin pages)
  const card    = { padding:"14px 16px", border:"1px solid #eee", borderRadius:12, background:"#fff" };
  const muted   = { color:"#6b5c51" };
  const btn     = { padding:"6px 10px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" };
  const primary = { ...btn, background:"#fbbf24", fontWeight:700 };
  const danger  = { ...btn, background:"#ef4444", color:"#fff", borderColor:"#ef4444" };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6" style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:16 }}>
      <SidePanel />
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>Categories</h1>
            <div style={{ ...muted }}>Manage your categories</div>
          </div>
          <Link to="/admin/categories/new" style={primary}>+ Add Category</Link>
        </div>

        {/* search + per-page */}
        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
          <input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search categories…"
            style={{ flex:"1 1 auto", maxWidth:420, padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb" }}
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
                  {/* Serial number, not DB id */}
                  <th style={{ padding:10, width:70 }}>S.no</th>
                  <th style={{ padding:10 }}>Name</th>
                  <th style={{ padding:10, width:140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom:"1px solid #f2f2f2" }}>
                    <td style={{ padding:10 }}>{start + i + 1}</td>
                    <td style={{ padding:10 }}>{c.name}</td>
                    <td style={{ padding:10 }}>
                      <button onClick={() => del(c.id)} style={danger}>Delete</button>
                    </td>
                  </tr>
                ))}
                {!slice.length && !busy && (
                  <tr><td colSpan={3} style={{ padding:10 }}>No categories</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination meta={meta} onPage={onPage} />
      </div>
    </div>
  );
}
