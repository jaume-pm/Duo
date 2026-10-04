export type ExerciseKind =
  | "fill"
  | "scramble"
  | "guided"
  | "translate"
  | "dialogue";

export type Word = {
  hanzi: string;
  pinyin: string;
  pos: string;
  meaningEn: string;
  meaningEs: string;
};

export type DialogueLine = {
  speaker: string;
  hanzi: string;
  pinyin: string;
  en: string;
};

export type Dialogue = {
  id: string;
  title: string;
  lines: DialogueLine[];
};

export type GrammarPoint = {
  id: string;
  title: string;
  structure: string;
  summaryEs: string;
  exampleHanzi: string;
  examplePinyin: string;
  exampleEn: string;
};

export type FillItem = {
  id: string;
  focus: string;
  promptEs: string;
  promptEn: string;
  template: string;
  pinyin: string;
  answers: string[];
  tip: string;
};

export type ScrambleItem = {
  id: string;
  promptEs: string;
  promptEn: string;
  tokens: string[];
  answers: string[];
  tip: string;
};

export type GuidedItem = {
  id: string;
  structure: string;
  promptEs: string;
  promptEn: string;
  answers: string[];
  tip: string;
};

export type TranslateItem = {
  id: string;
  sourceEs: string;
  sourceEn: string;
  answers: string[];
  tip: string;
};

export type DialogueExerciseLine =
  | {
      kind: "given";
      speaker: string;
      hanzi: string;
      pinyin: string;
    }
  | {
      kind: "blank";
      speaker: string;
      hintEs: string;
      hintEn: string;
      answers: string[];
      tip: string;
    };

export type DialogueItem = {
  id: string;
  title: string;
  contextEs: string;
  lines: DialogueExerciseLine[];
};

export type Lesson = {
  id: string;
  number: number;
  titleZh: string;
  titleEn: string;
  titleEs: string;
  sourceNote: string;
  words: Word[];
  grammar: GrammarPoint[];
  dialogues: Dialogue[];
  exercises: {
    fill: FillItem[];
    scramble: ScrambleItem[];
    guided: GuidedItem[];
    translate: TranslateItem[];
    dialogue: DialogueItem[];
  };
};

export const EXERCISE_META: Record<
  ExerciseKind,
  { title: string; blurb: string; index: number }
> = {
  fill: {
    title: "Completar",
    blurb: "Rellena el hueco con la palabra o partícula de la lección.",
    index: 1,
  },
  scramble: {
    title: "Ordenar",
    blurb: "Ordena las palabras para formar una frase correcta.",
    index: 2,
  },
  guided: {
    title: "Escritura guiada",
    blurb: "Escribe una frase china a partir de una estructura.",
    index: 3,
  },
  translate: {
    title: "Traducir",
    blurb: "Pasa al chino solo con lo que enseña esta lección.",
    index: 4,
  },
  dialogue: {
    title: "Minidiálogo",
    blurb: "Completa la réplica que falta, como en el texto.",
    index: 5,
  },
};

export const EXERCISE_ORDER: ExerciseKind[] = [
  "fill",
  "scramble",
  "guided",
  "translate",
  "dialogue",
];
