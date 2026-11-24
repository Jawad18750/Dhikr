import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/api', () => ({
  getAllReciters: vi.fn(async () => [
    {
      id: 'itqan.dev-2',
      name: 'Badr',
      source: 'itqan.dev',
      moshaf: { id: '11', playlist: [] },
    },
  ]),
}));

let sitemap: typeof import('./sitemap').default;

beforeAll(async () => {
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://dhikr.example');
  vi.resetModules();
  sitemap = (await import('./sitemap')).default;
});

describe('sitemap', () => {
  it('lists the home, about, contact and privacy in every language', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        'https://dhikr.example',
        'https://dhikr.example/en',
        'https://dhikr.example/de',
        'https://dhikr.example/about',
        'https://dhikr.example/en/about',
        'https://dhikr.example/de/about',
        'https://dhikr.example/fr',
        'https://dhikr.example/ur/about',
        'https://dhikr.example/ru/privacy',
      ])
    );
  });

  it('never lists settings or offline', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(
      urls.some((url) => url.includes('/settings') || url.includes('/offline'))
    ).toBe(false);
  });

  it('declares the language twins on every entry', async () => {
    const entries = await sitemap();
    const about = entries.find(
      (entry) => entry.url === 'https://dhikr.example/about'
    );

    expect(about?.alternates?.languages).toMatchObject({
      ar: 'https://dhikr.example/about',
      en: 'https://dhikr.example/en/about',
      de: 'https://dhikr.example/de/about',
      'x-default': 'https://dhikr.example/about',
    });
  });

  it('keeps every URL absolute on the configured origin', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.every((url) => url.startsWith('https://dhikr.example'))).toBe(
      true
    );
  });
});
