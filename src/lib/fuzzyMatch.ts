import Fuse from 'fuse.js';

/**
 * Fuzzy match two single-word or short answers.
 * Returns true if the answers are considered a match.
 * Normalizes input: trims, lowercases, removes punctuation and extra whitespace.
 */
export function normalizeAnswer(ans: string): string {
  return ans
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ');
}

export function fuzzyMatch(answer1: string, answer2: string): boolean {
  const a1 = normalizeAnswer(answer1);
  const a2 = normalizeAnswer(answer2);

  // Exact match
  if (a1 === a2) return true;

  // Empty answers never match
  if (!a1 || !a2) return false;

  // Substring match for single words (e.g. "chocolate" in "dark chocolate")
  if (a1.length >= 3 && a2.length >= 3) {
    if (a1.includes(a2) || a2.includes(a1)) {
      return true;
    }
  }

  // Use Fuse.js for fuzzy matching
  const fuse = new Fuse([a1], {
    includeScore: true,
    threshold: 0.35, // Typos allowed
    distance: 100,
  });

  const results = fuse.search(a2);

  if (results.length > 0 && results[0].score !== undefined) {
    if (results[0].score < 0.35) return true;
  }

  // Levenshtein distance fallback
  const distance = levenshteinDistance(a1, a2);
  const maxLen = Math.max(a1.length, a2.length);
  const similarity = 1 - distance / maxLen;

  return similarity >= 0.7; // 70% similarity threshold
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if two answers match - handles both option and text types
 */
export function answersMatch(
  answer1: string,
  answer2: string,
  questionType: 'option' | 'text'
): boolean {
  if (questionType === 'option') {
    // For option questions, exact normalized match
    return normalizeAnswer(answer1) === normalizeAnswer(answer2);
  }
  // For text questions, use fuzzy matching
  return fuzzyMatch(answer1, answer2);
}
