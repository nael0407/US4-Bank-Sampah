"use client";

import React, { useEffect, useRef } from "react";

export interface MapPoint {
  id: string;
  nama: string;
  alamat?: string;
  lat: number;
  lng: number;
  jadwal?: Array<{ hari: string; jamMulai: string; jamSelesai: string }>;
}

interface LeafletMapProps {
  points?: MapPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  selectedCoord?: { lat: number; lng: number } | null;
}

export default function LeafletMap({
  points = [],
  center = [-7.7713, 110.3776], // Default near UGM / Yogyakarta RW area
  zoom = 14,
  height = "420px",
  onMapClick,
  selectedCoord,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const tempMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dynamically import Leaflet on client side
    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView(center, zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;

        if (onMapClick) {
          map.on("click", (e: any) => {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
        }
      }

      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;

      if (markersLayer) {
        markersLayer.clearLayers();

        const customPinIcon = L.divIcon({
          className: "custom-leaflet-pin",
          html: `
            <div style="background-color: #059669; color: white; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -34],
        });

        points.forEach((point) => {
          if (point.lat && point.lng) {
            const jadwalList = point.jadwal
              ?.map((j) => `<li><b>${j.hari}:</b> ${j.jamMulai} - ${j.jamSelesai}</li>`)
              .join("") || "<li>Belum ada jadwal tetap</li>";

            const popupContent = `
              <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 180px;">
                <h4 style="font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">${point.nama}</h4>
                <p style="color: #64748b; font-size: 11px; margin: 0 0 6px 0;">${point.alamat || ""}</p>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 4px;">
                  <span style="font-size: 11px; font-weight: 600; color: #059669;">Jadwal Penjemputan:</span>
                  <ul style="margin: 2px 0 0 0; padding-left: 14px; font-size: 11px; color: #334155;">
                    ${jadwalList}
                  </ul>
                </div>
              </div>
            `;

            L.marker([point.lat, point.lng], { icon: customPinIcon })
              .bindPopup(popupContent)
              .addTo(markersLayer);
          }
        });

        // If there are points, fit bounds
        if (points.length > 1) {
          const validCoords = points
            .filter((p) => p.lat && p.lng)
            .map((p) => [p.lat, p.lng] as [number, number]);
          if (validCoords.length > 0) {
            map.fitBounds(validCoords, { padding: [40, 40] });
          }
        } else if (points.length === 1 && points[0].lat && points[0].lng) {
          map.setView([points[0].lat, points[0].lng], 15);
        }
      }

      // Handle temporary marker for coordinate picking (Admin)
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }

      if (selectedCoord && selectedCoord.lat && selectedCoord.lng) {
        const pickerIcon = L.divIcon({
          className: "picker-leaflet-pin",
          html: `
            <div style="background-color: #dc2626; color: white; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        tempMarkerRef.current = L.marker([selectedCoord.lat, selectedCoord.lng], {
          icon: pickerIcon,
        }).addTo(map);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [points, center, zoom, onMapClick, selectedCoord]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%", zIndex: 10 }}
      className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm"
    />
  );
}
