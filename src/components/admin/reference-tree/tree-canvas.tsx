"use client";

import React, { useCallback, useState, useRef, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  BackgroundVariant,
  Handle,
  Position,
  useReactFlow,
  NodeProps,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { IconUserStar, IconStethoscope, IconUserPlus, IconEdit, IconCheck, IconTrash } from "@tabler/icons-react";

type CustomNodeData = {
  label: string;
  type: "doctor" | "patient" | "other";
};

type AppNode = Node<CustomNodeData>;

// Custom node component with an edit button
function EditableNode({ id, data, selected }: NodeProps<AppNode>) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(data.label);
  const { setNodes, setEdges } = useReactFlow();

  const handleSave = () => {
    setIsEditing(false);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: name } };
        }
        return node;
      })
    );
  };

  const handleDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <input
              autoFocus
              className="bg-white text-slate-900 px-1 py-0.5 rounded border-none outline-none text-sm w-28"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
            <button onClick={handleSave} className="text-white hover:text-slate-200 transition-colors">
              <IconCheck size={16} />
            </button>
          </>
        ) : (
          <span>{data.label}</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />

      {selected && !isEditing && (
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="bg-white text-slate-500 p-1.5 rounded-md shadow-sm border border-slate-200 hover:text-brand-600 transition-colors"
            title="Edit"
          >
            <IconEdit size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="bg-white text-slate-500 p-1.5 rounded-md shadow-sm border border-slate-200 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <IconTrash size={14} />
          </button>
        </div>
      )}
    </>
  );
}

const nodeColor = (node: AppNode) => {
  switch (node.data.type) {
    case "doctor":
      return "#17153f"; // brand-600 (Darkest)
    case "patient":
      return "#2b2775"; // brand-500 (Medium)
    case "other":
      return "#b0a5d2"; // brand-300 (Lightest)
    default:
      return "#eee";
  }
};

export function TreeCanvas({
  treeId,
  initialNodes,
  initialEdges,
}: {
  treeId: string;
  initialNodes: AppNode[];
  initialEdges: Edge[];
}) {
  const supabase = createBrowserSupabase();
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSaving, setIsSaving] = useState(false);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  const nodeTypes = useMemo(() => ({ editable: EditableNode }), []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from("reference_trees")
      .update({
        nodes: nodes as any,
        edges: edges as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", treeId);

    setIsSaving(false);

    if (error) {
      toast.error("Failed to save reference tree");
      console.error(error);
    } else {
      toast.success("Reference tree saved successfully");
    }
  };

  const addNode = (type: "doctor" | "patient" | "other") => {
    let position = { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 };
    if (rfInstance && flowContainerRef.current) {
      const rect = flowContainerRef.current.getBoundingClientRect();
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      
      const flowPos = rfInstance.screenToFlowPosition({ x: centerX, y: centerY });
      position = {
        x: flowPos.x + (Math.random() * 40 - 20),
        y: flowPos.y + (Math.random() * 40 - 20),
      };
    }

    const newNode: AppNode = {
      id: crypto.randomUUID(),
      type: "editable", // Use our custom node
      position,
      data: {
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type,
      },
      style: {
        background: nodeColor({ data: { type } } as AppNode),
        color: type === "other" ? "#0a091c" : "white", // Dark text for lightest background
        border: "none",
        borderRadius: "8px",
        padding: "10px 20px",
        fontWeight: "bold",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="h-full w-full" ref={flowContainerRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        fitView
        className="bg-slate-50"
      >
        <Controls />
        <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        
        <Panel position="top-left" className="bg-white p-2 rounded-lg shadow-md border border-slate-200 flex gap-2">
          <button
            onClick={() => addNode("doctor")}
            className="flex items-center gap-1 bg-brand-700 text-white px-3 py-1.5 rounded-md hover:bg-brand-800 transition-colors text-sm font-medium"
          >
            <IconStethoscope className="w-4 h-4" /> Doctor
          </button>
          <button
            onClick={() => addNode("patient")}
            className="flex items-center gap-1 bg-brand-500 text-white px-3 py-1.5 rounded-md hover:bg-brand-600 transition-colors text-sm font-medium"
          >
            <IconUserPlus className="w-4 h-4" /> Patient
          </button>
          <button
            onClick={() => addNode("other")}
            className="flex items-center gap-1 bg-brand-200 text-brand-900 px-3 py-1.5 rounded-md hover:bg-brand-300 transition-colors text-sm font-medium"
          >
            <IconUserStar className="w-4 h-4" /> Other
          </button>
        </Panel>

        <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-md border border-slate-200 flex gap-2">
           <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand-600 text-white px-4 py-1.5 rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
          >
            {isSaving ? "Saving..." : "Save Canvas"}
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
