import { motion } from "framer-motion";
import { CheckCircle2, ServerCog, AlertTriangle, ArrowRightLeft, Scale, Zap } from "lucide-react";

interface ComponentObj {
  name: string;
  purpose: string;
  why: string;
  scale: string;
}

interface ArchitectureData {
  overview: string[];
  components: ComponentObj[];
  data_flow: string[];
  scaling: string[];
  bottlenecks: string[];
  tradeoffs: string[];
}

interface OutputPanelProps {
  data: ArchitectureData | null;
}

export function OutputPanel({ data }: OutputPanelProps) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Overview */}
      <section className="glass-panel p-5 rounded-xl border border-[#333]/50 bg-black/40 shadow-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4" /> System Overview
        </h4>
        <ul className="space-y-2">
          {data.overview?.map((bullet, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Components */}
      <section className="glass-panel p-5 rounded-xl border border-[#333]/50 bg-black/40 shadow-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2 mb-4">
          <ServerCog className="w-4 h-4" /> Core Components
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.components?.map((comp, i) => (
            <motion.div 
              key={i}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1a1a1a]/80 p-4 rounded-lg border border-[#333] hover:border-[#555] transition-colors"
            >
              <h5 className="font-bold text-gray-100 text-sm mb-2">{comp.name}</h5>
              <div className="space-y-2 text-xs">
                <div><span className="text-gray-500 font-semibold mr-1">Purpose:</span><span className="text-gray-300">{comp.purpose}</span></div>
                <div><span className="text-blue-400/80 font-semibold mr-1">Why:</span><span className="text-gray-300">{comp.why}</span></div>
                <div><span className="text-orange-400/80 font-semibold mr-1">Tradeoff/Scale:</span><span className="text-gray-300">{comp.scale}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Data Flow & Scaling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="glass-panel p-5 rounded-xl border border-[#333]/50 bg-black/40 shadow-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
            <ArrowRightLeft className="w-4 h-4" /> Data Flow
          </h4>
          <ul className="space-y-2 text-xs text-gray-300 list-decimal list-inside marker:text-emerald-500 font-mono">
            {data.data_flow?.map((step, i) => <li key={i}>{step}</li>)}
          </ul>
        </section>

        <section className="glass-panel p-5 rounded-xl border border-[#333]/50 bg-black/40 shadow-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4" /> Scaling Strategies
          </h4>
          <ul className="space-y-2 text-xs text-gray-300 list-disc list-inside marker:text-orange-500">
            {data.scaling?.map((bullet, i) => <li key={i}>{bullet}</li>)}
          </ul>
        </section>
      </div>

      {/* Bottlenecks & Tradeoffs */}
      <section className="glass-panel p-5 rounded-xl border border-red-900/30 bg-red-950/10 shadow-lg">
         <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2 mb-3">
           <AlertTriangle className="w-4 h-4" /> Bottlenecks & System Tradeoffs
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
            <div>
              <div className="font-semibold text-red-300 mb-1">Potential Bottlenecks:</div>
              <ul className="list-disc list-inside marker:text-red-500/50 space-y-1">
                {data.bottlenecks?.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-orange-300 mb-1">Architectural Tradeoffs:</div>
              <ul className="list-disc list-inside marker:text-orange-500/50 space-y-1">
                {data.tradeoffs?.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
         </div>
      </section>

    </motion.div>
  );
}
