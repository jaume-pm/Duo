import { displayAnswers, matchesAnswer } from "./check";
import {
  collectMixCards,
  getGrammar,
  getLesson,
  getTrackItems,
  grammarItemCount,
  lessonHeading,
  lessons,
  trackLabel,
  type MixCard,
  type Track,
} from "./data/lessons";
import {
  EXERCISE_META,
  EXERCISE_ORDER,
  type ExerciseKind,
  type FillItem,
  type Lesson,
  type ScrambleItem,
  type TranslateItem,
} from "./types";
import { el, shuffle } from "./ui";

type Route =
  | { name: "home" }
  | { name: "hub"; lessonId: string }
  | { name: "track"; lessonId: string; track: Track }
  | { name: "exercise"; lessonId: string; track: Track; kind: ExerciseKind }
  | { name: "mix"; lessonId: string };

type CheckStatus = "idle" | "correct" | "wrong" | "revealed";
type ItemResult = "correct" | "wrong" | "skipped";

type Session = {
  key: string;
  index: number;
  status: CheckStatus;
  input: string;
  selected: string[];
  bank: string[];
  results: ItemResult[];
  checkedOnce: boolean;
  mixDeck?: MixCard[];
};

const KINDS = new Set<string>(EXERCISE_ORDER);
const appNode = document.querySelector<HTMLDivElement>("#app");
if (!appNode) throw new Error("Missing #app");
const root: HTMLDivElement = appNode;

const sessions = new Map<string, Session>();

function parseTrack(parts: string[]): Track | null {
  if (parts[0] === "vocab") return { type: "vocab" };
  if (parts[0] === "mix") return { type: "mix" };
  if (parts[0] === "g" && parts[1]) return { type: "grammar", grammarId: parts[1] };
  return null;
}

function parseRoute(): Route {
  const hash = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] !== "l" || !parts[1]) return { name: "home" };
  const lessonId = parts[1];
  const rest = parts.slice(2);
  if (rest.length === 0) return { name: "hub", lessonId };
  if (rest[0] === "mix") return { name: "mix", lessonId };
  const track = parseTrack(rest);
  if (!track) return { name: "hub", lessonId };
  const kindPart = track.type === "vocab" ? rest[1] : rest[2];
  if (kindPart && KINDS.has(kindPart)) {
    return { name: "exercise", lessonId, track, kind: kindPart as ExerciseKind };
  }
  return { name: "track", lessonId, track };
}

function trackPath(track: Track): string {
  if (track.type === "vocab") return "vocab";
  if (track.type === "mix") return "mix";
  return `g/${track.grammarId}`;
}

function href(route: Route): string {
  if (route.name === "home") return "#/";
  if (route.name === "hub") return `#/l/${route.lessonId}`;
  if (route.name === "mix") return `#/l/${route.lessonId}/mix`;
  const base = `#/l/${route.lessonId}/${trackPath(route.track)}`;
  if (route.name === "track") return base;
  return `${base}/${route.kind}`;
}

function sessionKey(lessonId: string, track: Track, kind: ExerciseKind): string {
  return `${lessonId}:${trackPath(track)}:${kind}`;
}

function getSession(
  lessonId: string,
  track: Track,
  kind: ExerciseKind,
  itemId: string,
  tokens?: string[],
): Session {
  const key = sessionKey(lessonId, track, kind);
  const existing = sessions.get(key);
  if (existing) return existing;
  const created: Session = {
    key,
    index: 0,
    status: "idle",
    input: "",
    selected: [],
    bank: tokens ? shuffle(tokens, itemId) : [],
    results: [],
    checkedOnce: false,
  };
  sessions.set(key, created);
  return created;
}

function resetItem(session: Session, itemId: string, tokens?: string[]): void {
  session.status = "idle";
  session.input = "";
  session.selected = [];
  session.bank = tokens ? shuffle(tokens, `${itemId}:${session.index}`) : [];
  session.checkedOnce = false;
}

function markResult(session: Session, index: number, result: ItemResult): void {
  session.results[index] = result;
}

