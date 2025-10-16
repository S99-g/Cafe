import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ProductForm() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name:"", price:"", description:"", imageUrl:"", categoryId:"" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => { api.categories().then(setCats); }, []);
  const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await api.createProduct({
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),   // optional; may be blank
        categoryId: Number(form.categoryId),
      }); // POST /api/products
      nav("/admin", { replace:true });
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const input = { padding:"10px 12px", border:"1px solid #eee", borderRadius:10 };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 style={{ fontSize:24, fontWeight:800, marginBottom:10 }}>Add Product</h2>
      {err && <div style={{ color:"#991b1b", background:"#fee2e2", border:"1px solid #fecaca", padding:10, borderRadius:10 }}>{err}</div>}
      <form onSubmit={submit} style={{ display:"grid", gap:12 }}>
        <input style={input} placeholder="Name" value={form.name} onChange={change("name")} required />
        <input style={input} placeholder="Price (e.g. 199)" type="number" min="0" step="0.01" value={form.price} onChange={change("price")} required />
        <textarea style={{...input, minHeight:80}} placeholder="Description" value={form.description} onChange={change("description")} />
        <input style={input} placeholder="Image URL (optional)" value={form.imageUrl} onChange={change("imageUrl")} />
        <select style={input} value={form.categoryId} onChange={change("categoryId")} required>
          <option value="">Select category</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Create"}</button>
      </form>
    </div>
  );
}
