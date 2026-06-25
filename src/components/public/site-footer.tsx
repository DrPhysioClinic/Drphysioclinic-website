import Link from "next/link";
import { NAV_LINKS, telHref } from "@/lib/constants";
import type { SocialLink } from "@/types/database";
import Image from "next/image";
import { 
  IconBrandInstagram, 
  IconBrandFacebook, 
  IconBrandTwitter, 
  IconBrandLinkedin, 
  IconBrandYoutube, 
  IconBrandWhatsapp,
  IconLink 
} from "@tabler/icons-react";

const getSocialIcon = (platform?: string | null) => {
  const p = platform?.toLowerCase() || "";
  if (p.includes("instagram")) return <IconBrandInstagram className="h-6 w-6" />;
  if (p.includes("facebook")) return <IconBrandFacebook className="h-6 w-6" />;
  if (p.includes("twitter") || p.includes("x")) return <IconBrandTwitter className="h-6 w-6" />;
  if (p.includes("linkedin")) return <IconBrandLinkedin className="h-6 w-6" />;
  if (p.includes("youtube")) return <IconBrandYoutube className="h-6 w-6" />;
  if (p.includes("whatsapp")) return <IconBrandWhatsapp className="h-6 w-6" />;
  return <div className="h-6 w-6 bg-current transition-colors" style={{ WebkitMask: "url('/dr-physio-logo-12.svg') no-repeat center / contain", mask: "url('/dr-physio-logo-12.svg') no-repeat center / contain" }} />;
};

type FooterSettings = {
  clinic_name: string;
  tagline: string;
  phone_primary: string;
  phone_secondary?: string | null;
  email: string;
  address: string;
};

export function SiteFooter({
  settings,
  socialLinks,
}: {
  settings: FooterSettings;
  socialLinks: SocialLink[];
}) {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-[#17153f] text-slate-300 relative w-full min-h-[40vh] flex flex-col">
      {/* Watermark Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span 
          style={{ fontFamily: "var(--font-playfair), serif" }}
          className="text-[18.5vw] font-bold tracking-normal whitespace-nowrap text-white/5"
        >
          DR PHYSIO
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between">
        <div className="container-page flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:flex-nowrap lg:justify-between gap-12 lg:gap-8 xl:gap-20 py-12">
          <div>
            <div className="relative h-45 w-72 mb-2 -mt-4 ml-4">
              <Image 
                src="/dr-physio-logo-03.png" 
                alt={settings.clinic_name} 
                fill 
                className="object-contain object-left"
              />
            </div>
            <p className="mt-2 text-base text-slate-400">
              {settings.tagline?.split(/(fitness studio)/i).map((part, i) => 
                part.toLowerCase() === "fitness studio" ? (
                  <span key={i}><br />{part}</span>
                ) : (
                  part
                )
              )}
            </p>
          </div>

          <div className="min-w-max">
            <h4 className="text-lg font-semibold text-white whitespace-nowrap">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-base">
              {NAV_LINKS.map((l) => (
                <li key={l.href} className="group relative">
                  <Link href={l.href} className="hover:text-brand-300 inline-block py-1">
                    {l.label}
                  </Link>
                  {l.sublinks && (
                    <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-300 ease-in-out">
                      <div className="overflow-hidden pr-8 -mr-8">
                        <ul className="mt-1 ml-4 space-y-2 pb-1 pr-4">
                          {l.sublinks.filter(s => s.href !== l.href).map((sub) => (
                            <li key={sub.href}>
                              <Link href={sub.href} className="hover:text-brand-300 text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap inline-block pr-2">
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white whitespace-nowrap">Contact</h4>
            <ul className="mt-3 space-y-2 text-base">
              <li>
                <a href={telHref(settings.phone_primary)} className="hover:text-brand-300">
                  {settings.phone_primary}
                </a>
              </li>
              {settings.phone_secondary && (
                <li>
                  <a href={telHref(settings.phone_secondary)} className="hover:text-brand-300">
                    {settings.phone_secondary}
                  </a>
                </li>
              )}
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-brand-300">
                  {settings.email}
                </a>
              </li>
              <li>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-brand-300 transition-colors"
                >
                  {settings.address}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white whitespace-nowrap">Follow Us</h4>
            <ul className="mt-3 space-y-3 text-base">
              {(() => {
                const links = [...socialLinks];
                const webIdx = links.findIndex(l => !l.platform || l.platform.toLowerCase().includes("website"));
                const waIdx = links.findIndex(l => l.platform?.toLowerCase().includes("whatsapp"));
                if (webIdx !== -1 && waIdx !== -1) {
                  const temp = links[webIdx];
                  links[webIdx] = links[waIdx];
                  links[waIdx] = temp;
                }
                return links;
              })().map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex w-max items-center hover:text-brand-300 text-slate-400 transition-colors"
                  >
                    <div className="shrink-0 relative z-10 bg-[#17153f] rounded-md">
                      {getSocialIcon(s.platform)}
                    </div>
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 pointer-events-none flex items-center">
                      <div className="overflow-hidden whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 transition-all duration-300 ease-in-out">
                        {s.label || s.platform}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 py-4 mt-auto">
          <div className="w-full px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500">
            <p>
              © {new Date().getFullYear()} {settings.clinic_name}. All rights reserved.
            </p>
            <p>
              Designed by <a href="https://raahildesai.vercel.app/#" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-300 transition-colors font-medium">Raahil Desai</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
