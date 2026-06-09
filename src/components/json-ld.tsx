/** Renders a schema.org JSON-LD block. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
