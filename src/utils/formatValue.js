/**
 * formatValue — scales any number cleanly for display in stat cards.
 * Works for counts (13 → "13", 300000 → "300K", 1500000 → "1.5M")
 * and decimal scores (0.62943 → "0.629", 67.5 → "67.5").
 *
 * @param {number|string|null|undefined} value
 * @param {"count"|"epss"|"score"|"auto"} [type="auto"]
 * @returns {string}
 */
export function formatValue(value, type = "auto") {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);

  // Explicit decimal types
  if (type === "epss") return n.toFixed(3);
  if (type === "score") return n.toFixed(1);

  // Auto: decide by magnitude
  if (type === "auto" || type === "count") {
    // Small decimals (EPSS-like)
    if (n > 0 && n < 1) return n.toFixed(3);
    // Whole numbers or large decimals
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
    if (n >= 100_000)   return Math.round(n / 1_000) + "K";
    if (n >= 10_000)    return (n / 1_000).toFixed(1) + "K";
    // Single decimal scores like 67.5
    if (!Number.isInteger(n) && n < 1000) return n.toFixed(1);
    return n.toLocaleString();
  }

  return n.toLocaleString();
}
