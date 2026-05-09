import { useState, useMemo, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: string;
  purpose?: string;
  scale?: string;
}

interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

interface DiagramPanelProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

const typeColors: Record<string, string> = {
  api: "#3b82f6",     // blue
  service: "#10b981", // green
  db: "#a855f7",      // purple
  cache: "#f97316",   // orange
  queue: "#eab308",   // yellow
};

const typeLabels: Record<string, string> = {
  api: "API Gateway",
  service: "Service",
  db: "Database",
  cache: "Cache",
  queue: "Queue"
};

// --- Custom Node Implementation ---
// Gives us control over styling, hover states, and handles
const SystemNode = ({ data }: any) => {
  const color = data.color || "#555";
  const label = data.label || "Node";
  const truncatedLabel = label.length > 20 ? label.slice(0, 20) + "..." : label;

  console.log("Node Data:", data);

  return (
    <div 
      className="group relative flex flex-col items-center justify-center p-3 rounded-lg border-2 shadow-lg min-w-[140px] text-center bg-[#111] transition-all duration-300 hover:shadow-xl cursor-grab active:cursor-grabbing hover:border-white"
      style={{ borderColor: color }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2" style={{ background: color, border: "none" }} />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" style={{ background: color, border: "none" }} />
      
      <div className="flex flex-col items-center gap-1">
        <div className="w-2.5 h-2.5 rounded-full animate-pulse mr-1 absolute top-2 right-2" style={{ backgroundColor: color }} />
        <span className="text-xs font-bold tracking-wide text-gray-200 mt-1">{truncatedLabel}</span>
        <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">{data.typeLabel}</span>
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute top-full mt-2 w-48 p-2 rounded-md bg-black/90 border border-[#333] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
        <div className="text-[10px] text-gray-300 mb-1 leading-tight"><strong className="text-blue-400">Purpose:</strong> {data.purpose || "No purpose defined"}</div>
        <div className="text-[10px] text-gray-300 leading-tight"><strong className="text-orange-400">Scale:</strong> {data.scale || "No scale defined"}</div>
      </div>
    </div>
  );
};

export function DiagramPanel({ nodes, edges }: DiagramPanelProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Map Backend Data -> React Flow Structure
  const flowNodes: Node[] = useMemo(() => {
    return nodes.map((n) => ({
      id: n.id,
      position: { x: n.x * 2.5, y: n.y * 2.5 }, // spread out force mapping automatically slightly
      type: "systemNode",
      data: {
        label: n.label,
        color: typeColors[n.type] || "#888",
        typeLabel: typeLabels[n.type] || n.type,
        purpose: n.purpose,
        scale: n.scale
      }
    }));
  }, [nodes]);

  const flowEdges: Edge[] = useMemo(() => {
    return edges.map((e, idx) => ({
      id: `e-${e.from}-${e.to}-${idx}`,
      source: e.from,
      target: e.to,
      animated: true,
      label: e.label,
      labelStyle: { fill: "#aaa", fontSize: 10, fontWeight: 700 },
      labelBgStyle: { fill: "#111", fillOpacity: 0.8 },
      style: { stroke: "#555", strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: '#555',
      },
    }));
  }, [edges]);

  const [rfNodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Update explicitly if backend outputs change
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({ systemNode: SystemNode }), []);

  return (
    <div className={`rounded-xl border border-[#333] shadow-lg glass-panel bg-[#0a0a0a]/90 backdrop-blur-md flex flex-col transition-all duration-300 relative ${isFullScreen ? 'fixed inset-4 z-50' : 'h-full'}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] bg-[#111]">
        <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">
          Interactive Map
        </span>
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#222] hover:bg-[#333] text-gray-300 hover:text-white transition-colors text-xs font-medium"
        >
          {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          {isFullScreen ? "Exit Full View" : "Full View Mode"}
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full bg-[#111] relative">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={3}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#333" gap={30} size={1} />
          <Controls className="bg-[#222] border-[#333] fill-gray-300" />
          <MiniMap 
             nodeColor={(n) => n.data.color as string}
             maskColor="rgba(0,0,0, 0.7)"
             style={{ backgroundColor: '#1a1a1a' }}
             className="border border-[#333] rounded-lg"
          />
        </ReactFlow>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex gap-4 bg-black/80 p-3 rounded-lg border border-[#333] backdrop-blur-sm z-10 shadow-xl">
          {Object.entries(typeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: typeColors[type] || "#555" }}
              />
              <span className="text-[10px] text-gray-300 font-mono tracking-widest uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
