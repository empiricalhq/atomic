export const formatCurrency = (amount: number, currency = 'PEN', locale = 'es-PE'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
  locale = 'es-ES'
): string => {
  return new Intl.DateTimeFormat(locale, options).format(date);
};
