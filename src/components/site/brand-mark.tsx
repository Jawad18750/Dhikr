/** The gold square with the roofline chevrons: the ذكر mark. Decorative. */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-[30%] bg-gradient-to-b from-gold-light via-gold to-[#9c7a35]"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.58}
        height={size * 0.42}
        viewBox="0 0 20 14"
        fill="none"
      >
        <path
          d="M2 12 L10 4 L18 12"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 8 L10 3 L15 8"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
    </span>
  );
}
