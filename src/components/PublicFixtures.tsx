import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Calendar, Trophy, Search, Play, CheckCircle } from "lucide-react";

export default function PublicFixtures() {
  const { fixtures, players, teams, tournaments } = useApp();
  const [filter, setFilter] = useState<"All" | "Scheduled" | "Live" | "Completed">("All");

  const getPlayerName = (id: string | null) => {
    return players.find(p => p.id === id)?.username || "Competitor";
  };

  const getTeamName = (id: string | null) => {
    return teams.find(t => t.id === id)?.name || "Team";
  };

  const getTournamentName = (id: string) => {
    return tournaments.find(t => t.id === id)?.name || "League";
  };

  const filteredFixtures = fixtures.filter(f => {
    if (filter === "All") return true;
    return f.status === filter;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header and Filter Switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display font-semibold">Match Center & Fixtures</h2>
          <p className="text-xs text-gray-500 mt-1">Schedules, live streaming scores, and results database.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(["All", "Scheduled", "Live", "Completed"] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono transition-all ${
                filter === status 
                  ? "bg-[#C5A85C] text-black font-bold" 
                  : "bg-[#0A0D14] text-gray-400 border border-gray-800 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Fixtures grid list */}
      {filteredFixtures.length > 0 ? (
        <div className="space-y-4">
          {filteredFixtures.map(fixture => {
            const isSolo = fixture.player_a_id !== null;
            const nameA = isSolo ? getPlayerName(fixture.player_a_id) : getTeamName(fixture.team_a_id);
            const nameB = isSolo ? getPlayerName(fixture.player_b_id) : getTeamName(fixture.team_b_id);

            const scoreA = fixture.score_a ?? "-";
            const scoreB = fixture.score_b ?? "-";

            return (
              <div key={fixture.id} className="bg-[#0A0D14] border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Meta details */}
                <div className="text-left font-mono text-[10px]">
                  <span className="text-[#C5A85C] font-bold uppercase block tracking-wider truncate max-w-[150px]">
                    {getTournamentName(fixture.tournament_id)}
                  </span>
                  <span className="text-gray-500 block mt-0.5">Round: {fixture.round} • Match #{fixture.match_number}</span>
                  {fixture.scheduled_time && (
                    <span className="text-gray-400 block mt-1">
                      {new Date(fixture.scheduled_time).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                </div>

                {/* Visual scorecard */}
                <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8 max-w-xl mx-auto">
                  <span className="text-sm font-bold text-white text-right truncate w-24 sm:w-36">{nameA}</span>
                  
                  <div className="px-4 py-1.5 bg-gray-950 border border-gray-800/80 rounded-lg flex items-center gap-3 font-mono text-sm font-extrabold text-white">
                    <span>{scoreA}</span>
                    <span className="text-gray-600 font-normal">:</span>
                    <span>{scoreB}</span>
                  </div>

                  <span className="text-sm font-bold text-white text-left truncate w-24 sm:w-36">{nameB}</span>
                </div>

                {/* Action / State Badge */}
                <div className="flex justify-end sm:justify-start shrink-0">
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono border ${
                    fixture.status === "Completed" ? "bg-green-950/20 text-green-400 border-green-900/30" :
                    fixture.status === "Live" ? "bg-red-950/25 text-red-400 border-red-900/40 animate-pulse flex items-center gap-1" :
                    "bg-gray-950 text-gray-500 border-gray-800"
                  }`}>
                    {fixture.status === "Live" && <Play className="h-2.5 w-2.5 fill-current text-red-400 animate-spin" />}
                    {fixture.status}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0A0D14] rounded-xl border border-gray-800 flex flex-col items-center justify-center">
          <Calendar className="h-12 w-12 text-gray-700 mb-2" />
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Fixtures Match Current Status Filter</p>
        </div>
      )}

    </div>
  );
}
