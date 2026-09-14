import React from "react";
import { useApp } from "../context/AppContext";
import { Trophy, Users, Shield, Calendar, ArrowRight, Zap, Award, BookOpen, Megaphone } from "lucide-react";
import { PlayerStats, TeamStats } from "../types";

interface PublicHomeProps {
  setActiveTab: (tab: string) => void;
  setSelectedPlayerId: (id: string | null) => void;
}

export default function PublicHome({ setActiveTab, setSelectedPlayerId }: PublicHomeProps) {
  const { 
    settings, tournaments, playerStats, teamStats, 
    fixtures, announcements, players, teams 
  } = useApp();

  // Get active and upcoming tournaments
  const activeTournaments = tournaments.filter(t => t.status === "Ongoing");
  const upcomingTournaments = tournaments.filter(t => t.status === "Upcoming");
  
  // Get recent results
  const recentResults = fixtures
    .filter(f => f.status === "Completed")
    .sort((a, b) => new Date(b.scheduled_time || "").getTime() - new Date(a.scheduled_time || "").getTime())
    .slice(0, 5);

  // Latest news
  const latestNews = announcements
    .filter(a => a.published)
    .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
    .slice(0, 3);

  const stats = [
    { label: "Total Competitors", value: players.length, icon: Users },
    { label: "Active Rosters", value: teams.length, icon: Shield },
    { label: "Tournaments Held", value: tournaments.length, icon: Trophy },
    { label: "Matches Completed", value: fixtures.filter(f => f.status === "Completed").length, icon: Calendar },
  ];

  const getPlayerName = (id: string | null) => {
    return players.find(p => p.id === id)?.username || "Competitor";
  };

  const getTeamName = (id: string | null) => {
    return teams.find(t => t.id === id)?.name || "Team";
  };

  const handlePlayerClick = (id: string) => {
    setSelectedPlayerId(id);
    setActiveTab("players");
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#070A0F] py-20 px-8 sm:px-12 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: `url(${settings?.club_banner || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200'})` }} />
        
        {/* Hero Left Info */}
        <div className="relative z-20 max-w-xl space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5A85C]/15 border border-[#C5A85C]/30 rounded-full text-xs font-mono font-bold uppercase tracking-widest text-[#C5A85C]">
            <Zap className="h-3 w-3" />
            Est. 2026 Esports
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
            Welcome to <br />
            <span className="text-[#C5A85C]">{settings?.club_name || "Mafia PES Club"}</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {settings?.club_description || "Mafia PES Club (MPC) is a premier eFootball gaming esports organization dedicated to excellence, competing at the highest levels of digital soccer."}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button 
              onClick={() => setActiveTab("tournaments")}
              className="px-6 py-3 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-bold text-sm tracking-wider uppercase font-mono transition flex items-center gap-2"
            >
              Browse Tournaments
              <ArrowRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setActiveTab("players")}
              className="px-6 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm border border-gray-800 transition"
            >
              View Player Base
            </button>
          </div>
        </div>

        {/* Hero Right Logo Frame */}
        <div className="relative z-20 flex-shrink-0">
          <div className="h-48 w-48 rounded-2xl bg-[#0F131A] border-2 border-[#C5A85C]/40 p-4 shadow-xl flex items-center justify-center animate-pulse">
            <img 
              src={settings?.club_logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200"} 
              alt="MPC Logo" 
              className="h-full w-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* 2. CLUB STATISTICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-[#0B0D14] border border-gray-800 rounded-xl p-5 flex items-center gap-4 hover:border-gray-700 transition">
              <div className="p-3 bg-[#C5A85C]/5 rounded-lg border border-[#C5A85C]/15 text-[#C5A85C]">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-mono tracking-widest text-gray-500 font-bold">{s.label}</span>
                <span className="text-xl font-bold text-white tracking-tight">{s.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. TOURNAMENTS OUTLOOK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Active Tournament */}
        <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-[#C5A85C] flex items-center gap-1.5">
                <Trophy className="h-4.5 w-4.5" />
                Ongoing Championship
              </h2>
              <span className="px-2 py-0.5 bg-green-950/40 text-green-400 border border-green-900/40 rounded-full text-[10px] uppercase tracking-wider font-mono font-bold">Live Now</span>
            </div>
            
            {activeTournaments.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-800 relative bg-gray-950">
                  <img 
                    src={activeTournaments[0].banner || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200"} 
                    alt={activeTournaments[0].name} 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs text-[#C5A85C] font-semibold uppercase tracking-wider font-mono">{activeTournaments[0].format} Format</span>
                    <h3 className="text-lg font-bold text-white font-display mt-1">{activeTournaments[0].name}</h3>
                  </div>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{activeTournaments[0].description}</p>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-950/20 rounded-lg border border-gray-900 flex flex-col items-center justify-center">
                <Trophy className="h-10 w-10 text-gray-700 mb-2" />
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Active Tournaments Currently</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setActiveTab("tournaments")}
            className="w-full mt-4 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs text-white uppercase font-mono tracking-wider font-bold transition flex items-center justify-center gap-1.5"
          >
            All Tournaments
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Upcoming Competitions */}
        <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1.5 mb-4">
              <Calendar className="h-4.5 w-4.5 text-gray-500" />
              Upcoming Tournaments
            </h2>

            {upcomingTournaments.length > 0 ? (
              <div className="space-y-3">
                {upcomingTournaments.slice(0, 3).map(tourney => (
                  <div key={tourney.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-800/60 bg-gray-950/20 hover:border-gray-700 transition">
                    <img 
                      src={tourney.banner || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200"} 
                      alt={tourney.name} 
                      className="h-12 w-12 rounded object-cover border border-gray-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-[#C5A85C] uppercase tracking-wider font-mono font-semibold">{tourney.format} • Prize: {tourney.prize || "TBA"}</span>
                      <h4 className="text-xs font-bold text-white truncate font-display">{tourney.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-950/20 rounded-lg border border-gray-900 flex flex-col items-center justify-center">
                <Calendar className="h-10 w-10 text-gray-700 mb-2" />
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No New Tournaments Announced</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => setActiveTab("tournaments")}
            className="w-full mt-4 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs text-white uppercase font-mono tracking-wider font-bold transition flex items-center justify-center gap-1.5"
          >
            Register Now
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4. RECENT MATCH RESULTS */}
      <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1.5 mb-6">
          <BookOpen className="h-4.5 w-4.5 text-[#C5A85C]" />
          Recent Match Results
        </h2>

        {recentResults.length > 0 ? (
          <div className="divide-y divide-gray-800/60 space-y-4 divide-none">
            {recentResults.map(match => {
              const isSolo = match.player_a_id !== null;
              const nameA = isSolo ? getPlayerName(match.player_a_id) : getTeamName(match.team_a_id);
              const nameB = isSolo ? getPlayerName(match.player_b_id) : getTeamName(match.team_b_id);
              
              const scoreA = match.score_a ?? 0;
              const scoreB = match.score_b ?? 0;

              return (
                <div key={match.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-950/30 rounded-xl border border-gray-800/40">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{match.round}</span>
                  
                  <div className="flex items-center justify-center gap-4 sm:gap-8 flex-1">
                    <span className={`text-sm font-bold truncate text-right w-28 sm:w-40 ${scoreA > scoreB ? 'text-[#C5A85C]' : 'text-gray-400'}`}>{nameA}</span>
                    <div className="px-4 py-1.5 bg-gray-900 rounded-lg border border-gray-800 flex items-center gap-2.5 font-mono text-sm font-bold text-white shadow-inner">
                      <span className={scoreA > scoreB ? 'text-[#C5A85C]' : 'text-gray-400'}>{scoreA}</span>
                      <span className="text-gray-600 font-normal">:</span>
                      <span className={scoreB > scoreA ? 'text-[#C5A85C]' : 'text-gray-400'}>{scoreB}</span>
                    </div>
                    <span className={`text-sm font-bold truncate text-left w-28 sm:w-40 ${scoreB > scoreA ? 'text-[#C5A85C]' : 'text-gray-400'}`}>{nameB}</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded bg-gray-900/60 border border-gray-800 text-[9px] font-bold font-mono uppercase text-gray-400">Completed</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-950/10 rounded-lg border border-gray-900">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Matches Resolved Yet</p>
          </div>
        )}
      </div>

      {/* 5. TOP PERFORMERS LEADERBOARD & ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Player rankings leaderboard */}
        <div className="lg:col-span-2 bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-[#C5A85C]" />
              Top Player Rankings
            </h2>
            <button 
              onClick={() => setActiveTab("rankings")}
              className="text-xs text-[#C5A85C] uppercase tracking-widest font-mono font-bold hover:underline"
            >
              Full Leaderboard
            </button>
          </div>

          {playerStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-2 font-bold w-12 text-center">Rank</th>
                    <th className="py-3 px-4 font-bold text-left">Player</th>
                    <th className="py-3 px-4 font-bold text-center">Played</th>
                    <th className="py-3 px-4 font-bold text-center">Record (W-D-L)</th>
                    <th className="py-3 px-4 font-bold text-center">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {playerStats.slice(0, 5).map((stat, idx) => (
                    <tr 
                      key={stat.playerId} 
                      onClick={() => handlePlayerClick(stat.playerId)}
                      className="hover:bg-gray-800/10 cursor-pointer transition"
                    >
                      <td className="py-3 px-2 text-center font-bold">
                        {idx + 1 === 1 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#C5A85C] text-black font-extrabold text-[10px]">1st</span>
                        ) : idx + 1 === 2 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-400 text-black font-extrabold text-[10px]">2nd</span>
                        ) : idx + 1 === 3 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-700 text-black font-extrabold text-[10px]">3rd</span>
                        ) : (
                          <span>#{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={stat.profilePhoto || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=100"} 
                            alt={stat.username} 
                            className="h-8 w-8 rounded-full object-cover border border-gray-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-white block">{stat.username}</span>
                            <span className="text-[10px] text-gray-500 font-normal">{stat.teamName || "Free Agent"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{stat.matchesPlayed}</td>
                      <td className="py-3 px-4 text-center text-gray-400">{stat.wins}-{stat.draws}-{stat.losses}</td>
                      <td className="py-3 px-4 text-center text-[#C5A85C] font-bold">{stat.points} PTS</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-950/10 rounded-lg border border-gray-900">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Leaderboard Data Available</p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Latest News */}
        <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-white mb-6">Latest MPC News</h2>
            
            {latestNews.length > 0 ? (
              <div className="space-y-4">
                {latestNews.map(news => (
                  <div 
                    key={news.id} 
                    onClick={() => setActiveTab("announcements")}
                    className="group cursor-pointer space-y-1.5"
                  >
                    <span className="text-[9px] text-[#C5A85C] uppercase tracking-wider font-mono font-semibold">
                      {new Date(news.published_date).toLocaleDateString()}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#C5A85C] transition line-clamp-1 font-display">
                      {news.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{news.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-950/20 rounded-lg border border-gray-900 flex flex-col items-center justify-center">
                <Megaphone className="h-8 w-8 text-gray-700 mb-2" />
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No announcements posted</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => setActiveTab("announcements")}
            className="w-full mt-6 py-2 rounded-lg bg-gray-950/60 hover:bg-gray-800 border border-gray-800 text-xs text-gray-400 hover:text-white uppercase font-mono tracking-wider font-bold transition"
          >
            View News Archive
          </button>
        </div>

      </div>

    </div>
  );
}
