/**
 * SliderHandle - кастомный handle для before-after слайдера
 *
 * Дизайн основан на Figma компоненте "case" (Vector 24 + Group 42315)
 */

"use client";

interface SliderHandleProps {
  className?: string;
}

export function SliderHandle({ className = "" }: SliderHandleProps) {
  return (
    <div className={`relative flex items-center justify-center h-full ${className}`}>
      {/* Вертикальная линия */}
      <div className="absolute w-[2px] h-full bg-white shadow-lg" />

      {/* Круглая кнопка управления */}
      <div className="relative z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center cursor-ew-resize">
        {/* Стрелки влево-вправо */}
        <div className="flex items-center gap-1">
          {/* Стрелка влево */}
          <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 1L2 6L7 11"
              stroke="#526AC2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Стрелка вправо */}
          <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L6 6L1 11"
              stroke="#526AC2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
