"use client";

import { useState, useTransition, useMemo } from "react";
import { clearAttendances } from "@/app/admin/(panel)/actions";
import { toast } from "sonner";
import { IconDownload, IconPrinter, IconX } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import * as XLSX from "xlsx";

type Attendance = {
  id: string;
  created_at: string;
  patient_name: string | null;
  phone: string | null;
  unique_code: string | null;
  status: string;
  attendance_date: string;
};

export function AttendanceClient({ initialData }: { initialData: Attendance[] }) {
  const [filter, setFilter] = useState<"all" | "patient" | "external">("all");
  const [pending, startTransition] = useTransition();

  // Export Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportType, setExportType] = useState<"xlsx" | "pdf">("xlsx");
  const [stopDate, setStopDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Determine the oldest date from the data
  const oldestDate = useMemo(() => {
    if (!initialData || initialData.length === 0) return new Date().toISOString().split("T")[0];
    return initialData.reduce((min, p) => (p.attendance_date < min ? p.attendance_date : min), initialData[0].attendance_date);
  }, [initialData]);

  // Data currently visible based on the status filter
  const filteredData = initialData.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  // Data visible during PDF print (filtered by stopDate as well)
  // We use this so the print window only shows the exported date range.
  const printFilteredData = filteredData.filter((a) => a.attendance_date <= stopDate);

  const openExportModal = (type: "xlsx" | "pdf") => {
    if (filteredData.length === 0) {
      toast.error("No data to export.");
      return;
    }
    setExportType(type);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    const dataToExport = filteredData.filter((a) => a.attendance_date <= stopDate);

    if (dataToExport.length === 0) {
      toast.error("No records found in the selected date range.");
      return;
    }

    const formattedOldest = format(parseISO(oldestDate), "dd/MM/yyyy");
    const formattedStop = format(parseISO(stopDate), "dd/MM/yyyy");
    const titleRow = `Attendance Sheet from ${formattedOldest} to ${formattedStop}`;

    if (exportType === "xlsx") {
      // Create worksheet
      const wsData = [
        [titleRow], // First row description
        [], // Empty row for spacing
        ["Date", "Name", "Phone", "Unique ID", "Status"], // Headers
        ...dataToExport.map((a) => [
          a.attendance_date,
          a.patient_name || "-",
          a.phone || "-",
          a.unique_code || "-",
          a.status,
        ]),
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendances");
      
      // Download XLSX
      XLSX.writeFile(wb, `Attendance_Sheet_${stopDate}.xlsx`);
    } else if (exportType === "pdf") {
      // Print dialog (PDF export relies on the browser's print to PDF)
      // We will temporarily hide the modal (it's hidden via print:hidden in CSS)
      window.print();
    }

    // Automatically clear records up to stopDate
    startTransition(async () => {
      const res = await clearAttendances(stopDate);
      if (res?.error) {
        toast.error("Exported successfully, but failed to clear records: " + res.error);
      } else {
        toast.success(`Exported and cleared records up to ${formattedStop}.`);
        setIsModalOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Export Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Export & Clear Attendances
              </h2>
              <button 
                onClick={() => !pending && setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={pending}
              >
                <IconX size={20} />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Exporting will download the records and <strong>automatically delete</strong> them from the database up to the selected Stop Date.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date (Oldest Record)</label>
                <input 
                  type="date" 
                  value={oldestDate} 
                  disabled 
                  className="w-full rounded-md border border-slate-200 bg-slate-100 text-slate-500 px-3 py-2 text-sm cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stop Date (Export & Clear up to)</label>
                <input 
                  type="date" 
                  value={stopDate} 
                  min={oldestDate}
                  max={new Date().toISOString().split("T")[0]} // Prevent future dates
                  onChange={(e) => setStopDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={pending}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={pending}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-md shadow-sm transition-colors flex items-center gap-2"
              >
                {pending ? (
                  "Processing..."
                ) : (
                  <>
                    {exportType === "xlsx" ? <IconDownload size={16} /> : <IconPrinter size={16} />}
                    Export {exportType.toUpperCase()} & Clear
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-slate-200 gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "patient" | "external")}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Attendances</option>
            <option value="patient">Internal Patients</option>
            <option value="external">External Visitors</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openExportModal("pdf")}
            className="flex items-center gap-2 rounded-md bg-white border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <IconPrinter className="h-4 w-4" /> Print / PDF
          </button>
          
          <button
            onClick={() => openExportModal("xlsx")}
            className="flex items-center gap-2 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors shadow-sm"
          >
            <IconDownload className="h-4 w-4" /> Export XLSX
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-0">
        {/* Title specifically for print layout */}
        <div className="hidden print:block p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">
            Attendance Sheet from {format(parseISO(oldestDate), "dd/MM/yyyy")} to {format(parseISO(stopDate), "dd/MM/yyyy")}
          </h1>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200 sticky top-0 z-10 print:static print:bg-white">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium">Unique ID</th>
              <th className="px-6 py-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(isModalOpen && exportType === 'pdf' ? printFilteredData : filteredData).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              (isModalOpen && exportType === 'pdf' ? printFilteredData : filteredData).map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {a.attendance_date}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {a.patient_name || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {a.phone || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {a.unique_code ? (
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded print:bg-transparent print:border print:border-slate-200">
                        {a.unique_code}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${a.status === 'patient' ? 'bg-green-100 text-green-800 print:border print:border-green-300' : 'bg-orange-100 text-orange-800 print:border print:border-orange-300'}
                    `}>
                      {a.status === 'patient' ? 'Internal' : 'External'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
