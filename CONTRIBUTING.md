# Contributing to ذكر · Dhikr

Thank you for helping. Corrections, reciters, translations and code are all welcome, from programmers and non-programmers alike.

## Without code

Open an issue with the link to the page and what is wrong or missing:

- a word or ayah timed wrong (give the reciter, surah and ayah, and roughly when in the audio);
- a reciter's name, photo or details;
- a translation that reads badly, in any of the 12 languages;
- a recitation we could add (in Qalun or another riwaya), with where it can be found.

## With code

1. Pick an issue labelled `good first issue`, or open one to discuss your idea before starting.
2. Branch from `tilawat`, the default branch: `fix/<short-name>` or `feat/<short-name>`.
3. **Never push to `tilawat` and never merge.** Open a pull request into `tilawat` and wait for review. This applies to AI assistants working for you too: give them these rules.
4. Keep the change to what the issue needs: no reformatting of unrelated files, no new dependencies without asking first.
5. Never commit `.env` files, keys, tokens or anything secret.

### Setup

```sh
corepack enable
yarn install
cp .env.example .env.local
yarn dev
```

`.env.example` explains which settings each part of the site needs. Most of it runs with none.

### Before opening the pull request

```sh
yarn tsc --noEmit
yarn lint
yarn test
yarn build
```

In the pull request, say what changed, why, and what you checked (and add a screenshot for anything visible).

## Conventions

- Arabic is the site's first language: every visible string lives in `src/locales/*.json`, in all 12 languages.
- Public paths, indexing and the sitemap come from `src/lib/seo/routes.ts` only.
- Commit messages follow Conventional Commits, for example `fix(prayer): …` or `feat(api): …`.

## Licence

By contributing you agree that your code is released under the MIT licence of this repository.
