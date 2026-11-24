// Server only: draws the encyclopedia's runs and blocks.
import { Fragment } from 'react';

import { AyahCitation } from '@/components/site/ayah-citation';
import { qalunForHafs } from '@/lib/ayah-numbering';
import type { MawsuahBlock, Run } from '@/lib/mawsuah';
import { qalunSurah } from '@/lib/qalun-text';

/** Our ayahs a Hafs citation covers (those our text holds); a long range keeps its first five. */
function citedAyahs(surah: number, from: number, to: number) {
  const ours = new Set<number>();
  for (let hafs = from; hafs <= Math.min(to, from + 20); hafs++) {
    const found = qalunForHafs(surah, hafs);
    if (found.length === 0 && surah === 1 && hafs === 1) ours.add(1);
    for (const a of found) ours.add(a);
  }
  const held = new Set(qalunSurah(surah).map((x) => x.ayah));
  return [...ours]
    .filter((ayah) => held.has(ayah))
    .sort((a, b) => a - b)
    .slice(0, 5)
    .map((ayah) => ({ ayah }));
}

export function Runs({ runs }: { runs: Run[] | undefined }) {
  return (
    <>
      {(runs ?? []).map((run, index) => {
        if (typeof run === 'string') return <Fragment key={index}>{run}</Fragment>;
        switch (run[0]) {
          case 'q':
            return (
              <span key={index} className="font-semibold text-ink">
                <span className="text-gold">﴿</span>
                {run[1]}
                <span className="text-gold">﴾</span>
              </span>
            );
          case 'a':
            return <AyahCitation key={index} label={run[4]} surah={run[1]} ayahs={citedAyahs(run[1], run[2], run[3])} />;
          case 'f':
            return (
              <sup key={index} className="px-0.5 text-[0.7em] font-bold">
                <a href={`#note-${run[1]}`} className="text-gold hover:underline">
                  {run[1]}
                </a>
              </sup>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

const body = 'text-[18px] leading-[2.1] text-ink';

/** The footnotes a stretch of blocks calls on, in order. */
export function notesIn(blocks: MawsuahBlock[]): number[] {
  const found = new Set<number>();
  const walk = (runs: Run[] | undefined) => { if (runs) for (const run of runs) Array.isArray(run) && run[0] === 'f' && found.add(run[1]) };
  for (const b of blocks) {
    walk(b.r);
    if (b.rows) for (const row of b.rows) row.forEach(walk);
    b.items?.forEach(walk);
  }
  return [...found];
}

export function Block({ block, anchor }: { block: MawsuahBlock; anchor?: string }) {
  switch (block.k) {
    case 'h': {
      const level = block.l ?? 1;
      if (level === 1)
        return (
          <h2 id={anchor} className="scroll-mt-24 pt-2 font-display text-[24px] font-black leading-[1.5] text-ink sm:text-[28px]">
            <Runs runs={block.r} />
          </h2>
        );
      return (
        <h3 className={`pt-2 font-bold leading-[1.6] text-ink ${level === 2 ? 'text-[20px]' : 'text-[18px] text-ink-muted'}`}>
          <Runs runs={block.r} />
        </h3>
      );
    }
    case 'q':
      return (
        <blockquote className="rounded-[18px] border-s-4 border-gold/60 bg-gold/[0.06] px-5 py-3.5 text-[18px] leading-[2.1] text-ink">
          <Runs runs={block.r} />
        </blockquote>
      );
    case 'v':
      return (
        <p className="text-center text-[18px] italic leading-[2.1] text-ink">
          <Runs runs={block.r} />
        </p>
      );
    case 'x':
      return (
        <p className="text-[15px] leading-[1.9] text-ink-subtle">
          <Runs runs={block.r} />
        </p>
      );
    case 'l': {
      const List = block.ord ? 'ol' : 'ul';
      return (
        <List className={`flex flex-col gap-2 ps-6 ${block.ord ? 'list-decimal' : 'list-disc'} ${body}`}>
          {(block.items ?? []).map((item, index) => (
            <li key={index}>
              <Runs runs={item} />
            </li>
          ))}
        </List>
      );
    }
    case 't':
      return (
        <div className="overflow-x-auto rounded-[18px] border border-border">
          <table className="w-full border-collapse text-[15.5px] leading-[1.9]">
            <tbody>
              {(block.rows ?? []).map((row, r) => (
                <tr key={r} className={r === 0 ? 'bg-surface-sunken font-bold' : 'border-t border-border'}>
                  {row.map((cell, c) => (
                    <td key={c} className="border-s border-border px-3 py-2 align-top text-ink first:border-s-0">
                      <Runs runs={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return (
        <p className={`whitespace-pre-line ${body}`}>
          <Runs runs={block.r} />
        </p>
      );
  }
}
