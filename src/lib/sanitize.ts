import sanitize from 'sanitize-html';

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return sanitize(html, {
    allowedTags: [
      'p', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li', 
      'blockquote', 'a', 'img', 'br', 'code', 'pre'
    ],
    allowedAttributes: {
      '*': ['href', 'src', 'alt', 'title', 'target', 'rel']
    },
  });
}
