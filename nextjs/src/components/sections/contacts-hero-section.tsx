"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { Clinic } from "@/lib/wordpress/api";
import type { ContactsSettings } from "@/types/contacts";
import { ContactsContactCardInline } from "./contacts-contact-card-inline";

const ClinicsMap = dynamic(
  () =>
    import("./clinics-map-osm").then((mod) => ({
      default: mod.ClinicsMapOsm,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-unident-bgElements animate-pulse rounded-[25px]" />
    ),
  }
);

interface ContactsHeroSectionProps {
  contacts: ContactsSettings | null;
  clinics: Clinic[];
}

export function ContactsHeroSection({
  contacts,
  clinics,
}: ContactsHeroSectionProps) {
  const [activeClinicIndex, setActiveClinicIndex] = React.useState(0);

  const handleMarkerClick = React.useCallback((index: number) => {
    setActiveClinicIndex(index);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,400px)_1fr] gap-6 w-full">
      {/* Левая колонка: контактные данные */}
      <div className="flex flex-col">
        <ContactsContactCardInline contacts={contacts} />
      </div>

      {/* Правая колонка: карта */}
      <div className="relative w-full min-h-[400px] lg:min-h-[500px] rounded-[25px] overflow-hidden bg-unident-bgElements">
        {clinics.length > 0 ? (
          <ClinicsMap
            clinics={clinics}
            activeClinicIndex={activeClinicIndex}
            onMarkerClick={handleMarkerClick}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-unident-textGray">
            Клиники не найдены
          </div>
        )}
      </div>
    </div>
  );
}
