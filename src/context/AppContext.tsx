import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { 
  Player, Team, Tournament, TournamentParticipant, Fixture, 
  Card, Ban, Announcement, ActivityLog, ClubSettings,
  PlayerStats, TeamStats 
} from "../types";
import {
  insforge, getClubSettings, updateClubSettings,
  getPlayers, createPlayer as apiCreatePlayer, updatePlayer as apiUpdatePlayer, deletePlayer as apiDeletePlayer,
  getTeams, createTeam as apiCreateTeam, updateTeam as apiUpdateTeam, deleteTeam as apiDeleteTeam,
  getTournaments, createTournament as apiCreateTournament, updateTournament as apiUpdateTournament, deleteTournament as apiDeleteTournament,
  getTournamentParticipants, addTournamentParticipant, removeTournamentParticipant,
  getFixtures, createFixture as apiCreateFixture, updateFixture as apiUpdateFixture, deleteFixture as apiDeleteFixture,
  getCards, createCard as apiCreateCard, deleteCard as apiDeleteCard,
  getBans, createBan as apiCreateBan, updateBan as apiUpdateBan, liftBan as apiLiftBan,
  getAnnouncements, createAnnouncement as apiCreateAnnouncement, updateAnnouncement as apiUpdateAnnouncement, deleteAnnouncement as apiDeleteAnnouncement,
  getActivityLogs, logActivity,
  calculatePlayerStats, calculateTeamStats, generateUUID
} from "../lib/insforge";

interface AppContextType {
  players: Player[];
  teams: Team[];
  tournaments: Tournament[];
  participants: TournamentParticipant[];
  fixtures: Fixture[];
  cards: Card[];
  bans: Ban[];
  announcements: Announcement[];
  activityLogs: ActivityLog[];
  settings: ClubSettings | null;
  playerStats: PlayerStats[];
  teamStats: TeamStats[];
  
  loading: boolean;
  error: string | null;
  currentUser: any | null;
  isAdmin: boolean;
  
  refreshData: () => Promise<void>;
  
  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Settings actions
  updateSettings: (newSettings: Partial<ClubSettings>) => Promise<void>;
  
  // Player actions
  addPlayer: (player: Omit<Player, "id" | "created_at">) => Promise<Player>;
  editPlayer: (id: string, player: Partial<Player>) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
  issueCard: (card: Omit<Card, "id" | "created_at">) => Promise<Card>;
  issueBan: (ban: Omit<Ban, "id" | "created_at">) => Promise<Ban>;
  removeBan: (banId: string, playerId: string) => Promise<void>;
  
  // Team actions
  addTeam: (team: Omit<Team, "id" | "created_at">) => Promise<Team>;
  editTeam: (id: string, team: Partial<Team>) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;
  
  // Tournament actions
  addTournament: (tournament: Omit<Tournament, "id" | "created_at">) => Promise<Tournament>;
  editTournament: (id: string, tournament: Partial<Tournament>) => Promise<void>;
  removeTournament: (id: string) => Promise<void>;
  registerParticipant: (tournamentId: string, playerId: string | null, teamId: string | null) => Promise<void>;
  unregisterParticipant: (participantId: string) => Promise<void>;
  
  // Fixture actions
  addFixture: (fixture: Omit<Fixture, "id" | "created_at">) => Promise<Fixture>;
  editFixture: (id: string, fixture: Partial<Fixture>) => Promise<void>;
  removeFixture: (id: string) => Promise<void>;
  submitResult: (id: string, scoreA: number, scoreB: number) => Promise<void>;
  
