// Builds the site's per-ayah study data from the apps' Quranpedia database: one file per
// surah, keyed by Hafs ayah (as the source is), each ayah with every note that names it.
//   node scripts/build-quranpedia.mjs <dhikr-app> <out dir>
// The apps' policies hold here too: the unreviewed «asbab» summary of surah_info stays
// out, and notes' media (YouTube, images on quranpedia.net) are not carried.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import zlib from 'node:zlib';

const [app = `${os.homedir()}/Developer/dhikr/dhikr-app`, out = '.content/quranpedia'] = process.argv.slice(2);
const source = path.join(app, 'app/assets/data/quranpedia_data.db.br');
const temporary = path.join(os.tmpdir(), `quranpedia-${process.pid}.db`);
fs.writeFileSync(temporary, zlib.brotliDecompressSync(fs.readFileSync(source)));
const database = new DatabaseSync(temporary, { readOnly: true });
const all = (sql, ...args) => database.prepare(sql).all(...args);

const meta = Object.fromEntries(all('SELECT key, value FROM meta').map((r) => [r.key, r.value]));
const text = (html) =>
  String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\r/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** surah → hafs ayah → section → items */
const surahs = new Map();
const at = (s, a) => {
  if (!surahs.has(s)) surahs.set(s, new Map());
  const ayahs = surahs.get(s);
  if (!ayahs.has(a)) ayahs.set(a, {});
  return ayahs.get(a);
};
const push = (s, a, section, item) => {
  const node = at(s, a);
  (node[section] ??= []).push(item);
};

for (const r of all('SELECT surah, ayah, book_name, word_text, meaning FROM meanings ORDER BY id'))
  push(r.surah, r.ayah, 'meanings', { word: r.word_text, meaning: text(r.meaning), book: r.book_name });

const notes = (table, byAyah, section, shape) => {
  const byId = new Map(all(`SELECT * FROM ${table}`).map((r) => [r.id, r]));
  for (const link of all(`SELECT * FROM ${byAyah}`)) {
    const id = link.note_id ?? link.fatwa_id ?? link.qa_id;
    const note = byId.get(id);
    if (note) push(link.surah, link.ayah, section, shape(note, link));
  }
};
notes('balagha', 'balagha_by_ayah', 'balagha', (n) => ({ text: text(n.note_text), source: n.book_name || n.source || null }));
notes('waqafat', 'waqafat_by_ayah', 'reflections', (n) => ({ text: text(n.note_text), by: n.source || null }));
notes('ahkam_notes', 'ahkam_by_ayah', 'rulings', (n) => ({ text: text(n.note_text), by: n.author || null, book: n.book_name || null }));
notes('mutashabihat_notes', 'mutashabihat_by_ayah', 'similar', (n) => ({ text: text(n.note_text), ayahs: n.ayahs_ref }));
notes('topic_notes', 'topic_notes_by_ayah', 'topicNotes', (n) => ({ text: text(n.note_text), by: n.source || null }));
notes('fatwas', 'fatwas_by_ayah', 'fatwas', (n) => ({
  title: n.title,
  question: text(n.question),
  answer: text(n.answer),
  mufti: n.mufti || null,
  url: n.source_url || null,
}));
const sets = new Map(all('SELECT id, title FROM qa_sets').map((r) => [r.id, r.title]));
notes('qa', 'qa_by_ayah', 'questions', (n) => ({ set: sets.get(n.set_id) ?? null, question: text(n.question), answer: text(n.answer) }));

for (const r of all('SELECT surah, ayah, topic_name FROM topics_by_ayah')) push(r.surah, r.ayah, 'topics', r.topic_name);
for (const r of all('SELECT surah, ayah, book_name, book_author, content FROM sarf ORDER BY id'))
  push(r.surah, r.ayah, 'grammar', { text: text(r.content), book: r.book_name, author: r.book_author });
for (const r of all('SELECT surah, ayah, book_name, author, death_year, passage FROM nasekh'))
  push(r.surah, r.ayah, 'abrogation', { text: text(r.passage), book: r.book_name, author: r.author, died: r.death_year });
const books = new Map(all('SELECT book_id, title, author FROM asbab_books').map((r) => [r.book_id, r]));
for (const r of all('SELECT book_id, surah, ayah_from, ayah_to, text FROM asbab_entries ORDER BY id')) {
  const book = books.get(r.book_id);
  for (let a = r.ayah_from; a <= (r.ayah_to ?? r.ayah_from); a++)
    push(r.surah, a, 'asbab', { text: text(r.text), book: book?.title ?? null, author: book?.author ?? null, from: r.ayah_from, to: r.ayah_to });
}

const info = new Map(
  all('SELECT surah, revelation_type, revelation_order, introduction, names, purposes, topics, virtues, prophet_guidance FROM surah_info').map((r) => [
    r.surah,
    {
      revelation: r.revelation_type,
      order: r.revelation_order,
      introduction: text(r.introduction),
      names: text(r.names),
      purposes: text(r.purposes),
      topics: text(r.topics),
      virtues: text(r.virtues),
      guidance: text(r.prophet_guidance),
    },
  ])
);

fs.mkdirSync(out, { recursive: true });
const credits = Object.fromEntries(Object.entries(meta).filter(([k]) => k.startsWith('credit_')));
fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ version: meta.dump_manifest_version, credits }, null, 2));
let total = 0;
for (let s = 1; s <= 114; s++) {
  const ayahs = Object.fromEntries([...(surahs.get(s) ?? new Map())].sort((a, b) => a[0] - b[0]));
  const body = JSON.stringify({ surah: s, info: info.get(s) ?? null, ayahs });
  total += body.length;
  fs.writeFileSync(path.join(out, `${String(s).padStart(3, '0')}.json.br`), zlib.brotliCompressSync(Buffer.from(body)));
}
database.close();
fs.rmSync(temporary);
console.log(`quranpedia: 114 surahs, ${(total / 1e6).toFixed(1)} MB of JSON → ${out}`);
