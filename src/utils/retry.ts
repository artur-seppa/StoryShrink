export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 1000,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((r) => setTimeout(r, baseDelay));
    return withRetry(fn, retries - 1, baseDelay * 2);
  }
}
