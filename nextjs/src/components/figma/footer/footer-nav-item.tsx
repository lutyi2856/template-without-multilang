"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getIcon } from "@/icons";
import type { MenuItem } from "@/types";

/** Нормализация href для пунктов меню футера: стрипим домен WordPress, убираем trailing slash */
function normalizeHref(path: string | undefined, label: string | undefined): string {
  return (path || "").replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/";
}

export interface FooterNavItemProps {
  item: MenuItem;
  showIcon?: boolean;
  iconWhite?: boolean;
}

/** Пункт меню футера с dropdown по наведению */
export function FooterNavItem({ item, showIcon, iconWhite }: FooterNavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const href = normalizeHref(item.path ?? item.url, item.label);
  const hasChildren = !!item.childItems?.nodes?.length;
  const IconFromWP = showIcon ? (getIcon(item.icon) ?? getIcon("menu-lines")) : null;

  return (
    <div
      className="relative space-y-1"
      onMouseEnter={() => hasChildren && setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        href={href}
        className="flex items-center gap-2 font-gilroy text-[18px] font-medium text-white/90 transition-colors hover:text-white"
      >
        {IconFromWP && (
          <span className="inline-block shrink-0 text-white" aria-hidden>
            <IconFromWP className="h-5 w-5" />
          </span>
        )}
        {item.label}
        {hasChildren ? (
          <Image
            src="/images/figma/footer-dropdown-arrow.svg"
            alt=""
            width={10}
            height={6}
            className={`ml-0.5 shrink-0 opacity-90 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            unoptimized
            aria-hidden
          />
        ) : null}
      </Link>
      {hasChildren && isOpen && (
        <div className="ml-6 flex flex-col gap-1">
          {item.childItems!.nodes.map((child) => (
            <Link
              key={child.databaseId}
              href={normalizeHref(child.path ?? child.url, child.label)}
              className="block font-gilroy text-[16px] text-white/80 hover:text-white"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
