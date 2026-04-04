import { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import { useParams } from "react-router-dom";
import RunContextBar from "@/components/app/RunContextBar";
import SemanticNode from "@/components/graph/SemanticNode";
import {
  StructuralEdge,
  StrongRhetoricalEdge,
  ModerateRhetoricalEdge,
  LongRangeEdge,
} from "@/components/graph/edges";
import EdgeMarkers from "@/components/graph/EdgeMarkers";
import GraphToolbar from "@/components/graph/GraphToolbar";
import GraphLegend from "@/components/graph/GraphLegend";
import InspectPanel from "@/components/graph/InspectPanel";
import TimelineStrip from "@/components/graph/TimelineStrip";

const nodeTypes = { semantic: SemanticNode };
const edgeTypes = {
  structural: StructuralEdge,
  strong: StrongRhetoricalEdge,
  moderate: ModerateRhetoricalEdge,
  longrange: LongRangeEdge,
};

// Signal tags mock
const SIGNAL_TAGS: Record<string, ("trend" | "comment" | "retention")[]> = {
  "001": ["trend"],
  "003": ["comment"],
  "007": ["trend", "retention"],
  "008": ["comment", "retention"],
  "009": ["trend"],
};

const RAW_NODES: Node[] = [
  { id: "001", type: "semantic", position: { x: 0, y: 0 }, data: { node_type: "claim", timeStart: "0:00", timeEnd: "0:28", summary: "Host opens with a direct assertion about AI capabilities.", signalTags: SIGNAL_TAGS["001"] } },
  { id: "002", type: "semantic", position: { x: 0, y: 0 }, data: { node_type: "explanation", timeStart: "0:28", timeEnd: "1:05", summary: "Breaks down the technical mechanism behind the claim." } },
  { id: "003", type: "semantic", position: { x: 0, y: 0 }, data: { node_type: "example", timeStart: "1:05", timeEnd: "1:42", summary: "Gives a concrete demo of the model failing in a real scenario.", signalTags: SIGNAL_TAGS["003"] } },
  { id: "004", type: "semantic", position: { x: 0, y: 0 }, data: { node_type: "challenge_exchange", timeStart: "1:42", timeEnd: "2:18", summary: "Guest pushes back — argues the failure is an edge case." } },
  { id: "005", type: "semantic", position: { x: 0, y: 0 }, data: { node_type: "qa_exchange", timeStart: "2:18", timeEnd: "2:55", summary: "Host asks what would change the guest's mind." } },
  { id: "006", type: "semantic", position: { x: 0, y: 0 }, data: { node_type: "anecdote", timeStart: "2:55", timeEnd: "3:40", summary: "Guest shares a personal story about the same model working." } },
  { id: "007", type: "semantic", position: { x: 0, y: 0 }, data: { node_type: "setup_payoff", timeStart: "3:40", timeEnd: "4:22", summary: "Host lays out the failed experiment, guest reacts in disbelief.", flags: ["high_resonance_candidate"], signalTags: SIGNAL_TAGS["007"] } },
  { id: "008", type: "semantic", position: { x: 0, y: 0 }, data: { node_type: "reaction_beat", timeStart: "4:22", timeEnd: "4:48", summary: "Guest's 'no way' moment — laughter, genuine surprise.", signalTags: SIGNAL_TAGS["008"] } },
  { id: "009", type: "semantic", position: { x: 0, y: 0 }, data: { node_type: "reveal", timeStart: "4:48", timeEnd: "5:20", summary: "Host reveals the result was intentional — explains why.", signalTags: SIGNAL_TAGS["009"] } },
  { id: "010", type: "semantic", position: { x: 0, y: 0 }, data: { node_type: "transition", timeStart: "5:20", timeEnd: "5:45", summary: "Conversation moves to the next topic." } },
];

const RAW_EDGES: Edge[] = [
  { id: "e-s-1", source: "001", target: "002", type: "structural" },
  { id: "e-s-2", source: "002", target: "003", type: "structural" },
  { id: "e-s-3", source: "003", target: "004", type: "structural" },
  { id: "e-s-4", source: "004", target: "005", type: "structural" },
  { id: "e-s-5", source: "005", target: "006", type: "structural" },
  { id: "e-s-6", source: "006", target: "007", type: "structural" },
  { id: "e-s-7", source: "007", target: "008", type: "structural" },
  { id: "e-s-8", source: "008", target: "009", type: "structural" },
  { id: "e-s-9", source: "009", target: "010", type: "structural" },
  { id: "e-r-1", source: "007", target: "008", type: "strong", label: "setup_for" },
  { id: "e-r-2", source: "008", target: "007", type: "strong", label: "payoff_of" },
  { id: "e-r-3", source: "005", target: "006", type: "strong", label: "answers" },
  { id: "e-m-1", source: "004", target: "002", type: "moderate", label: "challenges" },
  { id: "e-m-2", source: "006", target: "002", type: "moderate", label: "supports" },
  { id: "e-m-3", source: "002", target: "003", type: "moderate", label: "elaborates" },
  { id: "e-l-1", source: "009", target: "001", type: "longrange", label: "callback_to" },
];

const NODE_W = 200;
const NODE_H = 100;
const ALL_TYPES = new Set(["claim", "explanation", "example", "anecdote", "reaction_beat", "qa_exchange", "challenge_exchange", "setup_payoff", "reveal", "transition"]);

function layoutGraph(nodes: Node[], edges: Edge[]): Node[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 40 });
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  Dagre.layout(g);
  return nodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 } };
  });
}

