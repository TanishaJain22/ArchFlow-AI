import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Network,
  Database,
  Server,
  Code2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  History,
  BookOpen,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Workspace", section: "workspace" },
  { icon: Network, label: "Architecture details", section: "architecture" },
  { icon: Database, label: "Quantitative Metrics", section: "metrics" },
  { icon: Server, label: "Interactive Maps", section: "diagram" },
];

const bottomItems = [
  { icon: History, label: "History", section: "history" },
  { icon: BookOpen, label: "Docs", section: "docs" },
  { icon: Settings, label: "Settings", section: "settings" },
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border">
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wider text-gradient">
            ARCHFLOW
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col justify-between py-3">
        <div className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const active = activeSection === item.section;
            return (
              <button
                key={item.section}
                onClick={() => onSectionChange(item.section)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div className="space-y-0.5 px-2">
          {bottomItems.map((item) => (
            <button
              key={item.section}
              onClick={() => onSectionChange(item.section)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                activeSection === item.section
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
