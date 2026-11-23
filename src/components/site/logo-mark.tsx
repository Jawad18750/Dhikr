/**
 * The «ذكر» mark: a circular rosette of ten pointed petals around an open
 * centre, from the mushaf's ayah roundel. Flat, in the current colour; the
 * hero shows the same rosette in 3D (logo-mark-3d.tsx).
 */
export const PETALS = 10;

/** One petal, pointing up, in a 360-unit box centred on the origin. */
export const PETAL_PATH =
  'M0,-150 C34,-118 34,-78 0,-52 C-34,-78 -34,-118 0,-150Z';

export function LogoMark({
  className,
  title,
}: {
  className?: string;
  /** Accessible name; omit when a parent link already names it. */
  title?: string;
}) {
  return (
    <svg
      viewBox="-156 -156 312 312"
      fill="currentColor"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {Array.from({ length: PETALS }, (_, index) => (
        <path
          key={index}
          d={PETAL_PATH}
          transform={`rotate(${(index * 360) / PETALS})`}
        />
      ))}
    </svg>
  );
}

/**
 * The mark as a faint watermark in a card's far corner, large and cut by the card's
 * edge, so a dark card is never just a blank field. Its card needs `relative`,
 * `isolate` (it sits behind the content, over the card's own colour) and
 * `overflow-hidden`.
 */
export function CardMark({ className = '' }: { className?: string }) {
  return (
    <LogoMark
      className={`card-mark pointer-events-none absolute -z-10 -bottom-14 -end-14 h-52 w-52 text-hero-gold opacity-[0.09] sm:-bottom-20 sm:-end-20 sm:h-80 sm:w-80 ${className}`}
    />
  );
}
