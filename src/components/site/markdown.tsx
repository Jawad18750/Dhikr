import { Fragment, type ReactNode } from 'react';

/**
 * Just enough Markdown for our own documentation (src/lib/api-documentation.ts): headings,
 * paragraphs, lists, tables, fenced code, and inline code, bold and links. Trusted input
 * only; nothing here is meant for text from outside.
 */
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[`*]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) out.push(text.slice(last, index));
    const token = match[0];
    if (token.startsWith('`')) {
      out.push(
        <code key={index} className="rounded-md bg-surface-sunken px-1.5 py-0.5 font-mono text-[13.5px] text-ink">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**')) {
      out.push(
        <strong key={index} className="font-bold text-ink">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('[')) {
      const [, label, href] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token) ?? [];
      out.push(
        <a key={index} href={href} className="font-bold text-ink underline">
          {label}
        </a>
      );
    } else {
      out.push(
        <a key={index} href={token} className="break-all text-ink underline">
          {token}
        </a>
      );
    }
    last = index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith('```')) {
      const body: string[] = [];
      for (index++; index < lines.length && !lines[index].startsWith('```'); index++) body.push(lines[index]);
      index++;
      blocks.push(
        <pre
          key={blocks.length}
          className="overflow-x-auto rounded-2xl bg-[#0b0b0c] p-4 font-mono text-[13px] leading-[1.8] text-white"
        >
          {body.join('\n')}
        </pre>
      );
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const className =
        level === 1
          ? 'font-display text-[34px] font-black leading-[1.2] text-ink sm:text-[44px]'
          : level === 2
            ? 'scroll-mt-24 pt-4 font-display text-[26px] font-black text-ink sm:text-[30px]'
            : 'scroll-mt-24 pt-2 text-[19px] font-bold text-ink';
      const Tag = (['h1', 'h2', 'h3'] as const)[level - 1];
      blocks.push(
        <Tag key={blocks.length} id={slug(text)} className={className}>
          {inline(text)}
        </Tag>
      );
      index++;
      continue;
    }
    if (line.startsWith('|')) {
      const rows: string[][] = [];
      for (; index < lines.length && lines[index].startsWith('|'); index++) {
        if (/^\|[\s|:-]+\|$/.test(lines[index])) continue;
        rows.push(
          lines[index]
            .replace(/\\\|/g, '\uE000')
            .slice(1, -1)
            .split('|')
            .map((cell) => cell.replace(/\uE000/g, '|').trim())
        );
      }
      const [head, ...body] = rows;
      blocks.push(
        <div key={blocks.length} className="overflow-x-auto rounded-[18px] border border-border">
          <table className="w-full min-w-[480px] border-collapse text-[14.5px]">
            <thead>
              <tr className="bg-surface-sunken">
                {head.map((cell, c) => (
                  <th key={c} className="px-4 py-2.5 text-start font-bold text-ink">
                    {inline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, r) => (
                <tr key={r} className="border-t border-border align-top">
                  {row.map((cell, c) => (
                    <td key={c} className="px-4 py-2.5 leading-[1.7] text-ink-muted">
                      {inline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    const bullet = /^(\s*)(-|\d+\.)\s+(.*)$/;
    if (bullet.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      for (; index < lines.length && bullet.test(lines[index]); index++) {
        items.push(bullet.exec(lines[index])?.[3] ?? "");
        // A wrapped item continues on the next, indented lines.
        while (index + 1 < lines.length && /^\s{2,}\S/.test(lines[index + 1]) && !bullet.test(lines[index + 1])) {
          items[items.length - 1] += ` ${lines[++index].trim()}`;
        }
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(
        <List
          key={blocks.length}
          className={`flex flex-col gap-1.5 ps-6 text-[16px] leading-[1.85] text-ink-muted ${ordered ? 'list-decimal' : 'list-disc'}`}
        >
          {items.map((item, n) => (
            <li key={n}>{inline(item)}</li>
          ))}
        </List>
      );
      continue;
    }
    if (!line.trim()) {
      index++;
      continue;
    }
    const paragraph: string[] = [];
    for (
      ;
      index < lines.length && lines[index].trim() && !/^(#{1,3}\s|```|\||\s*(-|\d+\.)\s)/.test(lines[index]);
      index++
    ) {
      paragraph.push(lines[index]);
    }
    blocks.push(
      <p key={blocks.length} className="text-[16px] leading-[1.9] text-ink-muted">
        {inline(paragraph.join(' '))}
      </p>
    );
  }
  return <Fragment>{blocks}</Fragment>;
}