function render(): void {
  const route = parseRoute();
  root.replaceChildren();
  if (route.name === "home") {
    root.append(renderHome());
    return;
  }
  const lesson = getLesson(route.lessonId);
  if (!lesson) {
    root.append(renderMissing());
    return;
  }
  if (route.name === "hub") {
    root.append(renderHub(lesson));
    return;
  }
  if (route.name === "mix") {
    root.append(renderMix(lesson));
    return;
  }
  const activeTrack = route.track;
  if (activeTrack.type === "grammar") {
    if (!getGrammar(lesson, activeTrack.grammarId)) {
      root.append(renderMissing());
      return;
    }
  }
  if (route.name === "track") {
    root.append(renderTrack(lesson, route.track));
    return;
  }
  root.append(renderExercise(lesson, route.track, route.kind));
}

function renderHome(): HTMLElement {
  const list = el("div", { class: "lesson-list" });
  for (const lesson of lessons) {
    list.append(
      el("a", { class: "lesson-card", href: href({ name: "hub", lessonId: lesson.id }) },
        el("div", { class: "lesson-card__meta" },
          el("span", { class: "chip", text: `Lesson ${lesson.number}` }),
          el("span", { class: "muted", text: lesson.sourceNote }),
        ),
        el("p", { class: "hanzi-title", text: lessonHeading(lesson) }),
        el("p", { class: "card-en", text: lesson.titleEn }),
        el("p", { class: "card-stats", text: `${lesson.words.length} words · ${lesson.grammar.length} grammar points` }),
        el("span", { class: "card-cta", text: "Open lesson →" }),
      ),
    );
  }
  return el("div", { class: "page" },
    el("header", { class: "topbar" },
      el("div", { class: "brand" },
        el("span", { class: "seal", text: "双" }),
        el("div", {},
          el("p", { class: "eyebrow", text: "Local workbook" }),
          el("h1", { text: "Duo" }),
        ),
      ),
    ),
    el("main", { class: "shell" },
      el("section", { class: "hero" },
        el("p", { class: "kicker", text: "HSK 2 · vocabulary and grammar" }),
        el("h2", { text: "Practice the words and patterns, not the textbook lines." }),
        el("p", { class: "lede" },
          "Drill each grammar point, or mix them so the pattern keeps changing. Sentences use HSK 1 plus the words you have already learned.",
        ),
      ),
      list,
    ),
  );
}

function renderMissing(): HTMLElement {
  return el("div", { class: "page" },
    el("main", { class: "shell" },
      el("h1", { text: "Lesson not found" }),
      el("a", { class: "text-link", href: "#/", text: "Back to home" }),
    ),
  );
}

function renderExerciseTypes(lesson: Lesson, track: Track): HTMLElement {
  const grid = el("div", { class: "exercise-grid" });
  for (const kind of EXERCISE_ORDER) {
    const meta = EXERCISE_META[kind];
    const count = getTrackItems(lesson, track, kind).length;
    grid.append(
      el("a", { class: "ex-card", href: href({ name: "exercise", lessonId: lesson.id, track, kind }) },
        el("span", { class: "ex-num", text: String(meta.index).padStart(2, "0") }),
        el("h3", { text: meta.title }),
        el("p", { class: "muted", text: meta.blurb }),
        el("p", { class: "ex-count", text: `${count} items` }),
      ),
    );
  }
  return grid;
}

