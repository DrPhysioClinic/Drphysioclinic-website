import { NextResponse } from "next/server";
import { getResolvedSettings, getServices, getDoctors, getConditions, getAreas } from "@/lib/queries";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export async function GET() {
  const [settings, services, doctors, conditions, areas] = await Promise.all([
    getResolvedSettings(),
    getServices(),
    getDoctors(),
    getConditions(),
    getAreas(),
  ]);

  const output: string[] = [];

  // Header
  output.push(`# ${settings.clinic_name}`);
  output.push("");

  // Summary quote
  output.push(
    `> ${settings.tagline} Located at ${settings.address}. Contact us at ${settings.phone_primary} or ${settings.email}.`
  );
  output.push("");

  // Services
  if (services.length > 0) {
    output.push("## Services");
    for (const s of services) {
      if (!s.slug) continue;
      const desc = s.seo_description || s.short_description || s.title;
      output.push(`- [${s.title}](${SITE_URL}/treatments/${s.slug}): ${desc}`);
    }
    output.push("");
  }

  // Team
  if (doctors.length > 0) {
    output.push("## Our Team");
    for (const d of doctors) {
      if (!d.slug) continue;
      const credentials = [d.title, d.education].filter(Boolean).join(", ");
      const spec = d.specialization || "Physiotherapist";
      output.push(
        `- [${d.name}${credentials ? `, ${credentials}` : ""}](${SITE_URL}/doctors/${d.slug}): ${spec}`
      );
    }
    output.push("");
  }

  // Conditions
  if (conditions.length > 0) {
    output.push("## Conditions We Treat");
    for (const c of conditions) {
      if (!c.slug) continue;
      const desc = c.seo_description || c.title;
      output.push(`- [${c.title}](${SITE_URL}/conditions/${c.slug}): ${desc}`);
    }
    output.push("");
  }

  // Service Areas
  if (areas.length > 0) {
    output.push("## Service Areas");
    for (const a of areas) {
      if (!a.slug) continue;
      const desc = a.seo_description || a.title;
      output.push(`- [${a.title}](${SITE_URL}/areas/${a.slug}): ${desc}`);
    }
    output.push("");
  }

  // About & Contact
  output.push("## About & Contact");
  output.push(`- [About ${settings.clinic_name}](${SITE_URL}/about): clinic background and credentials`);
  output.push(`- [Contact & Location](${SITE_URL}/contact): address, phone, hours, booking`);

  return new NextResponse(output.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
