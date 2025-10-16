// src/pages/About.jsx
import "./info.css";

export default function About() {
  return (
    <main className="page">
      <div className="page__bg" aria-hidden><img src="/images/background.jpg" alt=""/></div>
      <div className="page__shade" aria-hidden/>
      <div className="page__body">
        <h1 className="page__title">About My Cafe</h1>
        <p className="page__lead">
          We’re a neighborhood spot serving small-batch coffee and lovingly baked desserts.
          Everything is prepared fresh daily by our team of baristas and bakers.
        </p>

        <div className="section grid">
          <div className="card-lite">
            <h3 className="section__title">Our Coffee</h3>
            <p>We source ethically from family growers and roast to highlight natural sweetness.</p>
            <span className="badge">Single-origin</span>
          </div>
          <div className="card-lite">
            <h3 className="section__title">The Bakery</h3>
            <p>From croissants to cheesecakes—flaky, creamy, always fresh.</p>
            <span className="badge">Baked daily</span>
          </div>
          <div className="card-lite">
            <h3 className="section__title">Community</h3>
            <p>Open mics, latte art jams, and cozy corners for study or chat.</p>
            <span className="badge">Local vibes</span>
          </div>
        </div>
      </div>
    </main>
  );
}
