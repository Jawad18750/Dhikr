const OUTER = [0, 45, 90, 135, 180, 225, 270, 315];
const INNER = OUTER.map((angle) => angle + 22.5);

/**
 * The hero's art: eight glossy gold petals around eight green ones, drawn
 * from the ayah roundel's petal. Our own figure, no borrowed artwork.
 */
export function Rosette({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="-220 -220 440 440"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient
          id="rosette-gold"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#FFF1C9" />
          <stop offset="0.3" stopColor="#E6C47A" />
          <stop offset="0.72" stopColor="#B08A3E" />
          <stop offset="1" stopColor="#5C431A" />
        </linearGradient>
        <linearGradient id="rosette-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#CFF3DC" />
          <stop offset="0.4" stopColor="#6FBF8F" />
          <stop offset="1" stopColor="#0C3A28" />
        </linearGradient>
        <radialGradient
          id="rosette-glow"
          cx="0"
          cy="0"
          r="220"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#C5A059" stopOpacity="0.35" />
          <stop offset="1" stopColor="#C5A059" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="220" fill="url(#rosette-glow)" />
      {OUTER.map((angle) => (
        <g key={angle} transform={`rotate(${angle})`}>
          <path
            d="M0,-200 C56,-160 58,-86 0,-46 C-58,-86 -56,-160 0,-200Z"
            fill="url(#rosette-gold)"
          />
          <path
            d="M-8,-186 C18,-166 22,-130 10,-104"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.75"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
      ))}
      {INNER.map((angle) => (
        <g key={angle} transform={`rotate(${angle})`}>
          <path
            d="M0,-120 C30,-98 30,-58 0,-34 C-30,-58 -30,-98 0,-120Z"
            fill="url(#rosette-green)"
          />
          <ellipse cx="-6" cy="-96" rx="5" ry="14" fill="#fff" opacity="0.7" />
        </g>
      ))}
      <circle r="26" fill="#0B0B0C" stroke="#E6C47A" strokeWidth="3" />
    </svg>
  );
}
