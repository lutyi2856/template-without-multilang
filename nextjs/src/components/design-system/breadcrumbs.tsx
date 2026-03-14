/**
 * Breadcrumbs - хлебные крошки по Figma (node 259:2439)
 *
 * Универсальный компонент для навигационной цепочки на всех страницах.
 * Стили: 14px Gilroy Medium, #191E35, gap 10px, разделитель 4×8.
 *
 * @example
 * <Breadcrumbs items={[
 *   { label: 'Главная', href: '/' },
 *   { label: 'Врачи', href: '/doctors' },
 *   { label: 'Иванов И.И.' }
 * ]} />
 */

import Link from "next/link";
import { Text } from "./text";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** Inline SVG разделитель 4×8 (chevron right), по Figma node 259:2443 */
function BreadcrumbSeparator() {
  return (
    <span className="inline-flex shrink-0" aria-hidden>
      <svg
        width={4}
        height={8}
        viewBox="0 0 4 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-unident-dark"
      >
        <path
          d="M1 1l2 3-2 3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Хлебные крошки"
      className={cn("mb-6 opacity-70", className)}
    >
      <ol className="flex list-none flex-wrap items-center gap-[10px] p-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-[10px]"
            >
              {index > 0 && <BreadcrumbSeparator />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="font-gilroy text-unident-dark transition-colors hover:text-unident-primary"
                >
                  <Text as="span" variant="breadcrumb-link">
                    {item.label}
                  </Text>
                </Link>
              ) : (
                <Text
                  as="span"
                  variant="breadcrumb-link"
                  className="text-unident-dark"
                >
                  {item.label}
                </Text>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
