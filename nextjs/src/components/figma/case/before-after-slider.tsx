/**
 * BeforeAfterSlider - компонент слайдера "До/После" для сравнения изображений
 *
 * Использует библиотеку react-compare-slider для оптимальной производительности и SEO.
 *
 * @example
 * <BeforeAfterSlider
 *   beforeImage="/images/before.jpg"
 *   afterImage="/images/after.jpg"
 *   beforeAlt="Зубы до лечения"
 *   afterAlt="Зубы после лечения"
 * />
 */

"use client";

import { ReactCompareSlider } from "react-compare-slider";
import Image from "next/image";
import { SliderHandle } from "./slider-handle";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "До",
  afterAlt = "После",
  className = "",
}: BeforeAfterSliderProps) {
  return (
    <div
      data-before-after-slider
      className={`relative rounded-[25px] overflow-hidden touch-none ${className}`}
    >
      <ReactCompareSlider
        itemOne={
          <div className="relative w-full h-full">
            <Image
              src={beforeImage}
              alt={beforeAlt}
              fill
              loading="lazy"
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
              className="object-cover"
            />
            {/* Label "До" */}
            <div className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-[10px] text-unident-dark text-sm font-medium">
              До
            </div>
          </div>
        }
        itemTwo={
          <div className="relative w-full h-full">
            <Image
              src={afterImage}
              alt={afterAlt}
              fill
              loading="lazy"
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
              className="object-cover"
            />
            {/* Label "После" */}
            <div className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-[10px] text-unident-dark text-sm font-medium">
              После
            </div>
          </div>
        }
        handle={<SliderHandle />}
        position={50}
        style={{ height: "100%" }}
      />
    </div>
  );
}
