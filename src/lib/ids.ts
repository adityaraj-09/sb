export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeEmployeeId(value: string): string {
  return value.trim().toUpperCase();
}
