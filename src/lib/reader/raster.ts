// Server only: imported by the reader's API routes alone.

import sharp from 'sharp';

/**
 * A row's SVG (from the render service) turned into the PNG a browser gets, with the
 * session's 32-bit tag woven into the ink: in each 24 px cell, ink pixels shift by a
 * step of alpha according to one bit of the tag, too little to see, enough to read
 * back from a leaked image.
 */
const CELL = 24;
const STEP = 5;

export async function rasterise(svg: string, tag: number): Promise<Buffer> {
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * channels + 3;
      const a = data[index];
      if (a < 64) continue;
      const cell = (Math.floor(y / CELL) * Math.ceil(width / CELL) + Math.floor(x / CELL)) % 32;
      const bit = (tag >>> cell) & 1;
      data[index] = bit ? Math.max(0, a - STEP) : a;
    }
  }
  return sharp(data, { raw: { width, height, channels } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}
