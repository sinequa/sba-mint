function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

export function deepmerge<T extends Record<string, unknown>>(base: T, override: T): T {
  const result = structuredClone(base);
  for (const key of Object.keys(override)) {
    const baseVal = result[key];
    const overrideVal = override[key];
    if (isPlainObject(baseVal) && isPlainObject(overrideVal)) {
      (result as Record<string, unknown>)[key] = deepmerge(baseVal, overrideVal);
    } else {
      (result as Record<string, unknown>)[key] = structuredClone(overrideVal);
    }
  }
  return result;
}
