import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="relative"
    >
      <div className="glow-border rounded-xl overflow-hidden glass-panel border border-[#333]/50 shadow-2xl bg-black/40 backdrop-blur-md">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Describe your system... e.g. 'Design a real-time collaborative document editor like Notion with multiplayer cursors'"
          rows={3}
          className="w-full bg-transparent text-gray-200 placeholder:text-gray-500 px-5 py-4 text-sm resize-none focus:outline-none font-sans"
        />
        <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-t border-[#333]">
          
          <div className="flex items-center gap-3">
             <span className="text-xs text-blue-400/80 font-medium tracking-wide">
                ✦ Smart Analysis Active
             </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hidden sm:inline-block">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#333] border border-[#444] text-gray-400 text-[10px] font-mono shadow-sm">Enter</kbd> to generate
            </span>
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="flex items-center gap-2 px-5 py-1.5 rounded-md bg-blue-600 shadow-lg text-white text-xs font-medium transition-all hover:bg-blue-500 hover:shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {isLoading ? "Analyzing..." : "Generate"}
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
