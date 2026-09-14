import React from "react";
import { 
  LayoutDashboard, Users, Trophy, UserPlus, Calendar, 
  CheckSquare, BarChart3, ShieldCheck, Square, Ban, 
  Megaphone, Settings, History, ChevronRight
} from "lucide-react";

export type AdminSection = 
  | "dashboard"
  | "players"
  | "teams"
  | "tournaments"
  | "participants"
  | "fixtures"
  | "results"
  | "player_rankings"
  | "team_rankings"
  | "cards"
  | "bans"
  | "announcements"
  | "settings"
  | "activity_logs";

interface AdminSidebarProps {
  currentSection: AdminSection;
  setCurrentSection: (section: AdminSection) => void;
  onClose?: () => void;
}

export default function AdminSidebar({ currentSection, setCurrentSection, onClose }: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "players", label: "Players", icon: Users },
    { id: "teams", label: "Teams", icon: ShieldCheck },
    { id: "tournaments", label: "Tournaments", icon: Trophy },
    { id: "participants", label: "Participants", icon: UserPlus },
    { id: "fixtures", label: "Fixtures", icon: Calendar },
    { id: "results", label: "Results", icon: CheckSquare },
    { id: "player_rankings", label: "Player Rankings", icon: BarChart3 },
    { id: "team_rankings", label: "Team Rankings", icon: BarChart3 },
    { id: "cards", label: "Cards", icon: Square },
    { id: "bans", label: "Bans", icon: Ban },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "settings", label: "Club Settings", icon: Settings },
    { id: "activity_logs", label: "Activity Logs", icon: History },
  ] as const;

  const handleSelect = (sectionId: AdminSection) => {
    setCurrentSection(sectionId);
    if (onClose) onClose();
  };

  return (
    <aside className="w-full md:w-64 bg-[#0A0D14] border-r border-gray-800/80 flex flex-col h-full overflow-y-auto">
      {/* Mini Title Banner */}
      <div className="p-6 border-b border-gray-800/50">
        <h4 className="text-xs uppercase font-mono tracking-widest text-gray-500 font-semibold">MPC Controller</h4>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display text-[#C5A85C]">Admin Management</h2>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono transition-all duration-150 ${
                isActive 
                  ? "bg-[#C5A85C]/15 text-[#C5A85C] border-l-2 border-[#C5A85C]" 
                  : "text-gray-400 hover:text-white hover:bg-gray-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[#C5A85C]" : "text-gray-500"}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="h-3 w-3 text-[#C5A85C]" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
