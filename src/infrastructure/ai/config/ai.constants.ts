export const AI_CONFIG = {
  TIMEOUT: 1800000,
  TEMPERATURE: {
    PRECISE: 0.1,
    LOW: 0.2,
    MEDIUM: 0.5,
    HIGH: 0.8,
  },
  MAX_TOKENS: {
    SHORT: 256,
    MEDIUM: 512,
    LONG: 2048,
  },
  LIMITS: {
    MAX_KEYWORD_PHRASE_WORDS: 4,
    MAX_KEYWORD_LENGTH: 60,
    MAX_KEYWORDS: 32,
  },
} as const;
