import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { PromptInput } from "../components/PromptInput";
import { OutputPanel } from "../components/OutputPanel";
import { DiagramPanel } from "../components/DiagramPanel";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { MetricsChartPanel } from "../components/MetricsChartPanel";
import { BASE_URL } from "../config";

export const Route = createFileRoute("/")({
  component: ArchFlowWorkspace,
  head: () => ({
    meta: [
      { title: "ARCHFLOW — AI System Design" },
      { name: "description", content: "Generate production-ready system architectures with AI" },
    ],
  }),
});

function ArchFlowWorkspace() {
  const [activeSection, setActiveSection] = useState("workspace");
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<any | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<{prompt: string} | null>(null);
  const [debugInfo, setDebugInfo] = useState<any | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("archflow_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history from local storage:", e);
    }
  }, []);

  const scrollToTopAndFocus = () => {
    const scrollContainer = document.getElementById("main-scroll-container");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Timeout to ensure routing/rendering finishes before focusing
    setTimeout(() => {
      document.querySelector('textarea')?.focus();
    }, 150);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (section === "workspace") {
      scrollToTopAndFocus();
    }
  };

  const restoreHistoryItem = (item: any) => {
    setOutput(item.result);
    if (item.result.diagram && item.result.diagram.nodes) {
      setNodes(item.result.diagram.nodes);
      setEdges(item.result.diagram.edges);
    }
    setLastPrompt({ prompt: item.prompt }); // Safely populate input fallback
    handleSectionChange("workspace");
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("archflow_history");
    } catch (e) {}
  };

  const fetchSystemDesign = async (prompt: string, debugData: any) => {
    let response;
    try {
      response = await fetch(debugData.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(debugData.payload)
      });
    } catch (fetchErr: any) {
      debugData.errorMessage = fetchErr.message;
      if (fetchErr.message.includes("Failed to fetch")) {
        debugData.errorMessage = "ECONNREFUSED - Backend is not running or CORS blocked the request.";
      }
      throw new Error(debugData.errorMessage);
    }

    debugData.status = response.status;
    debugData.statusText = response.statusText;

    const text = await response.text();
    debugData.responseBody = text;

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      debugData.errorMessage = "Failed to parse JSON response";
      throw new Error("Invalid JSON response from backend.");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  };

  const handleHealthCheck = async () => {
    setDebugInfo(null);
    setShowDebug(false);
    setError(null);
    try {
      const resp = await fetch(`${BASE_URL}/api/health`, { method: 'GET' });
      if (resp.ok) {
        alert("SUCCESS - Backend Reachable!");
      } else {
        alert("FAIL - Connected but wrong response code.");
      }
    } catch (err) {
      console.error("HEALTH CHECK FAIL", err);
      alert("FAIL - Network Issue. Cannot reach backend.");
      setError("Health Check Failed! See console for network errors.");
    }
  };

  const handleGenerate = useCallback(async (prompt: string) => {
    setLastPrompt({prompt});
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setShowDebug(false);
    setNodes([]);
    setEdges([]);
    setOutput(null);

    const debugData = {
      url: `${BASE_URL}/api/v1/generate-system`,
      payload: { prompt },
      status: null as number | null,
      statusText: null as string | null,
      responseBody: null as string | null,
      errorMessage: null as string | null,
    };

    try {
      console.log(`Sending prompt to backend: `, prompt);
      const data = await fetchSystemDesign(prompt, debugData);

      // Save raw backend dict mapping properly
      setOutput(data);

      if (data.diagram && data.diagram.nodes) {
        const enrichedNodes = data.diagram.nodes.map((node: any) => {
           const matchingComponent = data.architecture?.components?.find((c: any) => 
             c.name.toLowerCase().includes(node.label.toLowerCase()) || 
             node.label.toLowerCase().includes(c.name.toLowerCase())
           );
           return {
             ...node,
             purpose: matchingComponent?.purpose || node.purpose,
             scale: matchingComponent?.scale || node.scale
           };
        });
        setNodes(enrichedNodes);
        setEdges(data.diagram.edges);
      }

      setDebugInfo(debugData);

      // Save to History organically
      const newHistoryItem = {
        id: Date.now(),
        prompt,
        result: data,
        createdAt: new Date().toISOString()
      };
      setHistory(prev => {
        const updated = [newHistoryItem, ...prev].slice(0, 10);
        try {
          localStorage.setItem("archflow_history", JSON.stringify(updated));
        } catch(e) {}
        return updated;
      });

    } catch (err: any) {
      console.error(err);
      debugData.errorMessage = debugData.errorMessage || err.message;
      setDebugInfo(debugData);
      setShowDebug(true);
      setError(`Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-gray-200 font-sans">
      <AppSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between px-8 h-16 border-b border-[#222] shrink-0 bg-[#111]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold tracking-wide">Workspace</h1>
            <span className="text-xs text-gray-600">/</span>
            <span className="text-xs text-gray-400 uppercase tracking-widest">{activeSection}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
              <Sparkles className="w-3 h-3" />
              Engine Active
            </div>
          </div>
        </header>

        {/* Content */}
        <div id="main-scroll-container" className="flex-1 overflow-auto bg-gradient-to-br from-[#0a0a0a] to-[#121212] scroll-smooth">
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

            {/* WORKSPACE SECTION */}
            {activeSection === "workspace" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Hero */}
                {!output && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-4 py-12"
                  >
                    <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                      Design Systems, Not Diagrams
                    </h2>
                    <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                      Describe your system. ARCHFLOW generates heavily structured architectures, deeply analytical tradeoffs, interactive maps, and concrete production load metrics.
                    </p>
                  </motion.div>
                )}

                {/* Prompt */}
                <div className="space-y-4">
                  <div className="flex justify-end w-full max-w-3xl mx-auto">
                    <button
                      onClick={handleHealthCheck}
                      className="text-xs bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 px-4 py-2 rounded-lg transition-colors border border-[#333] shadow-md"
                    >
                      <span className="opacity-70 mr-2 text-emerald-500">●</span>
                      Test Connectivity
                    </button>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <PromptInput onSubmit={(prompt) => handleGenerate(prompt)} isLoading={isLoading} />
                  </div>

                  {/* Error Message & Debug Toggle */}
                  {error && (
                    <div className="space-y-3 max-w-3xl mx-auto">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-400 text-sm font-medium bg-red-950/30 py-3 px-5 rounded-xl border border-red-900/50 flex flex-col sm:flex-row justify-between items-center shadow-lg gap-4"
                      >
                        <span>{error}</span>
                        <div className="flex items-center gap-2">
                           <button
                             onClick={() => lastPrompt && handleGenerate(lastPrompt.prompt)}
                             className="text-xs bg-red-900/60 hover:bg-red-800 text-white px-3 py-1.5 rounded-md transition-colors"
                           >
                             Retry Request
                           </button>
                           {debugInfo && (
                             <button
                               onClick={() => setShowDebug(!showDebug)}
                               className="text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 px-3 py-1.5 rounded-md transition-colors"
                             >
                               {showDebug ? "Hide Trace" : "Show Trace"}
                             </button>
                           )}
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* FAANG Skeleton Loading UI */}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl mx-auto mt-10">
                       <div className="flex items-center justify-center gap-3 text-blue-400 text-sm mb-6 animate-pulse">
                         <Sparkles className="w-4 h-4" />
                         Generating Deep Architectural Analysis...
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="h-28 bg-[#111]/80 animate-pulse rounded-xl border border-[#222]"></div>
                          <div className="h-28 bg-[#111]/80 animate-pulse rounded-xl border border-[#222]"></div>
                       </div>
                       <div className="h-64 bg-[#111]/80 animate-pulse rounded-xl border border-[#222]"></div>
                    </motion.div>
                  )}

                  {/* Debug Panel UI */}
                  {showDebug && debugInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="max-w-3xl mx-auto bg-[#0d0d0d] border border-[#222] rounded-xl p-5 font-mono text-xs text-gray-300 overflow-hidden flex flex-col shadow-2xl"
                    >
                      <div className="mb-4 text-emerald-500/80 font-bold tracking-widest border-b border-[#222] pb-2 uppercase">
                        Network Trace Dump
                      </div>
                      <div className="space-y-3">
                        <div><span className="text-blue-400 font-semibold">Request URL:</span> {debugInfo.url}</div>
                        <div><span className="text-blue-400 font-semibold">Payload:</span> {JSON.stringify(debugInfo.payload)}</div>
                        <div className="flex items-center gap-3">
                          <span className="text-blue-400 font-semibold">Response Status:</span>
                          <span className={`${debugInfo.status === 200 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"} px-2 py-0.5 rounded`}>
                            {debugInfo.status ? `${debugInfo.status} ${debugInfo.statusText}` : 'failed to reach server'}
                          </span>
                        </div>
                        {debugInfo.errorMessage && (
                          <div className="bg-red-950/30 p-3 rounded-lg border border-red-900/30 text-red-300 mt-2">
                            <span className="font-semibold text-red-500">Trace:</span> {debugInfo.errorMessage}
                          </div>
                        )}
                        <div className="pt-3 border-t border-[#222]"><span className="text-blue-400 font-semibold">Raw Response Body:</span></div>
                        <pre className="mt-2 text-gray-400 whitespace-pre-wrap break-words border border-[#222] p-4 rounded-lg bg-black/80 overflow-y-auto max-h-[300px]">
                          {debugInfo.responseBody || '(empty network response)'}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </div>

                {output && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-6">Design generated successfully! Use the sidebar tabs to explore the architecture, analytics, and interactive maps.</p>
                    <button 
                       onClick={() => {
                         if (lastPrompt) {
                           scrollToTopAndFocus();
                           handleGenerate(lastPrompt.prompt);
                         }
                       }} 
                       className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg shadow-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      ↻ Generate Again
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ARCHITECTURE SECTION */}
            {activeSection === "architecture" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {!output ? (
                  <div className="text-center text-gray-500 py-20">Generate a system design in the Workspace first.</div>
                ) : (
                  <OutputPanel data={output.architecture} />
                )}
              </motion.div>
            )}

            {/* METRICS SECTION */}
            {activeSection === "metrics" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {!output ? (
                  <div className="text-center text-gray-500 py-20">Generate a system design in the Workspace first.</div>
                ) : (
                  <MetricsChartPanel metrics={output.metrics} />
                )}
              </motion.div>
            )}

            {/* DIAGRAM SECTION */}
            {activeSection === "diagram" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-[600px] w-full max-w-7xl mx-auto">
                {!output ? (
                  <div className="text-center text-gray-500 py-20">Generate a system design in the Workspace first.</div>
                ) : (
                  <DiagramPanel nodes={nodes} edges={edges} />
                )}
              </motion.div>
            )}

            {/* HISTORY SECTION */}
            {activeSection === "history" && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-gray-200">Recent Designs</h3>
                     <button 
                        onClick={clearHistory}
                        className="text-xs px-3 py-1.5 bg-[#1a1a1a] hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded border border-[#333] transition-colors"
                     >
                        Clear History
                     </button>
                  </div>
                  
                  <div className="glass-panel p-5 rounded-xl border border-[#333]/50 bg-black/40 shadow-xl min-h-[300px]">
                     {history.length === 0 ? (
                        <div className="text-gray-500 text-sm text-center py-10">No design history found. Your past architectures will appear here.</div>
                     ) : (
                        <div className="flex flex-col gap-3">
                           {history.map((item, idx) => {
                              // Friendly time formatter block locally
                              const diffMs = Date.now() - new Date(item.createdAt).getTime();
                              const diffMins = Math.floor(diffMs / 60000);
                              const diffHrs = Math.floor(diffMins / 60);
                              const diffDays = Math.floor(diffHrs / 24);
                              
                              let timeStr = "Just now";
                              if (diffMins > 0 && diffMins < 60) timeStr = `${diffMins} min ago`;
                              else if (diffHrs > 0 && diffHrs < 24) timeStr = `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
                              else if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

                              const isCurrentlyOutput = output && output === item.result;

                              return (
                                 <button
                                    key={item.id}
                                    onClick={() => restoreHistoryItem(item)}
                                    className={`text-left p-4 rounded-xl border transition-all duration-300 relative group
                                       ${isCurrentlyOutput 
                                          ? "border-blue-500/50 bg-blue-900/10 shadow-lg" 
                                          : "border-[#333] bg-[#111] hover:border-gray-500 hover:bg-[#1a1a1a]"
                                       }
                                    `}
                                 >
                                    {isCurrentlyOutput && (
                                       <div className="absolute top-4 right-4 flex items-center gap-1.5">
                                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Active</span>
                                       </div>
                                    )}
                                    <div className="font-medium text-gray-200 text-sm pr-16 line-clamp-1">{item.prompt}</div>
                                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-3">
                                       <span>{timeStr}</span>
                                       {item.result?.metrics?.requests_per_sec && (
                                          <span className="px-1.5 py-0.5 rounded bg-[#222] border border-[#333] text-[10px]">
                                             {(item.result.metrics.requests_per_sec / 1000).toFixed(0)}k RPS
                                          </span>
                                       )}
                                    </div>
                                 </button>
                              );
                           })}
                        </div>
                     )}
                  </div>
               </motion.div>
            )}

            {/* DOCS SECTION */}
            {activeSection === "docs" && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 max-w-4xl mx-auto">
                  <h3 className="text-lg font-bold text-gray-200">System Documentation</h3>
                  <div className="glass-panel p-8 rounded-xl border border-[#333]/50 bg-black/40 text-gray-400 text-sm space-y-4 leading-relaxed shadow-xl max-w-3xl">
                     <p><strong>Input → LLM → Visualization Pipeline:</strong></p>
                     <ul className="list-disc list-inside ml-2 space-y-3">
                        <li>The system captures your system design prompt and architectural constraints.</li>
                        <li>It feeds the prompt into a rigidly structured Groq LangChain template enforcing strictly JSON metrics.</li>
                        <li>A robust backend parser safely hydrates quantitative components and load bottlenecks correctly safely avoiding generic responses.</li>
                        <li>The frontend dynamically ingests `metrics`, `architecture`, and `diagram` generating robust visualization pipelines.</li>
                     </ul>
                  </div>
               </motion.div>
            )}

            {/* SETTINGS SECTION */}
            {activeSection === "settings" && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 max-w-4xl mx-auto">
                  <h3 className="text-lg font-bold text-gray-200">Preferences</h3>
                  <div className="glass-panel p-6 rounded-xl border border-[#333]/50 bg-black/40 text-gray-400 text-sm shadow-xl max-w-2xl">
                     <div className="flex justify-between items-center border-b border-[#333] pb-4 mb-4">
                        <span>Theme Mode</span>
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded font-mono">Dark Only</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-[#333] pb-4 mb-4">
                        <span>Model Type</span>
                        <span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded font-mono">Llama-3.3-70B</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span>Environment Tier</span>
                        <span className="text-orange-500 bg-orange-500/10 px-2 py-1 rounded font-mono">FAANG Demo</span>
                     </div>
                  </div>
               </motion.div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
