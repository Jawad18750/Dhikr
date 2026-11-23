'use client';

import { useEffect, useRef, useState } from 'react';

import { AYAH_COUNTS, hafsForQalun, qalunForHafs } from '@/lib/ayah-numbering';

/**
 * The live part of two tools cards: real timings from our data, played back on a loop.
 * The text is in the page from the start; script only moves the light, and only while
 * the card is on screen (and not at all for readers who ask for less motion).
 */
function useLoopClock(lengthMs: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer: number | undefined;
    let origin = performance.now();
    const run = () => {
      origin = performance.now() - now;
      timer = window.setInterval(() => setNow((performance.now() - origin) % lengthMs), 80);
    };
    const stop = () => window.clearInterval(timer);
    const seen = new IntersectionObserver(([entry]) => (entry.isIntersecting ? run() : stop()));
    seen.observe(node);
    return () => {
      stop();
      seen.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lengthMs]);
  return { ref, now };
}

/** Al-Fatiha in Qalun's (Madinan) count, as عبدالحميد القريو recites it: ms from the start. */
const FATIHA = [
  { ayah: 1, start: 13_080, end: 17_080, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  { ayah: 2, start: 19_480, end: 22_520, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
  { ayah: 3, start: 23_800, end: 25_320, text: 'مَلِكِ يَوْمِ الدِّينِ' },
  { ayah: 4, start: 28_022, end: 32_742, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { ayah: 5, start: 34_342, end: 37_702, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
  { ayah: 6, start: 40_182, end: 44_102, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ' },
  { ayah: 7, start: 45_565, end: 54_205, text: 'غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
];
const FROM = 12_000;
const TO = 55_000;
/** The timeline plays at 4× so a loop is about ten seconds. */
const SPEED = 4;

const seconds = (ms: number) => (ms / 1000).toFixed(2);

export function AyahTimeline() {
  const { ref, now } = useLoopClock((TO - FROM) / SPEED);
  const at = FROM + now * SPEED;
  const current = FATIHA.find((a) => at < a.end) ?? FATIHA[0];
  const pct = (ms: number) => ((ms - FROM) / (TO - FROM)) * 100;
  return (
    <div ref={ref} className="flex h-full flex-col justify-between gap-2">
      <span dir="rtl" lang="ar" className="truncate text-[19px] font-bold text-white">
        {current.text}
      </span>
      <div className="relative h-2.5 rounded-full bg-white/[0.1]">
        {FATIHA.map((a) => (
          <span
            key={a.ayah}
            className={`absolute inset-y-0 rounded-full transition-colors duration-200 ${
              a === current && at >= a.start ? 'bg-[#a9ddbc]' : 'bg-[#a9ddbc]/35'
            }`}
            style={{ right: `${pct(a.start)}%`, width: `${pct(a.end) - pct(a.start)}%` }}
          />
        ))}
        <span
          className="absolute -inset-y-1 w-[3px] rounded-full bg-white"
          style={{ right: `${pct(at)}%` }}
        />
      </div>
      <span dir="ltr" className="font-mono text-[12px] tabular-nums text-[#a9c9b8]">
        1:{current.ayah} · {seconds(current.start)}–{seconds(current.end)}s
      </span>
    </div>
  );
}

/** 1:4 word by word in the same recitation: ms from the ayah's start. */
const WORDS = [
  { text: 'إِيَّاكَ', start: 0, end: 960 },
  { text: 'نَعْبُدُ', start: 960, end: 1920 },
  { text: 'وَإِيَّاكَ', start: 1920, end: 3200 },
  { text: 'نَسْتَعِينُ', start: 3200, end: 4720 },
];
const WORDS_LOOP = 6200;

export function WordLights() {
  const { ref, now } = useLoopClock(WORDS_LOOP);
  const lit = WORDS.findIndex((w) => now >= w.start && now < w.end);
  return (
    <div ref={ref} className="flex h-full flex-col justify-between gap-2">
      <div dir="rtl" lang="ar" className="flex flex-wrap gap-x-2.5 gap-y-1 text-[21px] font-bold">
        {WORDS.map((w, index) => (
          <span
            key={w.text}
            className={`rounded-lg px-1.5 transition-colors duration-150 ${
              index === lit ? 'bg-gold-light/20 text-gold-light' : 'text-white/45'
            }`}
          >
            {w.text}
          </span>
        ))}
      </div>
      <span dir="ltr" className="font-mono text-[12px] tabular-nums text-[#a7b0c8]">
        1:4:{lit === -1 ? '–' : lit + 1} ·{' '}
        {lit === -1 ? '—' : `${seconds(WORDS[lit].start)}–${seconds(WORDS[lit].end)}s`}
      </span>
    </div>
  );
}

/**
 * The numbering converter itself, small enough for the card: a surah, an ayah, a
 * direction; the answer as you type. The same tables as the API (and the apps).
 */
export function NumberingConverter({
  surahs,
  labels,
}: {
  /** Surah names in the page's language, 1 to 114. */
  surahs: string[];
  labels: { hafs: string; qalun: string; surah: string; ayah: string; swap: string; none: string };
}) {
  const [fromHafs, setFromHafs] = useState(true);
  const [surah, setSurah] = useState(2);
  const [ayah, setAyah] = useState(286);
  const max = (fromHafs ? AYAH_COUNTS.hafs : AYAH_COUNTS.qalun)[String(surah)] ?? 1;
  const answer = fromHafs ? qalunForHafs(surah, ayah) : hafsForQalun(surah, ayah);
  const [from, to] = fromHafs ? [labels.hafs, labels.qalun] : [labels.qalun, labels.hafs];
  return (
    <div className="flex h-full flex-col justify-between gap-2 text-[14px]">
      <div className="flex items-center gap-2">
        <select
          aria-label={labels.surah}
          value={surah}
          onChange={(event) => {
            const next = Number(event.target.value);
            setSurah(next);
            setAyah((value) => Math.min(value, (fromHafs ? AYAH_COUNTS.hafs : AYAH_COUNTS.qalun)[String(next)] ?? 1));
          }}
          className="h-9 min-w-0 flex-1 rounded-lg bg-white/10 px-2 text-white outline-none focus-visible:ring-2 focus-visible:ring-gold-light/60"
        >
          {surahs.map((name, index) => (
            <option key={index} value={index + 1} className="text-black">
              {index + 1}. {name}
            </option>
          ))}
        </select>
        <input
          aria-label={labels.ayah}
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={ayah}
          onChange={(event) => setAyah(Math.max(1, Math.min(max, Number(event.target.value) || 1)))}
          className="h-9 w-[72px] rounded-lg bg-white/10 px-2 text-center tabular-nums text-white outline-none focus-visible:ring-2 focus-visible:ring-gold-light/60"
        />
      </div>
      <div className="flex items-center gap-2.5">
        <span className="rounded-lg bg-white/10 px-2.5 py-1 tabular-nums text-white">
          {from} {surah}:{ayah}
        </span>
        <button
          type="button"
          aria-label={labels.swap}
          onClick={() => {
            const next = answer[0];
            setFromHafs((value) => !value);
            if (next) setAyah(next);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gold-light transition-colors hover:bg-white/10"
        >
          ⇄
        </button>
        <span className="rounded-lg bg-white/10 px-2.5 py-1 tabular-nums text-gold-light">
          {answer.length ? `${to} ${surah}:${answer.join('، ')}` : labels.none}
        </span>
      </div>
    </div>
  );
}
