// Server only.
import fs from 'node:fs';
import path from 'node:path';

/**
 * The original printed editions, as PDFs kept on our server (CONTENT_ROOT/pdf), from the
 * Libyan Awqaf authority's site (awqaf.gov.ly) and quranly.com.ly, which publishes the
 * authority's books. Some books have only their PDF here, no text yet.
 */
const ROOT = process.env.CONTENT_ROOT ?? '/Users/jawad/Developer/dhikr/dhikr-app';

export type PdfSource = { file: string; from: string; url: string };

const AWQAF = 'https://awqaf.gov.ly/research/';
const QURANLY = 'https://quranly.com.ly/resource/';

/** The PDF of a book the library has as text, by its id. */
export const PDF_OF: Record<string, PdfSource> = {
  qalun_manhaj: { file: 'qalun_manhaj.pdf', from: 'الهيئة العامة للأوقاف والشؤون الإسلامية', url: AWQAF },
  murshid_mueen: { file: 'murshid_mueen.pdf', from: 'الهيئة العامة للأوقاف والشؤون الإسلامية', url: AWQAF },
  nuzha_l1: { file: 'nuzha_l1.pdf', from: 'قرآنلي (quranly.com.ly)', url: QURANLY },
  nuzha_l2: { file: 'nuzha_l2.pdf', from: 'قرآنلي (quranly.com.ly)', url: QURANLY },
  nuzha_l3: { file: 'nuzha_l3.pdf', from: 'الهيئة العامة للأوقاف والشؤون الإسلامية', url: AWQAF },
};

/** Books the library has only as their printed PDF. */
export const PDF_BOOKS: {
  id: string;
  category: string;
  title: string;
  author: string;
  pdf: PdfSource;
}[] = [
  {
    id: 'warsh_manhaj',
    category: 'tafsir',
    title: 'المنهج العلمي في أحكام التجويد وأصول رواية الإمام ورش',
    author: 'لجنة إعداد المناهج، الهيئة العامة للأوقاف',
    pdf: { file: 'warsh_manhaj.pdf', from: 'قرآنلي (quranly.com.ly)', url: QURANLY },
  },
  {
    id: 'hafs_manhaj',
    category: 'tafsir',
    title: 'المنهج العلمي في أحكام التجويد وأصول رواية الإمام حفص',
    author: 'لجنة إعداد المناهج، الهيئة العامة للأوقاف',
    pdf: { file: 'hafs_manhaj.pdf', from: 'الهيئة العامة للأوقاف والشؤون الإسلامية', url: AWQAF },
  },
  {
    id: 'nibras_tullab',
    category: 'tafsir',
    title: 'نبراس الطلاب في رسم وضبط حروف الكتاب',
    author: 'عبد الباسط مختار مدّور، حسام ناجي البكّاي',
    pdf: { file: 'nibras_tullab.pdf', from: 'قرآنلي (quranly.com.ly)', url: QURANLY },
  },
  {
    id: 'uddat_tullab',
    category: 'mutun',
    title: 'متن عدة الطلاب في رسم الكتاب',
    author: 'عبد الله اجمال',
    pdf: { file: 'uddat_tullab.pdf', from: 'قرآنلي (quranly.com.ly)', url: QURANLY },
  },
  {
    id: 'manzumat_naili',
    category: 'mutun',
    title: 'سلسلة منظومات النائلي',
    author: 'النائلي',
    pdf: { file: 'manzumat_naili.pdf', from: 'قرآنلي (quranly.com.ly)', url: QURANLY },
  },
  {
    id: 'maraqi_suud',
    category: 'mutun',
    title: 'مراقي السعود',
    author: 'عثمان أبو سنينة',
    pdf: { file: 'maraqi_suud.pdf', from: 'قرآنلي (quranly.com.ly)', url: QURANLY },
  },
  {
    id: 'inbaa_alghamr',
    category: 'mutun',
    title: 'إنباء الغمر برسم أبي عمرو',
    author: 'عثمان أبو سنينة',
    pdf: { file: 'inbaa_alghamr.pdf', from: 'قرآنلي (quranly.com.ly)', url: QURANLY },
  },
  {
    id: 'tuhfa_atfal',
    category: 'mutun',
    title: 'تحفة الأطفال والغلمان في تجويد القرآن',
    author: 'سليمان الجمزوري',
    pdf: { file: 'tuhfa_atfal.pdf', from: 'متن', url: '' },
  },
  {
    id: 'istilah_katatib',
    category: 'tafsir',
    title: 'اصطلاح الكتاتيب الليبية (مسلاتة نموذجًا)',
    author: 'الهيئة العامة للأوقاف والشؤون الإسلامية',
    pdf: { file: 'istilah_katatib.pdf', from: 'قرآنلي (quranly.com.ly)', url: QURANLY },
  },
];

/** The file on disk, when it is there (the development checkout has none). */
export function pdfPath(file: string): string | null {
  if (!/^[a-z0-9_]+\.pdf$/.test(file)) return null;
  const full = path.join(ROOT, 'pdf', file);
  return fs.existsSync(full) ? full : null;
}

export const pdfSize = (file: string) => {
  const full = pdfPath(file);
  return full ? fs.statSync(full).size : null;
};
