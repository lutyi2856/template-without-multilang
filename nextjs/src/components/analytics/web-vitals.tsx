'use client';

/**
 * Web Vitals Tracking
 * 
 * Отслеживает Core Web Vitals метрики для мониторинга производительности
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/analytics
 * @see https://web.dev/vitals/
 */

import { useReportWebVitals } from 'next/web-vitals';

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

/**
 * Отправить метрику в аналитику
 */
function sendToAnalytics(metric: WebVitalsMetric) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      metric_rating: metric.rating,
      metric_delta: Math.round(metric.delta),
      metric_value: metric.value,
    });
  }

  // Yandex Metrika
  if (typeof window !== 'undefined' && (window as any).ym) {
    (window as any).ym(
      process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
      'reachGoal',
      'web-vitals',
      {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
      }
    );
  }

  // Console log для development
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log('📊 Web Vitals:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });
  }

  // Отправка в кастомный endpoint (опционально)
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'web-vitals',
        metric: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          delta: metric.delta,
          navigationType: metric.navigationType,
        },
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
      }),
    }).catch((error) => {
      console.error('Failed to send Web Vitals:', error);
    });
  }
}

/**
 * Web Vitals компонент
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Определяем rating на основе метрики
    const metricWithRating = {
      ...metric,
      rating: getRating(metric.name, metric.value),
    } as WebVitalsMetric;

    sendToAnalytics(metricWithRating);
  });

  return null;
}

/**
 * Определить rating метрики (good/needs-improvement/poor)
 * 
 * @see https://web.dev/vitals/#core-web-vitals
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'LCP':
      // Good: ≤2.5s, Needs Improvement: ≤4s, Poor: >4s
      if (value <= 2500) return 'good';
      if (value <= 4000) return 'needs-improvement';
      return 'poor';

    case 'FID':
      // Good: ≤100ms, Needs Improvement: ≤300ms, Poor: >300ms
      if (value <= 100) return 'good';
      if (value <= 300) return 'needs-improvement';
      return 'poor';

    case 'INP':
      // Good: ≤200ms, Needs Improvement: ≤500ms, Poor: >500ms
      if (value <= 200) return 'good';
      if (value <= 500) return 'needs-improvement';
      return 'poor';

    case 'CLS':
      // Good: ≤0.1, Needs Improvement: ≤0.25, Poor: >0.25
      if (value <= 0.1) return 'good';
      if (value <= 0.25) return 'needs-improvement';
      return 'poor';

    case 'TTFB':
      // Good: ≤800ms, Needs Improvement: ≤1800ms, Poor: >1800ms
      if (value <= 800) return 'good';
      if (value <= 1800) return 'needs-improvement';
      return 'poor';

    case 'FCP':
      // Good: ≤1.8s, Needs Improvement: ≤3s, Poor: >3s
      if (value <= 1800) return 'good';
      if (value <= 3000) return 'needs-improvement';
      return 'poor';

    default:
      return 'good';
  }
}

/**
 * Вспомогательная функция для форматирования значения метрики
 */
export function formatMetricValue(name: string, value: number): string {
  switch (name) {
    case 'CLS':
      return value.toFixed(3);
    case 'LCP':
    case 'FCP':
    case 'TTFB':
      return `${(value / 1000).toFixed(2)}s`;
    case 'FID':
    case 'INP':
      return `${Math.round(value)}ms`;
    default:
      return value.toString();
  }
}

