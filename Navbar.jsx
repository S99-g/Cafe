import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import "./navbar.css";

export default function Navbar({ authed = false, onLogout }) {
  const location = useLocation();
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, [location, authed]);

  const role = user?.role;

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand">
          <span className="nav__logo" aria-hidden>☕</span>
          <span className="nav__title">My Cafe</span>
        </Link>

        {/* center column intentionally empty */}

        <div className="nav__actions">
          {!authed ? (
            <>
              <Link to="/login" className="btn btn--ghost btn--nav">Login</Link>
              <Link to="/register" className="btn btn--primary btn--nav">Register</Link>
            </>
          ) : (
            <>
              {role === "User" && (
                <Link to="/cart" className="btn btn--ghost btn--nav" title="Cart">
                  🛒 Cart
                </Link>
              )}
              <button
                type="button"
                onClick={() => onLogout?.()}
                className="btn btn--primary btn--nav"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
