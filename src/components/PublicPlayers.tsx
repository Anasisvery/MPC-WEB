import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Search, ShieldAlert, Award, CreditCard, Ban, CheckCircle, Shield, AlertTriangle } from "lucide-react";
import { Player } from "../types";

interface PublicPlayersProps {
  selectedPlayerId: string | null;
  setSelectedPlayerId: (id: string | null) => void;
}

export default function PublicPlayers({ selectedPlayerId, setSelectedPlayerId }: PublicPlayersProps) {
  const { 
    players, teams, playerStats, cards, bans, tournaments, fixtures 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("All");

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const selectedStat = playerStats.find(s => s.playerId === selectedPlayerId);

  // Filtered Players
  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.efootball_uid.includes(searchQuery);
    
    const matchesDevice = deviceFilter === "All" || p.device === deviceFilter;

    return matchesSearch && matchesDevice;
  });

  const getTeamName = (teamId: string | null) => {
    return teams.find(t => t.id === teamId)?.name || "Free Agent";
  };

  const getPlayerCards = (playerId: string) => {
    return cards.filter(c => c.player_id === playerId);
  };

  const getPlayerBans = (playerId: string) => {
    return bans.filter(b => b.player_id === playerId);
  };

  const getPlayerTourneys = (playerId: string) => {
    // Collect tournaments where this player has completed matches
    const playedTourneyIds = new Set(
      fixtures
        .filter(f => f.status === "Completed" && (f.player_a_id === playerId || f.player_b_id === playerId))
        .map(f => f.tournament_id)
    );

    return tournaments.filter(t => playedTourneyIds.has(t.id));
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. SELECTION OR PROFILE SHEET */}
      {selectedPlayer && selectedStat ? (
        <div className="space-y-8">
          <button 
            onClick={() => setSelectedPlayerId(null)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            ← Back to Player Directory
          </button>

          {/* Profile overview box */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#070A0F] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200')" }} />

            <div className="relative z-20 flex-shrink-0">
              <img 
                src={selectedPlayer.profile_photo || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=300"} 
                alt={selectedPlayer.username} 
                className="h-32 w-32 rounded-2xl object-cover border-2 border-[#C5A85C]/30 shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="relative z-20 flex-1 space-y-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="text-xl font-black text-white font-display uppercase tracking-wide">{selectedPlayer.username}</span>
                {selectedPlayer.status === "banned" ? (
                  <span className="px-2.5 py-0.5 rounded bg-red-950/40 border border-red-900/40 text-red-400 text-[9px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
                    <Ban className="h-3 w-3" />
                    Banned
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded bg-green-950/40 border border-green-900/40 text-green-400 text-[9px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                )}
              </div>

              <p className="text-xs font-mono text-gray-500">
                Full Name: <strong className="text-white">{selectedPlayer.first_name} {selectedPlayer.last_name}</strong> • 
                Country: <strong className="text-white">{selectedPlayer.country || "TBA"}</strong>
              </p>

              {/* Hardware specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/40 text-center md:text-left">
                  <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">eFootball UID</span>
                  <span className="text-xs font-mono font-bold text-white block truncate">{selectedPlayer.efootball_uid}</span>
                </div>
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/40 text-center md:text-left">
                  <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Device Model</span>
                  <span className="text-xs font-mono font-bold text-white block truncate">{selectedPlayer.device_info || selectedPlayer.device}</span>
                </div>
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/40 text-center md:text-left">
                  <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Active Roster</span>
                  <span className="text-xs font-bold text-[#C5A85C] block truncate">{getTeamName(selectedPlayer.team_id)}</span>
                </div>
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-950/40 text-center md:text-left">
                  <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Global Rank</span>
                  <span className="text-xs font-mono font-bold text-white block truncate">
                    #{playerStats.findIndex(p => p.playerId === selectedPlayer.id) + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats, Tournament History and Ban Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column Left: Statistics summary */}
            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6 space-y-6 h-fit">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white mb-4 flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-[#C5A85C]" />
                Tournament Statistics
              </h3>

              {/* Hex / Stats panel */}
              <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                <div className="p-3 rounded-lg bg-gray-950/40 border border-gray-800/60">
                  <span className="block text-[9px] text-gray-500 uppercase font-bold">Wins</span>
                  <span className="text-lg font-black text-white">{selectedStat.wins}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-950/40 border border-gray-800/60">
                  <span className="block text-[9px] text-gray-500 uppercase font-bold">Draws</span>
                  <span className="text-lg font-black text-gray-400">{selectedStat.draws}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-950/40 border border-gray-800/60">
                  <span className="block text-[9px] text-gray-500 uppercase font-bold">Losses</span>
                  <span className="text-lg font-black text-red-500">{selectedStat.losses}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-gray-800/40">
                  <span className="text-gray-500">Matches Played:</span>
                  <span className="font-bold text-white">{selectedStat.matchesPlayed}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-800/40">
                  <span className="text-gray-500">Championship Points:</span>
                  <span className="font-bold text-[#C5A85C]">{selectedStat.points} PTS</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-800/40">
                  <span className="text-gray-500">Win Rate:</span>
                  <span className="font-bold text-white">{selectedStat.winRate}%</span>
                </div>
              </div>

              {/* Cards tally */}
              <div className="pt-4 border-t border-gray-800/50 space-y-3 text-xs font-mono">
                <h4 className="font-bold text-white text-xs uppercase tracking-wide">Foul Play Record</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-2 bg-yellow-950/15 border border-yellow-900/30 rounded-lg">
                    <span className="h-6 w-4 bg-yellow-400 rounded shrink-0" />
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase font-bold">Yellows</span>
                      <span className="font-bold text-white">{selectedStat.yellowCards}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 bg-red-950/15 border border-red-900/30 rounded-lg">
                    <span className="h-6 w-4 bg-red-500 rounded shrink-0" />
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase font-bold">Reds</span>
                      <span className="font-bold text-white">{selectedStat.redCards}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column Mid/Right: Tournament History and Ban notices */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Tournaments history */}
              <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white mb-4">Championship History</h3>
                {getPlayerTourneys(selectedPlayer.id).length > 0 ? (
                  <div className="space-y-3">
                    {getPlayerTourneys(selectedPlayer.id).map(tourney => (
                      <div key={tourney.id} className="flex items-center justify-between p-3.5 bg-gray-950/20 border border-gray-800 rounded-xl text-xs font-mono">
                        <div>
                          <h4 className="font-bold text-white font-display text-sm">{tourney.name}</h4>
                          <span className="text-[10px] text-gray-500 block mt-0.5">{tourney.format} Format • Status: {tourney.status}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded font-bold text-[#C5A85C]">PARTICIPANT</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-950/10 rounded-lg border border-gray-900 text-xs font-mono text-gray-500">
                    No active tournament participation records found.
                  </div>
                )}
              </div>

              {/* Fouls / Bans Logs */}
              {selectedPlayer.status === "banned" && (
                <div className="bg-red-950/10 border border-red-900/50 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                    Active Ban Penalty Notice
                  </h3>
                  
                  {getPlayerBans(selectedPlayer.id).filter(b => b.status === "Active").map(ban => (
                    <div key={ban.id} className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-xs font-mono space-y-2 text-gray-300 leading-relaxed">
                      <p>Reason for Penalty: <strong className="text-white">{ban.reason}</strong></p>
                      <p>Start Date: <strong className="text-white">{new Date(ban.start_date).toLocaleDateString()}</strong></p>
                      {ban.permanent ? (
                        <p className="text-red-400 font-bold uppercase tracking-wider">Penalty Duration: Permanent Ban</p>
                      ) : (
                        <p>Lifts Date: <strong className="text-white">{ban.end_date ? new Date(ban.end_date).toLocaleDateString() : "TBD"}</strong></p>
                      )}
                      {ban.note && <p className="text-gray-400 italic">Notes: {ban.note}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Cards details list */}
              {getPlayerCards(selectedPlayer.id).length > 0 && (
                <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white mb-4">Official Warning Warnings</h3>
                  <div className="space-y-3">
                    {getPlayerCards(selectedPlayer.id).map(card => (
                      <div key={card.id} className="flex items-center gap-3 p-3 bg-gray-950/20 border border-gray-800/60 rounded-xl text-xs font-mono">
                        <span className={`h-6 w-4 rounded shrink-0 ${card.card_type === "Yellow" ? 'bg-yellow-400' : 'bg-red-500'}`} />
                        <div>
                          <p className="text-white font-bold">{card.reason}</p>
                          <span className="text-[10px] text-gray-500 block mt-0.5">Issued: {new Date(card.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-display">MPC Player Directory</h2>
              <p className="text-xs text-gray-500 mt-1">Full roster registry of Mafia PES Club eFootball competitors.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search competitor/UID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none focus:border-[#C5A85C] w-full sm:w-48"
                />
              </div>

              {/* Device filter */}
              <select 
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none focus:border-[#C5A85C]"
              >
                <option value="All">All Hardware</option>
                <option value="Android">Android</option>
                <option value="iOS">iOS</option>
                <option value="PC">PC</option>
                <option value="PlayStation">PlayStation</option>
                <option value="Xbox">Xbox</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredPlayers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPlayers.map(player => {
                const isBanned = player.status === "banned";
                const pStat = playerStats.find(s => s.playerId === player.id);
                return (
                  <div 
                    key={player.id} 
                    onClick={() => setSelectedPlayerId(player.id)}
                    className="group cursor-pointer bg-[#0A0D14] border border-gray-800/80 hover:border-gray-700 rounded-xl p-5 flex flex-col items-center justify-between text-center transition-all duration-150"
                  >
                    <div className="space-y-3 w-full">
                      <div className="relative mx-auto h-20 w-20">
                        <img 
                          src={player.profile_photo || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=100"} 
                          alt={player.username} 
                          className="h-20 w-20 rounded-full object-cover border-2 border-gray-800 group-hover:border-[#C5A85C]/30 transition"
                          referrerPolicy="no-referrer"
                        />
                        {isBanned && (
                          <span className="absolute -bottom-1 -right-1 p-1 bg-red-950 border border-red-900 rounded-full text-red-500">
                            <Ban className="h-3 w-3" />
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#C5A85C] transition font-display">{player.username}</h4>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-gray-500 font-semibold">{getTeamName(player.team_id)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-800/50 w-full grid grid-cols-2 text-[10px] font-mono text-gray-500">
                      <div>
                        <span className="block text-gray-600 uppercase font-bold text-[8px]">Device</span>
                        <span className="text-white font-bold">{player.device}</span>
                      </div>
                      <div>
                        <span className="block text-gray-600 uppercase font-bold text-[8px]">Win Rate</span>
                        <span className="text-white font-bold">{pStat?.winRate || 0}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#0A0D14] rounded-xl border border-gray-800 flex flex-col items-center justify-center">
              <Search className="h-12 w-12 text-gray-700 mb-2" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Competitors match your query</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
