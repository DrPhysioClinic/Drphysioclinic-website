import { createServerSupabase } from "@/lib/supabase/server";
import { TreeCanvasWrapper as TreeCanvas } from "@/components/admin/reference-tree/tree-canvas-wrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reference Tree | Admin Panel",
};

export const dynamic = "force-dynamic";

export default async function ReferenceTreePage() {
  const supabase = await createServerSupabase();

  // Fetch the default reference tree.
  const { data: tree, error } = await supabase
    .from("reference_trees")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching reference tree:", error);
  }

  // Parse JSON data, or use defaults
  const dbNodes = tree?.nodes ? (Array.isArray(tree.nodes) ? tree.nodes : []) : [];
  const dbEdges = tree?.edges ? (Array.isArray(tree.edges) ? tree.edges : []) : [];

  // Ensure any existing nodes use the new 'editable' type
  const initialNodes = dbNodes.map((n: any) => ({ ...n, type: "editable" }));
  const initialEdges = dbEdges;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14)-theme(spacing.16))] w-full flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Reference Tree</h1>
        <p className="text-sm text-slate-500">
          Drag and drop nodes to build a map of referrals between doctors, patients, and others.
        </p>
      </div>

      <div className="relative flex-1 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <TreeCanvas
          treeId="00000000-0000-0000-0000-000000000001"
          initialNodes={initialNodes as any}
          initialEdges={initialEdges as any}
        />
      </div>
    </div>
  );
}
