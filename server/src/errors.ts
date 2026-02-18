import type { ErrorResponseBody } from './types.js';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

export class OpenAIError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(502, 'AI_SERVICE_ERROR', message, cause);
    this.name = 'OpenAIError';
  }
}

export class TimeoutError extends AppError {
  constructor() {
    super(504, 'AI_TIMEOUT', 'The AI service took too long to respond. Please try again.');
    this.name = 'TimeoutError';
  }
}

export function toErrorResponse(requestId: string, err: unknown): {
  statusCode: number;
  body: ErrorResponseBody;
} {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: {
        error: {
          code: err.code,
          message: err.message,
          requestId,
        },
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        requestId,
      },
    },
  };
}
