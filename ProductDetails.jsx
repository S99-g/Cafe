// src/pages/ProductDetails.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../context/CartContext"; // ✅ add cart

// name -> filename helper
const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// optional explicit map (put these files in /public/images or /public/images/products)
const productImages = {
  "Espresso": "/images/espressocoffee.jpg",
  "Cappuccino": "/images/cappuccino.jpg",
  "Latte": "/images/latte.jpg",
  "Chocolate Cake": "/images/chocolatecake.jpg",
  "Cheesecake": "/images/cheesecake.jpg",
  "Club Sandwich": "/images/clubsandwich.jpg",
  "Croissant": "/images/croissant.jpg",
  "Iced Coffee": "/images/icedcoffee.jpg",
  "Lemon Iced Tea": "/images/lemonicetea.jpg",
  "Garlic Bread": "/images/garlicbread.jpg",
  "Cold Coffee": "/images/coldcoffee.jpg",
  "Black Coffee": "/images/BlackCoffee.jpg",
  "Iced-Mocha": "/images/mocha.jpg",
  "Banana-Bread":"/images/bananabread.jpg",
  "Mini Lemon Cakes":"/images/minilemoncakes.jpg",
  "Blueberry Muffin":"/images/blueberrymuffin.jpg",
  "Chocolate Muffin":"/images/chocolatemuffin.jpg",
  "Veggie Sandwich":"/images/veggiesandwich.jpg",
  "Grilled Sandwich":"/images/grilledsandwich.jpg",
  "Tomato Soup":"/images/tomatosoup.jpg",
  "Minestrone Soup":"/images/minestronesoup.jpg",
};

// accept http(s), root-relative, or bare filename (assume /images/products/<file>)
const normalizeUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `/images/products/${url}`;
};

export default function ProductDetails() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const { addItem } = useCart(); // ✅ cart action
  const [qty, setQty] = useState(1); // ✅ quantity

  useEffect(() => {
    api.product(id).then(setP);
  }, [id]);

  // Build image candidates once we have the product
  const candidates = useMemo(() => {
    if (!p) return [];
    const s = slugify(p.name || "");
    const first = normalizeUrl(p.imageUrl);
    const list = [
      first,
      productImages[p.name || ""],
      s ? `/images/products/${s}.jpg` : null,
      s ? `/images/products/${s}.png` : null,
      s ? `/images/${s}.jpg` : null,
      s ? `/images/${s}.png` : null,
    ].filter(Boolean);
    return [...new Set(list)];
  }, [p]);

  // advance through candidates if an <img> fails
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [candidates.length]); // reset when candidates change

  if (!p) {
    return <div className="max-w-5xl mx-auto px-4 py-10">Loading...</div>;
  }

  const hasImage = idx >= 0 && idx < candidates.length;
  const src = hasImage ? candidates[idx] : null;

  const handleImgError = () => {
    if (idx < candidates.length - 1) setIdx(idx + 1);
    else setIdx(-1); // give up, show placeholder block
  };

  const onAddToCart = () => {
    const safeQty = Math.max(1, Number(qty) || 1);
    addItem(p, safeQty);
  };

  return (
    <div
      className="max-w-5xl mx-auto px-4 py-10"
      style={{
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "300px 1fr", // left column fixed, right flexible
        alignItems: "start",
      }}
    >
      {/* Image panel (compact, centered) */}
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.05)",
          borderRadius: "16px",
          padding: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // optional shadow:
          boxShadow: "0 6px 22px -12px rgba(0,0,0,.25)",
        }}
      >
        {hasImage ? (
          <img
            src={src}
            alt={p.name}
            onError={handleImgError}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "220px", // <-- shrink here
              objectFit: "contain", // don't crop
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              background: "#f3f4f6",
              borderRadius: "12px",
            }}
          >
            🍰
          </div>
        )}
      </div>

      {/* Details panel */}
      <div>
        <h1 className="text-3xl font-bold">{p.name}</h1>
        <div className="mt-2 text-gray-600">{p.Category?.name}</div>
        <div className="mt-4 text-2xl font-semibold">
          ₹{Number(p.price).toFixed(2)}
        </div>
        <p className="mt-4 text-gray-700 leading-relaxed">{p.description}</p>

        {/* ✅ Add to cart controls */}
        <div
          className="mt-5"
          style={{ display: "flex", gap: 10, alignItems: "center" }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="sr-only">Quantity</span>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) =>
                setQty(Math.max(1, Number(e.target.value) || 1))
              }
              style={{
                width: 80,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            />
          </label>

          <button
            onClick={onAddToCart}
            className="btn"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "#fbbf24",
              color: "#1a1a1a",
              fontWeight: 700,
              border: 0,
            }}
          >
            🛒 Add to Cart
          </button>
        </div>

        <Link
          to="/"
          className="inline-block mt-6 px-4 py-2 bg-amber-500 text-[#2b2b2b] rounded-md font-semibold"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