function renderHub(lesson: Lesson): HTMLElement {
  const vocab = el("div", { class: "vocab-grid" });
  for (const word of lesson.words) {
    vocab.append(
      el("article", { class: "vocab-item" },
        el("p", { class: "vocab-hanzi", text: word.hanzi }),
        el("p", { class: "pinyin", text: word.pinyin }),
        el("p", { class: "vocab-pos", text: word.pos }),
        el("p", { class: "vocab-meaning", text: word.meaningEn }),
      ),
    );
  }

  const grammar = el("div", { class: "grammar-grid" });
  for (const point of lesson.grammar) {
    const total = grammarItemCount(point);
    grammar.append(
      el("a", {
        class: "grammar-card grammar-card--link",
        href: href({ name: "track", lessonId: lesson.id, track: { type: "grammar", grammarId: point.id } }),
      },
        el("h3", { text: point.title }),
        el("p", { class: "structure", text: point.structure }),
        el("p", { class: "muted", text: point.summary }),
        el("p", { class: "hanzi-inline", text: point.exampleHanzi }),
        el("p", { class: "pinyin", text: point.examplePinyin }),
        el("p", { class: "muted", text: point.exampleEn }),
        el("span", { class: "card-cta", text: `Practice · ${total} exercises →` }),
      ),
    );
  }

  const vocabTrack: Track = { type: "vocab" };

  return el("div", { class: "page" },
    el("header", { class: "topbar" },
      el("a", { class: "back", href: "#/", text: "← Duo" }),
      el("div", { class: "brand brand--small" },
        el("span", { class: "seal seal--sm", text: "双" }),
        el("span", { text: "HSK 2" }),
      ),
    ),
    el("main", { class: "shell" },
      el("section", { class: "lesson-head" },
        el("p", { class: "kicker", text: `Lesson ${lesson.number}` }),
        el("h1", { class: "hanzi-title", text: lessonHeading(lesson) }),
        el("p", { class: "card-en", text: "Words and grammar only — new practice sentences, not the textbook dialogue." }),
      ),
      el("section", { class: "block" },
        el("a", { class: "mix-card", href: href({ name: "mix", lessonId: lesson.id }) },
          el("p", { class: "kicker", text: "Mixed practice" }),
          el("h2", { text: "All grammar, shuffled" }),
          el("p", { class: "muted", text: "Fill, unscramble, and translate items from every point in this lesson, in random order, so you are not drilling the same pattern the whole time." }),
          el("span", { class: "card-cta", text: `Start mix · ${lesson.grammar.reduce((n, point) => n + grammarItemCount(point), 0)} items →` }),
        ),
      ),
      el("section", { class: "block" },
        el("div", { class: "block-head" },
          el("h2", { text: "Vocabulary" }),
          el("a", {
            class: "text-link",
            href: href({ name: "track", lessonId: lesson.id, track: vocabTrack }),
            text: "Practice words →",
          }),
        ),
        el("p", { class: "muted", text: "Learn the lesson list, then drill it with new sentences." }),
        vocab,
      ),
      el("section", { class: "block" },
        el("h2", { text: "Grammar" }),
        el("p", { class: "muted", text: "Open a point to get fill-in, unscramble, and translation drills for that pattern." }),
        grammar,
      ),
    ),
  );
}

function renderTrack(lesson: Lesson, track: Track): HTMLElement {
  const back = el("a", { class: "back", href: href({ name: "hub", lessonId: lesson.id }), text: "← Lesson" });
  if (track.type === "vocab") {
    return el("div", { class: "page" },
      el("header", { class: "topbar" }, back),
      el("main", { class: "shell" },
        el("section", { class: "lesson-head" },
          el("p", { class: "kicker", text: "Vocabulary" }),
          el("h1", { text: `Lesson ${lesson.number} words` }),
          el("p", { class: "lede", text: "Fill, unscramble, and translate using this lesson’s word list. No copied textbook lines." }),
        ),
        el("section", { class: "block" },
          el("h2", { text: "Exercise types" }),
          renderExerciseTypes(lesson, track),
        ),
      ),
    );
  }

  if (track.type === "mix") return renderMissing();

  const point = getGrammar(lesson, track.grammarId);
  if (!point) return renderMissing();

  return el("div", { class: "page" },
    el("header", { class: "topbar" }, back),
    el("main", { class: "shell" },
      el("section", { class: "lesson-head" },
        el("p", { class: "kicker", text: "Grammar" }),
        el("h1", { text: point.title }),
        el("p", { class: "structure-pill", text: point.structure }),
        el("p", { class: "lede", text: point.summary }),
        el("p", { class: "hanzi-inline", text: point.exampleHanzi }),
        el("p", { class: "pinyin", text: point.examplePinyin }),
        el("p", { class: "muted", text: point.exampleEn }),
      ),
      el("section", { class: "block" },
        el("h2", { text: "Exercises" }),
        el("p", { class: "muted", text: "Different sentences, same pattern." }),
        renderExerciseTypes(lesson, track),
      ),
    ),
  );
}

