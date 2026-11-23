import Image from 'next/image';

import LocalizedLink from '@/components/localized-link';
import type { SeoLocale } from '@/lib/seo/routes';
import failSVG from '@/svgs/fail.svg';

const COPY = {
  ar: {
    title: 'صفحة غير موجودة',
    body: 'عذرًا، هذه الصفحة غير موجودة. يرجى التحقق من عنوان URL.',
    home: 'العودة إلى الصفحة الرئيسية',
  },
  en: {
    title: 'Page not found',
    body: 'Sorry, this page does not exist. Please check the URL.',
    home: 'Back to home',
  },
  de: {
    title: 'Seite nicht gefunden',
    body: 'Entschuldigung, diese Seite existiert nicht. Bitte prüfen Sie die URL.',
    home: 'Zurück zur Startseite',
  },
  fr: {
    title: 'Page introuvable',
    body: 'Désolé, cette page n’existe pas. Vérifiez l’adresse.',
    home: 'Retour à l’accueil',
  },
  es: {
    title: 'Página no encontrada',
    body: 'Lo sentimos, esta página no existe. Revisa la dirección.',
    home: 'Volver al inicio',
  },
  tr: {
    title: 'Sayfa bulunamadı',
    body: 'Üzgünüz, bu sayfa yok. Lütfen adresi kontrol edin.',
    home: 'Ana sayfaya dön',
  },
  id: {
    title: 'Halaman tidak ditemukan',
    body: 'Maaf, halaman ini tidak ada. Periksa kembali alamatnya.',
    home: 'Kembali ke beranda',
  },
  ms: {
    title: 'Halaman tidak dijumpai',
    body: 'Maaf, halaman ini tidak wujud. Sila semak alamatnya.',
    home: 'Kembali ke laman utama',
  },
  ur: {
    title: 'صفحہ نہیں ملا',
    body: 'معذرت، یہ صفحہ موجود نہیں۔ براہِ کرم پتہ دوبارہ دیکھیں۔',
    home: 'سرورق پر واپس جائیں',
  },
  fa: {
    title: 'صفحه پیدا نشد',
    body: 'متأسفیم، این صفحه وجود ندارد. لطفاً نشانی را بررسی کنید.',
    home: 'بازگشت به صفحهٔ اصلی',
  },
  bn: {
    title: 'পৃষ্ঠাটি পাওয়া যায়নি',
    body: 'দুঃখিত, এই পৃষ্ঠাটি নেই। অনুগ্রহ করে ঠিকানাটি দেখে নিন।',
    home: 'মূল পাতায় ফিরুন',
  },
  ru: {
    title: 'Страница не найдена',
    body: 'Извините, такой страницы нет. Проверьте адрес.',
    home: 'На главную',
  },
} as const;

export function NotFoundView({ locale }: { locale: SeoLocale }) {
  const copy = COPY[locale];

  return (
    <div className="mt-4 flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
        <h1 className="mt-4 text-2xl font-bold">{copy.title}</h1>
        <Image
          src={failSVG}
          alt="Fail"
          width={200}
          height={200}
          className="mx-auto"
        />
        <p className="mt-4 text-gray-600">{copy.body}</p>

        <div className="mt-6">
          <LocalizedLink
            href="/"
            className="hover:from-brand-CTA-blue-700 inline-block w-full rounded-md bg-gradient-to-r from-brand-CTA-blue-600 to-brand-CTA-blue-500 px-4 py-2 font-medium text-white hover:to-brand-CTA-blue-600"
          >
            {copy.home}
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
}
