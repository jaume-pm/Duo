import { displayAnswers, matchesAnswer } from "./check";
import { getItems, getLesson, lessons } from "./data/lessons";
import {
  EXERCISE_META,
  EXERCISE_ORDER,
  type DialogueItem,
  type ExerciseKind,
  type FillItem,
  type GuidedItem,
  type Lesson,
  type ScrambleItem,
  type TranslateItem,
} from "./types";
import { el, shuffle } from "./ui";

type Route =
  | { name: "home" }
  | { name: "hub"; lessonId: string }
  | { name: "exercise"; lessonId: string; kind: ExerciseKind };

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
};

const KINDS = new Set<string>(EXERCISE_ORDER);
const appNode = document.querySelector<HTMLDivElement>("#app");
if (!appNode) throw new Error("Missing #app");
const root: HTMLDivElement = appNode;

const sessions = new Map<string, Session>();

function parseRoute(): Route {
  const hash = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "l" && parts[1]) {
    const kind = parts[2];
    if (kind && KINDS.has(kind)) {
      return {
        name: "exercise",
        lessonId: parts[1],
        kind: kind as ExerciseKind,
      };
    }
    return { name: "hub", lessonId: parts[1] };
  }
  return { name: "home" };
}

function href(route: Route): string {
  if (route.name === "home") return "#/";
  if (route.name === "hub") return `#/l/${route.lessonId}`;
  return `#/l/${route.lessonId}/${route.kind}`;
}

function sessionKey(lessonId: string, kind: ExerciseKind): string {
  return `${lessonId}:${kind}`;
}

function getSession(
  lessonId: string,
  kind: ExerciseKind,
  itemId: string,
  tokens?: string[],
): Session {
  const key = sessionKey(lessonId, kind);
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
  root.append(renderExercise(lesson, route.kind));
}

function renderHome(): HTMLElement {
  const lesson = lessons[0];
  return el("div", { class: "page" },
    el("header", { class: "topbar" },
      el("div", { class: "brand" },
        el("span", { class: "seal", text: "双" }),
        el("div", {},
          el("p", { class: "eyebrow", text: "Cuaderno local" }),
          el("h1", { text: "Duo" }),
        ),
      ),
    ),
    el("main", { class: "shell" },
      el("section", { class: "hero" },
        el("p", { class: "kicker", text: "HSK 2 · solo lo que enseña cada lección" }),
        el("h2", { text: "Un workbook chino, lección a lección." }),
        el("p", { class: "lede" },
          "Escribes y formas frases con el vocabulario y la gramática de ",
          el("em", { text: "esta" }),
          " lección. Nada inventado de otras unidades.",
        ),
      ),
      el("a", { class: "lesson-card", href: href({ name: "hub", lessonId: lesson.id }) },
        el("div", { class: "lesson-card__meta" },
          el("span", { class: "chip", text: `Lección ${lesson.number}` }),
          el("span", { class: "muted", text: lesson.sourceNote }),
        ),
        el("p", { class: "hanzi-title", text: `第一课 ${lesson.titleZh}` }),
        el("p", { class: "pinyin", text: "Qù jīchǎng jiē péngyou" }),
        el("p", { class: "card-en", text: lesson.titleEn }),
        el("p", { class: "card-es", text: lesson.titleEs }),
        el("p", { class: "card-stats", text: `${lesson.words.length} palabras · ${lesson.grammar.length} puntos gramaticales · 5 tipos de ejercicio` }),
        el("span", { class: "card-cta", text: "Abrir lección →" }),
      ),
      el("p", { class: "footnote", text: "v1 cubre solo la lección 1. La lección 2 se podrá añadir como otro JSON en src/data/." }),
    ),
  );
}

function renderMissing(): HTMLElement {
  return el("div", { class: "page" },
    el("main", { class: "shell" },
      el("h1", { text: "Lección no encontrada" }),
      el("a", { class: "text-link", href: "#/", text: "Volver al inicio" }),
    ),
  );
}

