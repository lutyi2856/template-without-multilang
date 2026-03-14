/**
 * Mock данные для тестирования компонента CaseCard
 */

import type { CaseData } from "./types";

export const mockCaseData: CaseData = {
  id: "1",
  title: "Тотальное преображение улыбки: 28 виниров и коронок",
  beforeImage: {
    url: "/images/mock/case-before.jpg",
    alt: "Зубы до лечения",
    width: 800,
    height: 600,
  },
  afterImage: {
    url: "/images/mock/case-after.jpg",
    alt: "Зубы после лечения",
    width: 800,
    height: 600,
  },
  doctors: [
    {
      id: "d1",
      name: "Любимов Павел Олегович",
      specialty: "Стоматолог-ортопед",
      avatar: "/images/mock/doctor1.jpg",
    },
    {
      id: "d2",
      name: "Иванова Мария Петровна",
      specialty: "Стоматолог-терапевт",
      avatar: "/images/mock/doctor2.jpg",
    },
  ],
  services: [
    {
      id: "s1",
      name: "Имплантация зубов",
    },
    {
      id: "s2",
      name: "Виниры",
    },
    {
      id: "s3",
      name: "Коронки",
    },
  ],
  clinic: {
    id: "c1",
    name: "Клиника на Чайковского",
  },
};
