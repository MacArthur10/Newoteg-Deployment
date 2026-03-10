export const formatFCFA = (amount) => {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return value.toLocaleString('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};
