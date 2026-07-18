import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { getResolvedSettings, getSocialLinks, getInfoPages } from "@/lib/queries";
import { NAV_LINKS, type NavLink } from "@/lib/constants";
import { PageTracker } from "@/components/public/page-tracker";
import { ClickSpark } from "@/components/ui/click-spark";
import { ClinicSchema } from "@/components/public/clinic-schema";

// Public chrome is static + ISR; reads happen at build/revalidate, not per request.
export const revalidate = 3600;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, socialLinks, infoPages] = await Promise.all([
    getResolvedSettings(), 
    getSocialLinks(),
    getInfoPages()
  ]);

  const navLinks: NavLink[] = NAV_LINKS.map(link => {
    if (link.label === "More Info") {
      return {
        ...link,
        sublinks: [
          ...(link.sublinks || []),
          ...infoPages.map(page => ({ href: `/info/${page.slug}`, label: page.title || "" }))
        ]
      };
    }
    return link;
  });

  return (
    <ClickSpark sparkColor="#ffffff" sparkSize={10} sparkRadius={20} sparkCount={8} duration={400} extraScale={0.8}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader clinicName="Dr Physio" phone={settings.phone_primary} navLinks={navLinks} />
        <main className="flex-1">{children}</main>
        <SiteFooter
          settings={{
            clinic_name: settings.clinic_name,
            tagline: settings.tagline,
            phone_primary: settings.phone_primary,
            phone_secondary: settings.phone_secondary,
            email: settings.email,
            address: settings.address,
          }}
          socialLinks={socialLinks}
          navLinks={navLinks}
        />

        <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
        <PageTracker />
        <ClinicSchema />
      </div>
    </ClickSpark>
  );
}
