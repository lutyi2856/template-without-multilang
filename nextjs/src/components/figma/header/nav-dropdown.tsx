/**
 * NavDropdown - элемент навигации с выпадающим меню (hover)
 *
 * Контент рендерится через Portal в body, чтобы не обрезаться overflow header.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { DynamicIcon } from "@/components/dynamic-icon";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { NavDropdownProps } from "./types";

export function NavDropdown({ className, item }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = () => {
    if (triggerRef.current && typeof document !== "undefined") {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: rect.left });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [isOpen]);

  const handleTriggerEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleTriggerLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const handleDropdownEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleDropdownLeave = () => setIsOpen(false);

  const dropdownContent =
    isOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed z-[9999] pt-2"
        style={{ top: position.top, left: position.left }}
        onMouseEnter={handleDropdownEnter}
        onMouseLeave={handleDropdownLeave}
      >
        <div className="w-[240px] rounded-md border border-gray-200 bg-white p-2 shadow-lg">
          <ul className="space-y-1">
            {item.children?.map((child) => (
              <li key={child.id}>
                <a
                  href={child.href || "#"}
                  className="block rounded-md p-3 text-sm font-medium text-unident-dark transition-colors hover:bg-gray-100 hover:text-unident-primary"
                >
                  <div className="flex items-center gap-2">
                    {child.icon && (
                      <DynamicIcon name={child.icon} svgMarkup={child.iconSvg} className="h-4 w-4" />
                    )}
                    <span>{child.label}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>,
      document.body
    );

  return (
    <div
      ref={triggerRef}
      className={`relative ${className}`}
      onMouseEnter={handleTriggerEnter}
      onMouseLeave={handleTriggerLeave}
    >
      <div className="flex items-center gap-1">
        {item.icon && <DynamicIcon name={item.icon} svgMarkup={item.iconSvg} className="h-5 w-5" />}
        <a
          href={item.href || "#"}
          className={cn(
            "whitespace-nowrap font-gilroy text-unident-dark transition-colors hover:text-unident-primary",
            typography.figma["nav-link"]
          )}
        >
          {item.label}
        </a>
        <ChevronDown
          className={`h-3 w-3 text-unident-dark transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
      {dropdownContent}
    </div>
  );
}
