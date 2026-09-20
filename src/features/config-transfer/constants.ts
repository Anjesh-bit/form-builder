export const TRANSFER_MESSAGES = {
  exported: "Exported the current configuration.",
  imported: (fieldCount: number) =>
    `Imported ${fieldCount} top-level field(s).`,
  importFailed: (reason: string) => `Import failed: ${reason}`,
  unexpectedImportError: "Unexpected error while importing.",
} as const;
