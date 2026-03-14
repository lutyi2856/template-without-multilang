import Link from "next/link";
import { Text } from "@/components/design-system";
import { PhoneIcon } from "@/icons";
import { DynamicIcon } from "@/components/dynamic-icon";
import type { ContactsSettings, SocialContact } from "@/types/contacts";

interface ContactsContactCardInlineProps {
  contacts?: ContactsSettings | null;
}

function formatPhoneForTel(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

export function ContactsContactCardInline({
  contacts,
}: ContactsContactCardInlineProps) {
  const phone = contacts?.phone;
  const email = contacts?.email;
  const socials = contacts?.socialContacts ?? [];
  const hasSocials = socials.length > 0;
  const hasAnyContent = phone || email || hasSocials;

  if (!hasAnyContent) return null;

  return (
    <div className="flex flex-col gap-5 bg-unident-bgElements rounded-[25px] p-6 h-full">
      {/* Телефон */}
      {phone && (
        <a
          href={`tel:${formatPhoneForTel(phone)}`}
          className="group flex items-center gap-3 no-underline min-w-0"
          aria-label={`Позвонить: ${phone}`}
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white border-[1.5px] border-unident-bgElements">
            <PhoneIcon
              className="h-5 w-5 text-unident-primary"
              aria-hidden
            />
          </div>
          <Text
            as="span"
            variant="large"
            className="font-semibold text-unident-dark group-hover:text-unident-primary transition-colors whitespace-nowrap"
          >
            {phone}
          </Text>
        </a>
      )}

      {/* Социальные сети */}
      {hasSocials && (
        <div className="flex flex-col gap-3">
          {socials.map((social: SocialContact, idx: number) => {
            const iconName = social.icon ?? null;
            const label = social.name ?? "Социальная сеть";
            const isWhatsApp = iconName === "whatsapp";
            return (
              <Link
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group flex items-center gap-3 no-underline"
              >
                {iconName ? (
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                      isWhatsApp
                        ? "bg-[#009C30] group-hover:bg-[#007A25]"
                        : "bg-white border-[1.5px] border-unident-bgElements group-hover:bg-unident-primary group-hover:border-unident-primary"
                    }`}
                  >
                    <DynamicIcon
                      name={iconName}
                      svgMarkup={social.iconSvg}
                      className={`h-5 w-5 transition-colors ${
                        isWhatsApp
                          ? "text-white"
                          : "text-unident-primary group-hover:text-white"
                      }`}
                      aria-hidden
                    />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white border-[1.5px] border-unident-bgElements">
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
                  className="text-unident-dark group-hover:text-unident-primary transition-colors"
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
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white border-[1.5px] border-unident-bgElements">
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
  );
}
