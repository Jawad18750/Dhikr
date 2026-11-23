import { crc32 } from 'node:zlib';

/**
 * A ZIP written as it streams, files stored as they are (MP3s do not compress):
 * each entry's CRC is counted while its bytes pass and written in a data
 * descriptor after them, so nothing is held in memory and the archive starts at
 * once. Its exact length is known up front (`zipLength`), so a browser shows
 * real progress. Names are UTF-8 (bit 11). Without ZIP64: up to 4 GB.
 */
export type ZipEntry = {
  name: string;
  size: number;
  /** The file's bytes, in order. */
  read: () => AsyncIterable<Uint8Array>;
};

const LOCAL = 30;
const DESCRIPTOR = 16;
const CENTRAL = 46;
const END = 22;
const FLAGS = 0x0808; // data descriptor + UTF-8 names
export const ZIP_LIMIT = 0xffff_fff0;

const encoder = new TextEncoder();

export function zipLength(entries: { name: string; size: number }[]): number {
  let total = END;
  for (const e of entries) {
    const n = encoder.encode(e.name).length;
    total += LOCAL + n + e.size + DESCRIPTOR + CENTRAL + n;
  }
  return total;
}

/** DOS time and date for the entries: one fixed stamp (the archive is generated). */
const DOS_TIME = 0;
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;

export function zipStream(entries: ZipEntry[]): ReadableStream<Uint8Array> {
  const iterator = (async function* () {
    let offset = 0;
    const central: Uint8Array[] = [];
    for (const entry of entries) {
      const name = encoder.encode(entry.name);
      const local = new DataView(new ArrayBuffer(LOCAL));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, FLAGS, true);
      local.setUint16(8, 0, true); // stored
      local.setUint16(10, DOS_TIME, true);
      local.setUint16(12, DOS_DATE, true);
      // CRC and sizes follow in the descriptor.
      local.setUint16(26, name.length, true);
      local.setUint16(28, 0, true);
      yield new Uint8Array(local.buffer);
      yield name;

      let crc = 0;
      let size = 0;
      for await (const chunk of entry.read()) {
        crc = crc32(chunk, crc);
        size += chunk.length;
        yield chunk;
      }
      if (size !== entry.size) throw new Error(`${entry.name}: ${size} bytes, expected ${entry.size}`);

      const descriptor = new DataView(new ArrayBuffer(DESCRIPTOR));
      descriptor.setUint32(0, 0x08074b50, true);
      descriptor.setUint32(4, crc, true);
      descriptor.setUint32(8, size, true);
      descriptor.setUint32(12, size, true);
      yield new Uint8Array(descriptor.buffer);

      const record = new DataView(new ArrayBuffer(CENTRAL));
      record.setUint32(0, 0x02014b50, true);
      record.setUint16(4, 20, true);
      record.setUint16(6, 20, true);
      record.setUint16(8, FLAGS, true);
      record.setUint16(10, 0, true);
      record.setUint16(12, DOS_TIME, true);
      record.setUint16(14, DOS_DATE, true);
      record.setUint32(16, crc, true);
      record.setUint32(20, size, true);
      record.setUint32(24, size, true);
      record.setUint16(28, name.length, true);
      record.setUint32(42, offset, true);
      const full = new Uint8Array(CENTRAL + name.length);
      full.set(new Uint8Array(record.buffer), 0);
      full.set(name, CENTRAL);
      central.push(full);

      offset += LOCAL + name.length + size + DESCRIPTOR;
    }
    let centralSize = 0;
    for (const record of central) {
      centralSize += record.length;
      yield record;
    }
    const end = new DataView(new ArrayBuffer(END));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, entries.length, true);
    end.setUint16(10, entries.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);
    yield new Uint8Array(end.buffer);
  })();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) controller.close();
        else controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return?.(undefined);
    },
  });
}
