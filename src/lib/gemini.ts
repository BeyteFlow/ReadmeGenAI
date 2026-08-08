import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIAbortError,
} from "@google/generative-ai";

let _model: GenerativeModel | null = null;

export const GEMINI_GENERATION_TIMEOUT_MS = 60_000;

export type ModelGenerationFailure =
  | { kind: "rate_limited"; status: number; message: string }
  | { kind: "timeout"; status: number; message: string }
  | { kind: "model_error"; status: number; message: string }
  | { kind: "unknown"; status: number; message: string };

const RATE_LIMIT_STATUSES = [429];

const RATE_LIMIT_ERROR_MARKERS = [
  "RATE_LIMIT",
  "RESOURCE_EXHAUSTED",
  "QUOTA_EXCEEDED",
];

function isAbortError(error: unknown): boolean {
  if (error instanceof GoogleGenerativeAIAbortError) return true;

  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    ["AbortError", "TimeoutError"].includes(
      String((error as { name?: unknown }).name),
    )
  );
}

function getErrorDetailsText(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "errorDetails" in error &&
    Array.isArray((error as { errorDetails?: unknown }).errorDetails)
  ) {
    return JSON.stringify((error as { errorDetails: unknown[] }).errorDetails);
  }
  return "";
}

export function classifyModelGenerationError(
  error: unknown,
): ModelGenerationFailure {
  if (isAbortError(error)) {
    return {
      kind: "timeout",
      status: 504,
      message:
        "The AI model took too long to respond. Please wait a moment and try again.",
    };
  }

  if (error instanceof GoogleGenerativeAIFetchError) {
    const detailsText = getErrorDetailsText(error).toUpperCase();
    const messageText = error.message.toUpperCase();
    const hasRateLimitMarker = RATE_LIMIT_ERROR_MARKERS.some(
      (marker) => detailsText.includes(marker) || messageText.includes(marker),
    );
    const isRateLimited =
      (error.status !== undefined &&
        RATE_LIMIT_STATUSES.includes(error.status)) ||
      (error.status === 403 && hasRateLimitMarker);

    if (isRateLimited) {
      return {
        kind: "rate_limited",
        status: 429,
        message:
          "The AI model is temporarily rate-limited. Please wait a few minutes and try again.",
      };
    }

    return {
      kind: "model_error",
      status: error.status || 502,
      message:
        "The AI provider could not generate a README. Please try again in a few minutes.",
    };
  }

  return {
    kind: "unknown",
    status: 500,
    message: error instanceof Error ? error.message : "Internal Server Error",
  };
}

export function getGeminiModel(): GenerativeModel {
  if (_model) return _model;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  _model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });

  return _model;
}
