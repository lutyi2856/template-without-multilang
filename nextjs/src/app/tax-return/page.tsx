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
  title: "Возврат налога - УниДент",
  description:
    "Получите налоговый вычет за стоматологическое лечение в клинике УниДент",
};

const BREADCRUMB_ITEMS = [
  { label: "Главная", href: "/" },
  { label: "Возврат налога" },
];

export default function TaxReturnPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Возврат налога", url: `${baseUrl}/tax-return` },
  ];

  return (
    <main id="main-content">
      <Section spacing="lg">
      <Container>
        <div className="py-16">
          <Breadcrumbs items={BREADCRUMB_ITEMS} />
          <BreadcrumbStructuredData items={structuredItems} />
          <Heading level={1} className="mb-8">
            Возврат налога
          </Heading>

          <div className="space-y-6">
            <Text variant="large">
              Вы можете вернуть 13% от стоимости стоматологического лечения
              через налоговый вычет.
            </Text>

            <Heading level={2} variant="section-title" className="mt-12 mb-6">
              Кто может получить налоговый вычет
            </Heading>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>
                  Граждане РФ, официально трудоустроенные и платящие НДФЛ 13%
                </Text>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>Максимальная сумма вычета - 120 000 рублей в год</Text>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>Вернуть можно до 15 600 рублей (13% от 120 000)</Text>
              </li>
            </ul>

            <Heading level={2} variant="section-title" className="mt-12 mb-6">
              Необходимые документы
            </Heading>

            <div className="space-y-4">
              <Text>• Договор на оказание медицинских услуг</Text>
              <Text>
                • Справка об оплате медицинских услуг по форме, утвержденной
                приказом МНС РФ и Минздрава РФ
              </Text>
              <Text>• Копия лицензии медицинской организации</Text>
              <Text>• Справка 2-НДФЛ с места работы</Text>
              <Text>• Декларация 3-НДФЛ</Text>
            </div>

            <Text variant="large" className="mt-8 text-unident-primary">
              Все необходимые документы для налогового вычета мы предоставим
              после лечения.
            </Text>
          </div>
        </div>
      </Container>
    </Section>
    </main>
  );
}
