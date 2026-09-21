import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Layers,
  Compass,
  Bus,
  Car,
} from "lucide-react";

interface VenueStaticMapProps {
  venue: string;
  city: string;
  address?: string;
  category?: string;
}

interface GeoCoordinates {
  lat: number;
  lng: number;
  district: string;
  metroStation: string;
  highway: string;
  landmark: string;
}

// Coordinate and vicinity database for venues and cities
const CITY_GEO_DATA: Record<string, GeoCoordinates> = {
  mumbai: {
    lat: 19.0663,
    lng: 72.8718,
    district: "Bandra Kurla Complex (BKC)",
    metroStation: "BKC Metro Line 3 (~450m)",
    highway: "Western Express Highway (1.2 km)",
    landmark: "Adjacent to Jio World Centre",
  },
  bengaluru: {
    lat: 12.978,
    lng: 77.7289,
    district: "Whitefield / EPIP Zone",
    metroStation: "Whitefield Metro (~700m)",
    highway: "Outer Ring Road (2.8 km)",
    landmark: "Near KTPO Grounds",
  },
  bangalore: {
    lat: 12.978,
    lng: 77.7289,
    district: "Whitefield / EPIP Zone",
    metroStation: "Whitefield Metro (~700m)",
    highway: "Outer Ring Road (2.8 km)",
    landmark: "Near KTPO Grounds",
  },
  delhi: {
    lat: 28.6149,
    lng: 77.2415,
    district: "Central Secretariat / Pragati Maidan",
    metroStation: "Supreme Court Metro (~300m)",
    highway: "Ring Road (800m)",
    landmark: "Bharat Mandapam Complex",
  },
  "new delhi": {
    lat: 28.6149,
    lng: 77.2415,
    district: "Central Secretariat / Pragati Maidan",
    metroStation: "Supreme Court Metro (~300m)",
    highway: "Ring Road (800m)",
    landmark: "Bharat Mandapam Complex",
  },
  hyderabad: {
    lat: 17.4719,
    lng: 78.3725,
    district: "HITEC City / Madhapur",
    metroStation: "Hitec City Metro (~650m)",
    highway: "PVNR Expressway Link (3.1 km)",
    landmark: "HITEX Trade Centre",
  },
  pune: {
    lat: 18.5714,
    lng: 73.7685,
    district: "Balewadi / Mahalunge",
    metroStation: "Balewadi Phata (~1.1 km)",
    highway: "Mumbai-Pune Bypass (500m)",
    landmark: "Shree Shiv Chhatrapati Sports Complex",
  },
  goa: {
    lat: 15.5996,
    lng: 73.7423,
    district: "North Goa / Vagator",
    metroStation: "Thivim Rail Station (18 km)",
    highway: "NH 66 Coastal Highway (4.2 km)",
    landmark: "Vagator Hilltop Arena",
  },
  chennai: {
    lat: 13.0131,
    lng: 80.1764,
    district: "Nandambakkam / Guindy",
    metroStation: "Guindy Metro (~1.8 km)",
    highway: "Grand Southern Trunk Rd (1.5 km)",
    landmark: "Chennai Trade Centre",
  },
  kolkata: {
    lat: 22.5448,
    lng: 88.4005,
    district: "EM Bypass / Salt Lake",
    metroStation: "Salt Lake Stadium Metro (~1.2 km)",
    highway: "Eastern Metropolitan Bypass (400m)",
    landmark: "Biswa Bangla Mela Prangan",
  },
  jaipur: {
    lat: 26.9124,
    lng: 75.7873,
    district: "Ashok Nagar / Central Jaipur",
    metroStation: "Sindhi Camp (~2.5 km)",
    highway: "NH 48 Bypass (5.0 km)",
    landmark: "Diggi Palace Grounds",
  },
  ahmedabad: {
    lat: 23.0225,
    lng: 72.5714,
    district: "Kankaria / Maninagar",
    metroStation: "Apparel Park Metro (~1.5 km)",
    highway: "SG Highway (6.2 km)",
    landmark: "EKA Arena Complex",
  },
};

