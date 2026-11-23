# ذكر · Dhikr

Complete Quran recitations, starting with the riwaya of Qalun, with the ayah
lit on the printed ink of the Jamahiriya mushaf as it is recited.

Live at [dhikr.ly](https://dhikr.ly).

## Stack

- Next.js 15 (App Router, standalone output), React with the React Compiler
- TypeScript, Tailwind CSS, Jotai
- three.js for the 3D mark
- A PWA with offline listening

## Develop

**Requirements:** Node.js >= 20.9 and Yarn 4 (via Corepack).

```bash
yarn install
yarn dev
```

Checks:

```bash
yarn tsc --noEmit
yarn lint
yarn test
```

## Build and run

```bash
yarn build
node .next/standalone/server.js
```

Set `NEXT_PUBLIC_APP_URL` (the public origin, e.g. `https://dhikr.ly`) and
`NEXT_PUBLIC_APP_NAME` before `yarn build`; both are baked into the client.

## License

MIT. See [LICENSE](LICENSE).
