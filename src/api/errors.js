export function getErrorMessage(error) {
  if (error?.code === 'ERR_CANCELED') return 'The request was cancelled. Please try again.';
  if (error?.code === 'ECONNABORTED') return 'That took longer than expected. Please try again.';
  if (!error?.response) return 'We couldn’t connect. Check your connection and try again.';
  const { status, data } = error.response;
  if (status === 401) return data?.code === 'INVALID_CREDENTIALS' ? 'The email or password doesn’t match. Please try again.' : 'Your session has ended. Please log in again.';
  if (status === 403) return 'This account doesn’t have access to that page.';
  if (status === 409) return 'An account already uses this email. Try logging in instead.';
  if (status === 429) return 'There have been too many attempts. Please wait a moment and try again.';
  if (status === 400 || status === 422) return 'Some details need another look. Check the form and try again.';
  return 'Something went wrong on our side. Please try again in a moment.';
}
