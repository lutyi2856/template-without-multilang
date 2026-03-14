/**
 * Маркер нумерованного списка по Figma 417:4247 (Frame 2131328739).
 * 19.91×19.91px, круг #526AC2, текст "01" белый 12px Gilroy 600.
 */
export function NumberedMarker({ number }: { number: string }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center w-5 h-5 rounded-full bg-unident-primary font-gilroy text-[12px] font-semibold leading-[1.2] tracking-[-0.03em] text-white"
      aria-hidden
    >
      {number}
    </span>
  );
}
