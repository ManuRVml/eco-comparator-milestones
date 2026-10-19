/** Terms forbidden on client-facing routes. check-copy.mjs imports this list unchanged. */
export const VOCABULARY_TERMS = [
  { term: "HU-", regex: /HU-/gi },
  { term: "SP", regex: /\bSP\b/gi },
  { term: "story point", regex: /\bstory point\b/gi },
  { term: "sprint", regex: /\bsprint\b/gi },
  { term: "épica", regex: /\b(épica|epic)\b/gi },
  { term: "backlog", regex: /\bbacklog\b/gi },
  { term: "ruta crítica", regex: /\bruta crítica\b/gi },
  { term: "velocity", regex: /\bvelocity\b/gi },
  { term: "QA", regex: /\bQA\b/gi },
  { term: "E2E", regex: /\bE2E\b/gi },
  { term: "Gold", regex: /\bGold\b/gi },
  { term: "Silver", regex: /\bSilver\b/gi },
  { term: "Bronze", regex: /\bBronze\b/gi },
];
