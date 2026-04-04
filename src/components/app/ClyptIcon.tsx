const ClyptIcon = ({ width = 24, height = 16 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left half waveform - muted */}
    <path
      d="M0 8 Q3 4, 6 8 Q9 12, 12 8"
      stroke="var(--color-text-muted)"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Right half waveform - violet */}
    <path
      d="M12 8 Q15 4, 18 8 Q21 12, 24 8"
      stroke="var(--color-violet)"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Vertical cut line */}
    <line x1="12" y1="2" x2="12" y2="14" stroke="var(--color-violet)" strokeWidth="1" />
  </svg>
);

export default ClyptIcon;
