import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { MobileCtaBar } from "@/components/public/mobile-cta-bar";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { getResolvedSettings, getSocialLinks } from "@/lib/queries";
import { PageTracker } from "@/components/public/page-tracker";
import { ClickSpark } from "@/components/ui/click-spark";
import { ClinicSchema } from "@/components/public/clinic-schema";

// Public chrome is static + ISR; reads happen at build/revalidate, not per request.
export const revalidate = 3600;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, socialLinks] = await Promise.all([getResolvedSettings(), getSocialLinks()]);

  return (
    <ClickSpark sparkColor="#ffffff" sparkSize={10} sparkRadius={20} sparkCount={8} duration={400} extraScale={0.8}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader clinicName={settings.clinic_name} phone={settings.phone_primary} />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
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
        />
        <MobileCtaBar phone={settings.phone_primary} whatsappNumber={settings.whatsapp_number} />
        <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
        <PageTracker />
        <ClinicSchema />
      </div>
    </ClickSpark>
  );
}
