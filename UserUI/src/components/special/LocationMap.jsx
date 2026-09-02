import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useSiteConfig from '../../hooks/useSiteConfig';
import { siteConfig as staticSiteConfig } from '../../data/siteConfig';

/**
 * LocationMap — peta lokasi sekretariat Karang Taruna.
 * Menggunakan Leaflet + OpenStreetMap tiles (tanpa API key).
 * Marker kustom via L.divIcon dengan animasi pulse ring.
 */
export default function LocationMap() {
  const { data: siteConfig } = useSiteConfig();
  const staticMap = staticSiteConfig.map;

  // Fallback ke koordinat statis bila API belum mengisi lat/lng.
  const mapData =
    siteConfig.map && typeof siteConfig.map.lat === 'number'
      ? siteConfig.map
      : staticMap;
  const { lat, lng, zoom } = mapData;

  const orgName = siteConfig.name || staticSiteConfig.name;
  const orgAddress = siteConfig.address || staticSiteConfig.address;

  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    // Inisialisasi peta
    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: zoom || 16,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // --- Marker kustom via L.divIcon ---
    // Lingkaran dot utama + pulse ring animasi — warna primary (#1B5E3B)
    const markerIcon = L.divIcon({
      className: 'location-map-marker-icon', // reset leaflet default
      html: `
        <div class="location-map-marker">
          <span class="location-map-marker-pulse"></span>
          <span class="location-map-marker-dot"></span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20], // tengah → presisi di koordinat
      popupAnchor: [0, -22],
    });

    // Marker
    const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);

    // Popup — nama + alamat
    if (orgName) {
      const popupContent = `
        <div style="font-family:'Outfit',sans-serif;min-width:180px;">
          <strong style="font-size:14px;color:#1A1A1A;display:block;margin-bottom:4px;">${orgName}</strong>
          ${orgAddress ? `<span style="font-size:12px;color:#5C5C5C;line-height:1.4;display:block;">${orgAddress}</span>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'location-map-popup',
      });
    }

    // Tooltip — muncul saat hover
    marker.bindTooltip(orgName || 'Lokasi Sekretariat', {
      direction: 'top',
      offset: [0, -8],
      opacity: 0.9,
      className: 'location-map-tooltip',
    });

    mapInstanceRef.current = map;

    // Cleanup saat unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden border border-border-light">
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label={`Peta lokasi sekretariat ${orgName}`}
      />
    </div>
  );
}
