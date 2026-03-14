/**
 * ContactsContactCard - блок с контактной информацией
 *
 * Отображает телефон, социальные сети и email из ContactsSettings.
 * Иконки социальных сетей выбираются в Option Page «Контакты».
 *
 * PERFORMANCE: Server Component (без 'use client')
 */

import Link from "next/link";
import { Container, Text } from "@/components/design-system";
import { PhoneIcon } from "@/icons";
import { DynamicIcon } from "@/components/dynamic-icon";
import type { ContactsSettings, SocialContact } from "@/types/contacts";

interface ContactsContactCardProps {
  contacts?: ContactsSettings | null;
}

/**
 * Форматировать телефон для tel: ссылки
 */
function formatPhoneForTel(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

export function ContactsContactCard({ contacts }: ContactsContactCardProps) {
  const phone = contacts?.phone;
  const email = contacts?.email;
  const socials = contacts?.socialContacts ?? [];

  const hasSocials = socials.length > 0;
  const hasAnyContent = phone || email || hasSocials;

  if (!hasAnyContent) return null;

  return (
    <section
      className="bg-white pt-8 pb-10"
      aria-label="Контактная информация"
    >
      <Container size="xl">
        <div className="flex flex-col sm:flex-row flex-wrap gap-6 items-start">

          {/* Телефон */}
          {phone && (
            <a
              href={`tel:${formatPhoneForTel(phone)}`}
              className="group flex items-center gap-3 no-underline"
              aria-label={`Позвонить: ${phone}`}
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-unident-bgLightBlue">
                <PhoneIcon
                  className="h-5 w-5 text-unident-primary"
                  aria-hidden
                />
              </div>
              <Text
                as="span"
                variant="large"
                className="font-semibold text-unident-dark group-hover:text-unident-primary transition-colors"
              >
                {phone}
              </Text>
            </a>
          )}

          {/* Социальные сети */}
          {hasSocials && (
            <div className="flex items-center gap-3 flex-wrap">
              {socials.map((social: SocialContact, idx: number) => {
                const iconName = social.icon ?? null;
                const label = social.name ?? "Социальная сеть";

                return (
                  <Link
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group flex items-center gap-2 no-underline"
                  >
                    {iconName ? (
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-unident-bgLightBlue transition-colors group-hover:bg-unident-primary">
                        <DynamicIcon
                          name={iconName}
                          svgMarkup={social.iconSvg}
                          className="h-5 w-5 text-unident-primary transition-colors group-hover:text-white"
                          aria-hidden
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-unident-bgLightBlue">
                        <Text
                          as="span"
                          variant="xs"
                          className="font-semibold text-unident-primary uppercase"
                        >
                          {label.slice(0, 2)}
                        </Text>
                      </div>
                    )}
                    <Text
                      as="span"
                      variant="default"
                      className="text-unident-dark group-hover:text-unident-primary transition-colors hidden md:inline"
                    >
                      {label}
                    </Text>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Email */}
          {email && (
            <a
              href={`mailto:${email}`}
              className="group flex items-center gap-3 no-underline"
              aria-label={`Написать на email: ${email}`}
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-unident-bgLightBlue">
                {/* Mail icon inline SVG */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-unident-primary"
                  aria-hidden
                >
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m22 6-10 7L2 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <Text
                as="span"
                variant="default"
                className="text-unident-dark group-hover:text-unident-primary transition-colors"
              >
                {email}
              </Text>
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}
