import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li', 
      'blockquote', 'a', 'img', 'br', 'code', 'pre'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel'
    ],
  });
}
