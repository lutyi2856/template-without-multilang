import Image from "next/image";
import type { UniversalBlockAttrs, UniversalComponent } from "./types";

const CHECKMARK_SVG = (
  <svg
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <rect width="25" height="25" rx="12.5" fill="#526AC2" />
    <path
      d="M6.3252 12.1988L10.6426 16.5161L18.6748 8.48389"
      stroke="white"
      strokeWidth="2"
    />
  </svg>
);

const DOT_SVG = (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <rect width="10" height="10" rx="5" fill="#526AC2" />
  </svg>
);

export function UniversalBlock({ heading, components, anchorId, marginBottom = 40 }: UniversalBlockAttrs) {
  if (!heading && (!components || components.length === 0)) return null;

  return (
    <section
      className="flex flex-col gap-10 scroll-mt-24"
      style={{ marginBottom: `${marginBottom}px` }}
      {...(anchorId && { id: anchorId })}
    >
      {heading && (
        <h2 className="font-gilroy text-[28px] font-semibold leading-[1.2] text-unident-dark md:text-[36px]">
          {heading}
        </h2>
      )}

      <div className="flex flex-col gap-5">
        {components?.map((comp, i) => (
          <ComponentRenderer key={i} component={comp} />
        ))}
      </div>
    </section>
  );
}

function ComponentRenderer({ component }: { component: UniversalComponent }) {
  switch (component.type) {
    case "text_regular":
      return component.textContent ? (
        <div
          className="font-gilroy text-[16px] font-medium leading-[1.2] text-unident-dark [&_p]:mb-0 [&_p+p]:mt-3"
          dangerouslySetInnerHTML={{ __html: component.textContent }}
        />
      ) : null;

    case "text_highlight":
      return component.textContent ? (
        <div
          className="font-gilroy text-[22px] font-medium leading-[1.2] text-unident-dark [&_p]:mb-0"
          dangerouslySetInnerHTML={{ __html: component.textContent }}
        />
      ) : null;

    case "bullet_list":
      if (!component.listItems || component.listItems.length === 0) return null;
      const icon = component.icon ?? "dot";
      const MarkerIcon = icon === "checkmark" ? CHECKMARK_SVG : DOT_SVG;
      return (
        <div className="flex flex-col gap-2.5">
          {component.listItems.map((item, j) => (
            <div key={j} className="flex items-center gap-5">
              <span
                className={`flex items-center justify-center mt-0.5 shrink-0 ${
                  icon === "checkmark" ? "w-[25px] h-[25px]" : "w-[10px] h-[10px]"
                }`}
              >
                {MarkerIcon}
              </span>
              <span className="font-gilroy text-[16px] font-medium leading-[1.2] tracking-[-0.48px] text-unident-dark">
                {item}
              </span>
            </div>
          ))}
        </div>
      );

    case "image":
      if (!component.image?.url) return null;
      return (
        <div className="overflow-hidden rounded-[25px] bg-[#ececec]">
          <Image
            src={component.image.url}
            alt={component.image.alt || ""}
            width={component.image.width || 800}
            height={component.image.height || 330}
            className="w-full object-cover"
          />
        </div>
      );

    default:
      return null;
  }
}
