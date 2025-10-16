import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);
const LS_KEY = "cart_v1";

function toNumber(n) {
  if (n == null) return 0;
  if (typeof n === "number") return n;
  const num = parseFloat(String(n).replace(/[^\d.]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    const id = product?.id;
    if (!id) return;
    setItems((prev) => {
      const found = prev.find((x) => x.id === id);
      if (found) {
        return prev.map((x) =>
          x.id === id ? { ...x, qty: Math.max(1, x.qty + qty) } : x
        );
      }
      return [
        ...prev,
        {
          id,
          name: product.name,
          price: toNumber(product.price),
          imageUrl: product.imageUrl ?? null,
          categoryId: product.categoryId ?? null,
          qty: Math.max(1, qty),
        },
      ];
    });
  };

  const updateQty = (id, qty) => {
    const q = Math.max(1, Number(qty) || 1);
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: q } : x)));
  };

  const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id));
  const clear = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, x) => s + toNumber(x.price) * x.qty, 0), [items]);

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clear,
    totalItems,
    subtotal,
    currency: "₹",
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
