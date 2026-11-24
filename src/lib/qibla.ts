// The qibla from anywhere: the initial great-circle bearing to the Kaaba and the distance,
// on a sphere (as the apps compute it). Runs on the server (the API) and in the browser.
export const KAABA = { lat: 21.422487, lng: 39.826206 };
const R = 6371.0088; // mean Earth radius, km
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Degrees clockwise from true north. */
export function qiblaBearing(lat: number, lng: number) {
  const φ1 = rad(lat);
  const φ2 = rad(KAABA.lat);
  const Δλ = rad(KAABA.lng - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Great-circle distance to the Kaaba, km. */
export function qiblaDistance(lat: number, lng: number) {
  const φ1 = rad(lat);
  const φ2 = rad(KAABA.lat);
  const a = Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(rad(KAABA.lng - lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Points along the great circle from a place to the Kaaba, for drawing the path. */
export function qiblaPath(lat: number, lng: number, steps = 64) {
  const [φ1, λ1, φ2, λ2] = [rad(lat), rad(lng), rad(KAABA.lat), rad(KAABA.lng)];
  const d = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2));
  if (d === 0) return [[lng, lat]];
  const out: [number, number][] = [];
  for (let index = 0; index <= steps; index++) {
    const f = index / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    out.push([deg(Math.atan2(y, x)), deg(Math.atan2(z, Math.sqrt(x * x + y * y)))]);
  }
  return out;
}

const POINTS = ['الشمال', 'الشمال الشرقي', 'الشرق', 'الجنوب الشرقي', 'الجنوب', 'الجنوب الغربي', 'الغرب', 'الشمال الغربي'];
export const compassPoint = (bearing: number) => POINTS[Math.round(bearing / 45) % 8];
