export const inspectionStatusLabels: Record<number, string> = {
  1: 'Rascunho',
  2: 'Enviada',
  3: 'Em andamento',
  4: 'Concluída',
  5: 'Expirada'
};

export function statusLabel(status: number): string {
  return inspectionStatusLabels[status] ?? 'Desconhecido';
}
