interface ClyptMarkProps {
  size?: number;
  topColor?: string;
  bottomColor?: string;
  className?: string;
}

const ClyptMark = ({
  size = 20,
  topColor = "#635E6C",
  bottomColor = "#A78BFA",
  className,
}: ClyptMarkProps) => {
  const width = size * 2;
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 40 20"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      className={className}
    >
      <path d="M 5 0 L 35 0 L 30 8 L 0 8 Z" fill={topColor} />
      <path d="M 10 12 L 40 12 L 35 20 L 5 20 Z" fill={bottomColor} />
    </svg>
  );
};

export default ClyptMark;
