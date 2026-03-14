'use client';

/**
 * Google Analytics 4 компонент
 * 
 * Подключает Google Analytics 4 для отслеживания посещений
 * 
 * @see https://developers.google.com/analytics/devguides/collection/gtagjs
 */

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Не загружать в development (если не включено явно)
  if (
    !gaId ||
    (process.env.NODE_ENV === 'development' && 
     process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true')
  ) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure',
          });
        `}
      </Script>
    </>
  );
}

