import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { AlertCircle, Gauge, Activity, Database, Server } from "lucide-react";

interface MetricsData {
  latency_ms: number;
  requests_per_sec: number;
  db_reads_per_sec: number;
  cache_reads_per_sec: number;
  cache_hit_rate: number;
  error_rate: number;
}

export function MetricsChartPanel({ metrics }: { metrics: MetricsData }) {
  if (!metrics || metrics.requests_per_sec === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 bg-black/40 border border-[#333]/50 rounded-xl glass-panel">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Insufficient structural metrics provided for visualization.</p>
        </div>
      </div>
    );
  }

  // Parse safety for pie chart
  const cacheVal = Number(metrics.cache_reads_per_sec) || 0;
  const dbVal = Number(metrics.db_reads_per_sec) || 0;
  const pieData = cacheVal + dbVal > 0 
    ? [
        { name: "Cache Hits", value: cacheVal },
        { name: "DB Reads", value: dbVal }
      ]
    : [];

  const COLORS = ["#10b981", "#8b5cf6"]; // Green for cache, purple for DB

  // Dummy latency distribution assuming gaussian curve surrounding the targeted latency_ms
  const latMs = metrics.latency_ms || 100;
  const latencyDistribution = [
    { ms: latMs * 0.5, volume: 10 },
    { ms: latMs * 0.75, volume: 45 },
    { ms: latMs, volume: 100 },
    { ms: latMs * 1.25, volume: 35 },
    { ms: latMs * 1.5, volume: 5 },
  ];
  
  const cacheHitPercentage = metrics.cache_hit_rate > 1 ? metrics.cache_hit_rate : metrics.cache_hit_rate * 100;
  const errorRatePercentage = metrics.error_rate > 1 ? metrics.error_rate : metrics.error_rate * 100;

  return (
    <div className="space-y-6">
      
      {/* Top Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Gauge, label: "Throughput", val: `${metrics.requests_per_sec.toLocaleString()} req/s`, color: "text-blue-400" },
          { icon: Activity, label: "Latency", val: `${metrics.latency_ms} ms`, color: "text-emerald-400" },
          { icon: Database, label: "Cache Hit Rate", val: `${cacheHitPercentage.toFixed(1)}%`, color: "text-purple-400" },
          { icon: AlertCircle, label: "Error Rate", val: `${errorRatePercentage.toFixed(2)}%`, color: errorRatePercentage > 1 ? "text-red-500" : "text-gray-300" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel border border-[#333]/50 p-4 rounded-xl flex flex-col bg-black/40 backdrop-blur-md shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.val}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[260px]">
        {/* Latency Distribution Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel border border-[#333]/50 p-4 rounded-xl flex flex-col bg-black/40 backdrop-blur-md"
        >
          <span className="text-xs font-semibold tracking-wider text-emerald-400 mb-4 uppercase inline-block">Latency Distribution</span>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="ms" stroke="#666" fontSize={10} tickFormatter={(val) => `${val}ms`} />
                <YAxis stroke="#666" fontSize={10} />
                <RechartsTooltip cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="volume" stroke="#10b981" fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cache vs DB Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel border border-[#333]/50 p-4 rounded-xl flex flex-col bg-black/40 backdrop-blur-md"
        >
          <span className="text-xs font-semibold tracking-wider text-purple-400 mb-4 uppercase inline-block">Traffic Routing (Cache vs DB)</span>
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const total = pieData.reduce((acc, p) => acc + p.value, 0);
                      const value = payload[0].value as number;
                      const percent = ((value / total) * 100).toFixed(1);
                      return (
                        <div className="bg-[#0B0F1A] text-white px-4 py-3 rounded-lg shadow-xl shadow-black/80 border border-gray-700">
                          <p className="text-sm font-semibold mb-1">{payload[0].name}</p>
                          <p className="text-xs text-gray-300 font-mono">
                            {value.toLocaleString()} req/s <span className="text-gray-600 mx-1">—</span> <span className="text-emerald-400 font-bold">{percent}%</span>
                          </p>
                        </div>
                      );
                    }}
                    cursor={{ fill: "transparent" }} 
                  />
                  <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#ccc' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-gray-500">Insufficient request data</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Insights Card */}
      <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3 }}
         className="glass-panel border border-blue-900/30 bg-blue-950/10 p-5 rounded-xl shadow-lg flex items-start gap-4"
      >
         <Server className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
         <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Architectural Insight</h4>
            <p className="text-sm text-gray-300">
               With a cache hit rate of <strong className="text-emerald-400">{cacheHitPercentage.toFixed(1)}%</strong>, the system isolates the primary database effectively. 
               This configuration prevents approx. <strong className="text-white">{cacheVal.toLocaleString()} requests/second</strong> from reaching the database layer, dynamically scaling compute savings and ensuring predictable <strong className="text-emerald-400">{metrics.latency_ms}ms</strong> aggregate response times.
            </p>
         </div>
      </motion.div>

    </div>
  );
}
