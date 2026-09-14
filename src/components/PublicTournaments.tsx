import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Trophy, Calendar, Users, Award, Shield, CheckCircle, HelpCircle } from "lucide-react";
import { Tournament, TournamentParticipant, Fixture, Player, Team } from "../types";

export default function PublicTournaments() {
  const { 
    tournaments, participants, fixtures, players, teams 
  } = useApp();

  const [selectedTourneyId, setSelectedTourneyId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"All" | "Upcoming" | "Ongoing" | "Completed">("All");

  const selectedTourney = tournaments.find(t => t.id === selectedTourneyId);

  // Filter list
  const filteredTourneys = tournaments.filter(t => {
    if (filterStatus === "All") return true;
    return t.status === filterStatus;
  });

  const getParticipantsForTourney = (tourneyId: string) => {
    return participants.filter(p => p.tournament_id === tourneyId);
  };

  const getFixturesForTourney = (tourneyId: string) => {
    return fixtures.filter(f => f.tournament_id === tourneyId);
  };

  const getPlayerName = (id: string | null) => {
    return players.find(p => p.id === id)?.username || "Competitor";
  };

  const getTeamName = (id: string | null) => {
    return teams.find(t => t.id === id)?.name || "Team";
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. SELECTION HEADER OR DETAIL RETURN */}
      {selectedTourney ? (
        <div className="space-y-8">
          {/* Back button */}
          <button 
            onClick={() => setSelectedTourneyId(null)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            ← Back to Championships List
          </button>

          {/* Tournament banner card */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#070A0F] py-16 px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${selectedTourney.banner || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200'})` }} />

            <div className="relative z-20 space-y-4 max-w-xl">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-[#C5A85C]/15 border border-[#C5A85C]/30 text-[#C5A85C]">
                {selectedTourney.status} • {selectedTourney.format} Format
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">{selectedTourney.name}</h1>
              <p className="text-gray-400 text-sm leading-relaxed">{selectedTourney.description}</p>
              
              <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500">
                {selectedTourney.prize && (
                  <span className="flex items-center gap-1.5 bg-gray-950/40 p-2 border border-gray-900 rounded-lg">
                    <Award className="h-4 w-4 text-[#C5A85C]" />
                    Prize: <strong className="text-white">{selectedTourney.prize}</strong>
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-gray-950/40 p-2 border border-gray-900 rounded-lg">
                  <Users className="h-4 w-4 text-gray-400" />
                  Max Slots: <strong className="text-white">{selectedTourney.max_participants}</strong>
                </span>
              </div>
            </div>

            <div className="relative z-20 flex-shrink-0">
              <div className="px-6 py-6 rounded-xl bg-[#0B0E14] border border-gray-800/80 text-center space-y-2 min-w-[200px]">
                <span className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider font-semibold">Start Date</span>
                <span className="block text-sm font-bold text-white font-mono">
                  {selectedTourney.tournament_start ? new Date(selectedTourney.tournament_start).toLocaleDateString() : "TBD"}
                </span>
                <div className="border-t border-gray-800/60 my-2 pt-2">
                  <span className="block text-[10px] text-gray-500 uppercase font-mono tracking-wider font-semibold">Status</span>
                  <span className={`block text-xs font-bold font-mono uppercase mt-1 ${
                    selectedTourney.status === "Ongoing" ? "text-green-400" :
                    selectedTourney.status === "Upcoming" ? "text-[#C5A85C]" : "text-gray-500"
                  }`}>
                    {selectedTourney.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid detailing participants, fixtures, and rules */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Registered Competitors */}
            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6 h-fit">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white mb-4 flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-[#C5A85C]" />
                Registered Competitors ({getParticipantsForTourney(selectedTourney.id).length})
              </h3>
              
              {getParticipantsForTourney(selectedTourney.id).length > 0 ? (
                <div className="space-y-2">
                  {getParticipantsForTourney(selectedTourney.id).map(part => {
                    const isSolo = selectedTourney.format !== "Team";
                    const name = isSolo ? getPlayerName(part.player_id) : getTeamName(part.team_id);
                    const photo = isSolo 
                      ? (players.find(p => p.id === part.player_id)?.profile_photo || null)
                      : (teams.find(t => t.id === part.team_id)?.logo || null);

                    return (
                      <div key={part.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-950/20 border border-gray-800/40 text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <img 
                            src={photo || (isSolo ? "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=100" : "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200")} 
                            alt={name} 
                            className={`h-7 w-7 object-cover border border-gray-800 ${isSolo ? 'rounded-full' : 'rounded'}`}
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-bold text-white truncate max-w-[140px]">{name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-green-950/30 text-green-400 border border-green-900/40 font-bold uppercase tracking-wider">Approved</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-950/10 rounded-lg border border-gray-900">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Participants Signed Up Yet</p>
                </div>
              )}
            </div>

            {/* Right 2 Columns: Fixtures & Rule-book */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Fixtures Section */}
              <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white mb-6 flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-[#C5A85C]" />
                  Tournament Fixtures & Results
                </h3>

                {getFixturesForTourney(selectedTourney.id).length > 0 ? (
                  <div className="space-y-3">
                    {getFixturesForTourney(selectedTourney.id).map(match => {
                      const isSolo = selectedTourney.format !== "Team";
                      const nameA = isSolo ? getPlayerName(match.player_a_id) : getTeamName(match.team_a_id);
                      const nameB = isSolo ? getPlayerName(match.player_b_id) : getTeamName(match.team_b_id);
                      
                      const scoreA = match.score_a ?? "-";
                      const scoreB = match.score_b ?? "-";

                      return (
                        <div key={match.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-950/20 rounded-xl border border-gray-800/60 text-xs font-mono gap-4">
                          <div className="text-left">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{match.round}</span>
                            <span className="block text-[11px] text-gray-400 mt-0.5">Match #{match.match_number}</span>
                          </div>

                          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-1 max-w-md">
                            <span className="font-bold text-white text-right truncate w-24 sm:w-36">{nameA}</span>
                            <div className="px-3.5 py-1 bg-gray-900 rounded-md border border-gray-800 flex items-center gap-2 font-bold font-mono text-white text-sm">
                              <span>{scoreA}</span>
                              <span className="text-gray-600">:</span>
                              <span>{scoreB}</span>
                            </div>
                            <span className="font-bold text-white text-left truncate w-24 sm:w-36">{nameB}</span>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            match.status === "Completed" ? "bg-green-950/30 text-green-400 border border-green-900/40" :
                            match.status === "Live" ? "bg-red-950/30 text-red-400 border border-red-900/40 animate-pulse" :
                            "bg-gray-900 text-gray-400 border border-gray-800"
                          }`}>
                            {match.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-950/10 rounded-lg border border-gray-900">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">Fixtures Not Yet Generated</p>
                  </div>
                )}
              </div>

              {/* Tournament rules */}
              <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white mb-4 flex items-center gap-1.5">
                  <HelpCircle className="h-4.5 w-4.5 text-gray-500" />
                  Official Tournament Rules & Information
                </h3>
                <div className="p-4 bg-gray-950/40 rounded-xl border border-gray-800/60">
                  <p className="text-gray-400 text-xs whitespace-pre-line leading-relaxed">
                    {selectedTourney.rules || "Standard MPC rules apply: Respectful play, complete matching schedules within scheduled hours, and report screenshot proofs. Win matches to secure champion standings."}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header & filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-display">MPC Esports Tournaments</h2>
              <p className="text-xs text-gray-500 mt-1">Participate in elite soccer league tourneys and rise to top leaderboards.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {(["All", "Upcoming", "Ongoing", "Completed"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono transition-all ${
                    filterStatus === status 
                      ? "bg-[#C5A85C] text-black font-bold" 
                      : "bg-[#0A0D14] text-gray-400 border border-gray-800 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* List of Tournaments */}
          {filteredTourneys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTourneys.map(tourney => {
                const partCount = getParticipantsForTourney(tourney.id).length;
                return (
                  <div 
                    key={tourney.id} 
                    onClick={() => setSelectedTourneyId(tourney.id)}
                    className="group cursor-pointer bg-[#0A0D14] border border-gray-800 hover:border-gray-700 rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between"
                  >
                    <div className="aspect-video w-full bg-gray-950 border-b border-gray-800 relative overflow-hidden">
                      <img 
                        src={tourney.banner || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200"} 
                        alt={tourney.name} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/20 to-transparent" />
                      <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono border ${
                        tourney.status === "Ongoing" ? "bg-green-950/40 text-green-400 border-green-900/40" :
                        tourney.status === "Upcoming" ? "bg-[#C5A85C]/15 text-[#C5A85C] border-[#C5A85C]/30" :
                        "bg-gray-900 text-gray-400 border-gray-800"
                      }`}>
                        {tourney.status}
                      </span>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-[#C5A85C] font-mono uppercase font-bold tracking-widest">{tourney.format} League</span>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#C5A85C] transition font-display line-clamp-1">{tourney.name}</h3>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{tourney.description}</p>
                      </div>

                      <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between text-[11px] font-mono text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-gray-500" />
                          <span>{partCount} / {tourney.max_participants} Enrolled</span>
                        </div>
                        {tourney.prize && (
                          <span className="text-white font-bold">Prize: {tourney.prize}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#0A0D14] rounded-xl border border-gray-800 flex flex-col items-center justify-center">
              <Trophy className="h-12 w-12 text-gray-700 mb-2" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Tournaments found matching this filter</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
