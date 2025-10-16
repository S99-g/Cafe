import { useEffect, useState } from "react";

export default function SearchBar({ value, onChange, placeholder = "Search products…" }) {
  const [local, setLocal] = useState(value ?? "");

  // keep local input in sync when parent value changes externally
  useEffect(() => { setLocal(value ?? ""); }, [value]);

  // minimal debounce: call onChange 300ms after the user stops typing
  useEffect(() => {
    const t = setTimeout(() => onChange?.(local.trim()), 300);
    return () => clearTimeout(t);
  }, [local, onChange]);

  return (
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          outline: "none",
        }}
      />
      {local && (
        <button
          type="button"
          onClick={() => setLocal("")}
          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff" }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
