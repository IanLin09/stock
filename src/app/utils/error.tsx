import { toast } from 'sonner';

type HandleErrorOptions = {
  showToast?: boolean;
  context?: string; // e.g. "Login Form"
};

export const handleError = (
  error: unknown,
  options: HandleErrorOptions = {}
) => {
  const { showToast = true, context } = options;

  let message = 'Something went wrong';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    message = String((error as any).message);
  }

  // Logging
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? `: ${context}` : ''}]`, error);
  }

  // Optional: show toast
  if (showToast && typeof window !== 'undefined') {
    // e.g. using react-toastify or shadcn/toaster
    toast.error(`${context ? context + ': ' : ''}${message}`); // Fallback for demo
  }

  return message;
};
