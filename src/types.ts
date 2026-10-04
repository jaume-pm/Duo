export type ExerciseKind = "fill" | "scramble" | "translate";

export type Word = {
  hanzi: string;
  pinyin: string;
  pos: string;
  meaningEn: string;
};

export type FillItem = {
  id: string;
  prompt: string;
  template: string;
  pinyin: string;
  answers: string[];
  tip: string;
};

export type ScrambleItem = {
  id: string;
  prompt: string;
  tokens: string[];
  answers: string[];
  tip: string;
};

export type TranslateItem = {
  id: string;
  source: string;
  answers: string[];
  tip: string;
};

export type ExerciseBank = {
  fill: FillItem[];
  scramble: ScrambleItem[];
  translate: TranslateItem[];
};

export type GrammarPoint = {
  id: string;
  title: string;
  structure: string;
  summary: string;
  exampleHanzi: string;
  examplePinyin: string;
  exampleEn: string;
  exercises: ExerciseBank;
};

export type Lesson = {
  id: string;
  number: number;
  titleZh: string;
  titleEn: string;
  sourceNote: string;
  words: Word[];
  vocabExercises: ExerciseBank;
  grammar: GrammarPoint[];
};

export const EXERCISE_META: Record<
  ExerciseKind,
  { title: string; blurb: string; index: number }
> = {
  fill: {
    title: "Fill in",
    blurb: "Complete the sentence with the target word or particle.",
    index: 1,
  },
  scramble: {
    title: "Unscramble",
    blurb: "Tap the words into the right order.",
    index: 2,
  },
  translate: {
    title: "Translate",
    blurb: "Write the Chinese using this lesson’s vocab and grammar.",
    index: 3,
  },
};

export const EXERCISE_ORDER: ExerciseKind[] = ["fill", "scramble", "translate"];
