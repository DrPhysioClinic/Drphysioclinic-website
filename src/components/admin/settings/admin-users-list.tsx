"use client";

import { useState } from "react";
import { toast } from "sonner";
import { addAdminUser, updateAdminUser, deleteAdminUser } from "@/app/admin/(panel)/settings/admin-users-actions";
import { IconTrash, IconEdit, IconCheck, IconX } from "@tabler/icons-react";

type Admin = {
  user_id: string;
  email: string | null;
  created_at: string | null;
};

export function AdminUsersList({ admins }: { admins: Admin[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const toastId = toast.loading("Adding admin...");
    
    const result = await addAdminUser(formData);
    
    if (result?.error) {
      toast.error(result.error, { id: toastId });
    } else {
      toast.success("Admin added successfully", { id: toastId });
      (e.target as HTMLFormElement).reset();
      setIsAdding(false);
    }
  };

  const handleUpdate = async (userId: string) => {
    if (!editEmail && !editPassword) {
      setEditingId(null);
      return;
    }
    
    const formData = new FormData();
    formData.append("userId", userId);
    if (editEmail) formData.append("email", editEmail);
    if (editPassword) formData.append("password", editPassword);

    const toastId = toast.loading("Updating admin...");
    const result = await updateAdminUser(formData);
    
    if (result?.error) {
      toast.error(result.error, { id: toastId });
    } else {
      toast.success("Admin updated successfully", { id: toastId });
      setEditingId(null);
      setEditPassword("");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to completely remove this admin's access?")) return;
    
    const formData = new FormData();
    formData.append("userId", userId);
    
    const toastId = toast.loading("Deleting admin...");
    const result = await deleteAdminUser(formData);
    
    if (result?.error) {
      toast.error(result.error, { id: toastId });
    } else {
      toast.success("Admin deleted successfully", { id: toastId });
    }
  };

  const startEdit = (admin: Admin) => {
    setEditingId(admin.user_id);
    setEditEmail(admin.email || "");
    setEditPassword("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Admin Credentials</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary py-1.5 px-3 text-sm"
        >
          {isAdding ? "Cancel" : "+ Add Admin"}
        </button>
      </div>

      <div className="space-y-3">
        {admins.map((admin) => (
          <div key={admin.user_id} className="card p-3 flex flex-wrap items-center gap-3">
            {editingId === admin.user_id ? (
              <div className="flex-1 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="label">Username (Email)</label>
                  <input
                    type="email"
                    className="input"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="New email"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="label">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    className="input"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex items-center gap-2 self-end pb-1">
                  <button onClick={() => handleUpdate(admin.user_id)} className="btn-primary flex items-center gap-1 py-1.5 px-3">
                    <IconCheck size={16} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-outline flex items-center gap-1 py-1.5 px-3">
                    <IconX size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{admin.email}</div>
                  <div className="text-xs text-slate-500">
                    Added: {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(admin)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    <IconEdit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(admin.user_id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
                  >
                    <IconTrash size={16} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="border-t border-slate-200 pt-6">
          <h3 className="mb-3 font-semibold text-slate-800 text-sm uppercase tracking-wide">Add New Admin</h3>
          <form onSubmit={handleAdd} className="card p-4 flex flex-wrap items-end gap-3 bg-slate-50/50">
            <div className="flex-1 min-w-[200px]">
              <label className="label">Email Address</label>
              <input type="email" name="email" required placeholder="admin@drphysioclinic.com" className="input" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="label">Password</label>
              <input type="password" name="password" required minLength={6} placeholder="Secure password" className="input" />
            </div>
            <button type="submit" className="btn-primary">
              Confirm Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