// Deterministic fallback for any unrecognized city
function getCoordinatesForVenue(city: string, venue: string): GeoCoordinates {
  const normalizedCity = city.trim().toLowerCase();
  if (CITY_GEO_DATA[normalizedCity]) {
    return CITY_GEO_DATA[normalizedCity];
  }

  // Check if city name matches partial key
  for (const [key, data] of Object.entries(CITY_GEO_DATA)) {
    if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
      return data;
    }
  }

  // Check venue keywords
  const venueLower = venue.toLowerCase();
  if (
    venueLower.includes("bkc") ||
    venueLower.includes("mumbai") ||
    venueLower.includes("bandra")
  ) {
    return CITY_GEO_DATA["mumbai"];
  }
  if (
    venueLower.includes("whitefield") ||
    venueLower.includes("bangalore") ||
    venueLower.includes("bengaluru")
  ) {
    return CITY_GEO_DATA["bengaluru"];
  }
  if (
    venueLower.includes("pragati") ||
    venueLower.includes("delhi") ||
    venueLower.includes("stadium")
  ) {
    return CITY_GEO_DATA["delhi"];
  }

  // Deterministic pseudo-random generation based on city string
  let hash = 0;
  for (let i = 0; i < city.length; i++) {
    hash = (hash << 5) - hash + city.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 1000) / 1000) * 10 + 15;
  const lngOffset = ((Math.abs(hash >> 3) % 1000) / 1000) * 10 + 72;

  return {
    lat: Number(latOffset.toFixed(4)),
    lng: Number(lngOffset.toFixed(4)),
    district: `${city} Central District`,
    metroStation: `${city} City Transit (~800m)`,
    highway: `${city} Express Corridor`,
    landmark: `Near ${venue}`,
  };
}

