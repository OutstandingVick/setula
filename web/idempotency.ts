function scopeFingerprint(value: string): string {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0).toString(36);
}

export function idempotencyStorageKey(
  runId: string,
  action: string,
  scope: unknown = action,
): string {
  return `setula:idempotency:${runId}:${action}:${scopeFingerprint(JSON.stringify(scope))}`;
}
