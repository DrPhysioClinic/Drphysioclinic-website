"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { IconDownload } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export type AppointmentExportItem = {
  id: string;
  patient_name: string;
  phone: string;
  email: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: string | null;
  notes: string | null;
  doctor_notes: string | null;
  consultation_type: string | null;
  zoom_start_url?: string | null;
  zoom_join_url?: string | null;
  source_page?: string | null;
  terms_accepted?: boolean | null;
  created_at: string | null;
  services?: { title?: string | null } | { title?: string | null }[] | null;
};

export type EnquiryExportItem = {
  id: string;
  name: string;
  contact: string;
  message: string | null;
  source_page: string | null;
  status: string | null;
  created_at: string | null;
  notes: unknown;
};

function formatDateTime(isoStr?: string | null) {
  if (!isoStr) return "-";
  try {
    return format(parseISO(isoStr), "dd/MM/yyyy HH:mm");
  } catch {
    return isoStr;
  }
}

function capitalize(str?: string | null) {
  if (!str) return "-";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function ExportAppointmentsButton({
  data,
}: {
  data: AppointmentExportItem[];
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error("No appointments to export.");
      return;
    }

    setExporting(true);
    try {
      const headers = [
        "Date Booked",
        "Patient Name",
        "Phone",
        "Email",
        "Service / Treatment",
        "Preferred Date",
        "Preferred Time",
        "Consultation Type",
        "Status",
        "Patient Remarks",
        "Doctor Notes",
        "Meeting Link",
        "Source Page",
      ];

      const rows = data.map((a) => {
        const serviceTitle = Array.isArray(a.services)
          ? a.services[0]?.title
          : a.services?.title;

        return [
          formatDateTime(a.created_at),
          a.patient_name || "-",
          a.phone || "-",
          a.email || "-",
          serviceTitle || "-",
          a.preferred_date || "-",
          a.preferred_time || "-",
          a.consultation_type === "online" ? "Online Video" : "In Clinic",
          capitalize(a.status),
          a.notes || "-",
          a.doctor_notes || "-",
          a.zoom_start_url || a.zoom_join_url || "-",
          a.source_page || "-",
        ];
      });

      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws["!cols"] = [
        { wch: 18 }, // Date Booked
        { wch: 22 }, // Patient Name
        { wch: 16 }, // Phone
        { wch: 26 }, // Email
        { wch: 25 }, // Service
        { wch: 15 }, // Preferred Date
        { wch: 15 }, // Preferred Time
        { wch: 18 }, // Consultation Type
        { wch: 14 }, // Status
        { wch: 35 }, // Patient Remarks
        { wch: 35 }, // Doctor Notes
        { wch: 35 }, // Meeting Link
        { wch: 20 }, // Source Page
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Appointments");

      const today = format(new Date(), "yyyy-MM-dd");
      XLSX.writeFile(wb, `Appointments_${today}.xlsx`);

      toast.success(`Exported ${data.length} appointment${data.length === 1 ? "" : "s"} successfully!`);
    } catch (err: unknown) {
      console.error("Failed to export appointments:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to export appointments: " + msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
    >
      <IconDownload className="h-4 w-4" />
      {exporting ? "Exporting..." : "Export XLSX"}
    </button>
  );
}

export function ExportEnquiriesButton({
  data,
}: {
  data: EnquiryExportItem[];
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error("No enquiries to export.");
      return;
    }

    setExporting(true);
    try {
      const headers = [
        "Date Received",
        "Name",
        "Contact",
        "Status",
        "Message",
        "Managed By",
        "Reference",
        "Address",
        "Pincode",
        "Attendance w/ Mobile",
        "Call Date",
        "Follow-up Date",
        "Date of Joining",
        "Payment Received",
        "Total Visits / Month",
        "Extra Comment",
        "Source Page",
      ];

      const rows = data.map((e) => {
        let parsedNotes: Record<string, string> = {};
        if (typeof e.notes === "string") {
          try {
            parsedNotes = JSON.parse(e.notes) as Record<string, string>;
          } catch {
            parsedNotes = { extraComment: e.notes };
          }
        } else if (e.notes && typeof e.notes === "object" && !Array.isArray(e.notes)) {
          parsedNotes = e.notes as Record<string, string>;
        }

        return [
          formatDateTime(e.created_at),
          e.name || "-",
          e.contact || "-",
          capitalize(e.status),
          e.message || "-",
          parsedNotes.managedBy || "-",
          parsedNotes.reference || "-",
          parsedNotes.address || "-",
          parsedNotes.pincode || "-",
          parsedNotes.attendanceWithMobile || "-",
          parsedNotes.callDate || "-",
          parsedNotes.followUpDate || "-",
          parsedNotes.dateOfJoining || "-",
          parsedNotes.paymentReceived || "-",
          parsedNotes.totalVisitPerMonth || "-",
          parsedNotes.extraComment || "-",
          e.source_page || "-",
        ];
      });

      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws["!cols"] = [
        { wch: 18 }, // Date Received
        { wch: 22 }, // Name
        { wch: 20 }, // Contact
        { wch: 14 }, // Status
        { wch: 35 }, // Message
        { wch: 18 }, // Managed By
        { wch: 18 }, // Reference
        { wch: 30 }, // Address
        { wch: 12 }, // Pincode
        { wch: 22 }, // Attendance w/ Mobile
        { wch: 14 }, // Call Date
        { wch: 15 }, // Follow-up Date
        { wch: 16 }, // Date of Joining
        { wch: 18 }, // Payment Received
        { wch: 20 }, // Total Visits / Month
        { wch: 35 }, // Extra Comment
        { wch: 20 }, // Source Page
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Enquiries");

      const today = format(new Date(), "yyyy-MM-dd");
      XLSX.writeFile(wb, `Enquiries_${today}.xlsx`);

      toast.success(`Exported ${data.length} enquir${data.length === 1 ? "y" : "ies"} successfully!`);
    } catch (err: unknown) {
      console.error("Failed to export enquiries:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to export enquiries: " + msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
    >
      <IconDownload className="h-4 w-4" />
      {exporting ? "Exporting..." : "Export XLSX"}
    </button>
  );
}