function renderHub(lesson: Lesson): HTMLElement {
  const vocab = el("div", { class: "vocab-grid" });
  for (const word of lesson.words) {
    vocab.append(
      el("article", { class: "vocab-item" },
        el("p", { class: "vocab-hanzi", text: word.hanzi }),
        el("p", { class: "pinyin", text: word.pinyin }),
        el("p", { class: "vocab-pos", text: word.pos }),
        el("p", { class: "vocab-meaning", text: `${word.meaningEs} · ${word.meaningEn}` }),
      ),
    );
  }

  const grammar = el("div", { class: "grammar-grid" });
  for (const point of lesson.grammar) {
    grammar.append(
      el("article", { class: "grammar-card" },
        el("h3", { text: point.title }),
        el("p", { class: "structure", text: point.structure }),
        el("p", { class: "muted", text: point.summaryEs }),
        el("p", { class: "hanzi-inline", text: point.exampleHanzi }),
        el("p", { class: "pinyin", text: point.examplePinyin }),
      ),
    );
  }

  const texts = el("div", { class: "dialogue-stack" });
  for (const dialogue of lesson.dialogues) {
    const body = el("div", { class: "dialogue-body" });
    for (const line of dialogue.lines) {
      body.append(
        el("div", { class: "line" },
          el("span", { class: "speaker", text: line.speaker }),
          el("div", {},
            el("p", { class: "hanzi-inline", text: line.hanzi }),
            el("p", { class: "pinyin", text: line.pinyin }),
            el("p", { class: "muted", text: line.en }),
          ),
        ),
      );
    }
    texts.append(
      el("details", { class: "fold" },
        el("summary", { text: dialogue.title }),
        body,
      ),
    );
  }

  const exercises = el("div", { class: "exercise-grid" });
  for (const kind of EXERCISE_ORDER) {
    const meta = EXERCISE_META[kind];
    const count = getItems(lesson, kind).length;
    exercises.append(
      el("a", { class: "ex-card", href: href({ name: "exercise", lessonId: lesson.id, kind }) },
        el("span", { class: "ex-num", text: String(meta.index).padStart(2, "0") }),
        el("h3", { text: meta.title }),
        el("p", { class: "muted", text: meta.blurb }),
        el("p", { class: "ex-count", text: `${count} ítems` }),
      ),
    );
  }

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
        el("p", { class: "kicker", text: `Lección ${lesson.number}` }),
        el("h1", { class: "hanzi-title", text: `第一课 ${lesson.titleZh}` }),
        el("p", { class: "card-en", text: lesson.titleEn }),
        el("p", { class: "lede", text: "Practica solo con el texto, la tabla de palabras y los cuatro puntos gramaticales de esta lección." }),
      ),
      el("section", { class: "block" },
        el("h2", { text: "Ejercicios" }),
        exercises,
      ),
      el("section", { class: "block" },
        el("h2", { text: "Palabras" }),
        el("p", { class: "muted", text: "Tabla de la lección. Úsalas en los ejercicios; no añadas vocabulario de otras unidades." }),
        vocab,
      ),
      el("section", { class: "block" },
        el("h2", { text: "Gramática" }),
        grammar,
      ),
      el("section", { class: "block" },
        el("h2", { text: "Textos" }),
        texts,
      ),
    ),
  );
}

