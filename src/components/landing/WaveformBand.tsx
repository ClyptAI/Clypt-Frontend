const bars = Array.from({ length: 300 }, (_, i) => {
  const baseH = 12;
  const wave1 = Math.abs(Math.sin(i * 0.13)) * 90;
  const wave2 = Math.abs(Math.sin(i * 0.07 + 1.2)) * 40;
  const height = baseH + wave1 + wave2;

  const isAmber = i % 7 === 0;
  const isBlue = i % 13 === 0;
  const tall = height > 80;

  let color: string;
  let opacity: number;
  if (isBlue) {
    color = "#60A5FA";
    opacity = tall ? 0.7 : 0.5;
  } else if (isAmber) {
    color = "#FBB249";
    opacity = tall ? 0.7 : 0.55;
  } else {
    color = "#A78BFA";
    opacity = tall ? 0.85 : 0.65;
  }

  const wh = 0.2 + Math.random() * 0.9;
  const dur = 1.4 + Math.random() * 2.2;

  return { height, color, opacity, wh, dur, i };
});

const WaveformBand = () => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100vw",
      marginLeft: "calc(50% - 50vw)",
      height: 220,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 1,
      maskImage: `
        linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 30%, transparent 100%),
        linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)
      `,
      maskComposite: "intersect",
      WebkitMaskImage: `
        linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 30%, transparent 100%),
        linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)
      `,
      WebkitMaskComposite: "source-in" as any,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
      }}
    >
      {bars.map((b) => (
        <div
          key={b.i}
          style={{
            flex: "0 1 3px",
            maxWidth: 3,
            borderRadius: 9999,
            transformOrigin: "bottom center",
            height: b.height,
            backgroundColor: b.color,
            opacity: b.opacity,
            boxShadow: `0 0 6px ${b.color}, 0 0 12px ${b.color}55`,
            ["--wh" as any]: b.wh,
            animation: `waveBar ${b.dur}s ease-in-out infinite`,
            animationDelay: `${-(b.i * 0.022)}s`,
          }}
        />
      ))}
    </div>
  </div>
);

export default WaveformBand;
