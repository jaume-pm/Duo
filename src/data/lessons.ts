import { EXERCISE_META, EXERCISE_ORDER, type ExerciseKind, type FillItem, type GrammarPoint, type Lesson, type ScrambleItem, type TranslateItem } from "../types";
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
  lessonId: string;
  lessonNumber: number;
  grammarId: string;
  grammarTitle: string;
  kind: ExerciseKind;
  item: FillItem | ScrambleItem | TranslateItem;
};

export type MixFilter = {
  mode: "lesson" | "through" | "pick";
  lessonIds: string[];
  kind?: ExerciseKind;
  throughId?: string;
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

export function lessonPdfUrl(lessonId: string): string {
  const base = import.meta.env.BASE_URL;
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}notes/hsk2-lesson-${lessonId}.pdf`;
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

export function grammarBankCount(lesson: Lesson, kind?: ExerciseKind): number {
  if (kind) {
    return lesson.grammar.reduce((sum, point) => sum + point.exercises[kind].length, 0);
  }
  return lesson.grammar.reduce((sum, point) => sum + grammarItemCount(point), 0);
}

export function lessonsThrough(throughId: string): Lesson[] {
  const end = getLesson(throughId);
  if (!end) return [];
  return lessons.filter((lesson) => lesson.number <= end.number);
}

export function lessonsByIds(ids: string[]): Lesson[] {
  const wanted = new Set(ids);
  return lessons.filter((lesson) => wanted.has(lesson.id));
}

export function collectMixCards(selected: Lesson[], kind?: ExerciseKind): MixCard[] {
  const kinds = kind ? [kind] : EXERCISE_ORDER;
  const cards: MixCard[] = [];
  for (const lesson of selected) {
    for (const point of lesson.grammar) {
      for (const exerciseKind of kinds) {
        for (const item of point.exercises[exerciseKind]) {
          cards.push({
            lessonId: lesson.id,
            lessonNumber: lesson.number,
            grammarId: point.id,
            grammarTitle: point.title,
            kind: exerciseKind,
            item,
          });
        }
      }
    }
  }
  return cards;
}

export function mixHref(filter: MixFilter): string {
  const suffix = filter.kind ? `/${filter.kind}` : "";
  if (filter.mode === "lesson") {
    return `#/l/${filter.lessonIds[0] ?? "01"}/mix${suffix}`;
  }
  if (filter.mode === "through") {
    return `#/mix/through/${filter.throughId ?? filter.lessonIds.at(-1) ?? "01"}${suffix}`;
  }
  return `#/mix/pick/${filter.lessonIds.join("+")}${suffix}`;
}

export function mixLabel(filter: MixFilter): string {
  const type = filter.kind ? EXERCISE_META[filter.kind].title : "All types";
  if (filter.mode === "lesson") {
    const lesson = getLesson(filter.lessonIds[0] ?? "");
    return lesson ? `Lesson ${lesson.number} · ${type}` : type;
  }
  if (filter.mode === "through") {
    const end = getLesson(filter.throughId ?? filter.lessonIds.at(-1) ?? "");
    return end ? `Lessons 1–${end.number} · ${type}` : type;
  }
  const numbers = lessonsByIds(filter.lessonIds).map((lesson) => lesson.number).join(" + ");
  return numbers ? `Lessons ${numbers} · ${type}` : type;
}

export function trackLabel(lesson: Lesson, track: Track): string {
  if (track.type === "vocab") return "Vocabulary";
  if (track.type === "mix") return "Mixed practice";
  return getGrammar(lesson, track.grammarId)?.title ?? "Grammar";
}
