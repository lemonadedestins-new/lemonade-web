export function getErrorMessage(error) {
  if (error?.code === 'ERR_CANCELED') return 'The request was cancelled. Please try again.';
  if (error?.code === 'ECONNABORTED') return 'That took longer than expected. Please try again.';
  if (!error?.response) return 'We couldn’t connect. Check your connection and try again.';
  const { status, data } = error.response;
  if (status === 401) return data?.code === 'INVALID_CREDENTIALS' ? 'The email or password doesn’t match. Please try again.' : 'Your session has ended. Please log in again.';
  if (status === 403) return 'This account doesn’t have access to that page.';
  if (status === 404) return 'We couldn’t find this item. It may be unavailable or belong to a different account.';
  if (status === 409 && data?.code === 'LEAD_CLOSED') return 'This enquiry is closed or its travel dates have passed. You can still view its details.';
  if (status === 409 && data?.code === 'QUOTE_EXISTS') return 'A quote already exists for this enquiry. Open it from My quotes to continue.';
  if (status === 409 && data?.code === 'QUOTE_NOT_WITHDRAWABLE') return 'This proposal can no longer be withdrawn. Refresh to see its latest status.';
  if (status === 409) return data?.code === 'EMAIL_EXISTS' ? 'An account already uses this email. Try logging in instead.' : 'This request has already been submitted and can no longer be edited.';
  if (status === 429) return 'There have been too many attempts. Please wait a moment and try again.';
  if (status === 400 || status === 422) return 'Some details need another look. Check the form and try again.';
  return 'Something went wrong on our side. Please try again in a moment.';
}
