// src/pages/Contact.jsx
import { useState } from "react";
import "./info.css";

export default function Contact() {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    setOk(false);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setOk(true);
    }, 700); // demo only
  };

  // Build a precise map embed for Chennai
  const address = "No:84 Riverview Residency, Karapakkam 600097, Chennai, Tamil Nadu";
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <main className="page">
      <div className="page__bg" aria-hidden="true">
        <img src="/images/background.jpg" alt="" />
      </div>
      <div className="page__shade" aria-hidden="true" />

      <div className="page__body">
        <h1 className="page__title">Contact</h1>
        <p className="page__lead">
          Questions, feedback, or collaborations? We’d love to hear from you.
        </p>

        <div className="section grid">
          {/* Left: form */}
          <div className="card-lite">
            <h3 className="section__title">Send a message</h3>

            {ok && (
              <div
                className="card-lite"
                style={{ background: "#ecfccb", borderColor: "#bbf7d0", marginBottom: 10 }}
              >
                Got it! We’ll reply soon.
              </div>
            )}
            {err && (
              <div
                className="card-lite"
                style={{ background: "#fee2e2", borderColor: "#fecaca", marginBottom: 10 }}
              >
                {err}
              </div>
            )}

            <form className="form" onSubmit={submit}>
              <input className="input" placeholder="Your name" required />
              <input className="input" type="email" placeholder="you@example.com" required />
              <textarea className="textarea" placeholder="Your message…" required />
              <button className="btn-primary" disabled={busy}>
                {busy ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>

          {/* Right: map & info */}
          <div className="card-lite">
            <h3 className="section__title">Find us</h3>
            <p>{address}</p>

            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #eee",
                marginTop: 8,
              }}
            >
              <iframe
                title="My Cafe location (Chennai)"
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapSrc}
              />
            </div>

            <p style={{ marginTop: 10 }}>Hours: Mon–Sat 8am–8pm · Sun 9am–6pm</p>
          </div>
        </div>
      </div>
    </main>
  );
}
