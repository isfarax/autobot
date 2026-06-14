export interface TranslationMap {
  [key: string]: string | TranslationMap;
}

type InterpolationValues = Record<string, string | number>;

export function deepGet(
  obj: TranslationMap,
  path: string,
): string | TranslationMap | undefined {
  const keys = path.split('.');
  let current: TranslationMap | string | undefined = obj;
  for (const key of keys) {
    if (typeof current === 'object' && current !== null) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current;
}

export function interpolate(
  template: string,
  values?: InterpolationValues,
): string {
  if (!values) return template;
  return template.replace(
    /\{(\w+)\}/g,
    (_, key: string) => String(values[key] ?? `{${key}}`),
  );
}

export function t(
  localeData: TranslationMap,
  key: string,
  values?: InterpolationValues,
): string {
  const value = deepGet(localeData, key);
  if (typeof value === 'string') {
    return interpolate(value, values);
  }
  return key;
}
