const TENANT_ID = process.env.MS_GRAPH_TENANT_ID;
const CLIENT_ID = process.env.MS_GRAPH_CLIENT_ID;
const CLIENT_SECRET = process.env.MS_GRAPH_CLIENT_SECRET;
const TARGET_USER = process.env.MS_GRAPH_TARGET_USER || "dr.jeetendra@drphysioclinic.com";

async function getGraphToken() {
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing MS Graph credentials in environment variables.");
  }

  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to get Graph token: ${err}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

function getUtcTimeStrings(dateStr: string, timeStr: string, durationMinutes = 30) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  // Treat input as UTC, then subtract 5 hours 30 mins (330 mins) to convert IST -> UTC
  const d = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  d.setUTCMinutes(d.getUTCMinutes() - 330);
  
  const formatUtc = (date: Date) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dStr = String(date.getUTCDate()).padStart(2, "0");
    const h = String(date.getUTCHours()).padStart(2, "0");
    const min = String(date.getUTCMinutes()).padStart(2, "0");
    return `${y}-${m}-${dStr}T${h}:${min}:00`;
  };

  const startIso = formatUtc(d);
  d.setUTCMinutes(d.getUTCMinutes() + durationMinutes);
  const endIso = formatUtc(d);
  
  return { startIso, endIso };
}

export async function createOutlookEvent(appt: {
  patient_name: string;
  preferred_date: string;
  preferred_time: string;
  consultation_type: string;
  zoom_join_url?: string | null;
}) {
  const token = await getGraphToken();

  const { startIso, endIso } = getUtcTimeStrings(appt.preferred_date, appt.preferred_time, 30);

  let bodyContent = `Consultation for ${appt.patient_name}.`;
  if (appt.consultation_type === "online" && appt.zoom_join_url) {
    bodyContent += `<br><br>Join Zoom Meeting: <a href="${appt.zoom_join_url}">${appt.zoom_join_url}</a>`;
  }

  const url = `https://graph.microsoft.com/v1.0/users/${TARGET_USER}/events`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: `Consultation: ${appt.patient_name}`,
      body: {
        contentType: "HTML",
        content: bodyContent,
      },
      start: {
        dateTime: startIso,
        timeZone: "UTC",
      },
      end: {
        dateTime: endIso,
        timeZone: "UTC",
      },
      location: {
        displayName: appt.consultation_type === "online" ? "Zoom" : "Dr. Physio Clinic",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create Outlook event: ${err}`);
  }

  const data = await response.json();
  return data.id as string;
}

export async function updateOutlookEvent(
  eventId: string,
  appt: {
    preferred_date: string;
    preferred_time: string;
  }
) {
  const token = await getGraphToken();

  const { startIso, endIso } = getUtcTimeStrings(appt.preferred_date, appt.preferred_time, 30);

  const url = `https://graph.microsoft.com/v1.0/users/${TARGET_USER}/events/${eventId}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start: {
        dateTime: startIso,
        timeZone: "UTC",
      },
      end: {
        dateTime: endIso,
        timeZone: "UTC",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to update Outlook event: ${err}`);
  }
}

export async function deleteOutlookEvent(eventId: string) {
  const token = await getGraphToken();
  const url = `https://graph.microsoft.com/v1.0/users/${TARGET_USER}/events/${eventId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 404 is fine, it means it's already deleted
  if (!response.ok && response.status !== 404) {
    const err = await response.text();
    throw new Error(`Failed to delete Outlook event: ${err}`);
  }
}

export async function markOutlookEventCompleted(eventId: string, patientName: string) {
  const token = await getGraphToken();
  const url = `https://graph.microsoft.com/v1.0/users/${TARGET_USER}/events/${eventId}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: `[COMPLETED] Consultation: ${patientName}`,
      showAs: "free",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to mark Outlook event as completed: ${err}`);
  }
}

export async function getOutlookCalendarView(startIso: string, endIso: string) {
  const token = await getGraphToken();
  const url = `https://graph.microsoft.com/v1.0/users/${TARGET_USER}/calendarView?startDateTime=${startIso}&endDateTime=${endIso}&$orderby=start/dateTime`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Prefer: 'outlook.timezone="Asia/Kolkata"',
    },
    // Prevent Next.js from aggressively caching this fetch so the calendar stays fresh
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch Outlook calendar: ${err}`);
  }

  const data = await response.json();
  return data.value;
}
