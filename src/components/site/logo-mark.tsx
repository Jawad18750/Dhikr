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
 * The mark as a faint watermark in a card's far corner: the rendered 3D rosette (the
 * same picture as the icons), large and cut by the card's edge, so a dark card is never
 * just a blank field. Its card needs `relative`, `isolate` (it sits behind the content,
 * over the card's own colour) and `overflow-hidden`.
 */
export function CardMark({ className = '' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo-384.webp"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={`card-mark pointer-events-none absolute -bottom-14 -end-14 -z-10 h-52 w-52 rotate-12 select-none opacity-[0.14] sm:-bottom-20 sm:-end-20 sm:h-80 sm:w-80 ${className}`}
    />
  );
}
