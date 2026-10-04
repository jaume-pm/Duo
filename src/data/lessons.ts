import type { ExerciseKind, GrammarPoint, Lesson } from "../types";
import lesson01 from "./lesson-01.json";

export type Track = { type: "vocab" } | { type: "grammar"; grammarId: string };

export const lessons: Lesson[] = [lesson01 as Lesson];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getGrammar(lesson: Lesson, grammarId: string): GrammarPoint | undefined {
  return lesson.grammar.find((point) => point.id === grammarId);
}

export function getTrackItems(lesson: Lesson, track: Track, kind: ExerciseKind) {
  if (track.type === "vocab") return lesson.vocabExercises[kind];
  return getGrammar(lesson, track.grammarId)?.exercises[kind] ?? [];
}

export function trackLabel(lesson: Lesson, track: Track): string {
  if (track.type === "vocab") return "Vocabulary";
  return getGrammar(lesson, track.grammarId)?.title ?? "Grammar";
}