  // Announcement actions
  addAnnouncement: (announcement: Omit<Announcement, "id" | "created_at">) => Promise<Announcement>;
  editAnnouncement: (id: string, announcement: Partial<Announcement>) => Promise<void>;
  removeAnnouncement: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<ClubSettings | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Synchronize data from InsForge
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        fetchedSettings,
        fetchedPlayers,
        fetchedTeams,
        fetchedTournaments,
        fetchedParticipants,
        fetchedFixtures,
        fetchedCards,
        fetchedBans,
        fetchedAnnouncements,
        fetchedLogs
      ] = await Promise.all([
        getClubSettings(),
        getPlayers(),
        getTeams(),
        getTournaments(),
        getTournamentParticipants(),
        getFixtures(),
        getCards(),
        getBans(),
        getAnnouncements(),
        getActivityLogs()
      ]);

      setSettings(fetchedSettings);
      setPlayers(fetchedPlayers);
      setTeams(fetchedTeams);
      setTournaments(fetchedTournaments);
      setParticipants(fetchedParticipants);
      setFixtures(fetchedFixtures);
      setCards(fetchedCards);
      setBans(fetchedBans);
      setAnnouncements(fetchedAnnouncements);
      setActivityLogs(fetchedLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err: any) {
      console.error("Failed to load app data:", err);
      setError(err?.message || "Unable to connect to InsForge. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth session on startup
  useEffect(() => {
    refreshData();
    
    // Check local session
    const checkSession = async () => {
      try {
        // Look up standard auth info or state from SDK if available
        const userStr = localStorage.getItem("mpc_admin_user");
        if (userStr) {
          setCurrentUser(JSON.parse(userStr));
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };
    checkSession();
  }, [refreshData]);

  // Authenticate Admin via InsForge
  const login = async (email: string, password: string) => {
    try {
      // Support instant demo login with master/developer credentials for testing
      const isMasterAdmin = 
        (email.toLowerCase() === "admin@mpc.com" && password === "admin123") || 
        (email.toLowerCase() === "nexisnovastore773@gmail.com" && password === "admin123");

      if (isMasterAdmin) {
        const adminDetails = {
          email: email.toLowerCase(),
          username: email.split("@")[0] || "admin",
          id: "master-admin-bypass-id"
        };
        setCurrentUser(adminDetails);
        localStorage.setItem("mpc_admin_user", JSON.stringify(adminDetails));
        await logActivity("Admin Login", adminDetails.username, "System", "Successfully logged in via master admin credentials");
        await refreshData();
        return { success: true };
      }

      const { data, error } = await (insforge.auth as any).signIn({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      
      const adminDetails = {
        email: email,
        username: email.split("@")[0],
        id: data?.user?.id || generateUUID()
      };
      
      setCurrentUser(adminDetails);
      localStorage.setItem("mpc_admin_user", JSON.stringify(adminDetails));
      await logActivity("Admin Login", adminDetails.username, "System", "Successfully authenticated via InsForge auth");
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Connection to InsForge auth failed." };
    }
  };

  const logout = async () => {
    try {
      await (insforge.auth as any).signOut();
    } catch (e) {
      console.warn("SDK sign out warning:", e);
    }
    const adminUsername = currentUser?.username || "Admin";
    setCurrentUser(null);
    localStorage.removeItem("mpc_admin_user");
    await logActivity("Admin Logout", adminUsername, "System", "Logged out from management portal");
  };

  // Settings Actions
  const updateSettings = async (newSettings: Partial<ClubSettings>) => {
    if (!settings) return;
    await updateClubSettings(settings.id, newSettings);
    await logActivity(
      "Settings Updated", 
      currentUser?.username || "Admin", 
      "Club Settings", 
      `Changed configurations for ${Object.keys(newSettings).join(", ")}`
    );
    await refreshData();
  };

  // Players CRUD
  const addPlayer = async (player: Omit<Player, "id" | "created_at">) => {
    const res = await apiCreatePlayer(player);
    await logActivity(
      "Player Created", 
      currentUser?.username || "Admin", 
      res.username, 
      `Registered player ${res.first_name} ${res.last_name} (${res.efootball_uid})`
    );
    await refreshData();
    return res;
  };

  const editPlayer = async (id: string, player: Partial<Player>) => {
    const original = players.find(p => p.id === id);
    await apiUpdatePlayer(id, player);
    await logActivity(
      "Player Updated", 
      currentUser?.username || "Admin", 
      original?.username || id, 
      `Modified player fields: ${Object.keys(player).join(", ")}`
    );
    await refreshData();
  };

  const removePlayer = async (id: string) => {
    const original = players.find(p => p.id === id);
    await apiDeletePlayer(id);
    await logActivity(
      "Player Deleted", 
      currentUser?.username || "Admin", 
      original?.username || id, 
      `Permanently deleted player registration`
    );
    await refreshData();
  };

  const issueCard = async (card: Omit<Card, "id" | "created_at">) => {
    const res = await apiCreateCard(card);
    const targetPlayer = players.find(p => p.id === card.player_id);
    await logActivity(
      "Card Issued", 
      currentUser?.username || "Admin", 
      targetPlayer?.username || card.player_id, 
      `Issued ${card.card_type} card for: ${card.reason}`
    );
    await refreshData();
    return res;
  };

  const issueBan = async (ban: Omit<Ban, "id" | "created_at">) => {
    const res = await apiCreateBan(ban);
    const targetPlayer = players.find(p => p.id === ban.player_id);
    await logActivity(
      "Player Banned", 
      currentUser?.username || "Admin", 
      targetPlayer?.username || ban.player_id, 
      `Issued ${ban.permanent ? 'Permanent' : 'Temporary'} ban: ${ban.reason}`
    );
    await refreshData();
    return res;
  };

  const removeBan = async (banId: string, playerId: string) => {
    await apiLiftBan(banId, playerId);
    const targetPlayer = players.find(p => p.id === playerId);
    await logActivity(
      "Player Unbanned", 
      currentUser?.username || "Admin", 
      targetPlayer?.username || playerId, 
      `Lifted ban and reinstated player status`
    );
    await refreshData();
  };

  // Teams CRUD
  const addTeam = async (team: Omit<Team, "id" | "created_at">) => {
    const res = await apiCreateTeam(team);
    await logActivity(
      "Team Created", 
      currentUser?.username || "Admin", 
      res.name, 
      `Registered esports team with captain ID ${res.captain_id || "None"}`
    );
    await refreshData();
    return res;
  };

  const editTeam = async (id: string, team: Partial<Team>) => {
    const original = teams.find(t => t.id === id);
    await apiUpdateTeam(id, team);
    await logActivity(
      "Team Updated", 
      currentUser?.username || "Admin", 
      original?.name || id, 
      `Modified team fields: ${Object.keys(team).join(", ")}`
    );
    await refreshData();
  };

  const removeTeam = async (id: string) => {
    const original = teams.find(t => t.id === id);
    // De-associate players belonging to this team
    const teamPlayers = players.filter(p => p.team_id === id);
    await Promise.all(teamPlayers.map(p => apiUpdatePlayer(p.id, { team_id: null })));
    
    await apiDeleteTeam(id);
    await logActivity(
      "Team Deleted", 
      currentUser?.username || "Admin", 
      original?.name || id, 
      `Deleted team and updated ${teamPlayers.length} roster players`
    );
    await refreshData();
  };

  // Tournaments CRUD
  const addTournament = async (tournament: Omit<Tournament, "id" | "created_at">) => {
    const res = await apiCreateTournament(tournament);
    await logActivity(
      "Tournament Created", 
      currentUser?.username || "Admin", 
      res.name, 
      `Initiated ${res.format} tournament with a prize of ${res.prize || "Glory"}`
    );
    await refreshData();
    return res;
  };

  const editTournament = async (id: string, tournament: Partial<Tournament>) => {
    const original = tournaments.find(t => t.id === id);
    await apiUpdateTournament(id, tournament);
    await logActivity(
      "Tournament Updated", 
      currentUser?.username || "Admin", 
      original?.name || id, 
      `Modified tournament fields: ${Object.keys(tournament).join(", ")}`
    );
    await refreshData();
  };

  const removeTournament = async (id: string) => {
    const original = tournaments.find(t => t.id === id);
    await apiDeleteTournament(id);
    await logActivity(
      "Tournament Deleted", 
      currentUser?.username || "Admin", 
      original?.name || id, 
      `Permanently deleted tournament and all its related fixtures`
    );
    await refreshData();
  };

  const registerParticipant = async (tournamentId: string, playerId: string | null, teamId: string | null) => {
    await addTournamentParticipant({
      tournament_id: tournamentId,
      player_id: playerId,
      team_id: teamId,
      status: "Approved"
    });
    
    let targetName = "Unknown";
    if (playerId) {
      targetName = players.find(p => p.id === playerId)?.username || "Player";
    } else if (teamId) {
      targetName = teams.find(t => t.id === teamId)?.name || "Team";
    }
    const tournamentName = tournaments.find(t => t.id === tournamentId)?.name || "Tournament";

    await logActivity(
      "Participant Registered", 
      currentUser?.username || "Admin", 
      targetName, 
      `Registered participant into ${tournamentName}`
    );
    await refreshData();
  };

  const unregisterParticipant = async (participantId: string) => {
    const original = participants.find(p => p.id === participantId);
    await removeTournamentParticipant(participantId);
    
    if (original) {
      let targetName = "Unknown";
      if (original.player_id) {
        targetName = players.find(p => p.id === original.player_id)?.username || "Player";
      } else if (original.team_id) {
        targetName = teams.find(t => t.id === original.team_id)?.name || "Team";
      }
      const tournamentName = tournaments.find(t => t.id === original.tournament_id)?.name || "Tournament";

      await logActivity(
        "Participant Removed", 
        currentUser?.username || "Admin", 
        targetName, 
        `Removed participant from ${tournamentName}`
      );
    }
    await refreshData();
  };

  // Fixtures CRUD
  const addFixture = async (fixture: Omit<Fixture, "id" | "created_at">) => {
    const res = await apiCreateFixture(fixture);
    await logActivity(
      "Fixture Created", 
      currentUser?.username || "Admin", 
      `Match #${res.match_number}`, 
      `Created fixture in tournament ${res.tournament_id}`
    );
    await refreshData();
    return res;
  };

  const editFixture = async (id: string, fixture: Partial<Fixture>) => {
    await apiUpdateFixture(id, fixture);
    await refreshData();
  };

  const removeFixture = async (id: string) => {
    await apiDeleteFixture(id);
    await logActivity(
      "Fixture Deleted", 
      currentUser?.username || "Admin", 
      id, 
      `Removed match fixture`
    );
    await refreshData();
  };

  const submitResult = async (id: string, scoreA: number, scoreB: number) => {
    const original = fixtures.find(f => f.id === id);
    await apiUpdateFixture(id, {
      score_a: scoreA,
      score_b: scoreB,
      status: "Completed"
    });

    let detailsStr = `Score: ${scoreA} - ${scoreB}`;
    if (original) {
      const tournamentName = tournaments.find(t => t.id === original.tournament_id)?.name || "Tournament";
      detailsStr = `Match #${original.match_number} in ${tournamentName} resolved to ${scoreA} - ${scoreB}`;
    }

    await logActivity(
      "Result Updated", 
      currentUser?.username || "Admin", 
      `Fixture Result`, 
      detailsStr
    );
    await refreshData();
  };

  // Announcements CRUD
  const addAnnouncement = async (announcement: Omit<Announcement, "id" | "created_at">) => {
    const res = await apiCreateAnnouncement(announcement);
    await logActivity(
      "Announcement Created", 
      currentUser?.username || "Admin", 
      res.title, 
      `Drafted announcement, published: ${res.published}`
    );
    await refreshData();
    return res;
  };

  const editAnnouncement = async (id: string, announcement: Partial<Announcement>) => {
    const original = announcements.find(a => a.id === id);
    await apiUpdateAnnouncement(id, announcement);
    
    if (announcement.published !== undefined && announcement.published !== original?.published) {
      await logActivity(
        announcement.published ? "Announcement published" : "Announcement unpublished", 
        currentUser?.username || "Admin", 
        original?.title || id, 
        `Updated visibility status of announcement`
      );
    } else {
      await logActivity(
        "Announcement Updated", 
        currentUser?.username || "Admin", 
        original?.title || id, 
        `Edited fields: ${Object.keys(announcement).join(", ")}`
      );
    }
    await refreshData();
  };

  const removeAnnouncement = async (id: string) => {
    const original = announcements.find(a => a.id === id);
    await apiDeleteAnnouncement(id);
    await logActivity(
      "Announcement Deleted", 
      currentUser?.username || "Admin", 
      original?.title || id, 
      `Deleted announcement from system`
    );
    await refreshData();
  };

  // Derive rankings
  const playerStats = calculatePlayerStats(
    players,
    teams,
    fixtures,
    cards,
    bans,
    settings?.win_points ?? 3,
    settings?.draw_points ?? 1,
    settings?.loss_points ?? 0
  );

  const teamStats = calculateTeamStats(
    teams,
    players,
    fixtures,
    settings?.win_points ?? 3,
    settings?.draw_points ?? 1,
    settings?.loss_points ?? 0
  );

  return (
    <AppContext.Provider value={{
      players,
      teams,
      tournaments,
      participants,
      fixtures,
      cards,
      bans,
      announcements,
      activityLogs,
      settings,
      playerStats,
      teamStats,
      
      loading,
      error,
      currentUser,
      isAdmin: !!currentUser,
      
      refreshData,
      login,
      logout,
      
      updateSettings,
      
      addPlayer,
      editPlayer,
      removePlayer,
      issueCard,
      issueBan,
      removeBan,
      
      addTeam,
      editTeam,
      removeTeam,
      
      addTournament,
      editTournament,
      removeTournament,
      registerParticipant,
      unregisterParticipant,
      
      addFixture,
      editFixture,
      removeFixture,
      submitResult,
      
      addAnnouncement,
      editAnnouncement,
      removeAnnouncement
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
