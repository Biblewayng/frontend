/**
 * Extracts a human-readable message from an auth API error.
 * Handles FastAPI detail strings, objects, and arrays.
 */
export function getAuthError(err: any, fallback = 'Something went wrong. Please try again.'): string {
  if (!err) return fallback;

  // Plain string
  if (typeof err === 'string') return err;

  // { detail: string }
  if (typeof err.detail === 'string') return err.detail;

  // { detail: [{ msg: string }] } — FastAPI validation errors
  if (Array.isArray(err.detail) && err.detail[0]?.msg) {
    return err.detail[0].msg;
  }

  // { message: string }
  if (typeof err.message === 'string' && err.message) return err.message;

  // { error: string }
  if (typeof err.error === 'string') return err.error;

  return fallback;
}
