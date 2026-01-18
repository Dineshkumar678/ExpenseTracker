type SubmitErrorInput = {
  status?: number;
  apiMessage?: string;
  isNetworkError?: boolean;
};

export function formatSubmitErrorMessage({
  status,
  apiMessage,
  isNetworkError,
}: SubmitErrorInput) {
  if (isNetworkError) {
    return 'Network error. You can retry safely without creating a duplicate.';
  }

  const message = apiMessage || 'Failed to save expense.';
  const retryable = typeof status === 'number' && (status >= 500 || status === 429);
  if (retryable) {
    return `${message} You can retry safely without creating a duplicate.`;
  }

  return message;
}
