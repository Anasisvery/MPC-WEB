import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Award, Shield, Users, Medal } from "lucide-react";

export default function PublicRankings() {
  const { playerStats, teamStats } = useApp();
  const [boardType, setBoardType] = useState<"Players" | "Teams">("Players");

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header and board selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display font-semibold">Championship Standings</h2>
          <p className="text-xs text-gray-500 mt-1">Real-time calculated leaderboards based on match outcomes.</p>
        </div>

        {/* Buttons */}
        <div className="flex bg-gray-950 p-1.5 rounded-xl border border-gray-800">
          <button
            onClick={() => setBoardType("Players")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono transition-all ${
              boardType === "Players" 
                ? "bg-[#C5A85C] text-black font-bold" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Players Board
          </button>
          <button
            onClick={() => setBoardType("Teams")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono transition-all ${
              boardType === "Teams" 
                ? "bg-[#C5A85C] text-black font-bold" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Teams Board
          </button>
        </div>
      </div>

      {/* Render Leaderboard Table */}
      <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6 overflow-hidden">
        {boardType === "Players" ? (
          playerStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-2 font-bold w-12 text-center">Rank</th>
                    <th className="py-3 px-4 font-bold text-left">Player Competitor</th>
                    <th className="py-3 px-4 font-bold text-center">Played</th>
                    <th className="py-3 px-4 font-bold text-center">W</th>
                    <th className="py-3 px-4 font-bold text-center">D</th>
                    <th className="py-3 px-4 font-bold text-center">L</th>
                    <th className="py-3 px-4 font-bold text-center">Cards (Y/R)</th>
                    <th className="py-3 px-4 font-bold text-center">Win %</th>
                    <th className="py-3 px-4 font-bold text-center">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {playerStats.map((stat, idx) => (
                    <tr key={stat.playerId} className="hover:bg-gray-800/5 transition">
                      <td className="py-3.5 px-2 text-center font-bold">
                        {idx + 1 === 1 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#C5A85C] text-black font-extrabold text-[10px]">1</span>
                        ) : idx + 1 === 2 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-400 text-black font-extrabold text-[10px]">2</span>
                        ) : idx + 1 === 3 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-700 text-black font-extrabold text-[10px]">3</span>
                        ) : (
                          <span>#{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-center font-bold">{stat.matchesPlayed}</td>
                      <td className="py-3.5 px-4 text-center text-green-400 font-semibold">{stat.wins}</td>
                      <td className="py-3.5 px-4 text-center text-gray-400">{stat.draws}</td>
                      <td className="py-3.5 px-4 text-center text-red-500">{stat.losses}</td>
                      <td className="py-3.5 px-4 text-center text-gray-500">
                        <span className="text-yellow-400">{stat.yellowCards}Y</span> / <span className="text-red-500">{stat.redCards}R</span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-white">{stat.winRate}%</td>
                      <td className="py-3.5 px-4 text-center text-[#C5A85C] font-extrabold text-sm">{stat.points} PTS</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <Users className="h-10 w-10 text-gray-700 mb-2" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Player Stats Calculated Yet</p>
            </div>
          )
        ) : (
          teamStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-2 font-bold w-12 text-center">Rank</th>
                    <th className="py-3 px-4 font-bold text-left">Esports Clan/Team</th>
                    <th className="py-3 px-4 font-bold text-center">Roster Size</th>
                    <th className="py-3 px-4 font-bold text-center">Played</th>
                    <th className="py-3 px-4 font-bold text-center">W</th>
                    <th className="py-3 px-4 font-bold text-center">D</th>
                    <th className="py-3 px-4 font-bold text-center">L</th>
                    <th className="py-3 px-4 font-bold text-center">Win %</th>
                    <th className="py-3 px-4 font-bold text-center">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {teamStats.map((stat, idx) => (
                    <tr key={stat.teamId} className="hover:bg-gray-800/5 transition">
                      <td className="py-3.5 px-2 text-center font-bold">
                        {idx + 1 === 1 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#C5A85C] text-black font-extrabold text-[10px]">1</span>
                        ) : idx + 1 === 2 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-400 text-black font-extrabold text-[10px]">2</span>
                        ) : idx + 1 === 3 ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-700 text-black font-extrabold text-[10px]">3</span>
                        ) : (
                          <span>#{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={stat.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200"} 
                            alt={stat.name} 
                            className="h-8 w-8 rounded object-cover border border-gray-800 bg-[#0F131A]"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-bold text-white block">{stat.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-400 font-bold">{stat.playersCount}</td>
                      <td className="py-3.5 px-4 text-center font-bold">{stat.matchesPlayed}</td>
                      <td className="py-3.5 px-4 text-center text-green-400 font-semibold">{stat.wins}</td>
                      <td className="py-3.5 px-4 text-center text-gray-400">{stat.draws}</td>
                      <td className="py-3.5 px-4 text-center text-red-500">{stat.losses}</td>
                      <td className="py-3.5 px-4 text-center text-white">{stat.winRate}%</td>
                      <td className="py-3.5 px-4 text-center text-[#C5A85C] font-extrabold text-sm">{stat.points} PTS</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <Shield className="h-10 w-10 text-gray-700 mb-2" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Clan Standings Logged</p>
            </div>
          )
        )}
      </div>

    </div>
  );
}
