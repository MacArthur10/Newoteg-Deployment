export function formatFcfa(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}
