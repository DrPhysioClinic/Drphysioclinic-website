import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export const dynamic = "force-dynamic";

async function countOf(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  table:
    | "services"
    | "testimonials"
    | "gallery"
    | "updates"
    | "appointments"
    | "enquiries"
    | "doctors"
    | "videos"
) {
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

async function eventCount(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  eventType: string
) {
  const { count } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", eventType);
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createServerSupabase();

  const [
    services,
    doctors,
    testimonials,
    gallery,
    updates,
    appointments,
    enquiries,
    whatsappClicks,
    callClicks,
    statsResult,
  ] = await Promise.all([
    countOf(supabase, "services"),
    countOf(supabase, "doctors"),
    countOf(supabase, "testimonials"),
    countOf(supabase, "gallery"),
    countOf(supabase, "updates"),
    countOf(supabase, "appointments"),
    countOf(supabase, "enquiries"),
    eventCount(supabase, "whatsapp_click"),
    eventCount(supabase, "call_click"),
    supabase.rpc("get_visitor_stats"),
  ]);

  const monthlyStats = statsResult?.data || [];
  const uniqueVisitors = monthlyStats.reduce((acc: number, row: any) => acc + (Number(row.unique_visitors) || 0), 0);
  const totalPageviews = monthlyStats.reduce((acc: number, row: any) => acc + (Number(row.total_pageviews) || 0), 0);

  const cards = [
    { label: "Services", value: services, href: "/admin/services" },
    { label: "Doctors", value: doctors, href: "/admin/doctors" },
    { label: "Testimonials", value: testimonials, href: "/admin/testimonials" },
    { label: "Gallery Photos", value: gallery, href: "/admin/gallery" },
    { label: "Updates", value: updates, href: "/admin/updates" },
    { label: "Appointments", value: appointments, href: "/admin/appointments" },
    { label: "Enquiries", value: enquiries, href: "/admin/enquiries" },
    { label: "WhatsApp Clicks", value: whatsappClicks },
    { label: "Call Clicks", value: callClicks },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview of your clinic content and engagement.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <div className="card p-5 transition-shadow hover:shadow-md">
              <div className="text-3xl font-bold text-brand-700">{c.value}</div>
              <div className="mt-1 text-sm text-slate-500">{c.label}</div>
            </div>
          );
          return c.href ? (
            <Link key={c.label} href={c.href}>
              {inner}
            </Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>

      <AnalyticsDashboard 
        uniqueVisitors={uniqueVisitors}
        totalPageviews={totalPageviews}
        monthlyData={monthlyStats}
      />
    </div>
  );
}
