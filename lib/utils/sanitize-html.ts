import sanitizeHtml from 'sanitize-html';

const RICH_TEXT_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'span',
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Convert legacy plain-text descriptions to simple HTML paragraphs. */
export function normalizeLegacyDescriptionHtml(html: string): string {
  if (/<[a-z][\s\S]*>/i.test(html)) {
    return html;
  }

  return html
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
}

export function sanitizeRichTextHtml(html: string): string {
  const normalizedHtml = normalizeLegacyDescriptionHtml(html);

  return sanitizeHtml(normalizedHtml, {
    allowedTags: RICH_TEXT_ALLOWED_TAGS,
    allowedAttributes: {
      span: ['style'],
    },
    allowedStyles: {
      span: {
        color: [
          /^#([0-9a-f]{3}|[0-9a-f]{6})$/i,
          /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i,
        ],
        'font-size': [/^\d+(\.\d+)?(px|rem|em)$/i],
      },
    },
  });
}

export function richTextToPlainText(
  html: string | null | undefined
): string {
  if (!html) {
    return '';
  }

  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|h2|h3|li|blockquote|div)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function isRichTextEmpty(html: string | null | undefined): boolean {
  return richTextToPlainText(html).length === 0;
}

export const RICH_TEXT_CONTENT_CLASS_NAME =
  'space-y-3 text-slate-600 [&_p]:leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_strong]:font-semibold [&_em]:italic [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic';
