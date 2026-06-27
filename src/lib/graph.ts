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

function getEndTimeString(dateStr: string, timeStr: string, durationMinutes = 30) {
  // Use UTC math to avoid server timezone offset issues
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  const d = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  d.setUTCMinutes(d.getUTCMinutes() + durationMinutes);
  
  const endYear = d.getUTCFullYear();
  const endMonth = String(d.getUTCMonth() + 1).padStart(2, "0");
  const endDay = String(d.getUTCDate()).padStart(2, "0");
  const endHours = String(d.getUTCHours()).padStart(2, "0");
  const endMins = String(d.getUTCMinutes()).padStart(2, "0");
  
  return `${endYear}-${endMonth}-${endDay}T${endHours}:${endMins}:00`;
}

export async function createOutlookEvent(appt: {
  patient_name: string;
  preferred_date: string;
  preferred_time: string;
  consultation_type: string;
  zoom_join_url?: string | null;
}) {
  const token = await getGraphToken();

  const startIso = `${appt.preferred_date}T${appt.preferred_time}:00`;
  const endIso = getEndTimeString(appt.preferred_date, appt.preferred_time, 30);

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
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endIso,
        timeZone: "Asia/Kolkata",
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

  const startIso = `${appt.preferred_date}T${appt.preferred_time}:00`;
  const endIso = getEndTimeString(appt.preferred_date, appt.preferred_time, 30);

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
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endIso,
        timeZone: "Asia/Kolkata",
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
