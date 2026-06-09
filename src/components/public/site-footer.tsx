import Link from "next/link";
import { NAV_LINKS, telHref } from "@/lib/constants";
import type { SocialLink } from "@/types/database";

type FooterSettings = {
  clinic_name: string;
  tagline: string;
  phone_primary: string;
  phone_secondary: string;
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
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-white">{settings.clinic_name}</h3>
          <p className="mt-2 text-sm text-slate-400">{settings.tagline}</p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
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
            <li className="text-slate-400">{settings.address}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Follow Us</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {socialLinks.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-300"
                >
                  {s.label || s.platform}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4">
        <p className="container-page text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {settings.clinic_name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
