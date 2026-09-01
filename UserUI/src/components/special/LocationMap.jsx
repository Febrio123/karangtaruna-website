import { siteConfig } from '../../data/siteConfig';

export default function LocationMap() {
  const { lat, lng, zoom } = siteConfig.map;

  const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden border border-border-light">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer"
        title="Lokasi Sekretariat Karang Taruna Mekar Jaya"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
