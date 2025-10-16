import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CategoryForm() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await api.createCategory(name.trim()); // POST /api/categories  {name}
      nav("/admin", { replace:true });
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 style={{ fontSize:24, fontWeight:800, marginBottom:10 }}>Add Category</h2>
      {err && <div style={{ color:"#991b1b", background:"#fee2e2", border:"1px solid #fecaca", padding:10, borderRadius:10 }}>{err}</div>}
      <form onSubmit={submit} style={{ display:"grid", gap:12 }}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Coffee" required
               style={{ padding:"10px 12px", border:"1px solid #eee", borderRadius:10 }} />
        <button className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Create"}</button>
      </form>
    </div>
  );
}
