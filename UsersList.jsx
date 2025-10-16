import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import SidePanel from "../components/SidePanel";
import Pagination from "../components/Pagination";

export default function UsersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page  = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "10", 10), 1);
  const q     = (searchParams.get("q") || "").trim();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page, limit, pages: 1, total: 0 });
  const [busy, setBusy] = useState(true);
  const [err, setErr]   = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setBusy(true); setErr("");
        // backend supports ?q=&page=&limit=
        const res = await api.listUsers({ q, page, limit });
        const data = Array.isArray(res?.data) ? res.data : [];
        const m    = res?.meta || { page, limit, total: data.length, pages: 1 };
        if (live) { setRows(data); setMeta(m); }
      } catch (e) {
        if (live) setErr(e.message || "Failed to load users");
      } finally {
        if (live) setBusy(false);
      }
    })();
    return () => { live = false; };
  }, [q, page, limit]);

  const onSearch = (val) => {
    const sp = new URLSearchParams(searchParams);
    if (val?.trim()) sp.set("q", val.trim()); else sp.delete("q");
    sp.set("page", "1");
    sp.set("limit", String(limit));
    setSearchParams(sp);
  };

  const onPage = (p) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(p));
    sp.set("limit", String(limit));
    if (q) sp.set("q", q); else sp.delete("q");
    setSearchParams(sp);
  };

  // optional delete (works only if you’ve added the DELETE route server-side)
  const del = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.deleteUser?.(id);
      onPage(page);
    } catch (e) {
      alert(e.message);
    }
  };

  // tiny inline styles
  const card   = { padding:"14px 16px", border:"1px solid #eee", borderRadius:12, background:"#fff" };
  const muted  = { color:"#6b5c51" };
  const btn    = { padding:"6px 10px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" };
  const danger = { ...btn, background:"#ef4444", color:"#fff", borderColor:"#ef4444" };

  const offset = (meta.page - 1) * meta.limit; // for incremental #

  return (
    <div className="max-w-6xl mx-auto px-4 py-6" style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:16 }}>
      <SidePanel />
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>Users</h1>
            <div style={muted}>SuperAdmin – manage users</div>
          </div>
        </div>

        {/* search */}
        <div style={{ marginBottom:10 }}>
          <input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search users by name or email…"
            style={{ width: "100%", padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb" }}
          />
        </div>

        {err && <div style={{ marginBottom:10, padding:10, borderRadius:10, background:"#fee2e2", border:"1px solid #fecaca" }}>{err}</div>}
        {busy && <div style={{ ...muted, marginBottom:10 }}>Loading…</div>}

        <div style={card}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ textAlign:"left", borderBottom:"1px solid #eee" }}>
                  <th style={{ padding:10 }}>S.no</th> {/* incremental number */}
                  <th style={{ padding:10 }}>Username</th>
                  <th style={{ padding:10 }}>Email</th>
                  <th style={{ padding:10 }}>Role</th>
                  <th style={{ padding:10 }}>Created</th>
                  <th style={{ padding:10, width:120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom:"1px solid #f2f2f2" }}>
                    <td style={{ padding:10 }}>{offset + i + 1}</td>
                    <td style={{ padding:10 }}>{u.username}</td>
                    <td style={{ padding:10 }}>{u.email}</td>
                    <td style={{ padding:10 }}>{u.role}</td>
                    <td style={{ padding:10 }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding:10 }}>
                      {/* Show Delete only if you have the route wired on backend */}
                      <button onClick={() => del(u.id)} style={danger} title="Delete user">Delete</button>
                    </td>
                  </tr>
                ))}
                {!rows.length && !busy && (
                  <tr><td colSpan={6} style={{ padding:10 }}>No users</td></tr>
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
