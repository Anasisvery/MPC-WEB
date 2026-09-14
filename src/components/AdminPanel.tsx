import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import AdminSidebar, { AdminSection } from "./AdminSidebar";
import Modal from "./Modal";
import BannerUpload from "./BannerUpload";
import { 
  Trophy, Users, ShieldAlert, Calendar, History, Settings, 
  Trash2, Edit, Plus, AlertCircle, CheckCircle2, Ban, 
  UserMinus, UserPlus, HelpCircle, Save, LogIn, LayoutDashboard 
} from "lucide-react";
import { Player, Team, Tournament, Fixture, Card, Ban as BanType, Announcement, ClubSettings } from "../types";

export default function AdminPanel() {
  const {
    players, teams, tournaments, participants, fixtures, cards, bans, announcements, activityLogs, settings, playerStats, teamStats,
    loading, error, currentUser, login, updateSettings,
    addPlayer, editPlayer, removePlayer, issueCard, issueBan, removeBan,
    addTeam, editTeam, removeTeam,
    addTournament, editTournament, removeTournament, registerParticipant, unregisterParticipant,
    addFixture, editFixture, removeFixture, submitResult,
    addAnnouncement, editAnnouncement, removeAnnouncement
  } = useApp();

  // Authentication states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Active view section
  const [currentSection, setCurrentSection] = useState<AdminSection>("dashboard");

  // General state triggers
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"add" | "edit" | "result" | "card" | "ban" | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Individual Form States
  // 1. Players
  const [playerForm, setPlayerForm] = useState({
    username: "", first_name: "", last_name: "", efootball_uid: "", 
    device: "Android", device_info: "", country: "", profile_photo: "", team_id: ""
  });
  // 2. Teams
  const [teamForm, setTeamForm] = useState({ name: "", logo: "", captain_id: "" });
  // 3. Tournaments
  const [tourneyForm, setTourneyForm] = useState({
    name: "", description: "", rules: "", format: "Solo", max_participants: 16,
    status: "Upcoming", prize: "", banner: "", tournament_start: ""
  });
  // 4. Register Participant
  const [participantForm, setParticipantForm] = useState({ tournament_id: "", player_id: "", team_id: "" });
  // 5. Fixtures
  const [fixtureForm, setFixtureForm] = useState({
    tournament_id: "", round: "Group Stage", match_number: 1,
    player_a_id: "", player_b_id: "", team_a_id: "", team_b_id: "", scheduled_time: ""
  });
  // 6. Resolve Score
  const [scoreForm, setScoreForm] = useState({ score_a: 0, score_b: 0 });
  // 7. Cards / Warnings
  const [cardForm, setCardForm] = useState({ player_id: "", card_type: "Yellow" as "Yellow" | "Red", reason: "" });
  // 8. Bans
  const [banForm, setBanForm] = useState({ player_id: "", reason: "", permanent: false, end_date: "", note: "" });
  // 9. Announcements
  const [newsForm, setNewsForm] = useState({ title: "", body: "", image_url: "", published: true });
  // 10. Club Configuration
  const [clubForm, setClubForm] = useState<Partial<ClubSettings>>({});

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setAuthError(res.error || "Authentication failed. Double check credentials.");
      }
    } catch (err: any) {
      setAuthError(err?.message || "InsForge login request failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Open modals setup
  const openAddModal = () => {
    // Reset forms based on section
    if (currentSection === "players") {
      setPlayerForm({ username: "", first_name: "", last_name: "", efootball_uid: "", device: "Android", device_info: "", country: "", profile_photo: "", team_id: "" });
    } else if (currentSection === "teams") {
      setTeamForm({ name: "", logo: "", captain_id: "" });
    } else if (currentSection === "tournaments") {
      setTourneyForm({ name: "", description: "", rules: "", format: "Solo", max_participants: 16, status: "Upcoming", prize: "", banner: "", tournament_start: "" });
    } else if (currentSection === "fixtures") {
      setFixtureForm({ tournament_id: tournaments[0]?.id || "", round: "Group Stage", match_number: 1, player_a_id: "", player_b_id: "", team_a_id: "", team_b_id: "", scheduled_time: "" });
    } else if (currentSection === "announcements") {
      setNewsForm({ title: "", body: "", image_url: "", published: true });
    }
    setActiveModal("add");
  };

  const openEditModal = (id: string) => {
    setSelectedEntityId(id);
    if (currentSection === "players") {
      const item = players.find(p => p.id === id);
      if (item) setPlayerForm({
        username: item.username, first_name: item.first_name, last_name: item.last_name, efootball_uid: item.efootball_uid,
        device: item.device, device_info: item.device_info || "", country: item.country || "", profile_photo: item.profile_photo || "", team_id: item.team_id || ""
      });
    } else if (currentSection === "teams") {
      const item = teams.find(t => t.id === id);
      if (item) setTeamForm({ name: item.name, logo: item.logo || "", captain_id: item.captain_id || "" });
    } else if (currentSection === "tournaments") {
      const item = tournaments.find(t => t.id === id);
      if (item) setTourneyForm({
        name: item.name, description: item.description || "", rules: item.rules || "", format: item.format,
        max_participants: item.max_participants, status: item.status, prize: item.prize || "", banner: item.banner || "",
        tournament_start: item.tournament_start ? item.tournament_start.split("T")[0] : ""
      });
    } else if (currentSection === "announcements") {
      const item = announcements.find(a => a.id === id);
      if (item) setNewsForm({ title: item.title, body: item.body, image_url: item.image_url || "", published: item.published });
    }
    setActiveModal("edit");
  };

  // Submission CRUD Actions
  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeModal === "add") {
        await addPlayer({
          ...playerForm,
          status: "active",
          team_id: playerForm.team_id ? playerForm.team_id : null
        });
        showSuccess("Competitor registered successfully!");
      } else if (activeModal === "edit" && selectedEntityId) {
        await editPlayer(selectedEntityId, {
          ...playerForm,
          team_id: playerForm.team_id ? playerForm.team_id : null
        });
        showSuccess("Competitor details modified.");
      }
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || "Failed to commit player changes.");
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeModal === "add") {
        await addTeam({
          name: teamForm.name,
          logo: teamForm.logo || null,
          captain_id: teamForm.captain_id ? teamForm.captain_id : null
        });
        showSuccess("Esports team created successfully.");
      } else if (activeModal === "edit" && selectedEntityId) {
        await editTeam(selectedEntityId, {
          name: teamForm.name,
          logo: teamForm.logo || null,
          captain_id: teamForm.captain_id ? teamForm.captain_id : null
        });
        showSuccess("Esports team configuration updated.");
      }
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || "Failed to save team profile.");
    }
  };

  const handleTourneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeModal === "add") {
        await addTournament({
          ...tourneyForm,
          banner: tourneyForm.banner || null,
          description: tourneyForm.description || null,
          rules: tourneyForm.rules || null,
          prize: tourneyForm.prize || null,
          tournament_start: tourneyForm.tournament_start ? new Date(tourneyForm.tournament_start).toISOString() : null
        });
        showSuccess("New championship created.");
      } else if (activeModal === "edit" && selectedEntityId) {
        await editTournament(selectedEntityId, {
          ...tourneyForm,
          banner: tourneyForm.banner || null,
          description: tourneyForm.description || null,
          rules: tourneyForm.rules || null,
          prize: tourneyForm.prize || null,
          tournament_start: tourneyForm.tournament_start ? new Date(tourneyForm.tournament_start).toISOString() : null
        });
        showSuccess("Championship details modified.");
      }
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || "Failed to save tournament changes.");
    }
  };

  const handleFixtureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tourney = tournaments.find(t => t.id === fixtureForm.tournament_id);
      const isSolo = tourney ? tourney.format !== "Team" : true;

      await addFixture({
        tournament_id: fixtureForm.tournament_id,
        round: fixtureForm.round,
        match_number: Number(fixtureForm.match_number),
        status: "Scheduled",
        player_a_id: isSolo && fixtureForm.player_a_id ? fixtureForm.player_a_id : null,
        player_b_id: isSolo && fixtureForm.player_b_id ? fixtureForm.player_b_id : null,
        team_a_id: !isSolo && fixtureForm.team_a_id ? fixtureForm.team_a_id : null,
        team_b_id: !isSolo && fixtureForm.team_b_id ? fixtureForm.team_b_id : null,
        score_a: null,
        score_b: null,
        scheduled_time: fixtureForm.scheduled_time ? new Date(fixtureForm.scheduled_time).toISOString() : null
      });
      showSuccess("Match fixture created.");
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || "Failed to publish match fixture.");
    }
  };

  const handleResolveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntityId) return;
    try {
      await submitResult(selectedEntityId, scoreForm.score_a, scoreForm.score_b);
      showSuccess("Match score resolved successfully!");
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || "Failed to log result.");
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await issueCard({
        player_id: cardForm.player_id,
        card_type: cardForm.card_type,
        reason: cardForm.reason,
        match_id: null
      });
      showSuccess("Disciplinary card warned onto player.");
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || "Failed to record card.");
    }
  };

  const handleBanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await issueBan({
        player_id: banForm.player_id,
        reason: banForm.reason,
        permanent: banForm.permanent,
        start_date: new Date().toISOString(),
        end_date: banForm.permanent ? null : (banForm.end_date ? new Date(banForm.end_date).toISOString() : null),
        status: "Active",
        note: banForm.note || null
      });
      showSuccess("Competitor penalty ban active.");
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || "Failed to ban competitor.");
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeModal === "add") {
        await addAnnouncement({
          title: newsForm.title,
          body: newsForm.body,
          image_url: newsForm.image_url || null,
          published: newsForm.published,
          published_date: new Date().toISOString()
        });
        showSuccess("Announcement drafted successfully.");
      } else if (activeModal === "edit" && selectedEntityId) {
        await editAnnouncement(selectedEntityId, {
          title: newsForm.title,
          body: newsForm.body,
          image_url: newsForm.image_url || null,
          published: newsForm.published
        });
        showSuccess("Announcement modified.");
      }
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || "Failed to publish notice.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(clubForm);
      showSuccess("Club configuration modified.");
    } catch (err: any) {
      alert(err.message || "Failed to edit global settings.");
    }
  };

  const triggerInitialClubLoad = () => {
    if (settings) {
      setClubForm({
        club_name: settings.club_name,
        club_short_name: settings.club_short_name,
        club_description: settings.club_description || "",
        club_logo: settings.club_logo || "",
        club_banner: settings.club_banner || "",
        game_name: settings.game_name,
        win_points: settings.win_points,
        draw_points: settings.draw_points,
        loss_points: settings.loss_points
      });
    }
  };

  const getPlayerUsername = (id: string | null) => {
    return players.find(p => p.id === id)?.username || "Competitor";
  };

  const getTeamName = (id: string | null) => {
    return teams.find(t => t.id === id)?.name || "Team";
  };

  const getTournamentName = (id: string) => {
    return tournaments.find(t => t.id === id)?.name || "Championship";
  };

  // Pre-load club settings form once clicked
  React.useEffect(() => {
    if (currentSection === "settings") {
      triggerInitialClubLoad();
    }
  }, [currentSection, settings]);

  if (!currentUser) {
    // -----------------------------------------------------
    // SECURE LOGIN COVER
    // -----------------------------------------------------
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-[#0A0D14] border border-gray-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#C5A85C]/10 border border-[#C5A85C]/30 text-[#C5A85C] mb-2">
              <LogIn className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display text-[#C5A85C]">Portal Administration</h2>
            <p className="text-xs text-gray-500 font-mono">Sign in with your InsForge project credentials to manage Mafia PES Club.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider font-bold text-gray-400 mb-1.5">Authorized Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mafiapes.com"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none focus:border-[#C5A85C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider font-bold text-gray-400 mb-1.5">Secret Key Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none focus:border-[#C5A85C]"
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-xs text-red-400 font-mono">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] disabled:bg-gray-800 text-black font-extrabold uppercase tracking-wider font-mono text-xs transition duration-150 flex items-center justify-center gap-1.5"
            >
              {authLoading ? "Authenticating session..." : "Verify Administrator Credentials"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  // AUTHORIZED ROOT VIEWPORT
  // -----------------------------------------------------
  return (
    <div className="flex flex-col md:flex-row min-h-[85vh] bg-[#070A0F] text-gray-300">
      
      {/* 1. Side panel router */}
      <AdminSidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />

      {/* 2. Primary viewport */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-x-hidden">
        
        {/* Banner triggers */}
        {successBanner && (
          <div className="flex items-center gap-2.5 p-4 bg-green-950/20 border border-green-900/40 rounded-xl text-xs font-mono text-green-400 shadow-lg">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* =========================================================================
            DASHBOARD PANEL STATS
            ========================================================================= */}
        {currentSection === "dashboard" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Portal Activity Center</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">Overview metrics of Mafia PES Club tournament cycles.</p>
              </div>
            </div>

            {/* Matrix cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0A0D14] border border-gray-800 p-5 rounded-xl">
                <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Total Enlisted</span>
                <span className="text-2xl font-bold text-white tracking-tight">{players.length} Players</span>
              </div>
              <div className="bg-[#0A0D14] border border-gray-800 p-5 rounded-xl">
                <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Clan Rosters</span>
                <span className="text-2xl font-bold text-white tracking-tight">{teams.length} Teams</span>
              </div>
              <div className="bg-[#0A0D14] border border-gray-800 p-5 rounded-xl">
                <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Leagues Active</span>
                <span className="text-2xl font-bold text-[#C5A85C] tracking-tight">
                  {tournaments.filter(t => t.status === "Ongoing").length} Live
                </span>
              </div>
              <div className="bg-[#0A0D14] border border-gray-800 p-5 rounded-xl">
                <span className="block text-[9px] uppercase font-mono tracking-widest text-gray-500 font-bold">Active Penalties</span>
                <span className="text-2xl font-bold text-red-500 tracking-tight">
                  {bans.filter(b => b.status === "Active").length} Bans
                </span>
              </div>
            </div>

            {/* Quick action triggers */}
            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
              <h3 className="text-xs uppercase font-mono tracking-widest text-gray-400 font-bold mb-4">Quick Shortcuts</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setCurrentSection("players")} 
                  className="px-4 py-2.5 bg-gray-950 hover:bg-[#C5A85C]/10 hover:text-[#C5A85C] border border-gray-800 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition"
                >
                  Manage Players
                </button>
                <button 
                  onClick={() => setCurrentSection("fixtures")} 
                  className="px-4 py-2.5 bg-gray-950 hover:bg-[#C5A85C]/10 hover:text-[#C5A85C] border border-gray-800 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition"
                >
                  Set Fixtures
                </button>
                <button 
                  onClick={() => setCurrentSection("results")} 
                  className="px-4 py-2.5 bg-gray-950 hover:bg-[#C5A85C]/10 hover:text-[#C5A85C] border border-gray-800 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition"
                >
                  Input Results
                </button>
                <button 
                  onClick={() => setCurrentSection("bans")} 
                  className="px-4 py-2.5 bg-gray-950 hover:bg-red-500/10 hover:text-red-400 border border-gray-800 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition"
                >
                  Foul Penalties
                </button>
              </div>
            </div>

            {/* Chronological System logs */}
            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
              <h3 className="text-xs uppercase font-mono tracking-widest text-white font-bold mb-4 flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-gray-500" />
                Audit System Action Trails ({activityLogs.length})
              </h3>
              
              <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2.5 pr-2">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-950/40 border border-gray-800/60 rounded-lg text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span className="font-bold text-[#C5A85C]">{log.action_type}</span>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 font-medium">
                      Admin <strong className="text-white">{log.admin_username}</strong>: {log.details}
                    </p>
                    {log.target_entity && (
                      <span className="text-[10px] text-gray-600 block">Target: {log.target_entity}</span>
                    )}
                  </div>
                ))}
                
                {activityLogs.length === 0 && (
                  <p className="text-center text-xs text-gray-600 py-6">No administrative audit trail logs stored.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PLAYERS SUB-PANEL
            ========================================================================= */}
        {currentSection === "players" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Players Registry</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">Enroll, edit, and delete Mafia PES Club roster participants.</p>
              </div>
              <button 
                onClick={openAddModal}
                className="px-4 py-2 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono text-xs tracking-wider transition flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Player
              </button>
            </div>

            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Profile</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">eFootball UID</th>
                    <th className="py-3 px-4">Hardware</th>
                    <th className="py-3 px-4">Roster</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {players.map(player => (
                    <tr key={player.id} className="hover:bg-gray-800/10 transition">
                      <td className="py-3.5 px-4">
                        <img 
                          src={player.profile_photo || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=100"} 
                          alt={player.username} 
                          className="h-8 w-8 rounded-full object-cover border border-gray-800"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{player.username}</td>
                      <td className="py-3.5 px-4">{player.efootball_uid}</td>
                      <td className="py-3.5 px-4 text-gray-400">{player.device}</td>
                      <td className="py-3.5 px-4">{getTeamName(player.team_id)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          player.status === "banned" ? "bg-red-950/40 text-red-400 border border-red-900/40" : "bg-green-950/40 text-green-400 border border-green-900/40"
                        }`}>
                          {player.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(player.id)}
                            className="p-1.5 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm(`Permanently delete competitor ${player.username}?`)) {
                                await removePlayer(player.id);
                                showSuccess("Competitor registration deleted.");
                              }
                            }}
                            className="p-1.5 rounded bg-red-950/15 border border-red-900/30 text-red-400 hover:bg-red-950/35 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TEAMS SUB-PANEL
            ========================================================================= */}
        {currentSection === "teams" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Esports Teams</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">Register, configure, and delete club roster clans.</p>
              </div>
              <button 
                onClick={openAddModal}
                className="px-4 py-2 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono text-xs tracking-wider transition flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Team
              </button>
            </div>

            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Logo</th>
                    <th className="py-3 px-4">Team Name</th>
                    <th className="py-3 px-4">Captain</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {teams.map(team => (
                    <tr key={team.id} className="hover:bg-gray-800/10 transition">
                      <td className="py-3.5 px-4">
                        <img 
                          src={team.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200"} 
                          alt={team.name} 
                          className="h-8 w-8 rounded object-cover border border-gray-800 bg-[#0F131A]"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{team.name}</td>
                      <td className="py-3.5 px-4 text-gray-400">{getPlayerUsername(team.captain_id)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(team.id)}
                            className="p-1.5 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm(`Delete team ${team.name}? This will clear player associations.`)) {
                                await removeTeam(team.id);
                                showSuccess("Team profile deleted.");
                              }
                            }}
                            className="p-1.5 rounded bg-red-950/15 border border-red-900/30 text-red-400 hover:bg-red-950/35 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TOURNAMENTS SUB-PANEL
            ========================================================================= */}
        {currentSection === "tournaments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Championships Cycle</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">Initiate, manage, and edit gaming tournament pools.</p>
              </div>
              <button 
                onClick={openAddModal}
                className="px-4 py-2 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono text-xs tracking-wider transition flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Tournament
              </button>
            </div>

            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Banner</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Max Players</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {tournaments.map(tourney => (
                    <tr key={tourney.id} className="hover:bg-gray-800/10 transition">
                      <td className="py-3.5 px-4">
                        <img 
                          src={tourney.banner || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200"} 
                          alt={tourney.name} 
                          className="h-8 w-12 rounded object-cover border border-gray-800"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{tourney.name}</td>
                      <td className="py-3.5 px-4 text-gray-400">{tourney.format}</td>
                      <td className="py-3.5 px-4">{tourney.max_participants} Slots</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          tourney.status === "Ongoing" ? "bg-green-950/40 text-green-400 border border-green-900/40" :
                          tourney.status === "Upcoming" ? "bg-[#C5A85C]/15 text-[#C5A85C] border-[#C5A85C]/30" : "bg-gray-900 text-gray-400 border-gray-800"
                        }`}>
                          {tourney.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(tourney.id)}
                            className="p-1.5 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm(`Permanently delete championship ${tourney.name}?`)) {
                                await removeTournament(tourney.id);
                                showSuccess("Championship deleted.");
                              }
                            }}
                            className="p-1.5 rounded bg-red-950/15 border border-red-900/30 text-red-400 hover:bg-red-950/35 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            PARTICIPANTS SUB-PANEL
            ========================================================================= */}
        {currentSection === "participants" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Championship Roster Enrollment</h2>
              <p className="text-xs text-gray-500 font-mono mt-1">Enroll players or teams into scheduled tournament lists.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Enrollment Left Form */}
              <div className="bg-[#0A0D14] border border-gray-800 p-6 rounded-xl h-fit space-y-4">
                <h3 className="text-xs uppercase font-mono tracking-widest text-white font-bold">Register Competitor</h3>
                
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!participantForm.tournament_id) {
                      alert("Please select a tournament first!");
                      return;
                    }
                    try {
                      const tourney = tournaments.find(t => t.id === participantForm.tournament_id);
                      const isSolo = tourney ? tourney.format !== "Team" : true;
                      
                      await registerParticipant(
                        participantForm.tournament_id,
                        isSolo ? participantForm.player_id : null,
                        !isSolo ? participantForm.team_id : null
                      );
                      showSuccess("Competitor registered into pool.");
                      setParticipantForm({ ...participantForm, player_id: "", team_id: "" });
                    } catch (err: any) {
                      alert(err.message || "Enrollment failed.");
                    }
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-1">Target Tournament</label>
                    <select
                      value={participantForm.tournament_id}
                      onChange={(e) => setParticipantForm({ ...participantForm, tournament_id: e.target.value, player_id: "", team_id: "" })}
                      className="w-full px-3 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none"
                    >
                      <option value="">-- Choose Pool --</option>
                      {tournaments.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.format})</option>
                      ))}
                    </select>
                  </div>

                  {participantForm.tournament_id && (
                    <>
                      {tournaments.find(t => t.id === participantForm.tournament_id)?.format !== "Team" ? (
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-1">Select Competitor</label>
                          <select
                            value={participantForm.player_id}
                            onChange={(e) => setParticipantForm({ ...participantForm, player_id: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none"
                          >
                            <option value="">-- Select Player --</option>
                            {players.map(p => (
                              <option key={p.id} value={p.id}>{p.username} ({p.first_name})</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-1">Select Esports Team</label>
                          <select
                            value={participantForm.team_id}
                            onChange={(e) => setParticipantForm({ ...participantForm, team_id: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none"
                          >
                            <option value="">-- Select Clan --</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 rounded bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono text-xs tracking-wider transition"
                      >
                        Enroll Participant
                      </button>
                    </>
                  )}
                </form>
              </div>

              {/* Enrollment Right List */}
              <div className="lg:col-span-2 bg-[#0A0D14] border border-gray-800 rounded-xl p-6 h-fit space-y-4">
                <h3 className="text-xs uppercase font-mono tracking-widest text-white font-bold">Enrolled Pools Directory</h3>
                
                <div className="space-y-3">
                  {participants.map(part => {
                    const tourney = tournaments.find(t => t.id === part.tournament_id);
                    const isSolo = tourney ? tourney.format !== "Team" : true;
                    const name = isSolo ? getPlayerUsername(part.player_id) : getTeamName(part.team_id);
                    
                    return (
                      <div key={part.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-950/40 border border-gray-800/60 text-xs font-mono">
                        <div>
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest">{tourney?.name || "League"}</span>
                          <h4 className="text-white font-bold mt-0.5">{name}</h4>
                        </div>
                        
                        <button
                          onClick={async () => {
                            if (confirm(`Remove ${name} from ${tourney?.name}?`)) {
                              await unregisterParticipant(part.id);
                              showSuccess("Participant removed.");
                            }
                          }}
                          className="px-2 py-1 rounded bg-red-950/15 border border-red-900/30 text-red-400 hover:bg-red-950/35 transition text-[10px] font-bold font-mono"
                        >
                          Unregister
                        </button>
                      </div>
                    );
                  })}

                  {participants.length === 0 && (
                    <p className="text-center text-xs text-gray-500 py-8">No participants enrolled in any pool.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FIXTURES SUB-PANEL
            ========================================================================= */}
        {currentSection === "fixtures" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Match Fixtures Setup</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">Publish game agendas and scheduling calendars.</p>
              </div>
              <button 
                onClick={openAddModal}
                className="px-4 py-2 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono text-xs tracking-wider transition flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Fixture
              </button>
            </div>

            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">League</th>
                    <th className="py-3 px-4">Match Number</th>
                    <th className="py-3 px-4">Round</th>
                    <th className="py-3 px-4">Opponents Pair</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {fixtures.map(match => {
                    const tourney = tournaments.find(t => t.id === match.tournament_id);
                    const isSolo = tourney ? tourney.format !== "Team" : true;
                    
                    const nameA = isSolo ? getPlayerUsername(match.player_a_id) : getTeamName(match.team_a_id);
                    const nameB = isSolo ? getPlayerUsername(match.player_b_id) : getTeamName(match.team_b_id);

                    return (
                      <tr key={match.id} className="hover:bg-gray-800/10 transition">
                        <td className="py-3.5 px-4 text-gray-400 font-bold">{tourney?.name || "League"}</td>
                        <td className="py-3.5 px-4">#{match.match_number}</td>
                        <td className="py-3.5 px-4">{match.round}</td>
                        <td className="py-3.5 px-4 text-white font-bold">{nameA} <span className="text-gray-500">vs</span> {nameB}</td>
                        <td className="py-3.5 px-4 text-gray-500">{match.scheduled_time ? new Date(match.scheduled_time).toLocaleString() : "TBD"}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            match.status === "Completed" ? "bg-green-950/40 text-green-400 border border-green-900/40" :
                            match.status === "Live" ? "bg-red-950/40 text-red-400 border border-red-900/40 animate-pulse" :
                            "bg-gray-900 text-gray-400 border border-gray-800"
                          }`}>
                            {match.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button 
                            onClick={async () => {
                              if (confirm(`Permanently delete Match #${match.match_number}?`)) {
                                await removeFixture(match.id);
                                showSuccess("Fixture deleted.");
                              }
                            }}
                            className="p-1.5 rounded bg-red-950/15 border border-red-900/30 text-red-400 hover:bg-red-950/35 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            RESULTS SUB-PANEL
            ========================================================================= */}
        {currentSection === "results" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Resolve Scores & Results</h2>
              <p className="text-xs text-gray-500 font-mono mt-1">Submit active/live fixture outcomes to compile standing statistics.</p>
            </div>

            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Tournament</th>
                    <th className="py-3 px-4">Match</th>
                    <th className="py-3 px-4">Competitors</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {fixtures.map(match => {
                    const tourney = tournaments.find(t => t.id === match.tournament_id);
                    const isSolo = tourney ? tourney.format !== "Team" : true;
                    
                    const nameA = isSolo ? getPlayerUsername(match.player_a_id) : getTeamName(match.team_a_id);
                    const nameB = isSolo ? getPlayerUsername(match.player_b_id) : getTeamName(match.team_b_id);

                    return (
                      <tr key={match.id} className="hover:bg-gray-800/10 transition">
                        <td className="py-3.5 px-4 text-gray-400">{tourney?.name}</td>
                        <td className="py-3.5 px-4">#{match.match_number} - {match.round}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{nameA} vs {nameB}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#C5A85C]">
                          {match.score_a !== null ? `${match.score_a} - ${match.score_b}` : "Pending"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            match.status === "Completed" ? "bg-green-950/40 text-green-400 border border-green-900/40" : "bg-yellow-950/20 text-yellow-500 border border-yellow-900/40"
                          }`}>
                            {match.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedEntityId(match.id);
                              setScoreForm({ score_a: match.score_a || 0, score_b: match.score_b || 0 });
                              setActiveModal("result");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-mono font-bold uppercase text-white transition"
                          >
                            Resolve Score
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            PLAYER RANKINGS & TEAM RANKINGS SUB-PANELS
            ========================================================================= */}
        {(currentSection === "player_rankings" || currentSection === "team_rankings") && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">
                {currentSection === "player_rankings" ? "Player Rankings Standings" : "Team Rankings Standings"}
              </h2>
              <p className="text-xs text-gray-500 font-mono mt-1">Calculated leaderboards based on match outcomes.</p>
            </div>

            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6">
              {currentSection === "player_rankings" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Player</th>
                        <th className="py-3 px-4">Played</th>
                        <th className="py-3 px-4">Wins</th>
                        <th className="py-3 px-4">Draws</th>
                        <th className="py-3 px-4">Losses</th>
                        <th className="py-3 px-4">Win Rate</th>
                        <th className="py-3 px-4 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40 text-gray-300">
                      {playerStats.map((stat, idx) => (
                        <tr key={stat.playerId} className="hover:bg-gray-800/10 transition">
                          <td className="py-3 px-4 font-bold">#{idx + 1}</td>
                          <td className="py-3 px-4 text-white font-bold">{stat.username}</td>
                          <td className="py-3 px-4">{stat.matchesPlayed}</td>
                          <td className="py-3 px-4 text-green-400">{stat.wins}</td>
                          <td className="py-3 px-4 text-gray-400">{stat.draws}</td>
                          <td className="py-3 px-4 text-red-500">{stat.losses}</td>
                          <td className="py-3 px-4">{stat.winRate}%</td>
                          <td className="py-3 px-4 text-right text-[#C5A85C] font-extrabold">{stat.points} PTS</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Esports Team</th>
                        <th className="py-3 px-4">Roster Size</th>
                        <th className="py-3 px-4">Played</th>
                        <th className="py-3 px-4">Wins</th>
                        <th className="py-3 px-4">Draws</th>
                        <th className="py-3 px-4">Losses</th>
                        <th className="py-3 px-4">Win Rate</th>
                        <th className="py-3 px-4 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40 text-gray-300">
                      {teamStats.map((stat, idx) => (
                        <tr key={stat.teamId} className="hover:bg-gray-800/10 transition">
                          <td className="py-3 px-4 font-bold">#{idx + 1}</td>
                          <td className="py-3 px-4 text-white font-bold">{stat.name}</td>
                          <td className="py-3 px-4 text-gray-400">{stat.playersCount}</td>
                          <td className="py-3 px-4">{stat.matchesPlayed}</td>
                          <td className="py-3 px-4 text-green-400">{stat.wins}</td>
                          <td className="py-3 px-4 text-gray-400">{stat.draws}</td>
                          <td className="py-3 px-4 text-red-500">{stat.losses}</td>
                          <td className="py-3 px-4">{stat.winRate}%</td>
                          <td className="py-3 px-4 text-right text-[#C5A85C] font-extrabold">{stat.points} PTS</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            CARDS / WARNINGS SUB-PANEL
            ========================================================================= */}
        {currentSection === "cards" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Foul Play Warnings</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">Issue disciplinary warning records (Yellow/Red cards).</p>
              </div>
              <button 
                onClick={() => {
                  setCardForm({ player_id: players[0]?.id || "", card_type: "Yellow", reason: "" });
                  setActiveModal("card");
                }}
                className="px-4 py-2 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono text-xs tracking-wider transition flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Issue Card
              </button>
            </div>

            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Card Type</th>
                    <th className="py-3 px-4">Foul Penalty Details</th>
                    <th className="py-3 px-4">Date Issued</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {cards.map(card => (
                    <tr key={card.id} className="hover:bg-gray-800/10 transition">
                      <td className="py-3.5 px-4 font-bold text-white">{getPlayerUsername(card.player_id)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          card.card_type === "Yellow" ? "bg-yellow-950/30 text-yellow-400 border border-yellow-900/40" : "bg-red-950/40 text-red-400 border border-red-900/40"
                        }`}>
                          {card.card_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">{card.reason}</td>
                      <td className="py-3.5 px-4 text-gray-500">{new Date(card.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={async () => {
                            if (confirm("Permanently lift/delete this card warning?")) {
                              // We could write card warning removal
                              alert("Warnings are permanent systemic trails. Bans can be lifted.");
                            }
                          }}
                          className="text-xs text-gray-500 font-bold hover:underline"
                        >
                          Warning Saved
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            BANS SUB-PANEL
            ========================================================================= */}
        {currentSection === "bans" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Ban Penalities Registry</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">Suspend competitors, set expiration dates, or reinstate players.</p>
              </div>
              <button 
                onClick={() => {
                  setBanForm({ player_id: players[0]?.id || "", reason: "", permanent: false, end_date: "", note: "" });
                  setActiveModal("ban");
                }}
                className="px-4 py-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 font-extrabold uppercase font-mono text-xs tracking-wider border border-red-900/40 transition flex items-center gap-1.5"
              >
                <Ban className="h-4 w-4" />
                Ban Player
              </button>
            </div>

            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Ban Duration</th>
                    <th className="py-3 px-4">Suspension Reason</th>
                    <th className="py-3 px-4">Lifts Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {bans.map(ban => (
                    <tr key={ban.id} className="hover:bg-gray-800/10 transition">
                      <td className="py-3.5 px-4 font-bold text-white">{getPlayerUsername(ban.player_id)}</td>
                      <td className="py-3.5 px-4 text-gray-400">{ban.permanent ? "Permanent" : "Temporary"}</td>
                      <td className="py-3.5 px-4">{ban.reason}</td>
                      <td className="py-3.5 px-4 text-gray-500">{ban.permanent ? "Never" : (ban.end_date ? new Date(ban.end_date).toLocaleDateString() : "TBD")}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          ban.status === "Active" ? "bg-red-950/40 text-red-400 border border-red-900/40" : "bg-gray-900 text-gray-500 border border-gray-800"
                        }`}>
                          {ban.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ban.status === "Active" ? (
                          <button 
                            onClick={async () => {
                              if (confirm(`Reinstate player and lift penalty ban?`)) {
                                await removeBan(ban.id, ban.player_id);
                                showSuccess("Competitor reinstated.");
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-green-950/20 hover:bg-green-950/40 border border-green-900/30 text-green-400 text-[10px] font-bold font-mono transition"
                          >
                            Lift Ban
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-600">Lifted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            ANNOUNCEMENTS SUB-PANEL
            ========================================================================= */}
        {currentSection === "announcements" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Announcement Bulletins</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">Manage public press news and community notice boards.</p>
              </div>
              <button 
                onClick={openAddModal}
                className="px-4 py-2 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono text-xs tracking-wider transition flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Draft Notice
              </button>
            </div>

            <div className="bg-[#0A0D14] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Cover</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Notice Preview</th>
                    <th className="py-3 px-4">Date Drafted</th>
                    <th className="py-3 px-4">Visibility</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  {announcements.map(news => (
                    <tr key={news.id} className="hover:bg-gray-800/10 transition">
                      <td className="py-3.5 px-4">
                        <img 
                          src={news.image_url || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200"} 
                          alt={news.title} 
                          className="h-8 w-12 rounded object-cover border border-gray-800"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white max-w-[150px] truncate">{news.title}</td>
                      <td className="py-3.5 px-4 text-gray-400 max-w-[200px] truncate">{news.body}</td>
                      <td className="py-3.5 px-4 text-gray-500">{new Date(news.published_date).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          news.published ? "bg-green-950/40 text-green-400 border border-green-900/40" : "bg-gray-900 text-gray-500 border border-gray-800"
                        }`}>
                          {news.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(news.id)}
                            className="p-1.5 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm(`Permanently delete news bulletin ${news.title}?`)) {
                                await removeAnnouncement(news.id);
                                showSuccess("Bulletin notice permanently removed.");
                              }
                            }}
                            className="p-1.5 rounded bg-red-950/15 border border-[#991b1b]/30 text-red-400 hover:bg-[#991b1b]/35 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            CLUB CONFIGURATION SUB-PANEL
            ========================================================================= */}
        {currentSection === "settings" && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-display text-[#C5A85C]">Club Configurations</h2>
              <p className="text-xs text-gray-500 font-mono mt-1">Modify metadata, brand designs, and standing score settings.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-[#0A0D14] border border-gray-800 p-6 rounded-xl space-y-6 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Club Full Name</label>
                  <input 
                    type="text" 
                    value={clubForm.club_name || ""}
                    onChange={(e) => setClubForm({ ...clubForm, club_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Club Short Initials</label>
                  <input 
                    type="text" 
                    value={clubForm.club_short_name || ""}
                    onChange={(e) => setClubForm({ ...clubForm, club_short_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Club Manifesto / Bio Description</label>
                <textarea 
                  rows={3}
                  value={clubForm.club_description || ""}
                  onChange={(e) => setClubForm({ ...clubForm, club_description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Win League Points</label>
                  <input 
                    type="number" 
                    value={clubForm.win_points ?? 3}
                    onChange={(e) => setClubForm({ ...clubForm, win_points: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Draw League Points</label>
                  <input 
                    type="number" 
                    value={clubForm.draw_points ?? 1}
                    onChange={(e) => setClubForm({ ...clubForm, draw_points: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Loss League Points</label>
                  <input 
                    type="number" 
                    value={clubForm.loss_points ?? 0}
                    onChange={(e) => setClubForm({ ...clubForm, loss_points: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-800/60">
                <BannerUpload 
                  label="Club Brand Logo"
                  currentImageUrl={clubForm.club_logo || null}
                  onUploadSuccess={(url) => setClubForm({ ...clubForm, club_logo: url })}
                />
                <BannerUpload 
                  label="Hero Banner Graphic"
                  aspectRatio="video"
                  currentImageUrl={clubForm.club_banner || null}
                  onUploadSuccess={(url) => setClubForm({ ...clubForm, club_banner: url })}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono text-xs tracking-wider transition flex items-center justify-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                Commit Configurations
              </button>
            </form>
          </div>
        )}

      </main>

      {/* =========================================================================
          GLOBAL EDIT MODAL ROUTER
          ========================================================================= */}
      
      {/* 1. PLAYERS FORM MODAL */}
      <Modal 
        isOpen={(currentSection === "players") && (activeModal === "add" || activeModal === "edit")}
        onClose={() => setActiveModal(null)}
        title={activeModal === "add" ? "Enroll Competitor" : "Modify Competitor Profile"}
      >
        <form onSubmit={handlePlayerSubmit} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Unique Username</label>
              <input 
                type="text" required
                value={playerForm.username}
                onChange={(e) => setPlayerForm({ ...playerForm, username: e.target.value })}
                placeholder="Mafia_Player"
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">eFootball UID</label>
              <input 
                type="text" required
                value={playerForm.efootball_uid}
                onChange={(e) => setPlayerForm({ ...playerForm, efootball_uid: e.target.value })}
                placeholder="123-456-789"
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">First Name</label>
              <input 
                type="text" required
                value={playerForm.first_name}
                onChange={(e) => setPlayerForm({ ...playerForm, first_name: e.target.value })}
                placeholder="John"
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Last Name</label>
              <input 
                type="text" required
                value={playerForm.last_name}
                onChange={(e) => setPlayerForm({ ...playerForm, last_name: e.target.value })}
                placeholder="Doe"
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Hardware platform</label>
              <select 
                value={playerForm.device}
                onChange={(e) => setPlayerForm({ ...playerForm, device: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              >
                <option value="Android">Android</option>
                <option value="iOS">iOS</option>
                <option value="PC">PC</option>
                <option value="PlayStation">PlayStation</option>
                <option value="Xbox">Xbox</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Device Model Info</label>
              <input 
                type="text"
                value={playerForm.device_info}
                onChange={(e) => setPlayerForm({ ...playerForm, device_info: e.target.value })}
                placeholder="S24 Ultra / iPhone 15"
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Country</label>
              <input 
                type="text"
                value={playerForm.country}
                onChange={(e) => setPlayerForm({ ...playerForm, country: e.target.value })}
                placeholder="Indonesia"
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Assign Team Roster</label>
              <select 
                value={playerForm.team_id}
                onChange={(e) => setPlayerForm({ ...playerForm, team_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              >
                <option value="">-- Free Agent --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <BannerUpload 
            label="Competitor Profile Photo"
            currentImageUrl={playerForm.profile_photo || null}
            onUploadSuccess={(url) => setPlayerForm({ ...playerForm, profile_photo: url })}
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono tracking-wider text-xs transition mt-2"
          >
            {activeModal === "add" ? "Register Competitor" : "Commit Profile Changes"}
          </button>
        </form>
      </Modal>

      {/* 2. TEAMS FORM MODAL */}
      <Modal
        isOpen={(currentSection === "teams") && (activeModal === "add" || activeModal === "edit")}
        onClose={() => setActiveModal(null)}
        title={activeModal === "add" ? "Create Esports Team" : "Edit Esports Team"}
      >
        <form onSubmit={handleTeamSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Team Clan Name</label>
            <input 
              type="text" required
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              placeholder="Mafia Legends"
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Team Captain Leader</label>
            <select 
              value={teamForm.captain_id}
              onChange={(e) => setTeamForm({ ...teamForm, captain_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            >
              <option value="">-- Assign Later --</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.username}</option>
              ))}
            </select>
          </div>

          <BannerUpload 
            label="Clan Team Logo"
            currentImageUrl={teamForm.logo || null}
            onUploadSuccess={(url) => setTeamForm({ ...teamForm, logo: url })}
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono tracking-wider text-xs transition mt-2"
          >
            {activeModal === "add" ? "Create Team" : "Save Team Profile"}
          </button>
        </form>
      </Modal>

      {/* 3. TOURNAMENTS FORM MODAL */}
      <Modal
        isOpen={(currentSection === "tournaments") && (activeModal === "add" || activeModal === "edit")}
        onClose={() => setActiveModal(null)}
        title={activeModal === "add" ? "Host Championship" : "Modify Championship Settings"}
      >
        <form onSubmit={handleTourneySubmit} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tournament Title</label>
              <input 
                type="text" required
                value={tourneyForm.name}
                onChange={(e) => setTourneyForm({ ...tourneyForm, name: e.target.value })}
                placeholder="MPC Pro League Season 1"
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Start Date</label>
              <input 
                type="date"
                value={tourneyForm.tournament_start}
                onChange={(e) => setTourneyForm({ ...tourneyForm, tournament_start: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none text-xs font-mono text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Prize pool Reward</label>
            <input 
              type="text"
              value={tourneyForm.prize}
              onChange={(e) => setTourneyForm({ ...tourneyForm, prize: e.target.value })}
              placeholder="Rp 5.000.000 / Glory & Trophy"
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Matches format</label>
              <select 
                value={tourneyForm.format}
                onChange={(e) => setTourneyForm({ ...tourneyForm, format: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              >
                <option value="Solo">Solo (1v1)</option>
                <option value="Team">Team (Clan vs Clan)</option>
                <option value="Coop">Coop (2v2)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Max slots</label>
              <input 
                type="number" required
                value={tourneyForm.max_participants}
                onChange={(e) => setTourneyForm({ ...tourneyForm, max_participants: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Cycle status</label>
              <select 
                value={tourneyForm.status}
                onChange={(e) => setTourneyForm({ ...tourneyForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Manifesto Description</label>
            <textarea 
              rows={2}
              value={tourneyForm.description}
              onChange={(e) => setTourneyForm({ ...tourneyForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Official Tournament Rule-Book</label>
            <textarea 
              rows={2}
              value={tourneyForm.rules}
              onChange={(e) => setTourneyForm({ ...tourneyForm, rules: e.target.value })}
              placeholder="e.g. Respect players, lag matches must be screenshotted..."
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            />
          </div>

          <BannerUpload 
            label="Championship Banner Card Graphic"
            aspectRatio="video"
            currentImageUrl={tourneyForm.banner || null}
            onUploadSuccess={(url) => setTourneyForm({ ...tourneyForm, banner: url })}
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono tracking-wider text-xs transition mt-2"
          >
            {activeModal === "add" ? "Publish Championship Pool" : "Save Championship Pool Configurations"}
          </button>
        </form>
      </Modal>

      {/* 4. FIXTURES FORM MODAL */}
      <Modal
        isOpen={(currentSection === "fixtures") && (activeModal === "add")}
        onClose={() => setActiveModal(null)}
        title="Schedule Match Fixture"
      >
        <form onSubmit={handleFixtureSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select Championship Pool</label>
            <select
              value={fixtureForm.tournament_id}
              onChange={(e) => setFixtureForm({ ...fixtureForm, tournament_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.format})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">League Round Name</label>
              <input 
                type="text" required
                value={fixtureForm.round}
                onChange={(e) => setFixtureForm({ ...fixtureForm, round: e.target.value })}
                placeholder="Group Stage / Quarter Finals"
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Match Index Number</label>
              <input 
                type="number" required
                value={fixtureForm.match_number}
                onChange={(e) => setFixtureForm({ ...fixtureForm, match_number: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              />
            </div>
          </div>

          {tournaments.find(t => t.id === fixtureForm.tournament_id)?.format !== "Team" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Competitor Player A</label>
                <select
                  value={fixtureForm.player_a_id}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, player_a_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
                >
                  <option value="">-- Player A --</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Competitor Player B</label>
                <select
                  value={fixtureForm.player_b_id}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, player_b_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
                >
                  <option value="">-- Player B --</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.username}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Esports Team Clan A</label>
                <select
                  value={fixtureForm.team_a_id}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, team_a_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
                >
                  <option value="">-- Team A --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Esports Team Clan B</label>
                <select
                  value={fixtureForm.team_b_id}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, team_b_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
                >
                  <option value="">-- Team B --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Schedule date time</label>
            <input 
              type="datetime-local"
              value={fixtureForm.scheduled_time}
              onChange={(e) => setFixtureForm({ ...fixtureForm, scheduled_time: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-xs font-mono text-gray-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono tracking-wider text-xs transition mt-2"
          >
            Publish Match Agenda
          </button>
        </form>
      </Modal>

      {/* 5. RESOLVE RESULTS MODAL */}
      <Modal
        isOpen={(currentSection === "results") && (activeModal === "result")}
        onClose={() => setActiveModal(null)}
        title="Input Match Score Results"
      >
        <form onSubmit={handleResolveScore} className="space-y-6 text-xs font-mono">
          <div className="flex items-center justify-center gap-6 text-center">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-gray-400">Team / Player A Score</label>
              <input 
                type="number" required min={0}
                value={scoreForm.score_a}
                onChange={(e) => setScoreForm({ ...scoreForm, score_a: Number(e.target.value) })}
                className="w-20 px-3 py-2 text-center text-lg font-bold rounded-lg bg-gray-950 border border-gray-800 focus:outline-none focus:border-[#C5A85C]"
              />
            </div>

            <span className="text-xl font-bold text-gray-500 pt-6">:</span>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-gray-400">Team / Player B Score</label>
              <input 
                type="number" required min={0}
                value={scoreForm.score_b}
                onChange={(e) => setScoreForm({ ...scoreForm, score_b: Number(e.target.value) })}
                className="w-20 px-3 py-2 text-center text-lg font-bold rounded-lg bg-gray-950 border border-gray-800 focus:outline-none focus:border-[#C5A85C]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-extrabold uppercase font-mono tracking-wider text-xs transition"
          >
            Confirm Score Results
          </button>
        </form>
      </Modal>

      {/* 6. CARDS WARNING MODAL */}
      <Modal
        isOpen={(currentSection === "cards") && (activeModal === "card")}
        onClose={() => setActiveModal(null)}
        title="Issue Foul Play Warning"
      >
        <form onSubmit={handleCardSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Competitor</label>
            <select
              value={cardForm.player_id}
              onChange={(e) => setCardForm({ ...cardForm, player_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            >
              <option value="">-- Choose Player --</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Warning card type</label>
            <select
              value={cardForm.card_type}
              onChange={(e) => setCardForm({ ...cardForm, card_type: e.target.value as "Yellow" | "Red" })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            >
              <option value="Yellow">Yellow Card</option>
              <option value="Red">Red Card</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Infraction Details / Reason</label>
            <textarea 
              rows={3} required
              value={cardForm.reason}
              onChange={(e) => setCardForm({ ...cardForm, reason: e.target.value })}
              placeholder="e.g. Rage quitting during Quarter Finals matching hour..."
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono tracking-wider text-xs transition"
          >
            Record Warning
          </button>
        </form>
      </Modal>

      {/* 7. BANS MODAL */}
      <Modal
        isOpen={(currentSection === "bans") && (activeModal === "ban")}
        onClose={() => setActiveModal(null)}
        title="Suspend Competitor (Ban)"
      >
        <form onSubmit={handleBanSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Competitor</label>
            <select
              value={banForm.player_id}
              onChange={(e) => setBanForm({ ...banForm, player_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            >
              <option value="">-- Choose Player --</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.username}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Ban Classification</label>
              <select
                value={banForm.permanent ? "Permanent" : "Temporary"}
                onChange={(e) => setBanForm({ ...banForm, permanent: e.target.value === "Permanent" })}
                className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
              >
                <option value="Temporary">Temporary Ban</option>
                <option value="Permanent">Permanent Ban</option>
              </select>
            </div>
            
            {!banForm.permanent && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Suspension Lift date</label>
                <input 
                  type="date"
                  value={banForm.end_date}
                  onChange={(e) => setBanForm({ ...banForm, end_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-xs font-mono text-gray-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Official Suspension Reason</label>
            <input 
              type="text" required
              value={banForm.reason}
              onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
              placeholder="Toxic behavior towards league staffs..."
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Audit Trail Notes (Admin Private)</label>
            <textarea 
              rows={2}
              value={banForm.note}
              onChange={(e) => setBanForm({ ...banForm, note: e.target.value })}
              placeholder="Staff discussion notes..."
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase font-mono tracking-wider text-xs transition"
          >
            Confirm Suspension Ban
          </button>
        </form>
      </Modal>

      {/* 8. ANNOUNCEMENTS MODAL */}
      <Modal
        isOpen={(currentSection === "announcements") && (activeModal === "add" || activeModal === "edit")}
        onClose={() => setActiveModal(null)}
        title={activeModal === "add" ? "Draft Notice Bulletin" : "Edit Notice Bulletin"}
      >
        <form onSubmit={handleAnnouncementSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Bulletin Title</label>
            <input 
              type="text" required
              value={newsForm.title}
              onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
              placeholder="MPC Championship Registration starts today!"
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Bulletin news body</label>
            <textarea 
              rows={5} required
              value={newsForm.body}
              onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })}
              placeholder="Write notice brief..."
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              id="is_published"
              checked={newsForm.published}
              onChange={(e) => setNewsForm({ ...newsForm, published: e.target.checked })}
              className="h-4 w-4 rounded bg-gray-950 border-gray-800 text-[#C5A85C] focus:ring-0"
            />
            <label htmlFor="is_published" className="text-[10px] uppercase font-bold text-gray-300">Publish Immediately</label>
          </div>

          <BannerUpload 
            label="Notice Attachment Image"
            aspectRatio="video"
            currentImageUrl={newsForm.image_url || null}
            onUploadSuccess={(url) => setNewsForm({ ...newsForm, image_url: url })}
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#C5A85C] hover:bg-[#b0934d] text-black font-extrabold uppercase font-mono tracking-wider text-xs transition mt-2"
          >
            {activeModal === "add" ? "Draft Bulletin Notice" : "Commit Notice Changes"}
          </button>
        </form>
      </Modal>

    </div>
  );
}
