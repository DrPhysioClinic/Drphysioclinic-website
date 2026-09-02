"use client";

import React, { useState, useMemo } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { GooeyInput } from "@/components/ui/gooey-input";
import { useRouter } from "next/navigation";
import { IconChevronDown, IconChevronRight, IconPlus, IconTrash, IconEdit, IconX } from "@tabler/icons-react";

export type Patient = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  code?: string;
};

export type DoctorNode = {
  id: string;
  doctorName: string;
  patients: Patient[];
};

export function ReferenceTable({
  treeId,
  initialData,
}: {
  treeId: string;
  initialData: any[];
}) {
  const supabase = createBrowserSupabase();
  
  // Clean initial data to ensure it matches our new structure, ignoring old canvas nodes
  const cleanInitialData = useMemo(() => {
    return initialData.filter(d => typeof d === "object" && d !== null && "doctorName" in d && "patients" in d) as DoctorNode[];
  }, [initialData]);

  const router = useRouter();
  const [data, setData] = useState<DoctorNode[]>(cleanInitialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDoctors, setExpandedDoctors] = useState<Set<string>>(new Set(cleanInitialData.map(d => d.id)));
  
  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ id: string; field: "doctorName" | "patientName" | "patientPhone" | "patientEmail"; value: string } | null>(null);

  const handleSave = async (newData: DoctorNode[]) => {
    setData(newData);
    const { error } = await supabase
      .from("reference_trees")
      .update({
        nodes: newData as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", treeId);

    if (error) {
      toast.error("Failed to save reference data");
      console.error(error);
    } else {
      toast.success("Saved successfully");
      router.refresh();
    }
  };

  const addDoctor = () => {
    const newDoc: DoctorNode = {
      id: crypto.randomUUID(),
      doctorName: "New Doctor",
      patients: [],
    };
    const newData = [newDoc, ...data];
    setExpandedDoctors(new Set([...Array.from(expandedDoctors), newDoc.id]));
    handleSave(newData);
  };

  const deleteDoctor = (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor and all their patients?")) return;
    const newData = data.filter(d => d.id !== id);
    handleSave(newData);
  };

  const addPatient = (doctorId: string) => {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newData = data.map(doc => {
      if (doc.id === doctorId) {
        return {
          ...doc,
          patients: [...doc.patients, { id: crypto.randomUUID(), name: "", phone: "", email: "", code: generateCode() }],
        };
      }
      return doc;
    });
    setExpandedDoctors(new Set([...Array.from(expandedDoctors), doctorId]));
    handleSave(newData);
  };

  const deletePatient = (doctorId: string, patientId: string) => {
    const newData = data.map(doc => {
      if (doc.id === doctorId) {
        return {
          ...doc,
          patients: doc.patients.filter(p => p.id !== patientId),
        };
      }
      return doc;
    });
    handleSave(newData);
  };

  const toggleExpand = (doctorId: string) => {
    const next = new Set(expandedDoctors);
    if (next.has(doctorId)) {
      next.delete(doctorId);
    } else {
      next.add(doctorId);
    }
    setExpandedDoctors(next);
  };

  // Derived filtered data based on search and sort patients alphabetically
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    return data.map(doc => {
      let matchedPatients = doc.patients;
      
      if (query.trim()) {
        const docMatch = doc.doctorName.toLowerCase().includes(query);
        const filtered = doc.patients.filter(p => 
          p.name.toLowerCase().includes(query) || p.phone.toLowerCase().includes(query)
        );
        
        // If only doc matches, show all patients. Otherwise show matched patients.
        matchedPatients = docMatch && filtered.length === 0 ? doc.patients : filtered;
      }
      
      // Sort patients alphabetically by name
      const sortedPatients = [...matchedPatients].sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      if (!query.trim() || doc.doctorName.toLowerCase().includes(query) || sortedPatients.length > 0) {
        return {
          ...doc,
          patients: sortedPatients, 
        };
      }
      return null;
    }).filter(Boolean) as DoctorNode[];
  }, [data, searchQuery]);

  // Expand matching doctors automatically on search
  useMemo(() => {
    if (searchQuery.trim()) {
      setExpandedDoctors(new Set(filteredData.map(d => d.id)));
    }
  }, [searchQuery, filteredData]);

  const commitEdit = (id: string, field: "doctorName" | "patientName" | "patientPhone" | "patientEmail", newValue: string) => {
    const newData = data.map(doc => {
      if (field === "doctorName" && doc.id === id) {
        return { ...doc, doctorName: newValue };
      }
      if (field !== "doctorName") {
        return {
          ...doc,
          patients: doc.patients.map(p => {
            if (p.id === id) {
              return { ...p, [field === "patientName" ? "name" : field === "patientPhone" ? "phone" : "email"]: newValue };
            }
            return p;
          }),
        };
      }
      return doc;
    });
    handleSave(newData);
    setEditingCell(null);
  };

  const renderEditableCell = (id: string, field: "doctorName" | "patientName" | "patientPhone" | "patientEmail", currentValue: string, placeholder = "") => {
    const isEditing = editingCell?.id === id && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2 w-full">
          <input
            autoFocus
            className="flex-1 bg-white border border-brand-400 rounded-md px-2 py-1 text-sm outline-none ring-2 ring-brand-100"
            value={editingCell.value}
            onChange={e => setEditingCell({ ...editingCell, value: e.target.value })}
            onKeyDown={e => {
              if (e.key === "Enter") commitEdit(id, field, editingCell.value);
              if (e.key === "Escape") setEditingCell(null);
            }}
            onBlur={() => commitEdit(id, field, editingCell.value)}
          />
        </div>
      );
    }

    return (
      <div 
        className="group relative flex items-center min-h-[32px] w-full cursor-text rounded-md px-2 hover:bg-slate-50 transition-colors"
        onClick={() => setEditingCell({ id, field, value: currentValue })}
      >
        <span className={currentValue ? "" : "text-slate-400 italic"}>{currentValue || placeholder}</span>
        <div className="absolute right-2 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity">
          <IconEdit size={14} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <button onClick={addDoctor} className="btn-primary flex items-center gap-2">
          <IconPlus size={16} /> Add Doctor
        </button>
        <div className="flex justify-end [--gooey-width:180px] sm:[--gooey-width:260px] [--gooey-collapsed:125px] sm:[--gooey-collapsed:120px]">
          <GooeyInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search name or phone..."
            collapsedWidth="var(--gooey-collapsed)"
            expandedWidth="var(--gooey-width)"
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {searchQuery ? "No matches found." : "No data available. Click 'Add Doctor' to begin."}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map(doc => {
              const isExpanded = expandedDoctors.has(doc.id);
              return (
                <div key={doc.id} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  {/* Doctor Header */}
                  <div className="bg-slate-50 flex items-center p-2 border-b border-slate-200">
                    <button 
                      onClick={() => toggleExpand(doc.id)} 
                      className="p-1 text-slate-500 hover:text-slate-900 transition-colors mr-2 rounded-md hover:bg-slate-200"
                    >
                      {isExpanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                    </button>
                    <div className="flex-1 font-semibold text-slate-800">
                      {renderEditableCell(doc.id, "doctorName", doc.doctorName, "Doctor Name")}
                    </div>
                    <button 
                      onClick={() => deleteDoctor(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 ml-2"
                      title="Delete Doctor"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>

                  {/* Patients Table */}
                  {isExpanded && (
                    <div className="bg-white">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-xs text-slate-500 uppercase border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-2 font-medium w-4/12">Patient Name</th>
                            <th className="px-4 py-2 font-medium w-3/12 border-l border-slate-100">Phone Number</th>
                            <th className="px-4 py-2 font-medium w-3/12 border-l border-slate-100">Email</th>
                            <th className="px-4 py-2 font-medium w-1/12 border-l border-slate-100 text-center">Code</th>
                            <th className="px-4 py-2 w-1/12 text-center border-l border-slate-100"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {doc.patients.map(patient => (
                            <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-2 py-1 align-top">
                                {renderEditableCell(patient.id, "patientName", patient.name, "Enter name")}
                              </td>
                              <td className="px-2 py-1 align-top border-l border-slate-100">
                                {renderEditableCell(patient.id, "patientPhone", patient.phone, "Enter phone")}
                              </td>
                              <td className="px-2 py-1 align-top border-l border-slate-100">
                                {renderEditableCell(patient.id, "patientEmail", patient.email || "", "Enter email")}
                              </td>
                              <td className="px-2 py-2 align-middle border-l border-slate-100 text-center">
                                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                  {patient.code || 'N/A'}
                                </span>
                              </td>
                              <td className="px-2 py-1 align-middle text-center border-l border-slate-100">
                                <button
                                  onClick={() => deletePatient(doc.id, patient.id)}
                                  className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded"
                                  title="Delete Patient"
                                >
                                  <IconX size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={4} className="px-4 py-2 bg-slate-50/30">
                              <button 
                                onClick={() => addPatient(doc.id)}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                              >
                                <IconPlus size={14} /> Add row
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
