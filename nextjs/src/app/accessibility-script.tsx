/**
 * Accessibility Script - скрипт для Button Visually Impaired
 * 
 * Инициализирует функционал версии для слабовидящих
 */

'use client';

import { useEffect } from 'react';

export function AccessibilityScript() {
  useEffect(() => {
    // Динамически загружаем BVI CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@blasdfaa/bvi@latest/dist/css/bvi.min.css';
    document.head.appendChild(link);

    // Динамически загружаем BVI JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@blasdfaa/bvi@latest/dist/js/bvi.min.js';
    script.async = true;
    
    script.onload = () => {
      // Даем время на рендер DOM
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).isvek?.Bvi) {
          const button = document.querySelector('.bvi-open');
          if (button) {
            // Создаем экземпляр BVI
            new (window as any).isvek.Bvi();
          }
        }
      }, 200);
    };
    
    script.onerror = () => {
      console.error('[BVI] Failed to load accessibility script');
    };
    
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (link.parentNode) document.head.removeChild(link);
      if (script.parentNode) document.body.removeChild(script);
    };
  }, []);

  return null;
}
