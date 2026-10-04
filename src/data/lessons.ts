import { EXERCISE_ORDER, type ExerciseKind, type FillItem, type GrammarPoint, type Lesson, type ScrambleItem, type TranslateItem } from "../types";
import lesson01 from "./lesson-01.json";
import lesson02 from "./lesson-02.json";
import lesson03 from "./lesson-03.json";
import lesson04 from "./lesson-04.json";
import lesson05 from "./lesson-05.json";
import lesson06 from "./lesson-06.json";
import lesson07 from "./lesson-07.json";
import lesson08 from "./lesson-08.json";
import lesson09 from "./lesson-09.json";
import lesson10 from "./lesson-10.json";
import lesson11 from "./lesson-11.json";
import lesson12 from "./lesson-12.json";

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

export const lessons: Lesson[] = [
  lesson01 as Lesson,
  lesson02 as Lesson,
  lesson03 as Lesson,
  lesson04 as Lesson,
  lesson05 as Lesson,
  lesson06 as Lesson,
  lesson07 as Lesson,
  lesson08 as Lesson,
  lesson09 as Lesson,
  lesson10 as Lesson,
  lesson11 as Lesson,
  lesson12 as Lesson,
];

const CN_NUM = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

export function lessonHeading(lesson: Lesson): string {
  return `第${CN_NUM[lesson.number] ?? lesson.number}课 ${lesson.titleZh}`;
}

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
