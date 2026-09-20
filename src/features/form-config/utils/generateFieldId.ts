export const generateFieldId = (prefix: string): string =>
  `${prefix}-${crypto.randomUUID()}`;
