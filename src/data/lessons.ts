import { EXERCISE_ORDER, type ExerciseKind, type FillItem, type GrammarPoint, type Lesson, type ScrambleItem, type TranslateItem } from "../types";
import lesson01 from "./lesson-01.json";

export type Track =
  | { type: "vocab" }
  | { type: "grammar"; grammarId: string }
  | { type: "mix" };

export type MixCard = {
  grammarId: string;
  grammarTitle: string;
  kind: ExerciseKind;
  item: FillItem | ScrambleItem | TranslateItem;
};

export const lessons: Lesson[] = [lesson01 as Lesson];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getGrammar(lesson: Lesson, grammarId: string): GrammarPoint | undefined {
  return lesson.grammar.find((point) => point.id === grammarId);
}

export function grammarItemCount(point: GrammarPoint): number {
  return EXERCISE_ORDER.reduce((sum, kind) => sum + point.exercises[kind].length, 0);
}

export function getTrackItems(lesson: Lesson, track: Track, kind: ExerciseKind) {
  if (track.type === "vocab") return lesson.vocabExercises[kind];
  if (track.type === "mix") return [];
  return getGrammar(lesson, track.grammarId)?.exercises[kind] ?? [];
}

export function collectMixCards(lesson: Lesson): MixCard[] {
  const cards: MixCard[] = [];
  for (const point of lesson.grammar) {
    for (const kind of EXERCISE_ORDER) {
      for (const item of point.exercises[kind]) {
        cards.push({
          grammarId: point.id,
          grammarTitle: point.title,
          kind,
          item,
        });
      }
    }
  }
  return cards;
}

export function trackLabel(lesson: Lesson, track: Track): string {
  if (track.type === "vocab") return "Vocabulary";
  if (track.type === "mix") return "Mixed practice";
  return getGrammar(lesson, track.grammarId)?.title ?? "Grammar";
}
