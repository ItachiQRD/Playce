export type UserRole =
  | "athlete"
  | "club"
  | "coach"
  | "agent"
  | "scout"
  | "fan"
  | "admin";

export type Availability =
  | "open"
  | "looking"
  | "unavailable";

export type ApplicationStatus =
  | "sent"
  | "viewed"
  | "shortlisted"
  | "trial"
  | "closed"
  | "rejected";

export type OpportunityType = "offer" | "demand";

export type PostType =
  | "text"
  | "image"
  | "video"
  | "result"
  | "training"
  | "announcement"
  | "opportunity_search"
  | "highlight"
  | "reel";

export type Visibility = "public" | "limited" | "private";

export interface Sport {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  icon?: string;
}

export interface Profile {
  id: string;
  email: string;
  handle: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  birth_date?: string | null;
  hide_age?: boolean;
  sport_id?: string | null;
  sport?: Sport | null;
  position?: string | null;
  level?: string | null;
  dominant_side?: string | null;
  availability: Availability;
  languages: string[];
  goals?: string | null;
  current_club?: string | null;
  visibility: Visibility;
  allow_direct_contact: boolean;
  email_verified: boolean;
  identity_verified: boolean;
  completeness: number;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  profile_id: string;
  organization: string;
  role: string;
  level?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  is_current?: boolean;
}

export interface StatEntry {
  id: string;
  profile_id: string;
  label: string;
  value: string;
  season?: string | null;
  is_declarative: boolean;
  source?: string | null;
}

export interface MediaItem {
  id: string;
  profile_id: string;
  type: "photo" | "video" | "link";
  url: string;
  thumbnail_url?: string | null;
  title?: string | null;
  is_highlight?: boolean;
}

export interface Achievement {
  id: string;
  profile_id: string;
  title: string;
  year?: string | null;
  issuer?: string | null;
  type: "title" | "diploma" | "license" | "badge";
}

export interface Post {
  id: string;
  author_id: string;
  author?: Profile;
  type: PostType;
  content: string;
  media_url?: string | null;
  thumbnail_url?: string | null;
  sport_id?: string | null;
  hashtags: string[];
  likes_count: number;
  comments_count: number;
  saves_count: number;
  liked_by_me?: boolean;
  saved_by_me?: boolean;
  opportunity_id?: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author?: Profile;
  content: string;
  created_at: string;
}

export interface Opportunity {
  id: string;
  author_id: string;
  author?: Profile;
  type: OpportunityType;
  title: string;
  organization?: string | null;
  sport_id: string;
  sport?: Sport | null;
  position?: string | null;
  level?: string | null;
  city?: string | null;
  country?: string | null;
  contract_type?: string | null;
  compensation?: string | null;
  deadline?: string | null;
  description: string;
  criteria?: string | null;
  status: "open" | "closed";
  applications_count: number;
  match_score?: number;
  match_reasons?: string[];
  created_at: string;
}

export interface Application {
  id: string;
  opportunity_id: string;
  opportunity?: Opportunity;
  applicant_id: string;
  applicant?: Profile;
  message?: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  participants?: Profile[];
  last_message?: Message | null;
  updated_at: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: Profile;
  content: string;
  type: "text" | "image" | "link" | "profile" | "opportunity";
  attachment_url?: string | null;
  created_at: string;
  read_at?: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type:
    | "message"
    | "like"
    | "comment"
    | "follow"
    | "application"
    | "status"
    | "opportunity"
    | "system";
  title: string;
  body: string;
  link?: string | null;
  read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: "profile" | "post" | "message" | "opportunity" | "comment";
  target_id: string;
  reason: string;
  details?: string | null;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}

export interface SavedItem {
  id: string;
  user_id: string;
  item_type: "profile" | "opportunity" | "post";
  item_id: string;
  created_at: string;
}
