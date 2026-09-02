"use client";

import { useState, useTransition } from "react";
import { saveEnquiryNotes } from "@/app/admin/(panel)/actions";
import { IconNotes } from "@tabler/icons-react";

export interface EnquiryNotes {
  managedBy?: string;
  reference?: string;
  address?: string;
  pincode?: string;
  attendanceWithMobile?: string;
  callDate?: string;
  followUpDate?: string;
  totalVisitPerMonth?: string;
  paymentReceived?: string;
  dateOfJoining?: string;
  extraComment?: string;
}

export function EnquiryNotesModal({
  id,
  initialNotes,
}: {
  id: string;
  initialNotes: any;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // Parse initial notes if it's stored as JSON
  const parsedNotes: EnquiryNotes = typeof initialNotes === 'string' 
    ? ((): EnquiryNotes => { try { return JSON.parse(initialNotes); } catch { return {}; } })()
    : (initialNotes || {});

  const [notes, setNotes] = useState<EnquiryNotes>(parsedNotes);

  const handleChange = (field: keyof EnquiryNotes, value: string) => {
    setNotes((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      // We pass the stringified notes JSON
      const res = await saveEnquiryNotes(id, JSON.stringify(notes));
      if (res?.error) {
        alert(res.error);
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Enquiry Notes"
        className="rounded border border-yellow-300 bg-yellow-50 p-1.5 text-yellow-700 hover:bg-yellow-100 transition-colors"
      >
        <IconNotes className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 text-left">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Enquiry Notes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Managed By</label>
                <input
                  type="text"
                  value={notes.managedBy || ""}
                  onChange={(e) => handleChange("managedBy", e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Reference</label>
                <input
                  type="text"
                  value={notes.reference || ""}
                  onChange={(e) => handleChange("reference", e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                <input
                  type="text"
                  value={notes.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Pincode</label>
                <input
                  type="text"
                  value={notes.pincode || ""}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Attendance w/ Mobile Number</label>
                <input
                  type="text"
                  value={notes.attendanceWithMobile || ""}
                  onChange={(e) => handleChange("attendanceWithMobile", e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Call Date</label>
                <input
                  type="date"
                  value={notes.callDate || ""}
                  onChange={(e) => handleChange("callDate", e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Follow up Date</label>
                <input
                  type="date"
                  value={notes.followUpDate || ""}
                  onChange={(e) => handleChange("followUpDate", e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Date of Joining</label>
                <input
                  type="date"
                  value={notes.dateOfJoining || ""}
                  onChange={(e) => handleChange("dateOfJoining", e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Payment Received</label>
                <input
                  type="text"
                  value={notes.paymentReceived || ""}
                  onChange={(e) => handleChange("paymentReceived", e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Total Visit Per Month (Auto)</label>
                <input
                  type="text"
                  readOnly
                  placeholder="Will be updated automatically"
                  value={notes.totalVisitPerMonth || ""}
                  onChange={(e) => handleChange("totalVisitPerMonth", e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-sm text-slate-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Extra Comment</label>
                <textarea
                  value={notes.extraComment || ""}
                  onChange={(e) => handleChange("extraComment", e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={pending}
                onClick={handleSave}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {pending ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
