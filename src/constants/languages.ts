export const SUPPORTED_LANGUAGES = [
  "English",
  "Danish",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Portuguese",
  "Russian",
  "Arabic",
  "Turkish",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