function renderExercise(lesson: Lesson, track: Track, kind: ExerciseKind): HTMLElement {
  const items = getTrackItems(lesson, track, kind);
  const meta = EXERCISE_META[kind];
  const label = trackLabel(lesson, track);
  const firstTokens = kind === "scramble" ? (items[0] as ScrambleItem | undefined)?.tokens : undefined;
  const firstId = items[0]?.id ?? kind;
  const session = getSession(lesson.id, track, kind, firstId, firstTokens);

  if (items.length === 0) {
    return el("div", { class: "page" },
      el("main", { class: "shell" },
        el("h1", { text: "No items yet" }),
        el("a", { class: "text-link", href: href({ name: "track", lessonId: lesson.id, track }), text: "Back" }),
      ),
    );
  }

  if (session.index >= items.length) {
    return renderSummary(lesson, track, kind, session);
  }

  const item = items[session.index];
  const progress = `${session.index + 1} / ${items.length}`;

  const page = el("div", { class: "page" },
    el("header", { class: "topbar" },
      el("a", { class: "back", href: href({ name: "track", lessonId: lesson.id, track }), text: `← ${label}` }),
      el("div", { class: "progress-wrap" },
        el("p", { class: "progress-label", text: `${label} · ${meta.title} · ${progress}` }),
        el("div", { class: "bar", role: "progressbar", "aria-valuenow": session.index + 1, "aria-valuemax": items.length },
          el("span", { style: `width:${(session.index / items.length) * 100}%` }),
        ),
      ),
    ),
  );

  const main = el("main", { class: "shell shell--narrow" });
  const card = el("section", { class: "workbook" });
  card.append(el("p", { class: "kicker", text: `Item ${session.index + 1}` }));

  if (kind === "fill") {
    card.append(renderFill(item as FillItem, session, lesson, track, kind, items.length));
  } else if (kind === "scramble") {
    card.append(renderScramble(item as ScrambleItem, session, lesson, track, kind, items.length));
  } else {
    card.append(renderTranslate(item as TranslateItem, session, lesson, track, kind, items.length));
  }

  main.append(card);
  page.append(main);
  return page;
}

function mixTokens(card: MixCard): string[] | undefined {
  return card.kind === "scramble" ? (card.item as ScrambleItem).tokens : undefined;
}

function getMixSession(lesson: Lesson): Session {
  const key = `${lesson.id}:mix`;
  const existing = sessions.get(key);
  if (existing) return existing;
  const mixDeck = shuffle(collectMixCards(lesson), `${lesson.id}:mix`);
  const first = mixDeck[0];
  const created: Session = {
    key,
    index: 0,
    status: "idle",
    input: "",
    selected: [],
    bank: first && mixTokens(first) ? shuffle(mixTokens(first) as string[], first.item.id) : [],
    results: [],
    checkedOnce: false,
    mixDeck,
  };
  sessions.set(key, created);
  return created;
}

