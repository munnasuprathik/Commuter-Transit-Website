// Address autocomplete via Photon (OpenStreetMap) — free, no API key, no signup.
// Restricted to Australia via bounding box + country filter.

// Australia bounding box: minLon, minLat, maxLon, maxLat
const AU_BBOX = '112.0,-44.0,154.0,-9.0';
// Bias results toward south-east AU (Melbourne) where most demand is
const AU_LAT = -37.8136;
const AU_LON = 144.9631;

interface PhotonFeature {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    suburb?: string;
    locality?: string;
    neighbourhood?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countrycode?: string;
    osm_value?: string;
  };
}

function formatFeature(f: PhotonFeature): string {
  const p = f.properties;
  const parts: string[] = [];

  // Street address: "8 Langridge Drive"
  const line1 = [p.housenumber, p.street].filter(Boolean).join(' ');
  if (line1) parts.push(line1);
  else if (p.name) parts.push(p.name);

  // Suburb — prefer most specific: suburb > locality > neighbourhood > district > city
  // (Photon often sets city="Melbourne" for whole metro — useless for AU suburb disambiguation)
  const suburb = p.suburb || p.locality || p.neighbourhood || p.district || p.city;
  if (suburb && suburb !== parts[0]) parts.push(suburb);

  // State + postcode for full disambiguation
  const tail: string[] = [];
  if (p.state) tail.push(p.state);
  if (p.postcode) tail.push(p.postcode);
  if (tail.length) parts.push(tail.join(' '));

  return parts.filter(Boolean).join(', ');
}

/** Fetch Australia-only address predictions from Photon. Returns [] on error. */
export async function fetchSuggestions(input: string): Promise<string[]> {
  if (input.trim().length < 2) return [];
  try {
    const url =
      `https://photon.komoot.io/api/?q=${encodeURIComponent(input)}` +
      `&limit=8&lang=en&bbox=${AU_BBOX}&lat=${AU_LAT}&lon=${AU_LON}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const features: PhotonFeature[] = data.features || [];
    const seen = new Set<string>();
    return features
      .filter((f) => {
        const cc = f.properties.countrycode || '';
        const country = f.properties.country || '';
        return cc.toUpperCase() === 'AU' || country === 'Australia';
      })
      .map(formatFeature)
      .filter((s) => {
        if (!s || seen.has(s)) return false;
        seen.add(s);
        return true;
      })
      .slice(0, 6);
  } catch {
    return [];
  }
}