function renderExercise(lesson: Lesson, kind: ExerciseKind): HTMLElement {
  const items = getItems(lesson, kind);
  const meta = EXERCISE_META[kind];
  const firstTokens = kind === "scramble" ? (items[0] as ScrambleItem).tokens : undefined;
  const firstId = items[0] && "id" in items[0] ? items[0].id : kind;
  const session = getSession(lesson.id, kind, firstId, firstTokens);

  if (session.index >= items.length) {
    return renderSummary(lesson, kind, session);
  }

  const item = items[session.index];
  const progress = `${session.index + 1} / ${items.length}`;

  const page = el("div", { class: "page" },
    el("header", { class: "topbar" },
      el("a", { class: "back", href: href({ name: "hub", lessonId: lesson.id }), text: "← Lección 1" }),
      el("div", { class: "progress-wrap" },
        el("p", { class: "progress-label", text: `${meta.title} · ${progress}` }),
        el("div", { class: "bar", role: "progressbar", "aria-valuenow": session.index + 1, "aria-valuemax": items.length },
          el("span", { style: `width:${((session.index) / items.length) * 100}%` }),
        ),
      ),
    ),
  );

  const main = el("main", { class: "shell shell--narrow" });
  const card = el("section", { class: "workbook" });
  card.append(el("p", { class: "kicker", text: `Ítem ${session.index + 1}` }));

  if (kind === "fill") {
    card.append(renderFill(item as FillItem, session, lesson, kind));
  } else if (kind === "scramble") {
    card.append(renderScramble(item as ScrambleItem, session, lesson, kind));
  } else if (kind === "guided") {
    card.append(renderGuided(item as GuidedItem, session, lesson, kind));
  } else if (kind === "translate") {
    card.append(renderTranslate(item as TranslateItem, session, lesson, kind));
  } else {
    card.append(renderDialogue(item as DialogueItem, session, lesson, kind));
  }

  main.append(card);
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
      el("p", { class: "feedback-title", text: "Correcto" }),
      el("p", { class: "hanzi-inline", text: accepted[0] ?? "" }),
    );
  }
  const box = el("div", { class: "feedback feedback--no" },
    el("p", { class: "feedback-title", text: status === "revealed" ? "Respuesta" : "Aún no" }),
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
    const check = el("button", { class: "btn btn--primary", type: "button", text: "Comprobar" });
    check.addEventListener("click", options.onCheck);
    row.append(check);
  }
  if (options.status === "wrong") {
    const reveal = el("button", { class: "btn", type: "button", text: "Mostrar respuesta" });
    reveal.addEventListener("click", options.onReveal);
    row.append(reveal);
  }
  if (options.status === "wrong" || options.status === "revealed") {
    const retry = el("button", { class: "btn", type: "button", text: "Reintentar" });
    retry.addEventListener("click", options.onRetry);
    row.append(retry);
  }
  if (options.status === "correct" || options.status === "revealed") {
    const next = el("button", { class: "btn btn--primary", type: "button", text: options.last ? "Ver resultado" : "Siguiente" });
    next.addEventListener("click", options.onNext);
    row.append(next);
  }
  return row;
}

function advance(
  lesson: Lesson,
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
    const items = getItems(lesson, kind);
    const next = items[session.index];
    const tokens = kind === "scramble" ? (next as ScrambleItem).tokens : undefined;
    resetItem(session, next.id, tokens);
  }
  render();
}

function renderFill(
  item: FillItem,
  session: Session,
  lesson: Lesson,
  kind: ExerciseKind,
): HTMLElement {
  const wrap = el("div");
  wrap.append(
    el("h2", { text: "Completa el hueco" }),
    el("p", { class: "prompt", text: item.promptEs }),
    el("p", { class: "muted", text: item.promptEn }),
  );

  const parts = item.template.split("____");
  const field = el("input", {
    class: "blank",
    type: "text",
    autocomplete: "off",
    spellcheck: "false",
    "aria-label": "Respuesta",
    value: session.input,
    placeholder: "汉字 o pinyin",
  }) as HTMLInputElement;
  field.value = session.input;
  if (session.status === "correct") field.disabled = true;
  field.addEventListener("input", () => {
    session.input = field.value;
  });

  const sentence = el("p", { class: "sentence" }, parts[0] ?? "", field, parts[1] ?? "");
  wrap.append(sentence, el("p", { class: "pinyin", text: item.pinyin }));

  const last = session.index === getItems(lesson, kind).length - 1;
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
      onNext: () => advance(lesson, kind, session, getItems(lesson, kind).length),
      last,
    }),
  );
  return wrap;
}

