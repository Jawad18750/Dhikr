// Writes each non-Arabic language's route group from the English one: the same
// files with the locale swapped. Arabic is the bare tree; English is the source.
//   node scripts/locale-routes.mjs
import fs from 'node:fs';
import path from 'node:path';

const LOCALES = ['fr', 'de', 'es', 'tr', 'id', 'ms', 'ur', 'fa', 'bn', 'ru'];
const source = path.join('src', 'app', '(en)', 'en');

const copy = (from, to, locale) => {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copy(a, b, locale);
    else {
      const text = fs
        .readFileSync(a, 'utf8')
        .replaceAll("'en'", `'${locale}'`)
        .replaceAll('"en"', `"${locale}"`)
        .replaceAll("'/en/", `'/${locale}/`)
        .replaceAll('EnglishLayout', `Layout_${locale}`)
        .replaceAll('The English URL', 'This language’s URL')
        .replaceAll('lang="en"', `lang="${locale}"`)
        .replaceAll('and English', 'and its own');
      fs.writeFileSync(b, text);
    }
  }
};

for (const locale of LOCALES) {
  const target = path.join('src', 'app', `(${locale})`, locale);
  fs.rmSync(path.join('src', 'app', `(${locale})`), { recursive: true, force: true });
  copy(source, target, locale);
  console.log('wrote', target);
}
