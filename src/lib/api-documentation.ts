// The API documentation as plain Markdown: for /developers.md, /llms.txt, and for pasting
// into an AI assistant. English, since that is what code and assistants read best. It
// says what the Arabic page (src/app/(ar)/developers/page.tsx) says; change both together.

/** The language the documentation Markdown is written in. */
export const API_DOCS_LANG = 'en' as const;

export const API_DOCS_MARKDOWN = `# Dhikr API v1 (dhikr.ly)

Quran recitations in the Qalun narration (قالون عن نافع): reciters and their surahs, the
timing of every ayah and every word, the Qalun text, and an ayah-number converter between
Hafs and Qalun. JSON, free, with a personal key, no quotas.
Arabic documentation: https://dhikr.ly/developers

## Contents

1. Overview
2. Quick start
3. Keys and authentication
4. Response shape
5. Concepts and numbering
6. Endpoints: /reciters, /reciters/{slug}, /timings, /word-timings, /text, /numbering,
   /tafsir, /ayah, /library, /mawsuah, /hadith
7. Errors
8. Guides: highlight the recited ayah; word by word; Hafs tafsir beside a Qalun ayah;
   download a whole recitation
9. Limits and caching
10. Licence and attribution
11. What is logged
12. Changelog
13. FAQ

## 1. Overview

Base URL: \`https://dhikr.ly/api/v1\`. Every request is a GET, and every answer is UTF-8
JSON. The data follows the Qalun narration and the ayah boundaries the Jamahiriya mushaf
prints (6214 ayahs), unless Hafs is named.

| Endpoint | Gives |
|---|---|
| \`/reciters\` | Every recitation: name, riwaya, style, country, surah count, rank, portrait, page |
| \`/reciters/{slug}\` | One recitation's surahs: ayah count, length, size, MP3 URL |
| \`/timings/{slug}/{surah}\` | When each ayah starts and ends (every recitation) |
| \`/word-timings/{slug}/{surah}\` | When each word starts and ends (most recitations) |
| \`/text/{surah}\` | The surah's Qalun text, ayah by ayah, with juz, hizb and thumun |
| \`/numbering/{hafs\\|qalun}/{surah}/{ayah}\` | An ayah's number in the other count |

## 2. Quick start

1. Sign in at https://dhikr.ly/account (Google, or a link sent by email).
2. Create a key on the account page and copy it. It is shown in full only once.
3. Send it on every request: \`Authorization: Bearer dk_…\`

\`\`\`sh
curl https://dhikr.ly/api/v1/reciters -H "Authorization: Bearer $DHIKR_KEY"
\`\`\`

\`\`\`js
const response = await fetch('https://dhikr.ly/api/v1/timings/abdulhamid_algriw/1', {
  headers: { Authorization: \`Bearer \${process.env.DHIKR_KEY}\` },
});
if (!response.ok) throw new Error((await response.json()).error.message);
const { data } = await response.json();
console.log(data.ayahs[0]); // { ayah: 1, start: 13080, end: 17080 }
\`\`\`

\`\`\`python
import os, requests
r = requests.get("https://dhikr.ly/api/v1/text/1",
                 headers={"Authorization": f"Bearer {os.environ['DHIKR_KEY']}"}, timeout=10)
r.raise_for_status()
for ayah in r.json()["data"]["ayahs"]:
    print(ayah["ayah"], ayah["text"])
\`\`\`

## 3. Keys and authentication

Every request carries a personal key in \`Authorization: Bearer dk_…\` (keys start with
\`dk_\`). An account may hold up to ten keys, created and deleted on the account page, which
also shows each key's use.

- Keep the key on your server, never in code that reaches a browser or ships inside an app:
  whoever sees it can use it in your name.
- Only a hash of the key is stored, so it cannot be shown again. If you lose it, make another.
- If a key leaks, delete it on the account page; it stops working within a minute.
- CORS is open (any origin may call), but the safer pattern is to call from your server.

## 4. Response shape

A success (200) carries the data in \`data\`, with the licence and attribution:

\`\`\`json
{ "data": { }, "license": "CC BY-NC 4.0", "attribution": "ذكر · dhikr.ly" }
\`\`\`

Headers: \`X-License\`, \`Link\` (licence and docs), \`Cache-Control: private, no-store\`.
All numbers are integers. Times are milliseconds from the start of the surah's MP3. Text is
Arabic, as in the mushaf.

## 5. Concepts and numbering

- **slug**: a recitation's fixed name in lowercase Latin letters, digits and underscores,
  e.g. \`abdulhamid_algriw\`. It is the same in its page URL and audio URLs, and never changes.
- **Ayah counts**: ayahs are numbered as the Jamahiriya mushaf prints them in Qalun, by the
  Madinan count: 6214 ayahs. Hafs uses the Kufan count: 6236. They differ in many places
  (al-Baqara has 285 ayahs here, 286 in Hafs). Al-Fatiha's basmala is not an ayah in Qalun,
  so 1:1 here is «الحمد لله رب العالمين». Most tafsirs and translations are numbered by Hafs:
  convert with /numbering before joining them to these ayahs.
- **Word numbers**: words are numbered within each ayah from 1, as the printed mushaf shows
  them. The hizb sign «۞» is not a word and has no audio, so it is not counted.
- **Juz, hizb, thumun**: 30 juz, 2 hizbs each, 8 thumuns per hizb: 480 thumuns. Thumun starts
  are read from the «۞» signs printed in the mushaf; every juz begins on a thumun.
- **Audio**: one complete MP3 per surah, named by its number in three digits (001.mp3 to
  114.mp3). An isti'adha or basmala may precede the first ayah, so the first ayah's timing
  starts after the file does.

## 6. Endpoints

### GET /reciters
Every recitation, most listened first.

| Field | Type | Meaning |
|---|---|---|
| slug | string | The recitation's fixed name |
| name | string | The reciter's name in Arabic |
| riwaya | string | The narration, e.g. «قالون عن نافع» |
| style | string \\| null | مرتل, مجود, حدر or معلم |
| country | string \\| null | ISO 3166 code, e.g. LY |
| surahs | number | Surahs recorded |
| rank | number \\| null | Place in «most listened» |
| portrait | string \\| null | Portrait URL |
| page | string | The reciter's page on dhikr.ly |

### GET /reciters/{slug}
One recitation and all its surahs: \`slug, name, riwaya, style, country, page\` as above, and
\`surahs[]\` of \`{ surah, name, ayahs (Qalun count), seconds, bytes, audio (MP3 URL) }\`.

\`\`\`json
{ "slug": "abdulhamid_algriw", "name": "عبدالحميد القريو",
  "surahs": [{ "surah": 2, "name": "البقرة", "ayahs": 285, "seconds": 7910, "bytes": 63301843,
               "audio": "https://quran-audio.abdeljawad.com/audio/abdulhamid_algriw/002.mp3" }] }
\`\`\`

### GET /timings/{slug}/{surah}
When each ayah starts and ends in the surah's file; every recitation has them.
\`{ "slug", "surah", "ayahs": [{ "ayah", "start", "end" }] }\`. Row 0, where present, is
what precedes the first ayah (isti'adha or basmala).

### GET /word-timings/{slug}/{surah}
When each word starts and ends, numbered as the mushaf counts words. Most recitations have
them; one without answers 404.
\`{ "slug", "surah", "words": [{ "ayah", "word", "start", "end" }] }\` in reciting order.

### GET /text/{surah}
The surah's text ayah by ayah as the Jamahiriya mushaf prints it, in Qalun orthography,
each ayah with its juz; the ayah where a thumun begins also carries \`thumun\` (1–480) and
\`hizb\` (1–60). In two places (2:84, 18:22) the thumun sign falls inside the ayah, as printed.
\`{ "surah", "name", "riwaya": "qalun", "count", "ayahs": [{ "ayah", "text", "juz", "thumun"?, "hizb"? }] }\`

### GET /numbering/{hafs|qalun}/{surah}/{ayah}
An ayah's number in the other count: \`hafs\` converts Hafs → Qalun, \`qalun\` Qalun → Hafs.
An ayah can hold more than one of the other count, so \`ayahs\` is a list. Hafs 1:1 (the
basmala) has no Qalun number: its list is empty, with a \`note\`. The tables are the ones the
Dhikr apps use, checked against the printed mushaf's index; every ayah of both counts
round-trips.
- \`GET /numbering/hafs/2/286\` → \`{ "from": "hafs", "to": "qalun", "surah": 2, "ayah": 286, "ayahs": [285] }\`
- \`GET /numbering/qalun/1/1\` → \`{ "from": "qalun", "to": "hafs", "surah": 1, "ayah": 1, "ayahs": [2] }\`

### GET /tafsir
The nine tafsirs the Dhikr apps carry: \`[{ id, title, author, page }]\`.

### GET /tafsir/{id}/{surah}
A whole surah in one tafsir, by our (Qalun) ayahs. The source is numbered by Hafs, so each
passage carries \`hafs\`: the first and last Hafs ayah it explains. A passage covering two
of our ayahs appears under both.
\`{ "tafsir", "title", "author", "surah", "ayahs": [{ "ayah", "passages": [{ "hafs": [from, to], "text" }] }] }\`

### GET /ayah/{surah}/{ayah}
Everything the Quranic encyclopedia (quranpedia.net) holds about one of our ayahs, published
with its permission: \`{ surah, ayah, hafs, study, source, credits }\`. \`hafs\` lists the Hafs
ayahs gathered. \`study\` holds only the sections present:
\`meanings\` (\`{ word, meaning, book }\`), \`asbab\` (\`{ text, book, author, from, to }\`),
\`topics\` (strings), \`balagha\` (\`{ text, source }\`), \`rulings\` (\`{ text, by, book }\`),
\`similar\` (\`{ text, ayahs }\`), \`grammar\` (\`{ text, book, author }\`),
\`abrogation\` (\`{ text, book, author, died }\`), \`reflections\` and \`topicNotes\`
(\`{ text, by }\`), \`fatwas\` (\`{ title, question, answer, mufti, url }\`) and \`questions\`
(\`{ set, question, answer }\`). Credit «quranpedia.net» next to what you show.

### GET /library, /library/{book}, /library/{book}/{section}
The books on tajwid, orthography, ayah counting and the mutun, as text.
- \`/library\` → \`{ categories: [{ id, title, subtitle }], books: [{ id, category, title, author, items, cover, page }] }\`
- \`/library/{book}\` → \`{ id, category, title, author, source, sections: [{ section, chapter, title, headings }] }\`
- \`/library/{book}/{section}\` → \`{ book, section, of, chapter, title, blocks: [{ type, text, page?, level? }] }\`

### GET /mawsuah, /mawsuah/{id}
موسوعة التفسير الموضوعي (Tafsir Center for Quranic Studies), published with the
publisher's written permission: 333 Quranic topics in 18 sections.
- \`/mawsuah\` → \`{ title, publisher, sections: [{ id, title, topics: [{ id, title, parts, page }] }] }\`
- \`/mawsuah/{id}\` → \`{ id, section, title, blocks, notes, page }\`

Each block has a kind \`k\`: heading \`h\` (level \`l\`), paragraph \`p\`, quote \`q\`, poetry
\`v\`, cross-reference \`x\`, list \`l\` (\`items\`), table \`t\` (\`rows\`). Its text is a list
of runs \`r\`: a plain string, \`["q", ayah text]\`, \`["a", surah, from, to, label]\` (Hafs
numbers: convert with /numbering/hafs) or \`["f", footnote]\`. Credit the encyclopedia and its
publisher next to what you show.

### GET /hadith, /hadith/{slug}, /hadith/{slug}/{number}
The seven hadith collections the apps carry (اللؤلؤ والمرجان, رياض الصالحين, بلوغ المرام,
الأدب المفرد, الشمائل المحمدية, the Nawawi and Qudsi forties), in their authors' chapters.
- \`/hadith\` → \`[{ slug, title, author, hadiths, page }]\`
- \`/hadith/{slug}\` → \`{ slug, title, source, chapters: [{ chapter, title, from, to, hadiths }] }\`;
  with \`?chapter=n\` it adds \`hadiths\`: that chapter's hadiths.
- \`/hadith/{slug}/{number}\` → \`{ collection, number, chapter, title, text, narrator, grade, reference, page }\`
  (\`title\` is the باب where it differs from the chapter; missing fields are null).

## 7. Errors

\`{ "error": { "code": "...", "message": "...", "docs": "https://dhikr.ly/developers" } }\`

| Status | Code | Meaning |
|---|---|---|
| 401 | missing_key | No key in the request |
| 401 | invalid_key | The key does not exist or was deleted |
| 404 | not_found | No such recitation, no such surah for it, or no word timings yet |
| 502 | upstream | The data source did not answer; retry shortly |

## 8. Guides

### Highlight the ayah being recited
\`\`\`js
const { data: reciter } = await api('/reciters/abdulhamid_algriw');
const { data: timing } = await api('/timings/abdulhamid_algriw/1');
const audio = new Audio(reciter.surahs.find((s) => s.surah === 1).audio);
audio.addEventListener('timeupdate', () => {
  const ms = audio.currentTime * 1000;
  const current = timing.ayahs.find((a) => a.ayah > 0 && ms >= a.start && ms < a.end);
  highlight(current?.ayah);
});
audio.play();
\`\`\`

### Word by word
\`\`\`js
const { data } = await api('/word-timings/abdulhamid_algriw/2');
function wordAt(ms) {               // words are in reciting order: binary search
  let lo = 0, hi = data.words.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1, w = data.words[mid];
    if (ms < w.start) hi = mid - 1; else if (ms >= w.end) lo = mid + 1; else return w;
  }
  return null;
}
\`\`\`

### A Hafs-numbered tafsir beside a Qalun ayah
\`\`\`js
const { data } = await api('/numbering/qalun/2/285');   // → ayahs: [286]
const text = data.ayahs.map((hafs) => myTafsir[\`2:\${hafs}\`]).join('\\n');
\`\`\`

### Download a whole recitation
\`\`\`python
import os, requests
H = {"Authorization": f"Bearer {os.environ['DHIKR_KEY']}"}
reciter = requests.get("https://dhikr.ly/api/v1/reciters/abdulhamid_algriw", headers=H).json()["data"]
os.makedirs(reciter["slug"], exist_ok=True)
for s in reciter["surahs"]:
    path = f"{reciter['slug']}/{s['surah']:03d}.mp3"
    with requests.get(s["audio"], stream=True) as r, open(path, "wb") as f:
        for chunk in r.iter_content(1 << 16): f.write(chunk)
    assert os.path.getsize(path) == s["bytes"], path
\`\`\`

## 9. Limits and caching

No quotas and no rate limits: it is free, and an app may have millions of users. Most of
this data does not change, so cache it: the text and numbering are fixed, timings change
rarely, and the reciter list changes when a reciter is added. Fetch the list once a day and
the rest when first needed.

## 10. Licence and attribution

The data is licensed CC BY-NC 4.0 (https://creativecommons.org/licenses/by-nc/4.0/): use,
share and build on it for non-commercial purposes, crediting «ذكر · dhikr.ly» next to what
you show. For commercial use, contact us (https://dhikr.ly/contact). The recitations'
audio belongs to its reciters; the tafsirs, books and encyclopedia entries to their authors
and the sources named with them.

## 11. What is logged

Each request is logged with the key's account: path, time, status, size, duration and
country. Not the content of what you ask for, and not the IP address. It tells Dhikr what is
used; you see your own use on your account page. https://dhikr.ly/privacy

## 12. Changelog

- 2026-11-24: tafsirs (/tafsir), the ayah study (/ayah), the library (/library) and the
  thematic encyclopedia (/mawsuah) and the hadith collections (/hadith).
- 2026-11-23: the Qalun text (/text) and the numbering converter (/numbering).
- 2026-11-23: v1: reciters, ayah and word timings, with personal keys.

v1 changes only by addition (new fields, new endpoints). No field is removed or changes
meaning.

## 13. FAQ

- **Is it free?** Yes, without limits, for any non-commercial use.
- **Why do ayah numbers differ from the mushaf I know?** Most digital mushafs follow Hafs
  and the Kufan count; Dhikr follows the Jamahiriya mushaf in Qalun and the Madinan count.
  Use /numbering to link the two.
- **Other narrations?** Qalun first; others will follow.
- **Can I put the key in a mobile app?** Better not: anyone who unpacks the app sees it. Have
  your app ask your server, and your server ask the API.
- **Found an error in the data?** Tell us at https://dhikr.ly/contact.
`;
