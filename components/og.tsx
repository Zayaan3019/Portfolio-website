/* Shared layout for generated Open Graph images: the hero's survey palette, without fonts or images. */
export const OG_SIZE = { width: 1200, height: 630 };

function Contours() {
  const rings = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
      {rings.map((i) => (
        <ellipse key={`a${i}`} cx="930" cy="170" rx={70 + i * 46} ry={48 + i * 34} fill="none" stroke="#6fd3e8" strokeOpacity={i % 4 === 0 ? 0.35 : 0.14} strokeWidth={i % 4 === 0 ? 2 : 1.2} />
      ))}
      {rings.map((i) => (
        <ellipse key={`b${i}`} cx="1080" cy="560" rx={50 + i * 38} ry={36 + i * 30} fill="none" stroke="#ff8f3c" strokeOpacity={i % 4 === 0 ? 0.3 : 0.12} strokeWidth={i % 4 === 0 ? 2 : 1.2} />
      ))}
    </svg>
  );
}

export function OgFrame({ kicker, title, lines }: { kicker: string; title: string; lines: string[] }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#070b10",
        color: "#e8edf0",
        padding: "60px 72px",
        fontFamily: "sans-serif",
      }}
    >
      <Contours />
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#a9b6c0" }}>
        <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: "#ff8f3c" }} />
        {kicker}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: title.length > 28 ? 70 : 94, fontWeight: 800, letterSpacing: -2, lineHeight: 1.02 }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 34, gap: 10 }}>
          {lines.map((l) => (
            <div key={l} style={{ display: "flex", alignItems: "center", fontSize: 29, color: "#a9b6c0" }}>
              <div style={{ display: "flex", width: 12, height: 12, marginRight: 16, marginTop: 4, background: "#6fd3e8", transform: "rotate(45deg)" }} />
              {l}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 22, color: "#74838f" }}>zayaan-portfolio2026.vercel.app</div>
    </div>
  );
}
