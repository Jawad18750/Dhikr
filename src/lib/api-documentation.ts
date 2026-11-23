// The API documentation as plain Markdown: for /developers.md, /llms.txt, and for pasting
// into an AI assistant. English, since that is what code and assistants read best.

export const API_DOCS_MARKDOWN = `# Dhikr API (dhikr.ly)

Quran recitations in the Qalun narration (قالون عن نافع), with the timing of every ayah and
every word, as JSON. Free, with a personal key. Arabic site: https://dhikr.ly/developers

## Authentication

1. Sign in at https://dhikr.ly/account (Google, or a one-time email link).
2. Create a key there. It starts with \`dk_\` and is shown once; store it on your server.
3. Send it with every request:

\`\`\`
Authorization: Bearer dk_...
\`\`\`

Keep the key out of code that runs in a browser or a shipped app; call the API from your
server and cache what you get. Revoke a leaked key from your account page and make another.

## Base URL

\`https://dhikr.ly/api/v1\`

Every response is JSON. CORS is open (\`Access-Control-Allow-Origin: *\`).

\`\`\`json
{ "data": { ... }, "license": "CC BY-NC 4.0", "attribution": "ذكر · dhikr.ly" }
\`\`\`

## Endpoints

### GET /reciters
Every recitation: slug, name, riwaya, style, country (ISO code), number of surahs, rank in
listening, portrait URL, page URL.

### GET /reciters/{slug}
One recitation and its surahs. For each surah: number, Arabic name, ayah count in the Qalun
(later Madinan) count, length in seconds, MP3 size in bytes, MP3 URL.

### GET /timings/{slug}/{surah}
When each ayah starts and ends, in milliseconds from the start of the surah's MP3.
\`{ "slug", "surah", "ayahs": [{ "ayah": 1, "start": 13080, "end": 17080 }, ...] }\`
Row 0, where present, is what precedes the first ayah (the basmala).

### GET /word-timings/{slug}/{surah}
When each word starts and ends, in milliseconds, with words numbered as the Qalun mushaf
counts them within each ayah.
\`{ "slug", "surah", "words": [{ "ayah": 1, "word": 1, "start": 13080, "end": 13880 }, ...] }\`

### GET /text/{surah}
The surah's text in Qalun, ayah by ayah as the Jamahiriya mushaf prints them (6214 ayahs in
all), with the juz of each ayah, and \`thumun\` and \`hizb\` on the ayah where one begins
(480 thumuns, 60 hizbs).
\`{ "surah": 1, "name": "الفاتحة", "riwaya": "qalun", "count": 7,
  "ayahs": [{ "ayah": 1, "text": "اِ۬لْحَمْدُ لِلهِ رَبِّ اِ۬لْعَٰلَمِينَ", "juz": 1, "thumun": 1, "hizb": 1 }, ...] }\`

### GET /numbering/{hafs|qalun}/{surah}/{ayah}
One ayah's number in the other count, both ways: Hafs (Kufan, 6236) and Qalun as the
Jamahiriya mushaf numbers it (Madinan, 6214). An ayah can hold more than one of the other
count, so \`ayahs\` is a list. Hafs 1:1, the basmala, has no Qalun number.
\`GET /numbering/hafs/2/286\` → \`{ "from": "hafs", "to": "qalun", "surah": 2, "ayah": 286, "ayahs": [285] }\`

\`slug\` is the recitation's name as in its page URL (for example \`abdulhamid_algriw\`);
\`surah\` is 1 to 114.

## Errors

\`{ "error": { "code": "...", "message": "...", "docs": "https://dhikr.ly/developers" } }\`

- 401 \`missing_key\` / \`invalid_key\`: no key, or a key that does not exist or was revoked.
- 404 \`not_found\`: no such recitation, or no such surah for it.
- 502 \`upstream\`: the data source did not answer; retry shortly.

There are no quotas. Each request is logged with its account (endpoint, time, country,
response size) so Dhikr knows what is used.

## Licence

The data is licensed CC BY-NC 4.0 (https://creativecommons.org/licenses/by-nc/4.0/): use,
share and build on it with credit to «ذكر · dhikr.ly», for non-commercial purposes. For
commercial use, write to Dhikr (https://dhikr.ly/contact).

## Example

\`\`\`js
const res = await fetch('https://dhikr.ly/api/v1/timings/abdulhamid_algriw/1', {
  headers: { Authorization: \`Bearer \${process.env.DHIKR_KEY}\` },
});
const { data } = await res.json();
// data.ayahs[0] → { ayah: 1, start: 13080, end: 17080 }
\`\`\`
`;
