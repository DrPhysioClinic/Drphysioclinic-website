const fs = require('fs');
const path = require('path');

const ROUTES = {
  "src/app/(public)/contact/page.tsx": "/contact",
  "src/app/(public)/doctors/page.tsx": "/doctors",
  "src/app/(public)/gallery/page.tsx": "/gallery",
  "src/app/(public)/testimonials/page.tsx": "/testimonials",
  "src/app/(public)/treatments/page.tsx": "/treatments",
  "src/app/(public)/updates/page.tsx": "/updates",
  "src/app/(public)/videos/page.tsx": "/videos"
};

for (const [filePath, routePath] of Object.entries(ROUTES)) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (!content.includes('import { getCanonicalUrl }')) {
    content = content.replace(/import type \{ Metadata \} from "next";\n/, 'import type { Metadata } from "next";\nimport { getCanonicalUrl } from "@/lib/utils";\n');
  }

  if (content.includes('export const metadata')) {
    // If it already has alternates, skip
    if (!content.includes('alternates:')) {
      content = content.replace(/};\s*$/, `  alternates: { canonical: getCanonicalUrl("${routePath}") },\n};\n`);
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated metadata for ${filePath}`);
}
