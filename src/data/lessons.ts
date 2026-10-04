import type { ExerciseKind, Lesson } from "../types";
import lesson01 from "./lesson-01.json";

export const lessons: Lesson[] = [lesson01 as Lesson];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getItems(lesson: Lesson, kind: ExerciseKind) {
  return lesson.exercises[kind];
}
