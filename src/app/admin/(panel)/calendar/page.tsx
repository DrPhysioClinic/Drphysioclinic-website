import { getOutlookCalendarView } from "@/lib/graph";
import { format, addDays } from "date-fns";
import { IconVideo } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const today = new Date();
  
  // Microsoft Graph calendarView expects start and end times to bound the query.
  // We just use raw ISO strings; MS Graph will interpret them.
  const startIso = today.toISOString();
  const endIso = addDays(today, 7).toISOString();
  
  let events = [];
  let error = null;

  try {
    events = await getOutlookCalendarView(startIso, endIso);
  } catch (err: any) {
    error = err.message;
  }

  // Group events by day
  const groupedEvents: Record<string, any[]> = {};
  
  if (events && Array.isArray(events)) {
    events.forEach(event => {
      // The Prefer: 'outlook.timezone="Asia/Kolkata"' header makes Graph return 
      // event.start.dateTime as a localized ISO string WITHOUT the 'Z' suffix (e.g. 2024-11-20T10:30:00.0000000)
      const dateKey = event.start.dateTime.split("T")[0]; 
      if (!groupedEvents[dateKey]) groupedEvents[dateKey] = [];
      groupedEvents[dateKey].push(event);
    });
  }

  // Create an array of the next 7 days to ensure empty days still show up
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(today, i);
    const dateStr = format(d, "yyyy-MM-dd");
    return {
      date: d,
      dateStr,
      events: groupedEvents[dateStr] || [],
    };
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Outlook Calendar</h1>
      <p className="text-slate-500 mb-8">7-Day Agenda View for Dr. Jeetendra</p>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p className="font-medium">Failed to load calendar from Microsoft Graph.</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {days.map((day) => (
            <div key={day.dateStr} className="relative pl-6 border-l-2 border-slate-200">
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full border-4 border-white bg-brand-500"></div>
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                {format(day.date, "EEEE, MMMM d")}
                {day.dateStr === format(today, "yyyy-MM-dd") && (
                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Today</span>
                )}
              </h2>
              
              {day.events.length === 0 ? (
                <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-sm">
                  No appointments scheduled.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {day.events.map((evt: any) => {
                    const startTime = evt.start.dateTime.split("T")[1].slice(0, 5); // extracts "10:30"
                    const endTime = evt.end.dateTime.split("T")[1].slice(0, 5);
                    const isZoom = evt.location?.displayName?.toLowerCase().includes("zoom");
                    
                    let zoomUrl = null;
                    if (isZoom && evt.body?.content) {
                      const match = evt.body.content.match(/href="([^"]+)"/);
                      if (match) zoomUrl = match[1];
                    }
                    
                    return (
                      <div key={evt.id} className="p-4 rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-brand-300 hover:shadow-md">
                        <div className="flex-shrink-0 w-24 border-r border-slate-100 pr-4">
                          <p className="text-brand-600 font-bold text-lg">{startTime}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{endTime}</p>
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold text-slate-900">{evt.subject}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isZoom ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-700/10' : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10'}`}>
                              {isZoom ? 'Online Video' : 'In Clinic'}
                            </span>
                          </div>
                        </div>
                        {zoomUrl && (
                          <div className="flex-shrink-0">
                            <a 
                              href={zoomUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-sm hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900 transition-colors"
                            >
                              <IconVideo className="h-4 w-4" />
                              Join Now
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
