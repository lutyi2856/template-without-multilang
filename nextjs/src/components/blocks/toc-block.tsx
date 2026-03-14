"use client";

import type { TOCBlockAttrs } from "./types";

export function TOCBlock({ heading, items, marginBottom = 40 }: TOCBlockAttrs) {
  if (!items || items.length === 0) return null;

  function handleClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    anchorId: string
  ) {
    e.preventDefault();
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${anchorId}`);
    }
  }

  return (
    <nav
      className="overflow-hidden rounded-[25px] bg-unident-bgTopbar p-[30px]"
      style={{ marginBottom: `${marginBottom}px` }}
      aria-label="Содержание статьи"
    >
      <p className="mb-5 font-gilroy text-[24px] font-semibold leading-[1.3] text-black">
        {heading || "Содержание"}
      </p>

      <div className="flex flex-col gap-5">
        {items.map((item, i) => {
          const hasAnchor = Boolean(item.anchorId?.trim());
          const linkClass =
            "font-gilroy text-[18px] leading-[1.2] tracking-[-0.54px] text-unident-dark transition-colors hover:text-unident-primary";
          return (
            <div
              key={item.anchorId || i}
              className="flex items-center gap-5"
            >
              <span className="h-[7px] w-[7px] flex-shrink-0 rounded-full bg-unident-primary" />
              {hasAnchor ? (
                <a
                  href={`#${item.anchorId}`}
                  onClick={(e) => handleClick(e, item.anchorId!)}
                  className={linkClass}
                >
                  {item.label}
                </a>
              ) : (
                <span className={linkClass}>{item.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