function renderScramble(
  item: ScrambleItem,
  session: Session,
  lesson: Lesson,
  kind: ExerciseKind,
): HTMLElement {
  if (session.bank.length === 0 && session.selected.length === 0) {
    session.bank = shuffle(item.tokens, item.id);
  }

  const wrap = el("div");
  wrap.append(
    el("h2", { text: "Ordena las palabras" }),
    el("p", { class: "prompt", text: item.promptEs }),
    el("p", { class: "muted", text: item.promptEn }),
  );

  const built = el("div", { class: "tile-row tile-row--target", "aria-label": "Frase" });
  if (session.selected.length === 0) {
    built.append(el("p", { class: "placeholder", text: "Toca las palabras de abajo" }));
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

  const bank = el("div", { class: "tile-row", "aria-label": "Palabras" });
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

  const last = session.index === getItems(lesson, kind).length - 1;
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
      onNext: () => advance(lesson, kind, session, getItems(lesson, kind).length),
      last,
    }),
  );
  return wrap;
}

function renderTextExercise(
  title: string,
  structure: string | null,
  promptEs: string,
  promptEn: string,
  answers: string[],
  tip: string,
  session: Session,
  lesson: Lesson,
  kind: ExerciseKind,
  itemId: string,
): HTMLElement {
  const wrap = el("div");
  wrap.append(el("h2", { text: title }));
  if (structure) {
    wrap.append(el("p", { class: "structure-pill", text: structure }));
  }
  wrap.append(
    el("p", { class: "prompt", text: promptEs }),
    el("p", { class: "muted", text: promptEn }),
  );

  const field = el("textarea", {
    class: "writer",
    rows: 3,
    autocomplete: "off",
    spellcheck: "false",
    placeholder: "Escribe en 汉字…",
    "aria-label": "Respuesta en chino",
  }) as HTMLTextAreaElement;
  field.value = session.input;
  if (session.status === "correct") field.disabled = true;
  field.addEventListener("input", () => {
    session.input = field.value;
  });
  wrap.append(field);

  const last = session.index === getItems(lesson, kind).length - 1;
  const check = () => {
    session.checkedOnce = true;
    session.status = matchesAnswer(session.input, answers) ? "correct" : "wrong";
    render();
  };
  field.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (session.status === "idle" || session.status === "wrong") check();
    }
  });

  appendFeedback(wrap, session.status, answers, tip);
  wrap.append(
    actionRow({
      status: session.status,
      onCheck: check,
      onReveal: () => {
        session.status = "revealed";
        render();
      },
      onRetry: () => {
        resetItem(session, itemId);
        render();
        queueMicrotask(focusFirstField);
      },
      onNext: () => advance(lesson, kind, session, getItems(lesson, kind).length),
      last,
    }),
  );
  return wrap;
}

function renderGuided(
  item: GuidedItem,
  session: Session,
  lesson: Lesson,
  kind: ExerciseKind,
): HTMLElement {
  return renderTextExercise(
    "Escritura guiada",
    item.structure,
    item.promptEs,
    item.promptEn,
    item.answers,
    item.tip,
    session,
    lesson,
    kind,
    item.id,
  );
}

function renderTranslate(
  item: TranslateItem,
  session: Session,
  lesson: Lesson,
  kind: ExerciseKind,
): HTMLElement {
  return renderTextExercise(
    "Traduce al chino",
    null,
    item.sourceEs,
    item.sourceEn,
    item.answers,
    item.tip,
    session,
    lesson,
    kind,
    item.id,
  );
}

