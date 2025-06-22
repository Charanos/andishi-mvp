"use client";

import React, { useEffect, useRef } from "react";

// Define TypeScript types for the component props
type ContactMapProps = {
  className?: string;
  height?: string;
};

const ContactMap: React.FC<ContactMapProps> = ({
  className = "",
  height = "400px",
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamic import of Leaflet to avoid SSR issues
    const initializeMap = async () => {
      try {
        const L = await import("leaflet");

        // Import Leaflet CSS dynamically
        // Note: CSS import might not work in all bundlers, so we'll add it via link element
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        // Fix for default marker icons in Leaflet - use CDN URLs as fallback
        const createDefaultIcon = () =>
          L.icon({
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            iconRetinaUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });

        // Coordinates for Kiambu, Kenya (approximate center)
        const kiambuCoords: [number, number] = [-1.142667, 36.9538866];

        // Initialize the map only once
        if (!mapRef.current && mapContainerRef.current) {
          mapRef.current = L.map(mapContainerRef.current).setView(
            kiambuCoords,
            13
          );

          // Add OpenStreetMap tiles
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
          }).addTo(mapRef.current);

          // Add custom marker with popup
          L.marker(kiambuCoords, { icon: createDefaultIcon() })
            .addTo(mapRef.current)
            .bindPopup(
              `
              <div style="text-align: center; padding: 8px;">
                <div style="font-size: 24px; color: #3b82f6; margin-bottom: 4px;">📍</div>
                <h4 style="font-weight: 600; color: #374151; margin: 4px 0;">Andishi HQ</h4>
                <p style="color: #6b7280; margin: 0;">Ruiru - Kiambu, Kenya</p>
              </div>
              `
            )
            .openPopup();
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}
      style={{ height }}
    >
      {/* Fallback content */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-0">
        <div className="text-center p-6">
          <div className="text-4xl text-blue-400 mb-4">📍</div>
          <p className="text-white font-medium">Ruiru - Kiambu, Kenya</p>
          <p className="text-gray-400 text-sm mt-2">Loading map...</p>
        </div>
      </div>

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full relative z-10"
        aria-label="Interactive map showing Andishi's location in Kiambu, Kenya"
      />
    </div>
  );
};

export default ContactMap;
