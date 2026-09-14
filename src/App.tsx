import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navigation from "./components/Navigation";
import PublicHome from "./components/PublicHome";
import PublicTournaments from "./components/PublicTournaments";
import PublicPlayers from "./components/PublicPlayers";
import PublicTeams from "./components/PublicTeams";
import PublicFixtures from "./components/PublicFixtures";
import PublicRankings from "./components/PublicRankings";
import PublicAnnouncements from "./components/PublicAnnouncements";
import AdminPanel from "./components/AdminPanel";
import { Loader2, RefreshCw, AlertCircle, Shield } from "lucide-react";

function RootApp() {
  const { loading, error, settings, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState<string>("home");
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Connection/Loading screens
  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-[#070A0F] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#C5A85C]" />
        <span className="text-xs uppercase font-mono tracking-widest text-gray-500 font-bold">Booting MPC Esports Portal...</span>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="min-h-screen bg-[#070A0F] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#0A0D14] border border-gray-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-red-950/20 border border-red-900/40 text-red-500 mb-2">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display text-red-400">Database Connection Failed</h2>
          <p className="text-xs text-gray-400 font-mono leading-relaxed">{error}</p>
          <button
            onClick={refreshData}
            className="px-6 py-2.5 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono tracking-wider text-xs transition duration-150 flex items-center justify-center gap-1.5 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-gray-300 flex flex-col justify-between">
      <div>
        {/* Navigation bar */}
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedPlayerId(null);
          }} 
          showAdmin={showAdmin} 
          setShowAdmin={setShowAdmin} 
        />

        {/* Content routing wrapper */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showAdmin ? (
            <AdminPanel />
          ) : (
            <>
              {activeTab === "home" && (
                <PublicHome 
                  setActiveTab={setActiveTab} 
                  setSelectedPlayerId={setSelectedPlayerId} 
                />
              )}
              {activeTab === "tournaments" && <PublicTournaments />}
              {activeTab === "players" && (
                <PublicPlayers 
                  selectedPlayerId={selectedPlayerId} 
                  setSelectedPlayerId={setSelectedPlayerId} 
                />
              )}
              {activeTab === "teams" && <PublicTeams />}
              {activeTab === "fixtures" && <PublicFixtures />}
              {activeTab === "rankings" && <PublicRankings />}
              {activeTab === "announcements" && <PublicAnnouncements />}
            </>
          )}
        </div>
      </div>

      {/* Footer block */}
      <footer className="bg-[#0A0D14] border-t border-gray-800/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <img 
              src={settings?.club_logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200"} 
              alt={settings?.club_short_name || "MPC"} 
              className="h-10 w-10 rounded-lg object-cover border border-[#C5A85C]/30 mr-3"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-sm font-bold text-white font-display tracking-wide">{settings?.club_name || "Mafia PES Club"}</span>
              <span className="text-[10px] text-gray-500 font-mono uppercase block">All Rights Reserved © 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
            <Shield className="h-4 w-4" />
            <span>eFootball Division • MPC Controller Platform v1.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootApp />
    </AppProvider>
  );
}