function renderMix(lesson: Lesson): HTMLElement {
  const session = getMixSession(lesson);
  const deck = session.mixDeck ?? [];
  const mixTrack: Track = { type: "mix" };

  if (deck.length === 0) {
    return el("div", { class: "page" },
      el("main", { class: "shell" },
        el("h1", { text: "No mixed items yet" }),
        el("a", { class: "text-link", href: href({ name: "hub", lessonId: lesson.id }), text: "Back" }),
      ),
    );
  }

  if (session.index >= deck.length) {
    return renderSummary(lesson, mixTrack, "fill", session, deck.length);
  }

  const current = deck[session.index];
  const meta = EXERCISE_META[current.kind];
  const progress = `${session.index + 1} / ${deck.length}`;

  const page = el("div", { class: "page" },
    el("header", { class: "topbar" },
      el("a", { class: "back", href: href({ name: "hub", lessonId: lesson.id }), text: "← Lesson" }),
      el("div", { class: "progress-wrap" },
        el("p", { class: "progress-label", text: `Mix · ${current.grammarTitle} · ${meta.title} · ${progress}` }),
        el("div", { class: "bar", role: "progressbar", "aria-valuenow": session.index + 1, "aria-valuemax": deck.length },
          el("span", { style: `width:${(session.index / deck.length) * 100}%` }),
        ),
      ),
    ),
  );

  const main = el("main", { class: "shell shell--narrow" });
  const workbook = el("section", { class: "workbook" });
  workbook.append(el("p", { class: "kicker", text: `${current.grammarTitle} · ${meta.title}` }));

  if (current.kind === "fill") {
    workbook.append(renderFill(current.item as FillItem, session, lesson, mixTrack, current.kind, deck.length));
  } else if (current.kind === "scramble") {
    workbook.append(renderScramble(current.item as ScrambleItem, session, lesson, mixTrack, current.kind, deck.length));
  } else {
    workbook.append(renderTranslate(current.item as TranslateItem, session, lesson, mixTrack, current.kind, deck.length));
  }

  main.append(workbook);
  page.append(main);
  return page;
}

function appendFeedback(
  parent: HTMLElement,
  status: CheckStatus,
  answers: string[],
  tip: string,
): void {
  const box = feedbackBox(status, answers, tip);
  if (box) parent.append(box);
}

function focusFirstField(): void {
  const field = root.querySelector<HTMLElement>("input, textarea");
  field?.focus();
}

function feedbackBox(status: CheckStatus, answers: string[], tip: string): HTMLElement | null {
  if (status === "idle") return null;
  const accepted = displayAnswers(answers);
  if (status === "correct") {
    return el("div", { class: "feedback feedback--ok" },
      el("p", { class: "feedback-title", text: "Correct" }),
      el("p", { class: "hanzi-inline", text: accepted[0] ?? "" }),
    );
  }
  const box = el("div", { class: "feedback feedback--no" },
    el("p", { class: "feedback-title", text: status === "revealed" ? "Answer" : "Not yet" }),
    el("p", { class: "muted", text: tip }),
  );
  if (status === "revealed") {
    box.append(
      el("ul", { class: "answer-list" },
        ...accepted.map((answer) => el("li", { class: "hanzi-inline", text: answer })),
      ),
    );
  }
  return box;
}

function actionRow(options: {
  status: CheckStatus;
  onCheck: () => void;
  onReveal: () => void;
  onRetry: () => void;
  onNext: () => void;
  last: boolean;
}): HTMLElement {
  const row = el("div", { class: "actions" });
  if (options.status === "idle" || options.status === "wrong") {
    const check = el("button", { class: "btn btn--primary", type: "button", text: "Check" });
    check.addEventListener("click", options.onCheck);
    row.append(check);
  }
  if (options.status === "wrong") {
    const reveal = el("button", { class: "btn", type: "button", text: "Show answer" });
    reveal.addEventListener("click", options.onReveal);
    row.append(reveal);
  }
  if (options.status === "wrong" || options.status === "revealed") {
    const retry = el("button", { class: "btn", type: "button", text: "Try again" });
    retry.addEventListener("click", options.onRetry);
    row.append(retry);
  }
  if (options.status === "correct" || options.status === "revealed") {
    const next = el("button", { class: "btn btn--primary", type: "button", text: options.last ? "See results" : "Next" });
    next.addEventListener("click", options.onNext);
    row.append(next);
  }
  return row;
}

function advance(
  lesson: Lesson,
  track: Track,
  kind: ExerciseKind,
  session: Session,
  total: number,
): void {
  if (session.status === "correct") {
    markResult(session, session.index, "correct");
  } else if (session.status === "revealed") {
    markResult(session, session.index, session.checkedOnce ? "wrong" : "skipped");
  }
  session.index += 1;
  if (session.index < total) {
    if (track.type === "mix" && session.mixDeck) {
      const next = session.mixDeck[session.index];
      resetItem(session, next.item.id, mixTokens(next));
    } else {
      const items = getTrackItems(lesson, track, kind);
      const next = items[session.index];
      const tokens = kind === "scramble" ? (next as ScrambleItem).tokens : undefined;
      resetItem(session, next.id, tokens);
    }
  }
  render();
}

