const fs = require('fs');
const path = require('path');

const ROUTES = {
  "src/app/(public)/page.tsx": {
    path: "/",
    title: "Best Physiotherapist in Ahmedabad | Dr Physio",
    description: "Expert physiotherapy, sports injury rehab, and child development in Bopal, Ahmedabad. Book your appointment with Dr Jeetendra Brahmbhatt today."
  },
  "src/app/(public)/about/page.tsx": {
    path: "/about",
    title: "About Us | Dr Physio Clinic in Ahmedabad",
    description: "Learn about Dr Physio Clinic, our expert physiotherapists, and our mission to provide the best physiotherapy care in Bopal, Ahmedabad."
  },
  "src/app/(public)/contact/page.tsx": {
    path: "/contact",
    title: "Contact Us | Dr Physio in Ahmedabad",
    description: "Get in touch with Dr Physio Clinic in Bopal, Ahmedabad. Book an appointment, view our map, and get directions for physiotherapy treatments."
  },
  "src/app/(public)/doctors/page.tsx": {
    path: "/doctors",
    title: "Our Physiotherapy Team | Dr Physio in Ahmedabad",
    description: "Meet our team of expert physiotherapists at Dr Physio Clinic in Ahmedabad. Dedicated to your recovery and well-being."
  },
  "src/app/(public)/gallery/page.tsx": {
    path: "/gallery",
    title: "Clinic Gallery | Dr Physio in Ahmedabad",
    description: "Take a tour of Dr Physio Clinic in Bopal, Ahmedabad. View our state-of-the-art physiotherapy and sports injury rehabilitation facilities."
  },
  "src/app/(public)/testimonials/page.tsx": {
    path: "/testimonials",
    title: "Patient Reviews & Testimonials | Dr Physio in Ahmedabad",
    description: "Read reviews from our patients. See how Dr Physio Clinic in Ahmedabad has helped people recover from pain and injuries."
  },
  "src/app/(public)/treatments/page.tsx": {
    path: "/treatments",
    title: "Physiotherapy Treatments in Ahmedabad | Dr Physio",
    description: "Explore our range of physiotherapy treatments including sports injury rehab, manual therapy, and pediatric physiotherapy in Bopal, Ahmedabad."
  },
  "src/app/(public)/updates/page.tsx": {
    path: "/updates",
    title: "Latest Clinic Updates & Health Tips | Dr Physio in Ahmedabad",
    description: "Stay updated with the latest news, health tips, and clinic updates from Dr Physio in Ahmedabad."
  },
  "src/app/(public)/videos/page.tsx": {
    path: "/videos",
    title: "Educational Physiotherapy Videos | Dr Physio in Ahmedabad",
    description: "Watch our educational videos on physiotherapy exercises, pain management, and treatments by Dr Physio experts in Ahmedabad."
  }
};

for (const [filePath, meta] of Object.entries(ROUTES)) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - not found`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('export const metadata') || content.includes('export async function generateMetadata')) {
    console.log(`Skipping ${filePath} - metadata already exists`);
    continue;
  }

  const importStatement = `import { getCanonicalUrl } from "@/lib/utils";\n`;
  const metadataBlock = `
export const metadata = {
  title: "${meta.title}",
  description: "${meta.description}",
  alternates: { canonical: getCanonicalUrl("${meta.path}") },
};
`;

  // Find the last import statement
  const importLines = content.split('\n').filter(line => line.startsWith('import '));
  if (importLines.length > 0) {
    const lastImport = importLines[importLines.length - 1];
    content = content.replace(lastImport, lastImport + '\n' + importStatement);
  } else {
    content = importStatement + '\n' + content;
  }

  // Inject metadataBlock before 'export default' or 'export const revalidate'
  if (content.includes('export const revalidate')) {
    content = content.replace('export const revalidate', metadataBlock + '\nexport const revalidate');
  } else {
    content = content.replace('export default function', metadataBlock + '\nexport default function');
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Injected metadata into ${filePath}`);
}
