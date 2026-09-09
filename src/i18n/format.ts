/**
 * Locale-aware formatting for the values that are not words.
 *
 * Translating the labels is only part of the job. `4.5` is written `4,5` in
 * Spanish and `10 January 2026` is `10 de enero de 2026`, so a number or date
 * pushed straight into the DOM stays visibly English however well the sentence
 * around it is translated. `Intl` already knows every one of these rules, so
 * these helpers exist only to hand it the active language.
 */

/** `0.42` becomes `42%` in English and `42 %` in Spanish. */
export function formatPercent(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value);
}

/** `4.5` becomes `4.5` in English and `4,5` in Spanish. */
export function formatDecimal(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Formats a `YYYY-MM-DD` date from the API.
 *
 * The time is appended deliberately. `new Date('2026-01-10')` is parsed as
 * midnight UTC, which in any timezone behind UTC renders as the 9th; adding
 * `T00:00:00` makes it midnight *locally* and keeps the date the user stored.
 *
 * An unparseable value is returned untouched rather than shown as
 * "Invalid Date", since the raw string is at least still readable.
 */
export function formatDate(isoDate: string, language: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(parsed);
}
