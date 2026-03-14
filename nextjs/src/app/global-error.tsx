'use client';

/**
 * Global Error Boundary
 * 
 * Перехватывает ошибки в root layout
 * Используется как последняя линия защиты
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global Error:', error);

    // Отправка критичной ошибки в систему мониторинга
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        level: 'fatal',
        tags: {
          errorBoundary: 'global',
        },
      });
    }
  }, [error]);

  return (
    <html lang="ru">
      <body style={{ 
        margin: 0, 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f7f9',
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          maxWidth: '500px',
        }}>
          <div style={{ 
            fontSize: '4rem',
            marginBottom: '1rem',
          }}>
            ⚠️
          </div>
          
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 600,
            color: '#191E35',
            marginBottom: '1rem',
          }}>
            Критическая ошибка
          </h1>
          
          <p style={{ 
            fontSize: '1.125rem',
            color: '#8F8F8F',
            marginBottom: '2rem',
          }}>
            Произошла критическая ошибка приложения. Пожалуйста, перезагрузите страницу.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div style={{ 
              backgroundColor: '#fee',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'left',
            }}>
              <code style={{ 
                fontSize: '0.875rem',
                color: '#c00',
                wordBreak: 'break-word',
              }}>
                {error.message}
              </code>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#526AC2',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Попробовать снова
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              style={{
                backgroundColor: 'white',
                color: '#526AC2',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: '2px solid #526AC2',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

