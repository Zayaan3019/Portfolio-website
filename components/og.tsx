/* Shared layout for generated Open Graph images. */
export const OG_SIZE = { width: 1200, height: 630 };

export function OgFrame({ kicker, title, lines }: { kicker: string; title: string; lines: string[] }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#eef1f4",
        color: "#15181d",
        padding: "64px 72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: "#464e5b" }}>{kicker}</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: title.length > 28 ? 72 : 92, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02 }}>
          {title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 36, gap: 10 }}>
          {lines.map((l) => (
            <div key={l} style={{ display: "flex", fontSize: 30, color: "#464e5b" }}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", height: 8, width: 160, background: "#2340c8" }} />
    </div>
  );
}
