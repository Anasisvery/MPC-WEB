import { createClient } from "@insforge/sdk";
import { 
  Player, Team, Tournament, TournamentParticipant, Fixture, 
  Card, Ban, Announcement, ActivityLog, ClubSettings,
  PlayerStats, TeamStats 
} from "../types";

const baseUrl = (import.meta as any).env.VITE_INSFORGE_PROJECT_URL || "https://gpv7bcpp.ap-southeast.insforge.app";
const anonKey = (import.meta as any).env.VITE_INSFORGE_ANON_KEY || "anon_605bf0d2ea6512db3e17c1bcd98443296db4811c105a8969cb46f5cb9b25543b";

export const insforge = createClient({
  baseUrl,
  anonKey,
});

// Helper to generate UUIDs client-side if needed (or standard UUID generators)
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper for error handling
function handleDBError(error: any, context: string): never {
  console.error(`Error during ${context}:`, error);
  throw new Error(`Unable to connect to InsForge. ${error?.message || "Please check your network or try again."}`);
}

// --------------------------------------------------
// CLUB SETTINGS
// --------------------------------------------------
export async function getClubSettings(): Promise<ClubSettings> {
  try {
    const { data, error } = await insforge.database
      .from("mpc_settings")
      .select("*");

    if (error) throw error;

    if (!data || data.length === 0) {
      // Seed default settings if empty
      const defaultSettings: ClubSettings = {
        id: generateUUID(),
        club_name: "Mafia PES Club",
        club_short_name: "MPC",
        game_name: "eFootball",
        win_points: 3,
        draw_points: 1,
        loss_points: 0,
        club_logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200",
        club_banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200",
        club_description: "Mafia PES Club (MPC) is a premium eFootball gaming esports organization dedicated to excellence, competing at the highest levels of digital soccer.",
        created_at: new Date().toISOString()
      };

      const { error: insertError } = await insforge.database
        .from("mpc_settings")
        .insert([defaultSettings]);

      if (insertError) throw insertError;
      return defaultSettings;
    }

    return data[0] as ClubSettings;
  } catch (err) {
    return handleDBError(err, "fetching club settings");
  }
}

export async function updateClubSettings(id: string, settings: Partial<ClubSettings>): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("mpc_settings")
      .update(settings)
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "updating club settings");
  }
}

// --------------------------------------------------
// PLAYERS
// --------------------------------------------------
export async function getPlayers(): Promise<Player[]> {
  try {
    const { data, error } = await insforge.database
      .from("players")
      .select("*");

    if (error) throw error;
    return (data || []) as Player[];
  } catch (err) {
    handleDBError(err, "fetching players");
  }
}

export async function createPlayer(player: Omit<Player, "id" | "created_at">): Promise<Player> {
  try {
    const newPlayer: Player = {
      ...player,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };

    const { error } = await insforge.database
      .from("players")
      .insert([newPlayer]);

    if (error) throw error;
    return newPlayer;
  } catch (err) {
    handleDBError(err, "creating player");
  }
}

export async function updatePlayer(id: string, player: Partial<Player>): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("players")
      .update(player)
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "updating player");
  }
}

export async function deletePlayer(id: string): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("players")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "deleting player");
  }
}

// --------------------------------------------------
// TEAMS
// --------------------------------------------------
export async function getTeams(): Promise<Team[]> {
  try {
    const { data, error } = await insforge.database
      .from("teams")
      .select("*");

    if (error) throw error;
    return (data || []) as Team[];
  } catch (err) {
    handleDBError(err, "fetching teams");
  }
}

export async function createTeam(team: Omit<Team, "id" | "created_at">): Promise<Team> {
  try {
    const newTeam: Team = {
      ...team,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };

    const { error } = await insforge.database
      .from("teams")
      .insert([newTeam]);

    if (error) throw error;
    return newTeam;
  } catch (err) {
    handleDBError(err, "creating team");
  }
}

export async function updateTeam(id: string, team: Partial<Team>): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("teams")
      .update(team)
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "updating team");
  }
}

export async function deleteTeam(id: string): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("teams")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "deleting team");
  }
}

// --------------------------------------------------
// TOURNAMENTS
// --------------------------------------------------
export async function getTournaments(): Promise<Tournament[]> {
  try {
    const { data, error } = await insforge.database
      .from("tournaments")
      .select("*");

    if (error) throw error;
    return (data || []) as Tournament[];
  } catch (err) {
    handleDBError(err, "fetching tournaments");
  }
}

export async function createTournament(tournament: Omit<Tournament, "id" | "created_at">): Promise<Tournament> {
  try {
    const newTournament: Tournament = {
      ...tournament,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };

    const { error } = await insforge.database
      .from("tournaments")
      .insert([newTournament]);

    if (error) throw error;
    return newTournament;
  } catch (err) {
    handleDBError(err, "creating tournament");
  }
}

export async function updateTournament(id: string, tournament: Partial<Tournament>): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("tournaments")
      .update(tournament)
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "updating tournament");
  }
}