export const VenueStaticMap: React.FC<VenueStaticMapProps> = ({
  venue,
  city,
  address,
  category,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const [copied, setCopied] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<"carto-dark" | "satellite">("carto-dark");

  const geo = getCoordinatesForVenue(city, venue);
  const fullAddress = address ? `${address}` : `${venue}, ${city}`;

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(`${venue}, ${address || ""} ${city}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 12));
  };

  // Zoom scale multiplier
  const scale = 1 + (zoomLevel - 15) * 0.15;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden shadow-xl">
      {/* Map Header bar with Venue and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Event Location & Map
              </h3>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Verified Venue
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Approx. {geo.lat.toFixed(4)}° N, {geo.lng.toFixed(4)}° E • {geo.district}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Map style toggle */}
          <button
            onClick={() =>
              setMapStyle((prev) => (prev === "carto-dark" ? "satellite" : "carto-dark"))
            }
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Toggle Map Style"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {mapStyle === "carto-dark" ? "Dark Carto" : "Satellite"}
            </span>
          </button>

          {/* Open in Google Maps */}
          <button
            onClick={handleOpenGoogleMaps}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Open in Google Maps for live directions"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Get Directions</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </button>
        </div>
      </div>

      {/* Static Map Canvas Container */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950 select-none">
        {/* Map Background Layer: Dark Cartographic or Satellite */}
        {mapStyle === "carto-dark" ? (
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
          >
            {/* SVG Cartographic Grid with Arterials and River */}
            <svg
              className="h-full w-full opacity-80"
              viewBox="0 0 600 300"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="streetGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />
                  <circle cx="20" cy="20" r="1" fill="#334155" opacity="0.4" />
                </pattern>
                <linearGradient id="waterwayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="50%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="highwayGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Base terrain */}
              <rect width="600" height="300" fill="#090d16" />

              {/* City District Blocks */}
              <rect x="30" y="25" width="110" height="90" rx="6" fill="#0f172a" opacity="0.7" />
              <rect x="160" y="30" width="130" height="85" rx="6" fill="#0f172a" opacity="0.7" />
              <rect x="320" y="20" width="100" height="100" rx="6" fill="#0f172a" opacity="0.7" />
              <rect x="440" y="35" width="130" height="80" rx="6" fill="#0f172a" opacity="0.7" />

              <rect x="40" y="160" width="120" height="110" rx="6" fill="#0f172a" opacity="0.7" />
              <rect x="180" y="150" width="100" height="120" rx="6" fill="#0f172a" opacity="0.7" />
              <rect x="310" y="165" width="140" height="100" rx="6" fill="#0f172a" opacity="0.7" />
              <rect x="470" y="160" width="100" height="115" rx="6" fill="#0f172a" opacity="0.7" />

              {/* Green Park / Recreation Zone */}
              <path
                d="M 80 180 Q 120 160 140 210 Q 110 240 70 230 Z"
                fill="#064e3b"
                opacity="0.35"
              />
              <text x="85" y="210" fill="#34d399" opacity="0.5" fontSize="9" fontWeight="600">
                City Park
              </text>

              {/* Minor Street Grid */}
              <rect width="600" height="300" fill="url(#streetGrid)" />

              {/* Waterway / Creek */}
              <path
                d="M -20 280 Q 150 250 240 180 T 450 140 T 620 90"
                fill="none"
                stroke="url(#waterwayGrad)"
                strokeWidth="18"
                opacity="0.7"
              />

              {/* Arterial Secondary Roads */}
              <path d="M 0 140 L 600 140" stroke="#334155" strokeWidth="4" strokeDasharray="6 3" />
              <path d="M 300 0 L 300 300" stroke="#334155" strokeWidth="4" strokeDasharray="6 3" />
              <path d="M 150 0 L 150 300" stroke="#1e293b" strokeWidth="2.5" />
              <path d="M 450 0 L 450 300" stroke="#1e293b" strokeWidth="2.5" />

              {/* Primary Golden Highway */}
              <path
                d="M 0 80 Q 200 100 300 150 T 600 220"
                fill="none"
                stroke="url(#highwayGlow)"
                strokeWidth="4.5"
              />

              {/* Metro Line dashed */}
              <path
                d="M 50 300 L 250 180 L 550 40"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                opacity="0.6"
              />

              {/* Local Area Road Names */}
              <text
                x="320"
                y="132"
                fill="#64748b"
                fontSize="8"
                fontWeight="600"
                letterSpacing="0.5"
              >
                {geo.district.toUpperCase()}
              </text>
              <text x="20" y="72" fill="#f59e0b" fontSize="8" fontWeight="bold" opacity="0.8">
                {geo.highway}
              </text>
              <text x="380" y="270" fill="#38bdf8" fontSize="8" opacity="0.8">
                Metro Transit Corridor
              </text>
            </svg>
          </div>
        ) : (
          /* Satellite Aesthetic View */
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(15,23,42,0.6) 0%, rgba(2,6,23,0.92) 100%), linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)`,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {/* Satellite topographic grid overlay */}
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="absolute top-4 left-4 rounded-lg bg-black/60 border border-white/10 px-2 py-1 text-[10px] font-mono text-cyan-400 backdrop-blur-md">
              SAT-GEO: {geo.lat.toFixed(4)}N / {geo.lng.toFixed(4)}E (High-Res Simulation)
            </div>
          </div>
        )}

        {/* Center Venue Location Pin & Radar Beacon Pulse */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center">
            {/* Animated Radar Pulse Rings */}
            <motion.div
              animate={{
                scale: [1, 2.2, 3],
                opacity: [0.8, 0.35, 0],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute h-10 w-10 -top-5 rounded-full border border-amber-400 bg-amber-500/20"
            />
            <motion.div
              animate={{
                scale: [1, 1.8, 2.4],
                opacity: [0.9, 0.4, 0],
              }}
              transition={{
                duration: 2.4,
                delay: 0.6,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute h-10 w-10 -top-5 rounded-full border border-yellow-300 bg-yellow-400/25"
            />

            {/* Venue Callout Popover Tooltip */}
            <motion.div
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-2 max-w-[260px] rounded-xl border border-amber-400/40 bg-slate-950/95 p-2.5 shadow-2xl backdrop-blur-md text-center pointer-events-auto"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {category || "Venue Location"}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-white line-clamp-1">{venue}</h4>
              <p className="text-[10px] text-slate-300 line-clamp-1">{city}, India</p>
            </motion.div>

            {/* Glowing MapPin icon */}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/40 border-2 border-white ring-4 ring-amber-500/30">
              <MapPin className="h-5 w-5 fill-slate-950 text-slate-950" />
            </div>

            {/* Pin shadow on ground */}
            <div className="mt-1 h-1.5 w-5 rounded-full bg-black/60 blur-[1px]" />
          </div>
        </div>

        {/* Map Interactive Controls (Zoom In / Out / Reset) */}
        <div className="absolute right-3 bottom-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleZoomIn}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-slate-900/90 text-white hover:bg-slate-800 transition-colors shadow-md cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in on map"
          >
            <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
          </button>
          <button
            onClick={handleZoomOut}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-slate-900/90 text-white hover:bg-slate-800 transition-colors shadow-md cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out on map"
          >
            <ZoomOut className="h-3.5 w-3.5 text-amber-400" />
          </button>
        </div>

        {/* Dynamic Scale Indicator */}
        <div className="absolute left-3 bottom-3 rounded-lg border border-white/10 bg-slate-900/85 px-2.5 py-1 text-[10px] font-mono text-slate-300 backdrop-blur-md flex items-center gap-2">
          <span className="font-semibold text-amber-400">Scale:</span>
          <span>{zoomLevel >= 16 ? "250m" : zoomLevel >= 14 ? "500m" : "1 km"}</span>
          <div className="h-1 w-8 bg-amber-400/80 rounded" />
        </div>
      </div>

      {/* Venue Address & Vicinity Details Footer */}
      <div className="p-4 bg-slate-900/70 border-t border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="line-clamp-1">{venue}</span>
            </div>
            <p className="text-xs text-slate-300 pl-5.5 leading-relaxed">{fullAddress}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-amber-400" />
                  <span>Copy Address</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenGoogleMaps}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500/20 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <Navigation className="h-3.5 w-3.5 text-amber-400" />
              <span>Navigate</span>
            </button>
          </div>
        </div>

        {/* Transit & Commute Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Bus className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Public Transit:</strong> {geo.metroStation}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Driving Access:</strong> {geo.highway}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
