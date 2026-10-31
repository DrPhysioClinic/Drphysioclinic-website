"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { IconDownload, IconPrinter, IconX, IconBuildingHospital, IconHome } from "@tabler/icons-react";
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
  visit_type?: string | null;
};

function getVisitType(a: Attendance): "Clinic Visit" | "Home Visit" {
  if (a.visit_type) {
    return a.visit_type.toLowerCase() === "home" ? "Home Visit" : "Clinic Visit";
  }
  if (a.status && a.status.toLowerCase().includes("home")) {
    return "Home Visit";
  }
  return "Clinic Visit";
}

function getPatientCategory(a: Attendance): "Internal" | "External" {
  if (a.status && a.status.toLowerCase().startsWith("patient")) {
    return "Internal";
  }
  return "External";
}

function renderCodeBadge(code?: string | null) {
  if (!code) return <span className="text-slate-400">-</span>;
  const clean = code.trim();
  // 6 numeric digits = Email OTP
  const isOtp = /^\d{6}$/.test(clean);

  if (isOtp) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded print:border-slate-300 font-semibold" title="Verified via 6-digit Email OTP">
        <span className="text-[10px] font-bold tracking-wider text-sky-600 bg-sky-100/70 px-1 py-0.2 rounded">OTP</span>
        {clean}
      </span>
    );
  }

  // Alphanumeric code = Unique ID
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded print:border-slate-300 font-semibold" title="Verified via Reference Tree Unique Code">
      <span className="text-[10px] font-bold tracking-wider text-purple-600 bg-purple-100/70 px-1 py-0.2 rounded">UID</span>
      {clean}
    </span>
  );
}