function GraphInner() {
  const { id } = useParams();
  const rf = useReactFlow();

  const layoutNodes = useMemo(() => layoutGraph(RAW_NODES, RAW_EDGES), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, , onEdgesChange] = useEdgesState(RAW_EDGES);

  // Toolbar state
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(ALL_TYPES));
  const [confidence, setConfidence] = useState(0);
  const [clipWorthy, setClipWorthy] = useState(false);
  const [signalFilters, setSignalFilters] = useState({ trend: false, comment: false, retention: false });
  const [subgraph, setSubgraph] = useState(false);

  // Inspect state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Compute type counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    RAW_NODES.forEach((n) => { const t = (n.data as any).node_type; counts[t] = (counts[t] ?? 0) + 1; });
    return counts;
  }, []);

  // Any signal filter active?
  const anySignalActive = signalFilters.trend || signalFilters.comment || signalFilters.retention;

  // Apply dimming based on signal filters
  const displayNodes = useMemo(() => {
    if (!anySignalActive) return nodes.map((n) => ({ ...n, data: { ...n.data, dimmed: false } }));
    return nodes.map((n) => {
      const tags: string[] = (n.data as any).signalTags ?? [];
      const match = (signalFilters.trend && tags.includes("trend")) ||
                    (signalFilters.comment && tags.includes("comment")) ||
                    (signalFilters.retention && tags.includes("retention"));
      return { ...n, data: { ...n.data, dimmed: !match } };
    });
  }, [nodes, anySignalActive, signalFilters]);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const handleEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  return (
    <div className="flex flex-col" style={{ height: "100vh" }}>
      <RunContextBar
        runId={id ?? "demo"}
        runName="Lex ep. 412 — Sam Altman"
        videoUrl="youtube.com/watch?v=abc123"
        currentPhase={3}
        completedPhases={2}
      />

      <div className="relative flex-1" style={{ overflow: "hidden" }}>
        <EdgeMarkers />
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          fitView
          minZoom={0.3}
          maxZoom={2.0}
          nodesDraggable
          elementsSelectable
          panOnDrag
          zoomOnScroll
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} color="rgba(244,241,238,0.04)" size={1.5} gap={24} />
        </ReactFlow>

        <GraphToolbar
          typeCounts={typeCounts}
          activeTypes={activeTypes}
          onToggleType={(t) => setActiveTypes((s) => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n; })}
          onSelectAllTypes={() => setActiveTypes(new Set(ALL_TYPES))}
          onClearTypes={() => setActiveTypes(new Set())}
          confidence={confidence}
          onConfidenceChange={setConfidence}
          clipWorthy={clipWorthy}
          onClipWorthyToggle={() => setClipWorthy((v) => !v)}
          signalFilters={signalFilters}
          onSignalToggle={(s) => setSignalFilters((f) => ({ ...f, [s]: !f[s] }))}
          onZoomIn={() => rf.zoomIn()}
          onZoomOut={() => rf.zoomOut()}
          onFitView={() => rf.fitView()}
          subgraph={subgraph}
          onSubgraphToggle={() => setSubgraph((v) => !v)}
        />

        <GraphLegend typeCounts={typeCounts} />

        <InspectPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          allEdges={edges}
          onClose={() => { setSelectedNode(null); setSelectedEdge(null); }}
        />

        <TimelineStrip nodes={nodes} />
      </div>
    </div>
  );
}

export default function RunGraph() {
  return (
    <ReactFlowProvider>
      <GraphInner />
    </ReactFlowProvider>
  );
}