function renderFill(
  item: FillItem,
  session: Session,
  lesson: Lesson,
  track: Track,
  kind: ExerciseKind,
  total: number,
): HTMLElement {
  const wrap = el("div");
  wrap.append(
    el("h2", { text: "Fill the gap" }),
    el("p", { class: "prompt", text: item.prompt }),
  );

  const parts = item.template.split("____");
  const field = el("input", {
    class: "blank",
    type: "text",
    name: "answer",
    id: "answer-field",
    autocomplete: "off",
    spellcheck: "false",
    "aria-label": "Answer",
    value: session.input,
    placeholder: "汉字 or pinyin",
  }) as HTMLInputElement;
  field.value = session.input;
  if (session.status === "correct") field.disabled = true;
  field.addEventListener("input", () => {
    session.input = field.value;
  });

  const sentence = el("p", { class: "sentence" }, parts[0] ?? "", field, parts[1] ?? "");
  wrap.append(sentence, el("p", { class: "pinyin", text: item.pinyin }));

  const last = session.index === total - 1;
  const check = () => {
    session.checkedOnce = true;
    session.status = matchesAnswer(session.input, item.answers) ? "correct" : "wrong";
    render();
  };
  field.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (session.status === "idle" || session.status === "wrong") check();
    }
  });

  appendFeedback(wrap, session.status, item.answers, item.tip);
  wrap.append(
    actionRow({
      status: session.status,
      onCheck: check,
      onReveal: () => {
        session.status = "revealed";
        render();
      },
      onRetry: () => {
        resetItem(session, item.id);
        render();
        queueMicrotask(focusFirstField);
      },
      onNext: () => advance(lesson, track, kind, session, total),
      last,
    }),
  );
  return wrap;
}

function renderScramble(
  item: ScrambleItem,
  session: Session,
  lesson: Lesson,
  track: Track,
  kind: ExerciseKind,
  total: number,
): HTMLElement {
  if (session.bank.length === 0 && session.selected.length === 0) {
    session.bank = shuffle(item.tokens, item.id);
  }

  const wrap = el("div");
  wrap.append(
    el("h2", { text: "Put the words in order" }),
    el("p", { class: "prompt", text: item.prompt }),
  );

  const built = el("div", { class: "tile-row tile-row--target", "aria-label": "Sentence" });
  if (session.selected.length === 0) {
    built.append(el("p", { class: "placeholder", text: "Tap the words below" }));
  }
  session.selected.forEach((token, index) => {
    const chip = el("button", { class: "tile tile--in", type: "button", text: token });
    chip.addEventListener("click", () => {
      if (session.status === "correct") return;
      session.selected.splice(index, 1);
      session.bank.push(token);
      if (session.status === "wrong") session.status = "idle";
      render();
    });
    built.append(chip);
  });

  const bank = el("div", { class: "tile-row", "aria-label": "Words" });
  session.bank.forEach((token, index) => {
    const chip = el("button", { class: "tile", type: "button", text: token });
    chip.addEventListener("click", () => {
      if (session.status === "correct") return;
      session.bank.splice(index, 1);
      session.selected.push(token);
      if (session.status === "wrong") session.status = "idle";
      render();
    });
    bank.append(chip);
  });

  wrap.append(built, bank);

  const last = session.index === total - 1;
  appendFeedback(wrap, session.status, item.answers, item.tip);
  wrap.append(
    actionRow({
      status: session.status,
      onCheck: () => {
        session.checkedOnce = true;
        const guess = session.selected.join("");
        session.status = matchesAnswer(guess, item.answers) ? "correct" : "wrong";
        render();
      },
      onReveal: () => {
        session.status = "revealed";
        render();
      },
      onRetry: () => {
        resetItem(session, item.id, item.tokens);
        render();
      },
      onNext: () => advance(lesson, track, kind, session, total),
      last,
    }),
  );
  return wrap;
}