export function AttendanceClient({ initialData }: { initialData: Attendance[] }) {
  const [filter, setFilter] = useState<"all" | "patient" | "external" | "clinic" | "home">("all");

  // Export Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportType, setExportType] = useState<"xlsx" | "pdf">("xlsx");
  const [startDate, setStartDate] = useState<string>("");
  const [stopDate, setStopDate] = useState<string>("");

  // Determine the oldest date from the data
  const oldestDate = useMemo(() => {
    if (!initialData || initialData.length === 0) return new Date().toISOString().split("T")[0];
    return initialData.reduce((min, p) => (p.attendance_date < min ? p.attendance_date : min), initialData[0].attendance_date);
  }, [initialData]);

  // Data currently visible based on the status / visit-type filter
  const filteredData = initialData.filter((a) => {
    if (filter === "all") return true;
    if (filter === "patient") return a.status.toLowerCase().startsWith("patient");
    if (filter === "external") return a.status.toLowerCase().startsWith("external");
    if (filter === "clinic") return getVisitType(a) === "Clinic Visit";
    if (filter === "home") return getVisitType(a) === "Home Visit";
    return true;
  });

  // Data visible during PDF print (filtered by date range)
  const printFilteredData = filteredData.filter((a) => {
    const matchStart = !startDate || a.attendance_date >= startDate;
    const matchStop = !stopDate || a.attendance_date <= stopDate;
    return matchStart && matchStop;
  });

  const openExportModal = (type: "xlsx" | "pdf") => {
    if (filteredData.length === 0) {
      toast.error("No data to export.");
      return;
    }
    setExportType(type);
    setStartDate(oldestDate);
    setStopDate(new Date().toISOString().split("T")[0]);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    if (startDate && stopDate && startDate > stopDate) {
      toast.error("Start date cannot be after stop date.");
      return;
    }

    const dataToExport = filteredData.filter((a) => {
      const matchStart = !startDate || a.attendance_date >= startDate;
      const matchStop = !stopDate || a.attendance_date <= stopDate;
      return matchStart && matchStop;
    });

    if (dataToExport.length === 0) {
      toast.error("No records found in the selected date range.");
      return;
    }

    const formattedStart = startDate ? format(parseISO(startDate), "dd/MM/yyyy") : "-";
    const formattedStop = stopDate ? format(parseISO(stopDate), "dd/MM/yyyy") : "-";
    const titleRow = `Attendance Sheet from ${formattedStart} to ${formattedStop}`;

    if (exportType === "xlsx") {
      // Create worksheet with full metadata
      const wsData = [
        [titleRow], // First row description
        [], // Empty row for spacing
        ["Date", "Name", "Phone", "Visit Type", "Verification Code", "Auth Method", "Status"], // Headers
        ...dataToExport.map((a) => {
          const vType = getVisitType(a);
          const rawCode = a.unique_code?.trim() || "";
          let authMethod = "-";
          if (rawCode) {
            authMethod = /^\d{6}$/.test(rawCode) ? "Email OTP" : "Unique ID";
          }
          return [
            a.attendance_date,
            a.patient_name || "-",
            a.phone || "-",
            vType,
            rawCode || "-",
            authMethod,
            getPatientCategory(a),
          ];
        }),
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = [
        { wch: 14 }, // Date
        { wch: 22 }, // Name
        { wch: 16 }, // Phone
        { wch: 16 }, // Visit Type
        { wch: 20 }, // Verification Code
        { wch: 16 }, // Auth Method
        { wch: 14 }, // Status
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendances");
      
      // Download XLSX
      XLSX.writeFile(wb, `Attendance_Sheet_${stopDate || "all"}.xlsx`);
      toast.success(`Exported ${dataToExport.length} attendance record${dataToExport.length === 1 ? "" : "s"} successfully!`);
      setIsModalOpen(false);
    } else if (exportType === "pdf") {
      window.print();
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Export Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Export Attendances
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Select a date range to export attendance records. All records will remain preserved in the database.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  max={stopDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stop Date</label>
                <input 
                  type="date" 
                  value={stopDate} 
                  min={startDate}
                  max={new Date().toISOString().split("T")[0]} // Prevent future dates
                  onChange={(e) => setStopDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-md shadow-sm transition-colors flex items-center gap-2"
              >
                {exportType === "xlsx" ? <IconDownload size={16} /> : <IconPrinter size={16} />}
                Export {exportType.toUpperCase()}
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
            onChange={(e) => setFilter(e.target.value as "all" | "patient" | "external" | "clinic" | "home")}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Attendances</option>
            <option value="patient">Internal Patients Only</option>
            <option value="external">External Visitors Only</option>
            <option value="clinic">Clinic Visits Only</option>
            <option value="home">Home Visits Only</option>
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
            Attendance Sheet from {startDate ? format(parseISO(startDate), "dd/MM/yyyy") : "-"} to {stopDate ? format(parseISO(stopDate), "dd/MM/yyyy") : "-"}
          </h1>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200 sticky top-0 z-10 print:static print:bg-white">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium">Visit Type</th>
              <th className="px-6 py-3 font-medium">Verification / UID</th>
              <th className="px-6 py-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(isModalOpen && exportType === 'pdf' ? printFilteredData : filteredData).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              (isModalOpen && exportType === 'pdf' ? printFilteredData : filteredData).map((a) => {
                const visitType = getVisitType(a);
                const isHome = visitType === "Home Visit";
                const isInternal = getPatientCategory(a) === "Internal";

                return (
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
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isHome
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-teal-50 text-teal-800 border border-teal-200"
                      }`}>
                        {isHome ? <IconHome className="h-3.5 w-3.5 text-amber-600" /> : <IconBuildingHospital className="h-3.5 w-3.5 text-teal-600" />}
                        {visitType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {renderCodeBadge(a.unique_code)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                        ${isInternal ? 'bg-green-100 text-green-800 print:border print:border-green-300' : 'bg-orange-100 text-orange-800 print:border print:border-orange-300'}
                      `}>
                        {isInternal ? 'Internal' : 'External'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
