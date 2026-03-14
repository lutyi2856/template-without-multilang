'use client';

/**
 * Error Boundary для всего приложения
 *
 * Перехватывает ошибки в компонентах и отображает fallback UI.
 * Использует только нативные элементы, чтобы гарантированно загружаться.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application Error:', error);
    if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (e: Error) => void } }).Sentry) {
      (window as unknown as { Sentry: { captureException: (e: Error) => void } }).Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-unident-bgLight to-white px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="font-gilroy text-3xl font-semibold text-unident-dark">Что-то пошло не так</h1>
          <p className="font-gilroy text-lg text-unident-textGray">
            Произошла ошибка при загрузке страницы. Пожалуйста, попробуйте еще раз.
          </p>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg bg-red-50 p-4 text-left">
            <p className="font-mono text-sm text-red-800">{error.message}</p>
            {error.digest && <p className="mt-2 font-mono text-xs text-red-600">Error ID: {error.digest}</p>}
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-unident-primary px-6 py-3 font-gilroy font-semibold text-white hover:bg-unident-primaryLight"
          >
            Попробовать снова
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = '/'; }}
            className="rounded-lg border-2 border-unident-primary px-6 py-3 font-gilroy font-semibold text-unident-primary hover:bg-unident-bgLight"
          >
            Вернуться на главную
          </button>
        </div>
        <div className="pt-4">
          <p className="font-gilroy text-sm text-unident-textGray">
            Если проблема повторяется, свяжитесь с нами:{' '}
            <a href="tel:+79999999999" className="text-unident-primary hover:underline">+7 (999) 999-99-99</a>
          </p>
        </div>
      </div>
    </div>
  );
}

