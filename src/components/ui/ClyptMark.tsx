interface ClyptMarkProps {
  size?: number;
  color?: string;
  className?: string;
}

export const ClyptMark = ({ size = 20, color = "#A78BFA", className }: ClyptMarkProps) => (
  <svg
    width={size}
    height={Math.round(size * (20 / 14))}
    viewBox="0 0 14 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M 0 0 L 14 0 L 14 5 L 5 5 L 5 15 L 14 15 L 14 20 L 0 20 Z"
      fill={color}
    />
  </svg>
);

export default ClyptMark;
