export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  user_id: string;
  player_id: string;
  efootball_uid: string;
  device: string;
  device_info: string;
  team_id: string | null;
  country: string;
  profile_photo: string | null;
  status: 'active' | 'inactive' | 'banned';
  join_date: string;
  notes: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string | null;
  captain_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  banner: string | null;
  registration_start: string | null;
  registration_end: string | null;
  tournament_start: string | null;
  tournament_end: string | null;
  prize: string | null;
  rules: string | null;
  max_participants: number;
  format: 'Solo' | 'Duo' | 'Team' | 'Custom';
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  created_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  player_id: string | null;
  team_id: string | null;
  status: string; // e.g., 'Registered', 'Approved', 'Disqualified'
  created_at: string;
}

export interface Fixture {
  id: string;
  tournament_id: string;
  round: string;
  match_number: number;
  player_a_id: string | null;
  player_b_id: string | null;
  team_a_id: string | null;
  team_b_id: string | null;
  scheduled_time: string | null;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  score_a: number | null;
  score_b: number | null;
  created_at: string;
}

export interface Card {
  id: string;
  player_id: string;
  tournament_id: string | null;
  fixture_id: string | null;
  card_type: 'Yellow' | 'Red';
  reason: string;
  created_at: string;
}

export interface Ban {
  id: string;
  player_id: string;
  reason: string;
  start_date: string;
  end_date: string | null;
  permanent: boolean;
  status: 'Active' | 'Expired' | 'Cancelled';
  note: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  image: string | null;
  published: boolean;
  published_date: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  admin_username: string;
  target: string;
  details: string;
  created_at: string;
}

export interface ClubSettings {
  id: string;
  club_name: string;
  club_short_name: string;
  game_name: string;
  win_points: number;
  draw_points: number;
  loss_points: number;
  club_logo: string | null;
  club_banner: string | null;
  club_description: string;
  created_at: string;
}

// Stats interface calculated dynamically or aggregated
export interface PlayerStats {
  playerId: string;
  username: string;
  teamName: string | null;
  profilePhoto: string | null;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  winRate: number;
  yellowCards: number;
  redCards: number;
  isBanned: boolean;
}

export interface TeamStats {
  teamId: string;
  name: string;
  logo: string | null;
  captainName: string | null;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  winRate: number;
}
