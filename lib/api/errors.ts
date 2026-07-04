import { isAxiosError } from 'axios'

/**
 * Base error type for any failed API call. Carries the HTTP status,
 * a human-readable summary message, the full list of messages returned
 * by the backend (e.g. multiple validation issues), and the backend's
 * error label (e.g. "Bad Request").
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly messages: string[],
    public readonly error: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Thrown for HTTP 401 responses. Callers should redirect to `/login`. */
export class AuthError extends ApiError {
  constructor(message: string, messages: string[], error: string) {
    super(401, message, messages, error)
    this.name = 'AuthError'
  }
}

/** Thrown for HTTP 403 responses (authenticated but not permitted). */
export class ForbiddenError extends ApiError {
  constructor(message: string, messages: string[], error: string) {
    super(403, message, messages, error)
    this.name = 'ForbiddenError'
  }
}

/** Thrown for HTTP 404 responses. Callers in RSC pages should call `notFound()`. */
export class NotFoundError extends ApiError {
  constructor(message: string, messages: string[], error: string) {
    super(404, message, messages, error)
    this.name = 'NotFoundError'
  }
}

/** Thrown for HTTP 400 responses, typically failed request-body/field validation. */
export class ValidationError extends ApiError {
  constructor(message: string, messages: string[], error: string) {
    super(400, message, messages, error)
    this.name = 'ValidationError'
  }
}

/**
 * Normalises any error thrown by an Axios call into a typed `ApiError`
 * subclass based on HTTP status, so callers can `catch` and branch on
 * error type instead of inspecting raw Axios responses.
 */
export function parseApiError(err: unknown): ApiError {
  if (isAxiosError(err) && err.response) {
    const { status, data, statusText } = err.response
    const raw = data as { statusCode?: number; message?: string | string[]; error?: string }
    // Normalise to an array, falling back to the HTTP status text if absent.
    const messages = Array.isArray(raw?.message)
      ? raw.message
      : raw?.message
        ? [raw.message]
        : [statusText ?? 'Unknown error']
    const errorLabel = raw?.error ?? statusText ?? 'Error'
    const summary = messages[0] ?? statusText ?? 'Unknown error'

    switch (status) {
      case 400: return new ValidationError(summary, messages, errorLabel)
      case 401: return new AuthError(summary, messages, errorLabel)
      case 403: return new ForbiddenError(summary, messages, errorLabel)
      case 404: return new NotFoundError(summary, messages, errorLabel)
      default:  return new ApiError(status, summary, messages, errorLabel)
    }
  }

  // Note: Axios error with no `response` means the request never reached the server
  // (network failure, timeout, CORS, etc.).
  if (isAxiosError(err)) {
    return new ApiError(0, 'Network error', ['Network error'], 'NetworkError')
  }

  // Note: Already normalised (e.g. re-thrown from a nested call) — pass through as-is.
  if (err instanceof ApiError) return err

  return new ApiError(0, 'Unknown error', ['Unknown error'], 'UnknownError')
}
