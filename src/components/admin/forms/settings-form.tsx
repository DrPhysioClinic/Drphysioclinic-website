"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/admin/(panel)/actions";
import { emptySave } from "@/app/admin/(panel)/form-state";
import { Text, TextArea, SaveBar } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Settings } from "@/types/database";

export function SettingsForm({ settings }: { settings?: Settings }) {
  const [state, action] = useActionState(saveSettings, emptySave);
  return (
    <form action={action} className="space-y-4">
      {settings && <input type="hidden" name="id" value={settings.id} />}
      {state.error === "" && state !== emptySave && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">Settings saved.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="clinic_name" label="Clinic Name" defaultValue={settings?.clinic_name} required />
        <Text name="tagline" label="Tagline" defaultValue={settings?.tagline} />
        <Text name="phone_primary" label="Primary Phone" defaultValue={settings?.phone_primary} />
        <Text name="phone_secondary" label="Secondary Phone" defaultValue={settings?.phone_secondary} />
        <Text name="whatsapp_number" label="WhatsApp Number" defaultValue={settings?.whatsapp_number} />
        <Text name="email" label="Email" defaultValue={settings?.email} />
        <Text name="latitude" label="Latitude" type="number" defaultValue={settings?.latitude} />
        <Text name="longitude" label="Longitude" type="number" defaultValue={settings?.longitude} />
        <Text name="google_maps_url" label="Google Maps URL" defaultValue={settings?.google_maps_url} />
      </div>
      <TextArea name="address" label="Address" rows={2} defaultValue={settings?.address} />
      <TextArea name="opening_hours" label="Opening Hours" rows={2} defaultValue={settings?.opening_hours} />
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploader name="logo_url" label="Logo" folder="branding" defaultValue={settings?.logo_url} />
        <ImageUploader name="favicon_url" label="Favicon" folder="branding" defaultValue={settings?.favicon_url} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="seo_title" label="Default SEO Title" defaultValue={settings?.seo_title} />
        <Text name="seo_description" label="Default SEO Description" defaultValue={settings?.seo_description} />
      </div>
      <SaveBar state={state} label="Save Settings" />
    </form>
  );
}
