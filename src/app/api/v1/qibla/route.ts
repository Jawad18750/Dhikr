import { open, openPreflight } from '@/lib/api-open';
import { KAABA, qiblaBearing, qiblaDistance } from '@/lib/qibla';

export const runtime = 'nodejs';
export const OPTIONS = openPreflight;

const attribution = { license: 'CC BY 4.0', source: 'Great-circle bearing on a sphere (as in the Dhikr apps)', site: 'https://dhikr.ly/qibla' };

/** The qibla from ?lat=&lng=: bearing from true north and distance. Free, no key. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  return open(request, attribution, () => {
    const lat = Number(q.get('lat'));
    const lng = Number(q.get('lng'));
    if (!q.has('lat') || !q.has('lng') || !(Math.abs(lat) <= 90) || !(Math.abs(lng) <= 180)) return null;
    return {
      place: { lat, lng },
      kaaba: KAABA,
      bearing: Math.round(qiblaBearing(lat, lng) * 100) / 100,
      distance_km: Math.round(qiblaDistance(lat, lng) * 10) / 10,
      note: 'bearing: degrees clockwise from true north (add your local magnetic declination for a magnetic compass)',
    };
  });
}