function renderDialogue(
  item: DialogueItem,
  session: Session,
  lesson: Lesson,
  kind: ExerciseKind,
): HTMLElement {
  const wrap = el("div");
  wrap.append(
    el("h2", { text: item.title }),
    el("p", { class: "muted", text: item.contextEs }),
  );

  const stack = el("div", { class: "mini-dialogue" });
  let blankAnswers: string[] = [];
  let blankTip = "";
  let blankId = item.id;

  for (const line of item.lines) {
    if (line.kind === "given") {
      stack.append(
        el("div", { class: "bubble bubble--given" },
          el("span", { class: "speaker", text: line.speaker }),
          el("p", { class: "hanzi-inline", text: line.hanzi }),
          el("p", { class: "pinyin", text: line.pinyin }),
        ),
      );
    } else {
      blankAnswers = line.answers;
      blankTip = line.tip;
      blankId = `${item.id}-${line.speaker}`;
      const field = el("textarea", {
        class: "writer",
        rows: 3,
        autocomplete: "off",
        spellcheck: "false",
        placeholder: "Escribe la réplica…",
        "aria-label": `Réplica de ${line.speaker}`,
      }) as HTMLTextAreaElement;
      field.value = session.input;
      if (session.status === "correct") field.disabled = true;
      field.addEventListener("input", () => {
        session.input = field.value;
      });
      field.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          document.querySelector<HTMLButtonElement>(".btn--primary")?.click();
        }
      });
      stack.append(
        el("div", { class: "bubble bubble--blank" },
          el("span", { class: "speaker", text: line.speaker }),
          el("p", { class: "prompt", text: line.hintEs }),
          el("p", { class: "muted", text: line.hintEn }),
          field,
        ),
      );
    }
  }

  wrap.append(stack);

  const last = session.index === getItems(lesson, kind).length - 1;
  appendFeedback(wrap, session.status, blankAnswers, blankTip);
  wrap.append(
    actionRow({
      status: session.status,
      onCheck: () => {
        session.checkedOnce = true;
        session.status = matchesAnswer(session.input, blankAnswers) ? "correct" : "wrong";
        render();
      },
      onReveal: () => {
        session.status = "revealed";
        render();
      },
      onRetry: () => {
        resetItem(session, blankId);
        render();
        queueMicrotask(focusFirstField);
      },
      onNext: () => advance(lesson, kind, session, getItems(lesson, kind).length),
      last,
    }),
  );
  return wrap;
}

function renderSummary(lesson: Lesson, kind: ExerciseKind, session: Session): HTMLElement {
  const total = getItems(lesson, kind).length;
  const correct = session.results.filter((result) => result === "correct").length;
  const wrong = session.results.filter((result) => result === "wrong").length;
  const skipped = session.results.filter((result) => result === "skipped").length;
  const meta = EXERCISE_META[kind];
  const nextKind = EXERCISE_ORDER[EXERCISE_ORDER.indexOf(kind) + 1];

  const restart = el("button", { class: "btn btn--primary", type: "button", text: "Repetir esta sección" });
  restart.addEventListener("click", () => {
    sessions.delete(session.key);
    render();
  });

  const actions = el("div", { class: "actions" }, restart);
  if (nextKind) {
    actions.append(
      el("a", {
        class: "btn",
        href: href({ name: "exercise", lessonId: lesson.id, kind: nextKind }),
        text: `Seguir: ${EXERCISE_META[nextKind].title}`,
      }),
    );
  }
  actions.append(
    el("a", { class: "btn", href: href({ name: "hub", lessonId: lesson.id }), text: "Volver a la lección" }),
  );

  return el("div", { class: "page" },
    el("header", { class: "topbar" },
      el("a", { class: "back", href: href({ name: "hub", lessonId: lesson.id }), text: "← Lección 1" }),
    ),
    el("main", { class: "shell shell--narrow" },
      el("section", { class: "workbook" },
        el("p", { class: "kicker", text: meta.title }),
        el("h2", { text: "Sección terminada" }),
        el("p", { class: "score", text: `${correct} / ${total} bien a la primera o tras reintentar y acertar.` }),
        el("ul", { class: "score-list" },
          el("li", { text: `${correct} correctas` }),
          el("li", { text: `${wrong} con respuesta vista` }),
          el("li", { text: `${skipped} saltadas` }),
        ),
        el("p", { class: "muted", text: "El progreso no se guarda: al recargar la página, empiezas de nuevo." }),
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
