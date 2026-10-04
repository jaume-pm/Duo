# Duo

Local **HSK 2** workbook for **vocabulary and grammar**. Lesson 1 covers the word list and four patterns: 已经…了, 着, 是不是, V+一下.

There is no account, server, or saved progress. Everything runs in the browser. Practice sentences are new; they are not copied from the textbook dialogue.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:4721`).

GitHub Pages: https://jaume-pm.github.io/Duo/  
Repository: https://github.com/jaume-pm/Duo

Static build:

```bash
npm run build
npm run preview
```

## What’s inside

- **Vocabulary** — fill, unscramble, and translate drills for the lesson word list.
- **Grammar** — each point opens its own set of fill, unscramble, and translate exercises.

Lesson data lives in `src/data/lesson-01.json`. Add lesson 2 as another JSON file and register it in `src/data/lessons.ts`.