export async function deleteTournament(id: string): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("tournaments")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "deleting tournament");
  }
}

// --------------------------------------------------
// TOURNAMENT PARTICIPANTS
// --------------------------------------------------
export async function getTournamentParticipants(): Promise<TournamentParticipant[]> {
  try {
    const { data, error } = await insforge.database
      .from("tournament_participants")
      .select("*");

    if (error) throw error;
    return (data || []) as TournamentParticipant[];
  } catch (err) {
    handleDBError(err, "fetching tournament participants");
  }
}

export async function addTournamentParticipant(participant: Omit<TournamentParticipant, "id" | "created_at">): Promise<TournamentParticipant> {
  try {
    const newParticipant: TournamentParticipant = {
      ...participant,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };

    const { error } = await insforge.database
      .from("tournament_participants")
      .insert([newParticipant]);

    if (error) throw error;
    return newParticipant;
  } catch (err) {
    handleDBError(err, "adding tournament participant");
  }
}

export async function removeTournamentParticipant(id: string): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("tournament_participants")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "removing tournament participant");
  }
}

// --------------------------------------------------
// FIXTURES
// --------------------------------------------------
export async function getFixtures(): Promise<Fixture[]> {
  try {
    const { data, error } = await insforge.database
      .from("fixtures")
      .select("*");

    if (error) throw error;
    return (data || []) as Fixture[];
  } catch (err) {
    handleDBError(err, "fetching fixtures");
  }
}

export async function createFixture(fixture: Omit<Fixture, "id" | "created_at">): Promise<Fixture> {
  try {
    const newFixture: Fixture = {
      ...fixture,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };

    const { error } = await insforge.database
      .from("fixtures")
      .insert([newFixture]);

    if (error) throw error;
    return newFixture;
  } catch (err) {
    handleDBError(err, "creating fixture");
  }
}

export async function updateFixture(id: string, fixture: Partial<Fixture>): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("fixtures")
      .update(fixture)
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "updating fixture");
  }
}

export async function deleteFixture(id: string): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("fixtures")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "deleting fixture");
  }
}

// --------------------------------------------------
// CARDS SYSTEM
// --------------------------------------------------
export async function getCards(): Promise<Card[]> {
  try {
    const { data, error } = await insforge.database
      .from("cards")
      .select("*");

    if (error) throw error;
    return (data || []) as Card[];
  } catch (err) {
    handleDBError(err, "fetching cards");
  }
}

export async function createCard(card: Omit<Card, "id" | "created_at">): Promise<Card> {
  try {
    const newCard: Card = {
      ...card,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };

    const { error } = await insforge.database
      .from("cards")
      .insert([newCard]);

    if (error) throw error;
    return newCard;
  } catch (err) {
    handleDBError(err, "issuing card");
  }
}

export async function deleteCard(id: string): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("cards")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "deleting card");
  }
}

// --------------------------------------------------
// BAN SYSTEM
// --------------------------------------------------
export async function getBans(): Promise<Ban[]> {
  try {
    const { data, error } = await insforge.database
      .from("bans")
      .select("*");

    if (error) throw error;
    return (data || []) as Ban[];
  } catch (err) {
    handleDBError(err, "fetching bans");
  }
}

export async function createBan(ban: Omit<Ban, "id" | "created_at">): Promise<Ban> {
  try {
    const newBan: Ban = {
      ...ban,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };

    const { error } = await insforge.database
      .from("bans")
      .insert([newBan]);

    if (error) throw error;

    // Update player status to banned
    await updatePlayer(ban.player_id, { status: "banned" });

    return newBan;
  } catch (err) {
    handleDBError(err, "creating ban");
  }
}

export async function updateBan(id: string, ban: Partial<Ban>): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("bans")
      .update(ban)
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "updating ban");
  }
}

export async function liftBan(id: string, player_id: string): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("bans")
      .update({ status: "Cancelled" })
      .eq("id", id);

    if (error) throw error;

    // Restore player status to active
    await updatePlayer(player_id, { status: "active" });
  } catch (err) {
    handleDBError(err, "lifting ban");
  }
}

// --------------------------------------------------
// ANNOUNCEMENTS
// --------------------------------------------------
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const { data, error } = await insforge.database
      .from("announcements")
      .select("*");

    if (error) throw error;
    return (data || []) as Announcement[];
  } catch (err) {
    handleDBError(err, "fetching announcements");
  }
}

export async function createAnnouncement(announcement: Omit<Announcement, "id" | "created_at">): Promise<Announcement> {
  try {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };

    const { error } = await insforge.database
      .from("announcements")
      .insert([newAnnouncement]);

    if (error) throw error;
    return newAnnouncement;
  } catch (err) {
    handleDBError(err, "creating announcement");
  }
}

export async function updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("announcements")
      .update(announcement)
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "updating announcement");
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    const { error } = await insforge.database
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    handleDBError(err, "deleting announcement");
  }
}

