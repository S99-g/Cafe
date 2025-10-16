import "./home.css";

export default function Home() {
  // show cart CTA only for logged-in users
  const authed = !!localStorage.getItem("token");

  return (
    <main>
      {/* Hero only */}
      <section className="hero">
        <img src="/images/background.jpg" alt="" aria-hidden="true" className="hero__bg" />
        <div className="hero__overlay" />
        <div className="hero__content">
          <h1 className="hero__title">Welcome to My Cafe</h1>
          <p className="hero__subtitle">Freshly brewed coffee & tasty bites.</p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/menu" className="btn btn--accent">Explore Menu</a>

            {/* {authed ? (
              <a href="/cart" className="btn btn--secondary">Go to Cart</a>
            ) : (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => alert("Login to add the product")}
              >
                Add to Cart
              </button>
            )} */}
          </div>
        </div>
      </section>
    </main>
  );
}
