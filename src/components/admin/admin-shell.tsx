"use client";
import Link from "next/link";
import { NotificationCenter } from "./notification-center";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/admin/auth-actions";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconLayoutDashboard,
  IconStethoscope,
  IconUserStar,
  IconMessageStar,
  IconPhoto,
  IconNews,
  IconVideo,
  IconFileText,
  IconCalendarEvent,
  IconMail,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Image from "next/image";

const links = [
  { href: "/admin", label: "Dashboard", icon: <IconLayoutDashboard className="h-5 w-5 shrink-0 text-brand-200" /> },
  { href: "/admin/services", label: "Services", icon: <IconStethoscope className="h-5 w-5 shrink-0 text-brand-200" /> },
  { href: "/admin/doctors", label: "Doctors", icon: <IconUserStar className="h-5 w-5 shrink-0 text-brand-200" /> },
  { href: "/admin/testimonials", label: "Testimonials", icon: <IconMessageStar className="h-5 w-5 shrink-0 text-brand-200" /> },
  { href: "/admin/gallery", label: "Gallery", icon: <IconPhoto className="h-5 w-5 shrink-0 text-brand-200" /> },
  { href: "/admin/updates", label: "Updates", icon: <IconNews className="h-5 w-5 shrink-0 text-brand-200" /> },
  { href: "/admin/videos", label: "Videos", icon: <IconVideo className="h-5 w-5 shrink-0 text-brand-200" /> },
  { href: "/admin/info-pages", label: "Info Pages", icon: <IconFileText className="h-5 w-5 shrink-0 text-brand-200" /> },
  { href: "/admin/appointments", label: "Appointments", icon: <IconCalendarEvent className="h-5 w-5 shrink-0 text-brand-200" /> },
  { href: "/admin/enquiries", label: "Enquiries", icon: <IconMail className="h-5 w-5 shrink-0 text-brand-200" /> },
  { href: "/admin/settings", label: "Settings", icon: <IconSettings className="h-5 w-5 shrink-0 text-brand-200" /> },
];

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-100 md:flex-row">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 border-r border-brand-800 bg-brand-900">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo open={open} />
            <div className="mt-8 flex flex-col gap-1">
              {links.map((link) => {
                const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
                return (
                  <SidebarLink 
                    key={link.href} 
                    link={link} 
                    className={active ? "bg-brand-800 rounded-md" : "hover:bg-brand-800/50 rounded-md"} 
                  />
                );
              })}
            </div>
          </div>
          <div>
            <form action={signOut}>
              <button type="submit" className={`flex w-full items-center gap-2 group/sidebar py-2 hover:bg-brand-800/50 rounded-md px-2 justify-start`}>
                <IconLogout className="h-5 w-5 shrink-0 text-red-400" />
                <motion.span
                  animate={{
                    opacity: open ? 1 : 0,
                  }}
                  className="whitespace-pre inline-block !p-0 !m-0 text-sm font-medium text-red-400 group-hover/sidebar:translate-x-1 transition duration-150"
                >
                  Sign Out
                </motion.span>
              </button>
            </form>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-slate-50">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-slate-800">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" target="_blank" className="text-brand-600 hover:text-brand-700 font-medium">
              View live site ↗
            </Link>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <NotificationCenter />
            <span className="hidden text-slate-500 sm:inline ml-2">{userEmail}</span>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

const Logo = ({ open }: { open: boolean }) => {
  return (
    <Link href="/admin" className="relative z-20 flex items-center py-1 px-2 text-sm font-normal overflow-hidden whitespace-nowrap">
      <div className={`relative shrink-0 transition-all duration-300 ${open ? "h-12 w-12 -ml-[0.4rem]" : "h-10 w-10 -ml-[0.8rem]"}`}>
        <Image 
          src={open ? "/icon-white-v2.svg" : "/icon-primary-v2.svg"} 
          alt="Dr Physio" 
          fill 
          className="object-contain scale-[1.3]" 
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        className="font-bold text-white text-lg ml-2"
      >
        Dr Physio
      </motion.span>
    </Link>
  );
};
