"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { Clinic } from "@/lib/wordpress/api";

declare global {
  interface Window {
    ymaps3?: {
      ready: Promise<unknown>;
      import: (module: string) => Promise<unknown>;
      YMap: new (
        container: HTMLElement,
        options: { location: { center: [number, number]; zoom: number } },
        layers: unknown[]
      ) => {
        addChild: (child: unknown) => void;
        removeChild: (child: unknown) => void;
        getCenter: () => [number, number];
        setCenter: (center: [number, number]) => void;
        getZoom: () => number;
        setZoom: (zoom: number) => void;
        children: unknown[];
      };
      YMapDefaultSchemeLayer: new (opts?: object) => unknown;
      YMapDefaultFeaturesLayer: new (opts?: object) => unknown;
    };
  }
}

export interface YandexClinicsMapProps {
  clinics: Clinic[];
  activeClinicIndex: number;
  onMarkerClick: (index: number) => void;
}

const DEFAULT_CENTER: [number, number] = [37.6173, 55.7558]; // Москва
const DEFAULT_ZOOM = 11;

/**
 * YandexClinicsMap - карта с маркерами клиник (API 3).
 * Загружает скрипт lazyOnload, инициализирует карту при готовности.
 * Центр и активный маркер синхронизированы с activeClinicIndex.
 */
export function YandexClinicsMap({
  clinics,
  activeClinicIndex,
  onMarkerClick,
}: YandexClinicsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{
    setCenter: (center: [number, number]) => void;
    addChild: (child: unknown) => void;
  } | null>(null);
  const markersRef = useRef<unknown[]>([]);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  const apiKey =
    typeof process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY === "string"
      ? process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY
      : "";
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!apiKey || !scriptLoaded || !containerRef.current || !clinics.length) {
      return;
    }
    const ymaps3 = window.ymaps3;
    if (!ymaps3) return;

    let cancelled = false;

    const initMap = async () => {
      const ymaps3 = window.ymaps3 as typeof window.ymaps3;
      if (!ymaps3 || cancelled) return;

      await ymaps3.ready;

      const first = clinics[0];
      const center: [number, number] =
        first?.clinicFields?.coordinates != null
          ? [
              first.clinicFields.coordinates.longitude,
              first.clinicFields.coordinates.latitude,
            ]
          : DEFAULT_CENTER;

      const container = containerRef.current;
      if (!container) return;

      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = ymaps3;

      const map = new YMap(
        container,
        { location: { center, zoom: DEFAULT_ZOOM } },
        [
          new YMapDefaultSchemeLayer({}),
          new YMapDefaultFeaturesLayer({}),
        ]
      );
      mapRef.current = map;

      try {
        const defaultUi = await ymaps3.import(
          "@yandex/ymaps3-default-ui-theme"
        ) as {
          YMapDefaultMarker: new (opts: {
            coordinates: [number, number];
            title?: string;
            onClick?: () => void;
          }) => unknown;
        };

        if (!defaultUi?.YMapDefaultMarker || cancelled) return;

        clinics.forEach((clinic, index) => {
          const coords = clinic.clinicFields?.coordinates;
          if (!coords?.latitude || coords?.longitude == null) return;

          const coordinates: [number, number] = [
            coords.longitude,
            coords.latitude,
          ];

          const marker = new defaultUi.YMapDefaultMarker({
            coordinates,
            title: clinic.title ?? undefined,
            onClick: () => onMarkerClickRef.current(index),
          });
          map.addChild(marker);
          markersRef.current.push(marker);
        });
      } catch {
        // UI theme or markers failed — map still visible
      }
    };

    initMap();
    return () => {
      cancelled = true;
      markersRef.current = [];
      mapRef.current = null;
    };
  }, [apiKey, scriptLoaded, clinics]);

  // Центрировать карту при смене activeClinicIndex
  useEffect(() => {
    if (!mapRef.current || !clinics.length) return;
    const active = clinics[activeClinicIndex];
    const coords = active?.clinicFields?.coordinates;
    if (!coords?.latitude || coords?.longitude == null) return;

    const center: [number, number] = [
      coords.longitude,
      coords.latitude,
    ];
    try {
      mapRef.current.setCenter(center);
    } catch {
      // ignore
    }
  }, [activeClinicIndex, clinics]);

  if (!apiKey) {
    return (
      <div
        className="h-full min-h-[450px] w-full bg-unident-bgElements rounded-[25px] flex items-center justify-center"
        role="img"
        aria-label="Карта клиник (укажите NEXT_PUBLIC_YANDEX_MAPS_API_KEY для отображения)"
      >
        <p className="text-unident-textGray text-sm px-4 text-center">
          Укажите NEXT_PUBLIC_YANDEX_MAPS_API_KEY в .env.local для отображения карты
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`}
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
      <div
        ref={containerRef}
        className="h-full min-h-[450px] w-full rounded-[25px] overflow-hidden bg-unident-bgElements"
        aria-label="Карта с расположением клиник"
      />
    </>
  );
}
