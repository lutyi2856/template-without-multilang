/**
 * Декодирование HTML-сущностей для отображения текста из WordPress.
 * Работает на сервере и клиенте (без document).
 *
 * Декодирует:
 * - Числовые: &#8212; → —
 * - Hex: &#x2014; → —
 * - Именованные: &nbsp;, &mdash;, &ndash;, &quot;, &amp;, &lt;, &gt;
 */

const NAMED_ENTITIES: Record<string, string> = {
  "&nbsp;": "\u00A0",
  "&mdash;": "\u2014",
  "&ndash;": "\u2013",
  "&hellip;": "\u2026",
  "&quot;": '"',
  "&apos;": "'",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&laquo;": "\u00AB",
  "&raquo;": "\u00BB",
};

/**
 * Декодирует HTML-сущности в строке.
 * Безопасно для использования с текстом после strip HTML.
 */
export function decodeHtmlEntities(str: string): string {
  if (!str || typeof str !== "string") return str;

  return (
    str
      // Именованные сущности (сначала, чтобы &amp; не мешал остальным)
      .replace(/&(?:nbsp|mdash|ndash|hellip|quot|apos|amp|lt|gt|laquo|raquo);/gi, (m) => {
        const key = m.toLowerCase();
        return NAMED_ENTITIES[key] ?? m;
      })
      // Числовые десятичные: &#8212;
      .replace(/&#(\d+);/g, (_, code) =>
        String.fromCharCode(parseInt(code, 10))
      )
      // Числовые hex: &#x2014; или &#X2014;
      .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
        String.fromCharCode(parseInt(code, 16))
      )
  );
}
