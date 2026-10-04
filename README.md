# Duo

Local **HSK 2** workbook for **vocabulary and grammar**. Lessons 1–12 cover each lesson word list and the grammar from the lecture notes.

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
- **Grammar** — each point has 20 fill, unscramble, and translate items.
- **Mixed practice** — one shuffled stream of every grammar item in the lesson, so the pattern keeps changing.

Sentences use **HSK 1 plus the HSK 2 lessons you have already reached**. Lesson 1 only uses HSK 1 + Lesson 1 words. Lesson 2 may use Lessons 1 and 2, and so on. Not every word appears; the pool is just what you already know so the grammar is answerable.

Lesson data lives in `src/data/lesson-01.json` through `lesson-12.json`, registered in `src/data/lessons.ts`.
