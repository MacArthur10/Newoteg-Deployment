export const formatFCFA = (amount) => {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};
