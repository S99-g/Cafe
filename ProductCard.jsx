// src/components/ProductCard.jsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

// turn names into file-like slugs
const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// optional explicit name → image map
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

// normalize DB imageUrl
const normalizeUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `/images/products/${url}`;
};

export default function ProductCard({ product, p, onAdd, showAdd = true }) {
  const item = product || p || {};
  const { id, name = "", description = "", price = 0 } = item;
  const firstUrl = normalizeUrl(item.imageUrl);
  const slug = slugify(name);

  const candidates = useMemo(() => {
    const list = [
      firstUrl,
      productImages[name],
      slug ? `/images/products/${slug}.jpg` : null,
      slug ? `/images/products/${slug}.png` : null,
      slug ? `/images/${slug}.jpg` : null,
      slug ? `/images/${slug}.png` : null,
    ].filter(Boolean);
    return [...new Set(list)];
  }, [firstUrl, name, slug]);

  const [idx, setIdx] = useState(0);
  const hasImage = idx >= 0 && idx < candidates.length;
  const src = hasImage ? candidates[idx] : null;

  const handleImgError = () => {
    if (idx < candidates.length - 1) setIdx(idx + 1);
    else setIdx(-1);
  };

  return (
    <div className="card card--product">
      <Link to={`/product/${id}`} className="link-reset">
        <div className="card__image -with-bg">
          {hasImage ? (
            <img src={src} alt={name} onError={handleImgError} />
          ) : (
            <span className="card__emoji" aria-hidden>
              🍰
            </span>
          )}
        </div>
      </Link>

      <div className="card__body">
        <Link to={`/product/${id}`} className="link-reset">
          <div className="card__title">{name}</div>
        </Link>

        <div className="card__desc clamp-2">{description}</div>

        <div className="card__row">
          <div className="card__price">₹{Number(price).toFixed(2)}</div>
          {showAdd && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => onAdd?.(item)}
              title="Add to cart"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
