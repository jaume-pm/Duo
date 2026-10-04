const PUNCT = /[。？！，、．.?!,:：；;"""''「」『』（）()\[\]…—\-·~～]/g;

export function stripTones(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function normalizeAnswer(value: string): string {
  return stripTones(
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(PUNCT, ""),
  );
}

export function matchesAnswer(user: string, answers: string[]): boolean {
  const normalized = normalizeAnswer(user);
  if (!normalized) return false;
  return answers.some((answer) => normalizeAnswer(answer) === normalized);
}

export function displayAnswers(answers: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const answer of answers) {
    const key = normalizeAnswer(answer);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(answer.trim());
  }
  return result;
}