function renderTranslate(
  item: TranslateItem,
  session: Session,
  lesson: Lesson,
  track: Track,
  kind: ExerciseKind,
  total: number,
): HTMLElement {
  const wrap = el("div");
  wrap.append(
    el("h2", { text: "Translate into Chinese" }),
    el("p", { class: "prompt", text: item.source }),
  );

  const field = el("textarea", {
    class: "writer",
    name: "answer",
    id: "answer-field",
    rows: 3,
    autocomplete: "off",
    spellcheck: "false",
    placeholder: "Write in 汉字…",
    "aria-label": "Chinese answer",
  }) as HTMLTextAreaElement;
  field.value = session.input;
  if (session.status === "correct") field.disabled = true;
  field.addEventListener("input", () => {
    session.input = field.value;
  });
  wrap.append(field);

  const last = session.index === total - 1;
  const check = () => {
    session.checkedOnce = true;
    session.status = matchesAnswer(session.input, item.answers) ? "correct" : "wrong";
    render();
  };
  field.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (session.status === "idle" || session.status === "wrong") check();
    }
  });

  appendFeedback(wrap, session.status, item.answers, item.tip);
  wrap.append(
    actionRow({
      status: session.status,
      onCheck: check,
      onReveal: () => {
        session.status = "revealed";
        render();
      },
      onRetry: () => {
        resetItem(session, item.id);
        render();
        queueMicrotask(focusFirstField);
      },
      onNext: () => advance(lesson, track, kind, session, total),
      last,
    }),
  );
  return wrap;
}

function renderSummary(
  lesson: Lesson,
  track: Track,
  kind: ExerciseKind,
  session: Session,
  totalOverride?: number,
): HTMLElement {
  const total = totalOverride ?? getTrackItems(lesson, track, kind).length;
  const correct = session.results.filter((result) => result === "correct").length;
  const wrong = session.results.filter((result) => result === "wrong").length;
  const skipped = session.results.filter((result) => result === "skipped").length;
  const meta = EXERCISE_META[kind];
  const nextKind = track.type === "mix" ? undefined : EXERCISE_ORDER[EXERCISE_ORDER.indexOf(kind) + 1];
  const label = trackLabel(lesson, track);
  const backHref = track.type === "mix"
    ? href({ name: "hub", lessonId: lesson.id })
    : href({ name: "track", lessonId: lesson.id, track });

  const restart = el("button", { class: "btn btn--primary", type: "button", text: "Practice this set again" });
  restart.addEventListener("click", () => {
    sessions.delete(session.key);
    render();
  });

  const actions = el("div", { class: "actions" }, restart);
  if (nextKind) {
    actions.append(
      el("a", {
        class: "btn",
        href: href({ name: "exercise", lessonId: lesson.id, track, kind: nextKind }),
        text: `Continue: ${EXERCISE_META[nextKind].title}`,
      }),
    );
  }
  actions.append(
    el("a", { class: "btn", href: backHref, text: track.type === "mix" ? "Back to the lesson" : `Back to ${label}` }),
  );

  return el("div", { class: "page" },
    el("header", { class: "topbar" },
      el("a", { class: "back", href: backHref, text: `← ${label}` }),
    ),
    el("main", { class: "shell shell--narrow" },
      el("section", { class: "workbook" },
        el("p", { class: "kicker", text: track.type === "mix" ? "Mixed practice" : `${label} · ${meta.title}` }),
        el("h2", { text: "Set finished" }),
        el("p", { class: "score", text: `${correct} / ${total} correct on a first pass or after retrying.` }),
        el("ul", { class: "score-list" },
          el("li", { text: `${correct} correct` }),
          el("li", { text: `${wrong} revealed` }),
          el("li", { text: `${skipped} skipped` }),
        ),
        el("p", { class: "muted", text: "Progress is not saved. Reload and you start over." }),
        actions,
      ),
    ),
  );
}

export function startApp(): void {
  window.addEventListener("hashchange", render);
  if (!location.hash) location.hash = "#/";
  render();
}