// --------------------------------------------------
// ACTIVITY LOGS
// --------------------------------------------------
export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const { data, error } = await insforge.database
      .from("activity_logs")
      .select("*");

    if (error) throw error;
    return (data || []) as ActivityLog[];
  } catch (err) {
    handleDBError(err, "fetching activity logs");
  }
}

export async function logActivity(action: string, admin_username: string, target: string, details: string): Promise<void> {
  try {
    const newLog: ActivityLog = {
      id: generateUUID(),
      action,
      admin_username,
      target,
      details,
      created_at: new Date().toISOString()
    };

    await insforge.database
      .from("activity_logs")
      .insert([newLog]);
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}

// --------------------------------------------------
// IMAGE UPLOAD
// --------------------------------------------------
export async function uploadImage(file: File, bucketName: string = "mpc-media"): Promise<string> {
  try {
    const { data, error } = await insforge.storage
      .from(bucketName)
      .uploadAuto(file);

    if (error) throw error;
    if (!data?.url) throw new Error("Upload did not return a valid public URL");

    return data.url;
  } catch (err: any) {
    console.error("Storage upload failed, falling back to data URL:", err);
    // Graceful fallback: return local object URL / base64 or a structured error
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Unable to read file contents"));
      reader.readAsDataURL(file);
    });
  }
}

// --------------------------------------------------
// DYNAMIC RANKINGS / STATS CALCULATION
// --------------------------------------------------
export function calculatePlayerStats(
  players: Player[],
  teams: Team[],
  fixtures: Fixture[],
  cards: Card[],
  bans: Ban[],
  winPoints = 3,
  drawPoints = 1,
  lossPoints = 0
): PlayerStats[] {
  const teamMap = new Map(teams.map(t => [t.id, t.name]));
  const activeBans = new Set(bans.filter(b => b.status === "Active").map(b => b.player_id));

  return players.map(player => {
    // Filter player matches
    const playerFixtures = fixtures.filter(f => 
      f.status === "Completed" && 
      (f.player_a_id === player.id || f.player_b_id === player.id)
    );

    let wins = 0;
    let draws = 0;
    let losses = 0;

    playerFixtures.forEach(f => {
      const isPlayerA = f.player_a_id === player.id;
      const scoreSelf = isPlayerA ? (f.score_a || 0) : (f.score_b || 0);
      const scoreOpponent = isPlayerA ? (f.score_b || 0) : (f.score_a || 0);

      if (scoreSelf > scoreOpponent) {
        wins++;
      } else if (scoreSelf === scoreOpponent) {
        draws++;
      } else {
        losses++;
      }
    });

    const matchesPlayed = playerFixtures.length;
    const points = (wins * winPoints) + (draws * drawPoints) + (losses * lossPoints);
    const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

    const yellowCards = cards.filter(c => c.player_id === player.id && c.card_type === "Yellow").length;
    const redCards = cards.filter(c => c.player_id === player.id && c.card_type === "Red").length;
    const isBanned = activeBans.has(player.id) || player.status === "banned";

    return {
      playerId: player.id,
      username: player.username,
      teamName: player.team_id ? (teamMap.get(player.team_id) || null) : null,
      profilePhoto: player.profile_photo,
      matchesPlayed,
      wins,
      draws,
      losses,
      points,
      winRate,
      yellowCards,
      redCards,
      isBanned
    };
  }).sort((a, b) => b.points - a.points || b.wins - a.wins || a.username.localeCompare(b.username));
}

export function calculateTeamStats(
  teams: Team[],
  players: Player[],
  fixtures: Fixture[],
  winPoints = 3,
  drawPoints = 1,
  lossPoints = 0
): TeamStats[] {
  const playerMap = new Map(players.map(p => [p.id, p.username]));

  return teams.map(team => {
    // Filter team matches
    const teamFixtures = fixtures.filter(f => 
      f.status === "Completed" && 
      (f.team_a_id === team.id || f.team_b_id === team.id)
    );

    let wins = 0;
    let draws = 0;
    let losses = 0;

    teamFixtures.forEach(f => {
      const isTeamA = f.team_a_id === team.id;
      const scoreSelf = isTeamA ? (f.score_a || 0) : (f.score_b || 0);
      const scoreOpponent = isTeamA ? (f.score_b || 0) : (f.score_a || 0);

      if (scoreSelf > scoreOpponent) {
        wins++;
      } else if (scoreSelf === scoreOpponent) {
        draws++;
      } else {
        losses++;
      }
    });

    const matchesPlayed = teamFixtures.length;
    const points = (wins * winPoints) + (draws * drawPoints) + (losses * lossPoints);
    const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

    const captainName = team.captain_id ? (playerMap.get(team.captain_id) || null) : null;

    return {
      teamId: team.id,
      name: team.name,
      logo: team.logo,
      captainName,
      matchesPlayed,
      wins,
      draws,
      losses,
      points,
      winRate
    };
  }).sort((a, b) => b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name));
}
