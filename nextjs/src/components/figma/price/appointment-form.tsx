/**
 * AppointmentForm - форма записи на консультацию
 *
 * Отображает форму записи с контактными данными:
 * - Заголовок "Запись на консультацию в Унидент"
 * - Описание с телефоном из Option Page
 * - Иконки социальных сетей из Option Page «Контакты»
 * - Поле ввода телефона
 * - Кнопка "Записаться"
 *
 * Дизайн из Figma: node 93:302 (appointment card)
 */

"use client";

import { Text, Heading } from "@/components/design-system";
import { CallbackForm } from "@/components/forms/callback-form";
import { DynamicIcon } from "@/components/dynamic-icon";
import type { ContactsSettings, SocialContact } from "@/types/contacts";

interface AppointmentFormProps {
  contacts: ContactsSettings | null;
  className?: string;
}

export function AppointmentForm({
  contacts,
  className = "",
}: AppointmentFormProps) {

  // Преобразование номера телефона в формат tel: ссылки
  // Убираем все пробелы, скобки, тире для корректной ссылки
  const formatPhoneForTel = (phoneNumber: string) => {
    return phoneNumber.replace(/[\s\-\(\)]/g, "");
  };

  return (
    <div
      className={`bg-unident-bgLightGray rounded-[25px] p-4 md:p-6 flex flex-col gap-4 w-full min-w-0 ${className}`}
    >
      {/* Заголовок */}
      <Heading
        level={3}
        variant="appointment-form-title"
        className="text-unident-dark"
      >
        Запись на консультацию в Унидент
      </Heading>

      {/* Описание с телефоном */}
      <Text variant="default" className="text-unident-dark">
        Оставьте свой номер, мы свяжемся и подберём для вас удобное время
        приёма. Или позвоните нам сами —{" "}
        <a
          href={`tel:${formatPhoneForTel(
            contacts?.phone || "+7 999 999-99-99"
          )}`}
          className="font-medium text-unident-primary hover:text-unident-dark transition-colors underline whitespace-nowrap"
        >
          {contacts?.phone || "+7 999 999-99-99"}
        </a>
      </Text>

      {/* Иконки социальных сетей — из Option Page «Контакты» */}
      {contacts?.socialContacts && contacts.socialContacts.length > 0 && (
        <div className="flex gap-3">
          {contacts.socialContacts.map((social: SocialContact, idx: number) => {
            const iconName = social.icon ?? null;
            const label = social.name ?? "Социальная сеть";
            return (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-unident-dark text-white transition-colors hover:opacity-80"
                aria-label={label}
              >
                {iconName ? (
                  <DynamicIcon
                    name={iconName}
                    svgMarkup={social.iconSvg}
                    className="h-5 w-5"
                  />
                ) : (
                  <span className="text-xs font-semibold uppercase">
                    {label.slice(0, 2)}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      )}

      {/* Форма обратного звонка — JetFormBuilder */}
      <CallbackForm variant="default" className="mt-2" />
    </div>
  );
}
