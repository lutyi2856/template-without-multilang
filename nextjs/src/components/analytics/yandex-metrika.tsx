'use client';

/**
 * Yandex Metrika компонент
 * 
 * Подключает Яндекс.Метрику для отслеживания посещений
 * 
 * @see https://yandex.ru/support/metrica/
 */

import Script from 'next/script';

interface YandexMetrikaProps {
  counterId?: string;
}

export function YandexMetrika({ counterId }: YandexMetrikaProps) {
  const ymId = counterId || process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

  // Не загружать в development (если не включено явно)
  if (
    !ymId ||
    (process.env.NODE_ENV === 'development' && 
     process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true')
  ) {
    return null;
  }

  return (
    <>
      {/* Yandex Metrika */}
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {
              if (document.scripts[j].src === r) { return; }
            }
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],
            k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${ymId}, "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            ecommerce: "dataLayer"
          });
        `}
      </Script>

      {/* NoScript fallback */}
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${ymId}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}

