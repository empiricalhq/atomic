// Floats lose precision when summed directly (0.1 + 0.2 !== 0.3), so every
// money total is rounded to cents first and summed as integers.
//
// Reads cents off toFixed(10)'s digits and rounds half up on the third
// decimal, because multiplying by 100 first shifts values like 1.005 across
// the rounding boundary (1.005 * 100 === 100.49999999999999).
export const toCents = (amount: number): number => {
  if (!Number.isFinite(amount)) return NaN;
  const negative = amount < 0;
  const [wholePart, fractionPart = ''] = Math.abs(amount).toFixed(10).split('.');
  const whole = Number(wholePart);
  const hundredths = Number(fractionPart.slice(0, 2));
  const roundsUp = Number(fractionPart[2]) >= 5;
  const cents = whole * 100 + hundredths + (roundsUp ? 1 : 0);
  return negative ? -cents : cents;
};

export const fromCents = (cents: number): number => cents / 100;

export const sumMoney = (amounts: number[]): number =>
  fromCents(amounts.reduce((total, amount) => total + toCents(amount), 0));

export const subtractMoney = (a: number, b: number): number => fromCents(toCents(a) - toCents(b));

// Rejects a keystroke that would add a second decimal point or a third
// decimal digit, so a form field never holds more precision than a
// currency amount has.
export const hasAtMostTwoDecimals = (text: string): boolean => {
  const parts = text.split('.');
  return parts.length <= 2 && (parts[1] === undefined || parts[1].length <= 2);
};
