import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, updateQty, removeItem, clear, subtotal, currency } = useCart();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8" style={{ position: "relative" }}>
      {/* soft background like other pages */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "url(/images/background.jpg)",
        backgroundSize: "cover", backgroundPosition: "center",
        filter: "blur(6px) brightness(.9)",
        transform: "scale(1.02)",
      }} aria-hidden="true" />
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "rgba(0,0,0,.35)"
      }} aria-hidden="true" />

      <div style={{
        position: "relative", zIndex: 1,
        background: "rgba(255,255,255,.92)",
        border: "1px solid rgba(0,0,0,.08)",
        borderRadius: 16, padding: 16, boxShadow: "0 18px 60px -25px rgba(0,0,0,.4)"
      }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Your Cart</h1>

        {!items.length ? (
          <div>
            <p style={{ color: "#6b5c51" }}>Your cart is empty.</p>
            <Link to="/" style={{
              display: "inline-block", marginTop: 12, padding: "8px 12px",
              borderRadius: 10, background: "#fbbf24", fontWeight: 700, color: "#1a1a1a",
              textDecoration: "none"
            }}>← Continue shopping</Link>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                    <th style={{ padding: 10 }}>Item</th>
                    <th style={{ padding: 10 }}>Price</th>
                    <th style={{ padding: 10 }}>Qty</th>
                    <th style={{ padding: 10 }}>Total</th>
                    <th style={{ padding: 10 }} />
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                      <td style={{ padding: 10, display: "flex", gap: 10, alignItems: "center" }}>
                        <img
                          src={it.imageUrl || "/images/fallback.jpg"}
                          alt={it.name}
                          onError={(e) => (e.currentTarget.src = "/images/fallback.jpg")}
                          style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }}
                        />
                        <Link to={`/product/${it.id}`} style={{ color: "#1f2937", fontWeight: 600, textDecoration: "none" }}>
                          {it.name}
                        </Link>
                      </td>
                      <td style={{ padding: 10 }}>{currency}{Number(it.price).toFixed(2)}</td>
                      <td style={{ padding: 10 }}>
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={(e) => updateQty(it.id, e.target.value)}
                          style={{ width: 64, padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                        />
                      </td>
                      <td style={{ padding: 10, fontWeight: 600 }}>
                        {currency}{(Number(it.price) * it.qty).toFixed(2)}
                      </td>
                      <td style={{ padding: 10 }}>
                        <button
                          onClick={() => removeItem(it.id)}
                          style={{ padding: "6px 10px", borderRadius: 8, background: "#ef4444", color: "#fff", border: 0, fontWeight: 700 }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* summary */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                Subtotal: {currency}{subtotal.toFixed(2)}
              </div>
              <button
                onClick={clear}
                style={{ padding: "8px 12px", borderRadius: 10, background: "#e5e7eb", border: 0, fontWeight: 700 }}
              >
                Clear
              </button>
              <button
                onClick={() => alert("Checkout not wired yet")}
                style={{ padding: "8px 12px", borderRadius: 10, background: "#fbbf24", border: 0, fontWeight: 700 }}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
