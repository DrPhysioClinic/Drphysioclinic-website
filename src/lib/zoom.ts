/**
 * Zoom API Wrapper
 */

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getZoomToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Missing Zoom API credentials in environment variables.");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    // We shouldn't cache the OAuth token request through Next.js
    cache: "no-store", 
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Zoom Token Error:", text);
    throw new Error("Failed to authenticate with Zoom API");
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Expire 5 minutes early to be safe
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
  
  return cachedToken!;
}

export async function createZoomMeeting(options: {
  topic: string;
  start_time: string;
  duration?: number;
  agenda?: string;
}) {
  const token = await getZoomToken();
  const hostEmail = process.env.ZOOM_HOST_EMAIL;

  if (!hostEmail) {
    throw new Error("Missing ZOOM_HOST_EMAIL in environment variables.");
  }

  const res = await fetch(`https://api.zoom.us/v2/users/${hostEmail}/meetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: options.topic,
      type: 2, // Scheduled meeting
      start_time: options.start_time,
      duration: options.duration || 30,
      agenda: options.agenda || "",
      timezone: "Asia/Kolkata",
      settings: {
        waiting_room: true,
        join_before_host: false,
        audio: "both",
        auto_recording: "none",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Zoom Create Meeting Error:", text);
    throw new Error("Failed to create Zoom meeting");
  }

  const data = await res.json();
  return {
    id: data.id.toString(),
    join_url: data.join_url,
    start_url: data.start_url,
  };
}

export async function updateZoomMeeting(
  meetingId: string,
  startTimeIso: string,
  durationMinutes: number = 30
) {
  const token = await getZoomToken();

  const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start_time: startTimeIso,
      duration: durationMinutes,
    }),
  });

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    console.error("Zoom Update Meeting Error:", text);
    throw new Error("Failed to update Zoom meeting");
  }
}

export async function deleteZoomMeeting(meetingId: string) {
  const token = await getZoomToken();

  const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    // If it's a 404, it might already be deleted, which is fine
    if (res.status !== 404) {
      const text = await res.text();
      console.error("Zoom Delete Meeting Error:", text);
      throw new Error("Failed to delete Zoom meeting");
    }
  }
}
