import { Metadata } from "next";
import {
  Heading,
  Text,
  Container,
  Section,
  Breadcrumbs,
} from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

export const metadata: Metadata = {
  title: "Лечение в рассрочку - УниДент",
  description:
    "Лечение зубов в рассрочку без переплат в стоматологической клинике УниДент",
};

const BREADCRUMB_ITEMS = [
  { label: "Главная", href: "/" },
  { label: "Лечение в рассрочку" },
];

export default function InstallmentTreatmentPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Лечение в рассрочку", url: `${baseUrl}/installment-treatment` },
  ];

  return (
    <main id="main-content">
      <Section spacing="lg">
      <Container>
        <div className="py-16">
          <Breadcrumbs items={BREADCRUMB_ITEMS} />
          <BreadcrumbStructuredData items={structuredItems} />
          <Heading level={1} className="mb-8">
            Лечение в рассрочку
          </Heading>

          <div className="space-y-6">
            <Text variant="large">
              Получите качественное стоматологическое лечение сейчас, а платите
              частями - удобно и без переплат.
            </Text>

            <Heading level={2} variant="section-title" className="mt-12 mb-6">
              Преимущества рассрочки
            </Heading>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>
                  Без процентов и переплат - вы платите только стоимость лечения
                </Text>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>Гибкий график платежей - от 3 до 12 месяцев</Text>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>Минимум документов - паспорт и ИНН</Text>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>Быстрое оформление - решение за 15 минут</Text>
              </li>
            </ul>

            <Heading level={2} variant="section-title" className="mt-12 mb-6">
              Как получить рассрочку
            </Heading>

            <div className="space-y-4">
              <Text>1. Запишитесь на консультацию и пройдите осмотр</Text>
              <Text>2. Врач составит план лечения и рассчитает стоимость</Text>
              <Text>3. Выберите удобный срок рассрочки</Text>
              <Text>4. Оформите рассрочку - нужен только паспорт и ИНН</Text>
              <Text>5. Начните лечение сразу после одобрения</Text>
            </div>

            <div className="mt-12 rounded-[25px] bg-unident-bgLightBlue p-8">
              <Heading level={3} className="mb-4">
                Условия рассрочки
              </Heading>
              <div className="space-y-2">
                <Text>
                  <strong>Минимальная сумма:</strong> от 30 000 рублей
                </Text>
                <Text>
                  <strong>Срок:</strong> от 3 до 12 месяцев
                </Text>
                <Text>
                  <strong>Первый взнос:</strong> не требуется
                </Text>
                <Text>
                  <strong>Процентная ставка:</strong> 0%
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
    </main>
  );
}
