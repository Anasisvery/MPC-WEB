import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Shield, Users, Trophy, Award, Calendar, ArrowRight, Star } from "lucide-react";

export default function PublicTeams() {
  const { 
    teams, players, teamStats, fixtures, tournaments 
  } = useApp();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const selectedStat = teamStats.find(s => s.teamId === selectedTeamId);

  const getCaptainName = (captainId: string | null) => {
    return players.find(p => p.id === captainId)?.username || "TBD";
  };

  const getRoster = (teamId: string) => {
    return players.filter(p => p.team_id === teamId);
  };

  const getTeamMatches = (teamId: string) => {
    return fixtures.filter(f => f.team_a_id === teamId || f.team_b_id === teamId);
  };

  const getTournamentName = (id: string) => {
    return tournaments.find(t => t.id === id)?.name || "Championship";
  };

  const getPlayerName = (id: string | null) => {
    return players.find(p => p.id === id)?.username || "Competitor";
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. SELECTION OR TEAM DETAILS SHEET */}
      {selectedTeam && selectedStat ? (
        <div className="space-y-8">
          <button 
            onClick={() => setSelectedTeamId(null)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            ← Back to Esports Teams
          </button>

          {/* Overview Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#070A0F] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200')" }} />

            <div className="relative z-20 flex-shrink-0">
              <img 
                src={selectedTeam.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200"} 
                alt={selectedTeam.name} 
                className="h-28 w-28 rounded-2xl object-cover border-2 border-[#C5A85C]/30 shadow-xl bg-[#0B0E14]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="relative z-20 flex-1 space-y-4 text-center md:text-left">
              <h1 className="text-3xl font-black text-white font-display uppercase tracking-wider">{selectedTeam.name}</h1>
              <p className="text-xs text-gray-400 max-w-xl font-mono">
                Team Captain: <strong className="text-[#C5A85C] font-extrabold">{getCaptainName(selectedTeam.captain_id)}</strong>
              </p>

              {/* Tag / Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-center md:text-left">
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/40">
                  <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Championship Points</span>
                  <span className="text-base font-mono font-bold text-[#C5A85C] block">{selectedStat.points} PTS</span>
                </div>
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/40">
                  <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Total Roster</span>
                  <span className="text-base font-mono font-bold text-white block">{getRoster(selectedTeam.id).length} Active</span>
                </div>
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/40">
                  <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Win rate</span>
                  <span className="text-base font-mono font-bold text-white block">{selectedStat.winRate}%</span>
                </div>
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/40">
                  <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Global Rank</span>
                  <span className="text-base font-mono font-bold text-white block">#{teamStats.findIndex(t => t.teamId === selectedTeam.id) + 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Roster & Matches */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Official Roster */}
            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6 h-fit space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1.5 border-b border-gray-800/60 pb-3">
                <Users className="h-4.5 w-4.5 text-[#C5A85C]" />
                Official Active Roster
              </h3>

              <div className="space-y-3">
                {getRoster(selectedTeam.id).map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-950/20 border border-gray-800/40 text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <img 
                        src={member.profile_photo || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=100"} 
                        alt={member.username} 
                        className="h-7 w-7 rounded-full object-cover border border-gray-800"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-bold text-white truncate max-w-[120px]">{member.username}</span>
                    </div>
                    {selectedTeam.captain_id === member.id ? (
                      <span className="px-2 py-0.5 rounded-full text-[8px] bg-[#C5A85C]/15 border border-[#C5A85C]/30 text-[#C5A85C] font-bold flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        CAPTAIN
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[10px]">Player</span>
                    )}
                  </div>
                ))}
                
                {getRoster(selectedTeam.id).length === 0 && (
                  <div className="text-center py-6 text-xs text-gray-500 font-mono">
                    No registered players in this roster.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Record Matches */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white mb-4">W-D-L Balance</h3>
                <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
                  <div className="p-4 bg-gray-950/30 border border-gray-800/50 rounded-xl">
                    <span className="block text-gray-500 uppercase font-bold text-[9px]">Wins</span>
                    <span className="text-xl font-bold text-white">{selectedStat.wins}</span>
                  </div>
                  <div className="p-4 bg-gray-950/30 border border-gray-800/50 rounded-xl">
                    <span className="block text-gray-500 uppercase font-bold text-[9px]">Draws</span>
                    <span className="text-xl font-bold text-gray-400">{selectedStat.draws}</span>
                  </div>
                  <div className="p-4 bg-gray-950/30 border border-gray-800/50 rounded-xl">
                    <span className="block text-gray-500 uppercase font-bold text-[9px]">Losses</span>
                    <span className="text-xl font-bold text-red-500">{selectedStat.losses}</span>
                  </div>
                </div>
              </div>

              {/* Matches History */}
              <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white mb-4 flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-gray-500" />
                  Roster Fixtures & History
                </h3>

                {getTeamMatches(selectedTeam.id).length > 0 ? (
                  <div className="space-y-3">
                    {getTeamMatches(selectedTeam.id).map(match => {
                      const oppName = match.team_a_id === selectedTeam.id ? teams.find(t => t.id === match.team_b_id)?.name : teams.find(t => t.id === match.team_a_id)?.name;
                      const scoreSelf = match.team_a_id === selectedTeam.id ? match.score_a : match.score_b;
                      const scoreOpp = match.team_a_id === selectedTeam.id ? match.score_b : match.score_a;
                      
                      const isCompleted = match.status === "Completed";
                      const isWin = isCompleted && (scoreSelf ?? 0) > (scoreOpp ?? 0);
                      const isLoss = isCompleted && (scoreSelf ?? 0) < (scoreOpp ?? 0);
                      const isDraw = isCompleted && (scoreSelf ?? 0) === (scoreOpp ?? 0);

                      return (
                        <div key={match.id} className="flex items-center justify-between p-3.5 bg-gray-950/20 border border-gray-800 rounded-xl text-xs font-mono">
                          <div>
                            <span className="text-[9px] text-gray-500 uppercase font-bold">{getTournamentName(match.tournament_id)} • Round: {match.round}</span>
                            <h4 className="text-white font-bold mt-0.5">vs {oppName || "Competitor"}</h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold">{scoreSelf ?? "-"} : {scoreOpp ?? "-"}</span>
                            {isCompleted && (
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                isWin ? 'bg-green-950/30 text-green-400 border border-green-900/40' :
                                isLoss ? 'bg-red-950/30 text-red-400 border border-red-900/40' :
                                'bg-gray-900 text-gray-400 border border-gray-800'
                              }`}>
                                {isWin ? 'W' : isLoss ? 'L' : 'D'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-950/10 rounded-lg border border-gray-900 text-xs font-mono text-gray-500">
                    No active match results logged for this esports team.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display font-semibold">Active Roster Teams</h2>
            <p className="text-xs text-gray-500 mt-1">Official registered teams competing under MPC leagues.</p>
          </div>

          {/* Teams list */}
          {teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => {
                const stat = teamStats.find(s => s.teamId === team.id);
                return (
                  <div 
                    key={team.id} 
                    onClick={() => setSelectedTeamId(team.id)}
                    className="group cursor-pointer bg-[#0A0D14] border border-gray-800 hover:border-gray-700 rounded-xl overflow-hidden transition"
                  >
                    <div className="p-6 flex items-center gap-4">
                      <img 
                        src={team.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200"} 
                        alt={team.name} 
                        className="h-16 w-16 rounded-xl object-cover border border-gray-800 bg-[#0F131A]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white group-hover:text-[#C5A85C] transition font-display truncate">{team.name}</h3>
                        <span className="text-[10px] text-gray-500 font-mono block mt-0.5">Captain: {getCaptainName(team.captain_id)}</span>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-950/40 border-t border-gray-800/60 flex items-center justify-between text-xs font-mono text-gray-400">
                      <span>{getRoster(team.id).length} Competitors</span>
                      <span className="text-[#C5A85C] font-bold">{stat?.points || 0} PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#0A0D14] rounded-xl border border-gray-800 flex flex-col items-center justify-center">
              <Shield className="h-12 w-12 text-gray-700 mb-2" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Active Teams Registered Yet</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
