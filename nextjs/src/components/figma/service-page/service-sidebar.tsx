/**
 * ServiceSidebar — сайдбар страницы услуги (Figma 838:4192)
 *
 * Блок «Содержание» (TOC) + форма «Прикинуть стоимость лечения».
 * Скроллится в рамках секции при переполнении.
 */

import { Heading, Text } from "@/components/design-system";
import { PostSidebarForm } from "@/components/forms/post-sidebar-form";

export function ServiceSidebar() {
  return (
    <div
      className="flex flex-col gap-6 overflow-y-auto overscroll-contain max-h-[calc(100vh-12rem)] lg:max-h-[70vh]"
      style={{ scrollbarGutter: "stable" }}
    >
      {/* TOC block — placeholder (Figma: Содержание, fills '6', borderRadius 25px) */}
      <nav
        className="rounded-[25px] bg-unident-bgTopbar p-6 shrink-0"
        aria-label="Содержание"
      >
        <Heading
          level={3}
          className="text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-unident-dark mb-4"
        >
          Содержание
        </Heading>
        <ul className="flex flex-col gap-3">
          {/* Placeholder: пункты можно парсить из content (H2/H3) позже */}
          <li>
            <Text
              variant="default"
              as="span"
              className="text-unident-textGray"
            >
              Разделы появятся здесь
            </Text>
          </li>
        </ul>
      </nav>

      {/* CTA форма (Figma: Прикинуть стоимость лечения, fills '7') */}
      <div className="shrink-0">
        <PostSidebarForm
          title="Прикинуть стоимость лечения"
          description="Оставьте заявку и мы рассчитаем стоимость лечения"
          buttonText="Рассчитать стоимость"
        />
      </div>
    </div>
  );
}
