export const formatDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (inputDate.getTime() === today.getTime()) {
    return 'Hoy';
  } else if (inputDate.getTime() === yesterday.getTime()) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

export const getMonthName = (month: number): string => {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return months[month];
};

export const getCurrentMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    name: getMonthName(now.getMonth()),
  };
};
