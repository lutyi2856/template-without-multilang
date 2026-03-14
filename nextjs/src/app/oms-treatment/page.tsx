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
  title: "ОМС лечение - УниДент",
  description:
    "Лечение зубов по полису ОМС в стоматологической клинике УниДент",
};

const BREADCRUMB_ITEMS = [
  { label: "Главная", href: "/" },
  { label: "ОМС лечение" },
];

export default function OMSTreatmentPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "ОМС лечение", url: `${baseUrl}/oms-treatment` },
  ];

  return (
    <main id="main-content">
      <Section spacing="lg">
      <Container>
        <div className="py-16">
          <Breadcrumbs items={BREADCRUMB_ITEMS} />
          <BreadcrumbStructuredData items={structuredItems} />
          <Heading level={1} className="mb-8">
            ОМС лечение
          </Heading>

          <div className="space-y-6">
            <Text variant="large">
              В нашей клинике вы можете получить стоматологическую помощь по
              полису обязательного медицинского страхования (ОМС).
            </Text>

            <Heading level={2} variant="section-title" className="mt-12 mb-6">
              Какие услуги доступны по ОМС
            </Heading>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>Профилактические осмотры</Text>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>Лечение кариеса</Text>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>Удаление зубов</Text>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-unident-primary">•</span>
                <Text>Лечение осложнений кариеса</Text>
              </li>
            </ul>

            <Heading level={2} variant="section-title" className="mt-12 mb-6">
              Как получить лечение по ОМС
            </Heading>

            <div className="space-y-4">
              <Text>
                1. Запишитесь на прием по телефону или через форму на сайте
              </Text>
              <Text>2. Возьмите с собой паспорт и полис ОМС</Text>
              <Text>3. Пройдите консультацию у врача-стоматолога</Text>
              <Text>4. Получите необходимое лечение</Text>
            </div>
          </div>
        </div>
      </Container>
    </Section>
    </main>
  );
}
