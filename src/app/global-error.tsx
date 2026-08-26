"use client";

/** Last-resort boundary (outside providers): minimal bilingual message. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", background: "#f7f3ea", color: "#20211e" }}>
        <div style={{ maxWidth: 560, margin: "15vh auto", padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 28 }}>Something went wrong / કંઈક ખોટું થયું</h1>
          <p style={{ marginTop: 12 }}>
            Please try again, or WhatsApp us: +91 99043 76340
            <br />
            ફરી પ્રયત્ન કરો, અથવા WhatsApp કરો.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              background: "#c54832",
              color: "#fffdf8",
              border: 0,
              borderRadius: 12,
              padding: "12px 24px",
              fontSize: 15,
              cursor: "pointer"
            }}
          >
            Try again / ફરી પ્રયત્ન કરો
          </button>
        </div>
      </body>
    </html>
  );
}
