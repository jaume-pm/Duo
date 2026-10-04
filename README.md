# Duo

Cuaderno local de **HSK 2**. La v1 cubre solo la **primera lección**: 去机场接朋友 (*Pick up friends at the airport*).

No hay cuentas, servidor ni progreso guardado. Todo corre en el navegador, con el texto, la tabla de palabras y la gramática de esa lección (已经…了, 着, 是不是, V+一下).

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:4721`).

En GitHub Pages: https://jaume-pm.github.io/Duo/  
Repositorio: https://github.com/jaume-pm/Duo

Para una build estática:

```bash
npm run build
npm run preview
```

## Qué hay dentro

1. **Completar** — huecos de vocabulario y gramática.
2. **Ordenar** — rearmar frases del texto.
3. **Escritura guiada** — una estructura + un prompt; se aceptan unas pocas variantes equivalentes.
4. **Traducir** — EN/ES → 中, solo con material de la lección.
5. **Minidiálogo** — completar la réplica que falta.

La lección está en `src/data/lesson-01.json`. Para una lección 2, añade otro JSON con la misma forma y regístralo en `src/data/lessons.ts`.

## Contenido

El material de la lección 1 sigue las notas *Everyday Chinese* (diálogos, Words y Grammar). Las frases de práctica no inventan vocabulario HSK 2 fuera de esa lección.
