"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Clinic } from "@/lib/wordpress/api";
import "leaflet/dist/leaflet.css";

// Фикс иконок маркеров в Next.js (иначе 404 на marker-icon.png)
const DefaultIcon = L.Icon.Default;
if ("_getIconUrl" in DefaultIcon.prototype) {
  delete (DefaultIcon.prototype as unknown as Record<string, unknown>)._getIconUrl;
}
DefaultIcon.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export interface ClinicsMapOsmProps {
  clinics: Clinic[];
  activeClinicIndex: number;
  onMarkerClick: (index: number) => void;
  /** Сдвиг центра карты вправо (px), чтобы маркер был виден — не под карточкой. panBy(-x, 0) */
  centerOffsetX?: number;
}

const MOSCOW_CENTER: [number, number] = [55.7558, 37.6173];
const DEFAULT_ZOOM = 11;
/** Ближе к улице для одной клиники (Ташкент, Москва и др.) */
const SINGLE_CLINIC_ZOOM = 16;

/** MapTiler: при наличии ключа — тайлы; для русских подписей на всех zoom — своя карта в Cloud с Language = Local */
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
const MAPTILER_MAP_ID = process.env.NEXT_PUBLIC_MAPTILER_MAP_ID || "basic-v2";

/** Провайдер тайлов без MapTiler: osm (глобально стабилен) или carto. По умолчанию osm — лучше работает в Узбекистане и др. */
const TILE_PROVIDER =
  process.env.NEXT_PUBLIC_MAP_TILE_PROVIDER || "osm";

function ChangeView({
  center,
  zoom,
  centerOffsetX,
}: {
  center: [number, number];
  zoom: number;
  centerOffsetX?: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    if (centerOffsetX != null && centerOffsetX > 0) {
      map.panBy([-centerOffsetX, 0], { duration: 0 });
    }
  }, [map, center, zoom, centerOffsetX]);
  return null;
}

/**
 * Карта клиник на Leaflet.
 * Тайлы: MapTiler (при ключе) > OpenStreetMap (по умолчанию, стабилен в Узбекистане и др.) > CARTO.
 * NEXT_PUBLIC_MAP_TILE_PROVIDER=carto — вернуть CARTO вместо OSM.
 * Для русских подписей: cloud.maptiler.com → Basic → Language = Local → NEXT_PUBLIC_MAPTILER_MAP_ID.
 */
export function ClinicsMapOsm({
  clinics,
  activeClinicIndex,
  onMarkerClick,
  centerOffsetX,
}: ClinicsMapOsmProps) {
  const active = clinics[activeClinicIndex];
  const center: [number, number] =
    active?.clinicFields?.coordinates != null
      ? [
          active.clinicFields.coordinates.latitude,
          active.clinicFields.coordinates.longitude,
        ]
      : MOSCOW_CENTER;

  const zoom = clinics.length === 1 ? SINGLE_CLINIC_ZOOM : DEFAULT_ZOOM;

  if (!clinics.length) {
    return (
      <div
        className="h-full min-h-[450px] w-full rounded-[25px] bg-unident-bgElements flex items-center justify-center"
        aria-label="Карта клиник"
      >
        <p className="text-unident-textGray text-sm">Нет клиник с координатами</p>
      </div>
    );
  }

  return (
    <div className="clinics-map-osm h-full min-h-[450px] w-full rounded-[25px] overflow-hidden [&_.leaflet-container]:rounded-[25px] [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-control-zoom]:!hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={center} zoom={zoom} centerOffsetX={centerOffsetX} />
        {MAPTILER_KEY ? (
          <TileLayer
            attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={`https://api.maptiler.com/maps/${MAPTILER_MAP_ID}/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
            maxZoom={19}
            maxNativeZoom={19}
            crossOrigin
          />
        ) : TILE_PROVIDER === "osm" ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains="abc"
            maxZoom={19}
            maxNativeZoom={19}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
            maxNativeZoom={19}
          />
        )}
        {clinics.map((clinic, index) => {
          const coords = clinic.clinicFields?.coordinates;
          if (!coords?.latitude || coords?.longitude == null) return null;
          const position: [number, number] = [coords.latitude, coords.longitude];
          return (
            <Marker
              key={clinic.id}
              position={position}
              eventHandlers={{
                click: () => onMarkerClick(index),
              }}
            >
              <Popup>
                <span className="font-semibold">{clinic.title}</span>
                {clinic.clinicFields?.address && (
                  <p className="text-sm mt-1">{clinic.clinicFields.address}</p>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
