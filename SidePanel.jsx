import { NavLink } from "react-router-dom";
import { useMemo } from "react";
import "./sidepanel.css";

export default function SidePanel() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = user?.role;

  // Sidebar links per role
  const items =
    role === "SuperAdmin"
      ? [
          { to: "/admin/users", label: "Users" },
          { to: "/admin/products", label: "Products" },
          { to: "/admin/categories", label: "Categories" },
        ]
      : role === "Admin"
      ? [
          { to: "/admin/products", label: "Products" },
          { to: "/admin/categories", label: "Categories" },
        ]
      : [
          { to: "/menu", label: "Menu" },
          { to: "/about", label: "About" },
          { to: "/contact", label: "Contact" },
        ];

  return (
    <aside className="sp">
      <div className="sp__title">{role || "Guest"}</div>
      <nav className="sp__nav">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => "sp__link" + (isActive ? " is-active" : "")}
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
